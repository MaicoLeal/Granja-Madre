import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const target=new URL('../supabase/functions/_shared/',import.meta.url);mkdirSync(target,{recursive:true});
writeFileSync(new URL('model.ts',target),readFileSync(new URL('../db/model.ts',import.meta.url),'utf8').replace("from 'zod'","from 'npm:zod@3.25.76'"));
writeFileSync(new URL('access.ts',target),readFileSync(new URL('../db/access.ts',import.meta.url),'utf8'));console.log('Edge Function preparada con las mismas reglas de producción y permisos.');
