# Sistema Administrativo Sono Inteligente

**Autores**

- Cauê Silva Rasteiro (26033)
- Rosa Gonzales Ribeiro Meneghetti (25976)
- Igor Carneiro Carvalho (26028)

Ciência da Computação | 4º semestre


## Sobre o sistema

O Sono Inteligente é um sistema administrativo para o acompanhamento de pacientes que usam CPAP (tratamento da apneia do sono). Ele centraliza o que antes era feito de forma manual:

- **Pacientes:** cadastro com dados pessoais, equipamento (modelo e número de série do CPAP, máscara, tipo de filtro), médico responsável e polissonografia em PDF.
- **Relatórios:** importação dos PDFs de relatório das plataformas dos fabricantes (AirView, Care Orchestrator, Smart Live), associação ao paciente, revisão dos indicadores e aprovação antes do envio.
- **Mensagens:** envio de lembretes e relatórios aos pacientes por WhatsApp (integração com a Evolution API), com fila, histórico e reenvio das falhas.
- **Automações:** acompanhamento das tarefas automáticas, conectores dos portais e controle para pausar ou retomar os envios.
- **Configurações:** perfil do administrador, janela de horário de envio, fuso horário, modelos de CPAP e tipo de filtro, modelos de mensagem e tema da interface.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Node.js, Express 5, TypeScript, Prisma 7.10, PostgreSQL, Zod, JWT, bcryptjs |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Axios, Lucide |
| Infraestrutura | Docker Compose (PostgreSQL 16) |

## Estrutura do repositório

```
backend/    API REST (Express + Prisma)
frontend/   Aplicação web (React + Vite)
infra/      docker-compose do banco de dados
```

### Scripts

| Local | Comando | O que faz |
| --- | --- | --- |
| backend | `npm run dev` | Inicia a API com recarga automática |
| backend | `npm run build` | Gera o client do Prisma e compila para `dist/` |
| backend | `npm start` | Executa a versão compilada |
| backend | `npm run db:migrate` | Cria e aplica migrations (desenvolvimento) |
| backend | `npm run db:deploy` | Aplica as migrations existentes |
| backend | `npm run test:integration` | Teste de integração (exige `TEST_DATABASE_URL` apontando para um banco vazio cujo nome termina em `_test`) |
| frontend | `npm run dev` | Inicia o Vite |
| frontend | `npm run build` | Verifica os tipos e gera o build |
| frontend | `npm run lint` | Executa o linter |

## Variáveis de ambiente (backend)

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `PORT` | Porta da API | `3000` |
| `NODE_ENV` | `development` ou `production` | |
| `APP_ORIGIN` | Origens permitidas no CORS, separadas por vírgula | `http://localhost:5173` |
| `DATABASE_URL` | String de conexão do PostgreSQL | |
| `JWT_ACCESS_SECRET` | Segredo do token de acesso (mínimo de 32 caracteres em produção) | valor privado |
| `JWT_ACCESS_EXPIRES_IN` | Validade do token de acesso | `15m` |
| `JWT_REFRESH_TTL_DAYS` | Validade da sessão (refresh token), em dias | `7` |
| `PRIVATE_FILES_DIR` | Pasta onde os PDFs são guardados | `backend/storage/private` (no sistema do cliente guardamos em nuvem, essa é somente uma adaptação) |
| `EVOLUTION_API_ENABLED` | Liga a integração com o WhatsApp | `false` |
| `EVOLUTION_API_URL` | URL da Evolution API | |
| `EVOLUTION_API_KEY` | Chave da Evolution API | |
| `EVOLUTION_INSTANCE` | Nome da instância do WhatsApp | |
| `EVOLUTION_TEST_RECIPIENTS` | Números autorizados para mensagens de teste, separados por vírgula | |
| `EVOLUTION_API_TIMEOUT_MS` | Tempo limite das chamadas à Evolution API | `10000` |

## Telas do frontend

