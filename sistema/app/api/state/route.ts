import {SUPABASE_PROJECT_URL,SUPABASE_PUBLISHABLE_KEY} from '../../../lib/supabase-public';
async function forward(request:Request,mode:'read'|'command'){
 const authorization=request.headers.get('Authorization');
 if(!authorization?.startsWith('Bearer '))return Response.json({error:'Inicie sesión.'},{status:401});
 if(mode==='command'&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origen no permitido.'},{status:403});
 try{
  let input:Record<string,unknown>={};
  if(mode==='command'){const text=await request.text();if(new TextEncoder().encode(text).length>100000)return Response.json({error:'Solicitud demasiado grande.'},{status:413});input=JSON.parse(text);}
  const response=await fetch(SUPABASE_PROJECT_URL+'/functions/v1/production-api',{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:authorization,'Content-Type':'application/json'},body:JSON.stringify({...input,mode}),signal:AbortSignal.timeout(20000),redirect:'error'});
  if(response.status===404)return Response.json({error:'Servicio de producción pendiente de activación.'},{status:503});
  const value=await response.json();
  return Response.json(value,{status:response.status,headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'No se pudo conectar con el servicio de producción.'},{status:503});}
}
export async function GET(request:Request){return forward(request,'read');}
export async function POST(request:Request){return forward(request,'command');}
