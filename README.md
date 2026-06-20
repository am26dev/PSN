# Portal de Saúde Nacional (PSN) — Angola

A saúde de toda a Angola num só portal: **hospitais públicos, clínicas privadas e farmácias**.
Os Utentes encontram unidades perto de si, consultam especialidades e médicos disponíveis,
veem a cobertura das seguradoras, marcam consultas e gerem a sua ficha de saúde e o seu
agregado familiar — tudo em **português de Portugal** e com valores em **Kwanza (Kz)**.

> Estado: **MVP (v1)**. Algumas integrações externas (SIAC e Multicaixa Express/EMIS)
> estão preparadas como "encaixes" e entram em funcionamento mediante protocolo institucional.

## Funcionalidades do MVP

- **Contas de Utente** com Bilhete de Identidade (cidadãos angolanos) ou Passaporte (estrangeiros),
  com validação de formato do BI e pré-preenchimento da província de emissão.
- **Agregado familiar** — o responsável adiciona filhos, cônjuge ou pais.
- **Diretório nacional** de unidades, com pesquisa por nome, tipo e província.
- **Página da unidade** com especialidades, médicos disponíveis e **seguros aceites** (e atendimento sem seguro).
- **Marcação de consultas** com escolha de especialidade/médico e **método de pagamento**
  (Multicaixa Express, Transferência Bancária, Seguro de Saúde, Pagamento ao Estado/RUPE).
- **Ficha de saúde** pessoal (tipo sanguíneo, alergias, doenças crónicas, medicação).

## Identidade visual

Cores da **Bandeira de Angola** segundo a regra 60/30/10:
**60%** base neutra (branco + preto da bandeira para texto, garantindo legibilidade),
**30%** vermelho de Angola (cabeçalhos e superfícies de marca),
**10%** dourado do emblema (botões de ação e destaques).

## Stack técnica

- **Next.js (App Router) + TypeScript** — web responsiva / PWA.
- **PostgreSQL + Prisma** — base de dados e ORM.
- **Segurança:** palavras-passe com **Argon2id**, sessões assinadas (`jose`) e revogáveis em BD,
  cabeçalhos de segurança (HSTS, X-Frame-Options, etc.), validação de entrada com **Zod**.
  Tratamento de dados conforme a **Lei n.º 22/11** de Proteção de Dados Pessoais de Angola.

## Como executar localmente

Pré-requisitos: Node 20+ e PostgreSQL.

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env
#   - defina DATABASE_URL para o seu PostgreSQL
#   - gere um SESSION_SECRET:  openssl rand -base64 48

# 3. Base de dados (cria as tabelas e os dados iniciais)
npm run db:push
npm run db:seed

# 4. Arrancar
npm run dev          # desenvolvimento  → http://localhost:3000
# ou
npm run build && npm run start
```

### Scripts úteis

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (inclui `prisma generate`) |
| `npm run db:push` | Aplica o schema Prisma à base de dados |
| `npm run db:seed` | Semeia seguradoras, especialidades e unidades |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run db:reset` | Recria a base de dados e volta a semear |

## Estrutura

```
prisma/
  schema.prisma        # modelo de dados (Utente, Dependente, Unidade, Marcação, …)
  seed.ts              # dados iniciais (Angola)
src/
  app/                 # páginas e rotas de API (App Router)
  components/          # componentes de UI
  lib/                 # auth (Argon2/sessões), validação, documentos (BI), moeda, SIAC
```

## Próximos passos (pós-MVP)

- Integração real com o **SIAC** (carregamento automático de dados pelo BI).
- Integração de pagamentos com a **EMIS / Multicaixa Express** e **RUPE**.
- Notificações (SMS/push) e teleconsulta por vídeo.
- Painéis para profissionais e unidades de saúde.
- Interoperabilidade clínica com **HL7 FHIR** e ligação ao SIS/DHIS2 do MINSA.