| Rota | Tela | Acesso |
| --- | --- | --- |
| `/login` | Login | Público |
| `/cadastro` | Cadastro do primeiro administrador | Público |
| `/recuperar-acesso` | Recuperação de acesso | Público |
| `/inicio` | Painel com resumo, atividade recente e próximos lembretes | Autenticado |
| `/pacientes` | Lista de pacientes com busca, filtros e paginação | Autenticado |
| `/pacientes/novo` | Cadastro de paciente | Autenticado |
| `/pacientes/:id` | Detalhes do paciente | Autenticado |
| `/pacientes/:id/editar` | Edição e desativação do paciente | Autenticado |
| `/mensagens` | Fila de mensagens e estado da conexão do WhatsApp | Autenticado |
| `/mensagens/:id` | Detalhe do envio e reenvio | Autenticado |
| `/mensagens/reconectar` | Pareamento do WhatsApp por QR code | Administrador |
| `/mensagens/modelos/:id/editar` | Edição de modelo de mensagem | Administrador |
| `/relatorios` | Fila de importação de relatórios em PDF | Autenticado |
| `/relatorios/:id` | Revisão e aprovação do relatório | Autenticado |
| `/relatorios/:id/enviar` | Pré-visualização e agendamento do envio | Autenticado |
| `/automacoes` | Status das automações, conectores e execuções | Administrador |
| `/automacoes/:id` | Detalhe de uma execução | Autenticado |
| `/configuracoes` | Perfil, senha e tema | Autenticado |
| `/configuracoes/lembretes` | Janela de envio, fuso e modelos de CPAP | Administrador |

## Documentação da API

URL base: `http://localhost:3000`

### Convenções

**Autenticação.** O login devolve um token de acesso (JWT, 15 minutos por padrão) que deve ser enviado no cabeçalho `Authorization: Bearer <token>`. A sessão é renovada por um refresh token guardado em cookie HttpOnly (`si_refresh`, caminho `/auth`), que é rotacionado a cada renovação. O cliente HTTP precisa enviar cookies (`withCredentials: true`).

**Perfis.** `ADMIN` e `STAFF`. Os endpoints marcados como *Admin* respondem 403 para `STAFF`.

**Formato das respostas.**

- Item único: `{ "patient": { ... } }`, `{ "user": { ... } }` etc. (a chave é o nome do recurso).
- Listas: `{ "data": [ ... ], "pagination": { "page", "pageSize", "total", "totalPages" } }`.
- Exclusões e desativações: `204 No Content`.

**Paginação.** Parâmetros `page` (padrão 1) e `pageSize` (padrão 25, máximo 100).

**Erros.**

```json
{ "message": "Request validation failed", "status": 400, "details": [{ "field": "cpf", "rule": ["CPF must be valid"] }] }
```

| Status | Significado |
| --- | --- |
| 400 | Dados inválidos (o campo `details` lista os campos) |
| 401 | Token ausente, inválido ou expirado, ou credenciais incorretas |
| 403 | Sem permissão |
| 404 | Recurso ou rota inexistente |
| 409 | Conflito (registro duplicado ou estado que não permite a ação) |
| 429 | Muitas tentativas nas rotas de autenticação (20 por 15 minutos por IP) |
| 500 | Erro interno |


**Upload de arquivos.** Os PDFs são enviados em `multipart/form-data`, com até 20 MB por arquivo

### Saúde

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/health` | Público | Verifica se a API está no ar |

### Autenticação (`/auth`)

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/register` | Público | Cria o primeiro administrador (403 se já existir usuário) |
| POST | `/auth/login` | Público | Autentica e devolve `user`, `accessToken` e `expiresIn`; define o cookie de sessão |
| POST | `/auth/refresh` | Cookie | Renova o token de acesso e rotaciona o refresh token |
| POST | `/auth/logout` | Cookie | Encerra a sessão e limpa o cookie |
| GET | `/auth/me` | Autenticado | Dados do usuário logado |
| PATCH | `/auth/password` | Autenticado | Troca a senha e revoga todas as sessões |

Corpos:

