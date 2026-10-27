'use client';
import {createClient} from '@supabase/supabase-js';
import {SUPABASE_PROJECT_URL,SUPABASE_PUBLISHABLE_KEY} from './supabase-public';
export const supabase=createClient(SUPABASE_PROJECT_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
export async function authenticatedFetch(path:string,init:RequestInit={}){
// O servidor verifica a identidade e o vínculo; a sessão local só transporta o token.
const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Su sesión terminó. Inicie sesión nuevamente.');
const headers=new Headers(init.headers);headers.set('Authorization','Bearer '+session.access_token);return fetch(path,{...init,headers,cache:'no-store'});}
