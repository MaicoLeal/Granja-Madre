export type AppRole = 'admin' | 'operator' | 'reviewer' | 'viewer';
const permissions: Record<AppRole, readonly string[]> = {
admin:['member','member-toggle','lot','release','production','step','output','review','donation','adjust','procedure','approve-procedure','correction','link-self-member'],
operator:['lot','production','step','output','donation','correction'],reviewer:['release','review','approve-procedure','correction'],viewer:[]};
export function canCommand(role:AppRole,type:string):boolean{return Object.prototype.hasOwnProperty.call(permissions,role)&&permissions[role].includes(type);}
export function assertCommandAccess(role:AppRole,command:unknown,memberId:string|null){
if(!command||typeof command!=='object'||!('type' in command)||typeof command.type!=='string'||!canCommand(role,command.type))throw Error('No tiene permiso para realizar esta operación.');
const c=command as Record<string,unknown>,field=c.type==='step'?'operator':c.type==='review'||c.type==='approve-procedure'?'reviewer':null;
if(field&&(!memberId||c[field]!==memberId))throw Error('El responsable debe corresponder a su perfil operativo vinculado.');}