- `register`: `name`, `email`, `username` (opcional), `password`, `confirmPassword` (opcional).
- `login`: `email` (aceita e-mail ou nome de usuário) e `password`.
- `password`: `currentPassword` e `newPassword`.
- Regra de senha: 12 a 128 caracteres, com pelo menos uma letra e um número.

### Usuários (`/users`)

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/users/me` | Autenticado | Perfil do usuário logado |
| PATCH | `/users/me` | Autenticado | Atualiza `name`, `email` ou `username` do próprio perfil |
| GET | `/users` | Admin | Lista usuários. Filtros: `search`, `role`, `isActive` |
| POST | `/users` | Admin | Cria usuário (`name`, `email`, `username`, `password`, `role`) |
| GET | `/users/:id` | Admin | Busca um usuário |
| PATCH | `/users/:id` | Admin | Atualiza `name`, `email`, `username`, `role`, `isActive` |
| DELETE | `/users/:id` | Admin | Desativa o usuário |


### Pacientes (`/patients`)

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/patients` | Autenticado | Lista pacientes |
| POST | `/patients` | Autenticado | Cadastra paciente |
| GET | `/patients/:id` | Autenticado | Detalhes, com documentos, relatórios, mensagens e histórico de alterações |
| PATCH | `/patients/:id` | Autenticado | Atualiza dados (campos vazios limpam o valor) |
| DELETE | `/patients/:id` | Autenticado | Desativa o paciente (status `INACTIVE`, remove a autorização de WhatsApp) |
| GET | `/patients/:id/documents` | Autenticado | Lista documentos do paciente |
| POST | `/patients/:id/documents` | Autenticado | Envia PDF (campo `file`; `type`: `POLYSOMNOGRAPHY` ou `OTHER`) |
| GET | `/patients/:patientId/documents/:documentId/file` | Autenticado | Baixa o PDF |

Filtros da listagem: `search` (nome, telefone, e-mail, CPF ou série), `status` (`ACTIVE`, `PAUSED`, `INACTIVE` ou `ALL`; padrão `ACTIVE`), `cpapModelId`, `filterType`, `reportPlatform`, `maskModel`, `physicianName`, `minAge`, `maxAge`, `therapyStartFrom`, `therapyStartTo`.

Campos do paciente: `fullName` e `phone` (obrigatórios), `birthDate`, `therapyStartDate`, `cpf` , `cep`, `email`, `cpapSerialNumber`, `cpapModelId`, `cpapModelName`, `filterType` (`WASHABLE`, `DISPOSABLE`, `UNKNOWN`), `physicianName`, `maskModel`, `reportPlatform` (`AIRVIEW`, `CARE_ORCHESTRATOR`, `SMART_LIVE`), `status` e `whatsappOptIn`. A resposta inclui `age`, calculada pela data de nascimento. Ao informar `cpapModelId`, o nome do modelo e o tipo de filtro são preenchidos a partir do cadastro de modelos.

### Modelos de CPAP (`/cpap-models`) - Admin

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/cpap-models` | Lista modelos. Filtros: `search`, `filterType`, `isActive` |
| POST | `/cpap-models` | Cria modelo (`manufacturer`, `model`, `filterType`, `isActive`) |
| GET | `/cpap-models/:id` | Busca um modelo |
| PATCH | `/cpap-models/:id` | Atualiza um modelo |
| DELETE | `/cpap-models/:id` | Desativa o modelo |

### Relatórios (`/reports`)

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/reports` | Autenticado | Lista relatórios. Filtros: `status`, `matchStatus`, `platform`, `patientId`, `periodFrom`, `periodTo` |
| POST | `/reports/import` | Autenticado | Importa até 5 PDFs por requisição (campo `files`), com `platform`, `periodStart` e `periodEnd` |
| GET | `/reports/:id` | Autenticado | Detalhes, paciente associado e indicadores |
| GET | `/reports/:id/file` | Autenticado | Baixa o PDF |
| PATCH | `/reports/:id/associate` | Autenticado | Associa manualmente a um paciente (`patientId`) |
| PUT | `/reports/:id/metrics` | Autenticado | Substitui os indicadores (`metrics`: lista com `key`, `value` ou `valueText`, `unit`, `sourceLabel`) |
| POST | `/reports/:id/approve` | Autenticado | Aprova o relatório |
| POST | `/reports/:id/retry` | Autenticado | Reprocessa um relatório com falha |

