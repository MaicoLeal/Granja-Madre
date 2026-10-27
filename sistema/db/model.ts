import {z} from 'zod';
export const stages=['Preparación y extracción','Filtración','Obtención de resina','Almacenamiento de resina','Mezcla con aceite','Homogeneización','Envasado'];
export type State={members:any[];lots:any[];productions:any[];procedures:any[];movements:any[];donations:any[];audit:any[]};
export function emptyState():State{return {members:[],lots:[],productions:[],procedures:[{id:'initial',name:'Flujo observado · pendiente de validación',version:1,steps:stages,approved:false}],movements:[],donations:[],audit:[]};}
const txt=z.string().trim().min(1).max(300),opt=z.string().trim().max(2000).default(''),qty=z.number().finite().min(0.000001).max(1e9).refine(v=>Math.abs(v*1e6-Math.round(v*1e6))<0.0001),unit=z.enum(['g','kg','mL','L','unidades']);
const schema=z.discriminatedUnion('type',[
z.object({type:z.literal('member'),name:txt,role:txt}),z.object({type:z.literal('member-toggle'),id:txt}),
z.object({type:z.literal('lot'),name:txt,category:z.enum(['Materia prima','Insumo','Intermedio','Producto terminado']),quantity:qty,unit,container:txt,location:txt,origin:opt,variety:opt,harvest:opt,responsible:txt}),
z.object({type:z.literal('release'),id:txt}),
z.object({type:z.literal('production'),title:txt,procedure:txt,inputs:z.array(z.object({lotId:txt,quantity:qty})).min(1).max(30)}),
z.object({type:z.literal('step'),production:txt,name:txt,start:txt,end:txt,operator:txt,participants:z.array(txt).max(30),equipment:opt,container:opt,notes:opt,result:txt,checks:z.array(z.boolean()).length(3)}),
z.object({type:z.literal('output'),production:txt,name:txt,category:z.enum(['Intermedio','Producto terminado']),quantity:qty,unit,container:txt,location:txt,responsible:txt}),
z.object({type:z.literal('review'),production:txt,reviewer:txt}),
z.object({type:z.literal('donation'),lotId:txt,quantity:qty,reference:txt}),
z.object({type:z.literal('adjust'),lotId:txt,quantity:z.number().finite().min(-1e9).max(1e9).refine(v=>Math.abs(v)>=0.000001&&Math.abs(v*1e6-Math.round(v*1e6))<0.0001),reason:txt}),
z.object({type:z.literal('procedure'),name:txt,steps:z.array(txt).min(1).max(30)}),
z.object({type:z.literal('approve-procedure'),id:txt,reviewer:txt}),
z.object({type:z.literal('correction'),production:txt,step:txt,reason:txt,notes:txt})]);
export function applyCommand(previous:State,raw:unknown,actor:string):State{
const c=schema.parse(raw),s=structuredClone(previous),now=new Date().toISOString(),id=()=>crypto.randomUUID();
const fail=(m:string):never=>{throw Error(m)};
const member=(k:string)=>s.members.find(m=>m.id===k&&m.active)||fail('Seleccione un miembro activo.');
const lot=(k:string)=>s.lots.find(l=>l.id===k)||fail('Lote no encontrado.');
const prod=(k:string)=>s.productions.find(p=>p.id===k)||fail('Producción no encontrada.');
const move=(l:any,q:number,type:string,reference:string)=>{const balance=Math.round((l.quantity+q)*1e6)/1e6;if(balance<0)fail('Cantidad superior al saldo disponible.');l.quantity=balance;s.movements.push({id:id(),lotId:l.id,quantity:q,type,reference,at:now});};let ref='';
if(c.type==='member'){ref=id();s.members.push({id:ref,name:c.name,role:c.role,active:true});}
if(c.type==='member-toggle'){const m=s.members.find(m=>m.id===c.id)||fail('Miembro no encontrado.');m.active=!m.active;ref=m.id;}
if(c.type==='lot'){member(c.responsible);ref=id();const l={...c,id:ref,code:'GM-'+String(s.lots.length+1).padStart(5,'0'),quantity:0,released:false,parents:[],created:now};s.lots.push(l);move(l,c.quantity,'Inventario inicial','Alta de lote');}
if(c.type==='release'){const l=lot(c.id);if(l.parents.length)fail('El resultado debe aprobarse desde su ficha de producción.');l.released=true;ref=l.id;}
if(c.type==='production'){const pr=s.procedures.find(p=>p.id===c.procedure)||fail('Procedimiento no encontrado.');if(!pr.approved)fail('Apruebe el procedimiento antes de iniciar la producción.');ref=id();for(const input of c.inputs){const l=lot(input.lotId);if(!l.released)fail('El lote debe estar liberado.');move(l,-input.quantity,'Consumo',ref);}s.productions.push({id:ref,code:'PR-'+String(s.productions.length+1).padStart(5,'0'),title:c.title,inputs:c.inputs,steps:[],status:'En curso',procedure:c.procedure,created:now});}
if(c.type==='step'){const p=prod(c.production);if(p.status!=='En curso')fail('La ficha está cerrada.');member(c.operator);c.participants.forEach(member);const pr=s.procedures.find(x=>x.id===p.procedure);if(c.name!==pr.steps[p.steps.length])fail('Registre la siguiente etapa.');const a=Date.parse(c.start),b=Date.parse(c.end);if(!Number.isFinite(a)||!Number.isFinite(b)||b<a||b>Date.now()+60000)fail('Revise los horarios de ejecución.');if(p.steps.length&&a<Date.parse(p.steps.at(-1).end))fail('El inicio debe ser posterior a la etapa anterior.');if(c.checks.some(v=>!v))fail('Complete las verificaciones.');p.steps.push({...c,id:id(),recorded:now});ref=p.id;}
if(c.type==='output'){const p=prod(c.production);member(c.responsible);const pr=s.procedures.find(x=>x.id===p.procedure);if(p.status!=='En curso'||p.steps.length!==pr.steps.length)fail('Complete todas las etapas antes del resultado.');ref=id();const l={...c,id:ref,code:'GM-'+String(s.lots.length+1).padStart(5,'0'),quantity:0,released:false,parents:[p.id],origin:'Producción interna',variety:'',harvest:'',created:now};s.lots.push(l);move(l,c.quantity,'Resultado',p.id);p.status='Pendiente de revisión';}
if(c.type==='review'){const p=prod(c.production);member(c.reviewer);if(p.status!=='Pendiente de revisión')fail('La ficha debe tener un resultado.');p.status='Aprobada';p.reviewer=c.reviewer;s.lots.filter(l=>l.parents.includes(p.id)).forEach(l=>l.released=true);ref=p.id;}
if(c.type==='donation'){const l=lot(c.lotId);if(l.category!=='Producto terminado'||!l.released)fail('Seleccione un producto terminado liberado.');ref=id();move(l,-c.quantity,'Donación',c.reference);s.donations.push({...c,id:ref,at:now});}
if(c.type==='adjust'){if(c.quantity===0)fail('El ajuste debe modificar el saldo.');const l=lot(c.lotId);move(l,c.quantity,'Ajuste',c.reason);ref=l.id;}
if(c.type==='procedure'){ref=id();s.procedures.push({id:ref,name:c.name,version:s.procedures.filter(p=>p.name===c.name).length+1,steps:c.steps,approved:false});}
if(c.type==='approve-procedure'){member(c.reviewer);const p=s.procedures.find(x=>x.id===c.id)||fail('Procedimiento no encontrado.');if(p.approved)fail('Ya aprobado.');p.approved=true;p.reviewer=c.reviewer;ref=p.id;}
if(c.type==='correction'){const p=prod(c.production),st=p.steps.find((x:any)=>x.id===c.step)||fail('Etapa no encontrada.');s.audit.push({at:now,actor,action:'Corrección: '+c.reason+' | Observación anterior: '+st.notes,reference:st.id});st.notes=c.notes;ref=p.id;}
s.audit.push({at:now,actor,action:({member:'Alta de miembro','member-toggle':'Estado del miembro',lot:'Alta de lote',release:'Liberación de lote',production:'Inicio de producción',step:'Registro de etapa',output:'Registro de resultado',review:'Aprobación de producción',donation:'Donación',adjust:'Ajuste de inventario',procedure:'Alta de procedimiento','approve-procedure':'Aprobación de procedimiento',correction:'Corrección de observación'})[c.type],reference:ref});return s;}



