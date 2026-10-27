# Supabase — Granja Madre

Modalidade confirmada pelo usuário: banco de dados Supabase e login individual dos membros da equipe.
Projeto: https://nnlefxtchtfipjekmssx.supabase.co

## Implementado nesta cópia local

- URL e chave publicável em `lib/supabase-public.ts`, sem chave secreta no cliente.
- Cliente oficial `@supabase/supabase-js` fixado em 2.117.2 e lockfile atualizado.
- Portal em espanhol com login por e-mail/senha, sessão individual, encerramento de sessão e troca de senha.
- Transporte do token de usuário para a API; validação remota da identidade com `auth.getUser(token)`.
- Perfis de administrador, operador, responsável pela revisão e consulta, definidos por vínculo no banco, sem usar `user_metadata` para autorização.
- Função `production-api`: vínculo ativo, papel, identificação do operador/revisor, atualização por revisão e mesmas regras de produção da versão original.
- Proposta de estrutura `supabase/schema-equipe-proposto.sql`: espaços, vínculos de equipe e estado versionado. RLS habilitada; usuários só consultam vínculos próprios ativos e registros dos espaços autorizados. Gravações diretas pelo cliente não são concedidas.
- Regras de negócio compartilhadas com a função, geradas por `node scripts/prepare-supabase-edge.mjs`.

A função utiliza a credencial administrativa interna do ambiente Edge Functions, somente depois de validar o token e o vínculo do usuário. Essa credencial não é recebida pelo navegador nem precisa ser enviada no chat. `verify_jwt=false` no config da função utiliza autenticação própria com `getUser` antes de qualquer consulta; não significa endpoint sem autenticação. A configuração precisa ser conferida contra o projeto real antes da implantação.

## Verificação em 7 de outubro de 2026

- Auth/settings respondeu HTTP 200 com a chave enviada; login por e-mail está habilitado.
- `gm_spaces` não aparece no cache de esquema da API (404/PGRST205).
- A função `production-api` não está publicada (404/NOT_FOUND).
- Conector Supabase recusou acesso ao projeto informado. O projeto também não aparece na lista de projetos acessíveis pela conexão atual.
- Testes de domínio, permissões e autenticação da função passaram. Testes da função usaram serviços simulados, sem gravações remotas.
- Verificação TypeScript e compilação de produção passaram.
- Página local respondeu HTTP 200; API local recusou requisição sem token com HTTP 401.
- Conferência visual da nova tela não concluída: ferramenta de navegador falhou ao iniciar nesta sessão. Nenhuma tentativa de login com usuário real foi feita.

## Ativação pendente

1. Autorizar/reconectar o plugin Supabase à conta/organização que possui `nnlefxtchtfipjekmssx`.
2. Inspecionar as tabelas, políticas e migrações existentes. A proposta SQL é um arquivo de revisão, ainda não uma migração aplicada ou gerada pelo CLI.
3. Aplicar o esquema revisado, executar os advisors e testar a RLS com usuário sem vínculo, usuário de consulta e usuário autorizado.
4. Criar o espaço de equipe e vincular o primeiro administrador a uma conta Auth confirmada. O administrador deverá cadastrar seu perfil operacional e vinculá-lo pela ação “Vincular a mi cuenta”. Vincular os demais usuários às funções e perfis operacionais autorizados.
5. Publicar a função e testar login real, acesso compartilhado e gravação. Usuários podem ter conta Auth sem acesso ao espaço; somente vínculos ativos concedem acesso.
6. Conferir/exportar os registros existentes do D1 e preparar sua migração, preservando a origem. A versão hospedada anterior continua inalterada.
7. Definir o acesso/hospedagem do portal da equipe. O endereço Sites anterior permanece privado da conta proprietária e continua exigindo o acesso da plataforma; o login Supabase sozinho não elimina essa restrição. Não foi ampliada a audiência do site.
8. Publicar a aplicação somente depois de validar o backend e a forma de acesso da equipe.

Não foram criadas contas reais, enviadas mensagens de convite, aplicadas tabelas remotas ou alteradas permissões do site nesta preparação.

## Comandos de verificação

- `node scripts/test-domain.mjs`
- `node scripts/test-access.mjs`
- `node scripts/test-edge-auth.mjs`
- `node scripts/check-supabase.mjs` (verifica apenas conectividade/configuração pública)
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `node scripts/run-framework.mjs build`

## Fontes consultadas

- https://supabase.com/changelog.md
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/jwts
- https://supabase.com/docs/guides/functions/auth-legacy-jwt
