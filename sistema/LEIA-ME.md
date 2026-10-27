# Granja Madre — primeira versão funcional

Interface em espanhol, responsiva para celular e computador. Acesso privado pelo Sites e dados persistentes em Cloudflare D1, vinculados à conta autenticada. A mesma conta acessa os mesmos registros em dispositivos diferentes.

## Recursos implementados

- Equipe com nome, função e ativação/desativação.
- Lotes iniciais, recipientes, origem opcional, unidade, saldo e liberação.
- Procedimentos com etapas, versões em rascunho e registro de aprovação.
- Ficha com vários lotes de entrada e consumo registrado ao iniciar.
- Etapas em sequência com execução, operador, participantes, equipamento, recipiente, resultado, observações e verificações do registro.
- Resultado vinculado à ficha e aos lotes de origem, seguido de revisão para liberação.
- Movimentações, ajustes justificados, doações por referência interna e prevenção de saldo negativo.
- Consulta de origem e destinos, etiquetas QR privadas e relatório para impressão/salvar em PDF pelo navegador.
- Exportação JSON da base e do relatório; correções de observações preservam o texto anterior na auditoria.
- Proteção contra gravação sobre uma versão desatualizada dos dados.

## Limites desta versão

Esta é uma base para revisão e piloto. Membros do cadastro ainda não têm contas individuais nem permissões distintas. O responsável selecionado no formulário identifica a pessoa informada; o autor autenticado da gravação também fica registrado. As aprovações não constituem assinatura digital nem comprovação de habilitação profissional.

O fluxo observado começa como rascunho e não inclui receitas, concentrações, temperaturas ou tempos técnicos padrão. A associação deve revisar os passos e os responsáveis antes de aprovar. Os checklists atuais verificam a qualidade do registro; checklists técnicos específicos, campos estruturados de medição, anexos/fotos e inventário de equipamentos precisam de desenvolvimento adicional após levantamento com a equipe.

Não implementados: logins da equipe, consulta pública do QR, dados clínicos de beneficiários, notificações automáticas, cultivo, restauração por interface e política automatizada de backup. Exportação manual disponível. Cada ficha gera um lote resultante; divisões de uma matéria-prima ocorrem em fichas diferentes, e combinação é feita selecionando vários lotes de entrada.

## Validação

`node scripts/test-domain.mjs`: regras de estoque, liberação, consumo atômico, etapas, conferência, resultado, doações e correções.

`node scripts/test-api.mjs`: com servidor local ativo, verifica autenticação simulada, API e persistência D1, conflitos de revisão, origem da requisição e fluxo completo. Cria somente dados de teste locais, separados da base hospedada.

`node node_modules/typescript/bin/tsc --noEmit`: validação de tipos.

Build pelo helper de Sites. Migração em `drizzle/0000_happy_magma.sql`. A publicação aplica a migração à base hospedada; o estado local `.wrangler` não é publicado.

Interface conferida em navegador e largura de 390 px. QR gerado e exibido; leitura com câmera física e impressão em impressora de etiquetas ainda precisam ser validadas na associação.

## Primeiro uso

1. Abra Equipe e cadastre os membros.
2. Em Procedimientos, revise o rascunho ou crie outro e registre sua aprovação somente depois da validação do responsável.
3. Cadastre e confira os lotes iniciais em Lotes e inventario; libere os que estiverem aptos.
4. Inicie uma produção selecionando o procedimento e as quantidades de cada lote.
5. Registre os passos reais, o resultado e a revisão.
6. Consulte etiquetas, histórico e informe; registre as saídas dos produtos liberados.

## Atualização de 7 de outubro de 2026

Esta cópia foi adaptada para Supabase e login individual da equipe. As informações anteriores descrevem a versão já publicada; o estado atualizado e as pendências de ativação estão em `SUPABASE-INTEGRACAO.md`. Os perfis de acesso e a função remota foram preparados e testados com serviços simulados, mas ainda não implantados no projeto Supabase informado.