Na importação, o sistema tenta associar o PDF a um paciente pelo CPF ou pelo número de série do CPAP encontrado no texto. Arquivos repetidos (mesmo conteúdo) são detectados e não são importados de novo. Cada item do resultado traz `status`: `ASSOCIATED_REVIEW_REQUIRED`, `UNMATCHED`, `REVIEW_REQUIRED`, `DUPLICATE` ou `FAILED`.

Para aprovar, o relatório precisa ter paciente associado, período informado e estar em revisão (`REVIEW_REQUIRED`).

Status do relatório: `AWAITING_MATCH`, `PROCESSING`, `REVIEW_REQUIRED`, `APPROVED`, `SENT`, `FAILED`.

### Mensagens (`/messages`)

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/messages` | Autenticado | Lista mensagens. Filtros: `status`, `category`, `patientId`, `from`, `to` |
| POST | `/messages` | Autenticado | Agenda uma mensagem |
| GET | `/messages/:id` | Autenticado | Detalhes da mensagem |
| POST | `/messages/:id/retry` | Autenticado | Recoloca na fila uma mensagem com falha |


Categorias: `FILTER_WASH`, `FILTER_REPLACE_DISPOSABLE`, `FILTER_REPLACE_WASHABLE`, `ANNUAL_MAINTENANCE`, `MONTHLY_REPORT`, `CUSTOM`.

Status: `SCHEDULED`, `PENDING`, `PROCESSING`, `SENT`, `DELIVERED`, `FAILED`, `CANCELLED`.

### Modelos de mensagem (`/message-templates`)

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/message-templates` | Autenticado | Lista modelos. Filtros: `search`, `category`, `filterType`, `isActive` |
| GET | `/message-templates/:id` | Autenticado | Busca um modelo |
| POST | `/message-templates` | Admin | Cria modelo (`code`, `name`, `category`, `filterType`, `body`, `mediaUrl`, `isActive`) |
| PATCH | `/message-templates/:id` | Admin | Atualiza um modelo |
| DELETE | `/message-templates/:id` | Admin | Desativa o modelo |


### WhatsApp (`/integrations/whatsapp`) - Admin

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/integrations/whatsapp/status` | Estado da conexão: `{ enabled, connected, state }` |
| POST | `/integrations/whatsapp/connect` | Gera o QR code (ou código) de pareamento |
| POST | `/integrations/whatsapp/test-message` | Envia mensagem de teste (`recipient`, `message`), somente para números de `EVOLUTION_TEST_RECIPIENTS` |


### Automações (`/automation-jobs`)

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/automation-jobs` | Autenticado | Lista tarefas. Filtros: `status`, `type`, `patientId` |
| GET | `/automation-jobs/:id` | Autenticado | Detalhes da tarefa |
| POST | `/automation-jobs/:id/retry` | Admin | Recoloca na fila uma tarefa com falha (respeita o máximo de tentativas) |

Tipos: `MESSAGE_SEND`, `REPORT_IMPORT`, `REPORT_PROCESS`, `REPORT_SEND`, `PORTAL_SYNC`. Status: `QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `CANCELLED`.

### Configurações (`/settings`) - Admin

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/settings` | Configurações globais |
| PATCH | `/settings` | Atualiza `timezone`, `sendingWindowStart`, `sendingWindowEnd` (formato `HH:mm`), `messageAutomationEnabled`, `reportAutomationEnabled` |
| GET | `/settings/portals` | Lista os conectores (AirView, Care Orchestrator, Smart Live) |
| PATCH | `/settings/portals/:platform` | Liga ou desliga um conector (`isEnabled`) |

### Painel (`/dashboard`)

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/dashboard/summary` | Autenticado | Pacientes ativos, mensagens do dia (agendadas, enviadas, com falha), relatórios (pendentes, processados, com falha), estado das automações e atividade recente |