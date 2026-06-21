# Portal de Saúde Nacional (PSN) — Angola

A saúde de toda a Angola num só portal: **hospitais públicos, clínicas privadas e farmácias**.
Os Utentes encontram unidades perto de si, consultam especialidades e médicos disponíveis,
veem a cobertura das seguradoras, marcam consultas e gerem a sua ficha de saúde e o seu
agregado familiar — tudo em **português de Portugal** e com valores em **Kwanza (Kz)**.

> Estado: **MVP (v1)**. As integrações externas (consulta de BI/NIF via dev.it.ao,
> pagamentos Pay4all/Multicaixa Express) estão implementadas e ativam-se por
> configuração (chaves/credenciais e allowlist de rede).

## 🚀 Pôr online (1 clique)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/am26dev/PSN/tree/claude/angola-health-portal-uw0mjy)

Carrega no botão, inicia sessão com o GitHub e confirma — a Render cria o site e
a base de dados sozinha e dá-te um endereço público. **Não precisas de preencher
nada** para o primeiro teste, e a **primeira conta que criares no site fica
automaticamente como administrador**. Detalhes em [DEPLOY.md](./DEPLOY.md).

## Funcionalidades do MVP

- **Contas de Utente** com Bilhete de Identidade (cidadãos angolanos) ou Passaporte (estrangeiros),
  com validação de formato do BI e pré-preenchimento da província de emissão.
- **Agregado familiar** — o responsável adiciona filhos, cônjuge ou pais.
- **Diretório nacional** com 787 unidades/prestadores compilados (143 hospitais
  públicos/SNS e 644 prestadores privados), pesquisa por nome, tipo, província,
  serviços e seguradora/rede, com paginação.
- **Página da unidade** com especialidades, médicos disponíveis e **seguros aceites** (e atendimento sem seguro).
- **Fontes e validação visíveis** em cada unidade, para distinguir dados oficiais,
  diretórios públicos e registos que ainda devem ser confirmados localmente.
- **Marcação de consultas** com escolha de especialidade/médico e **método de pagamento**.
- **Ficha de saúde** pessoal (tipo sanguíneo, alergias, doenças crónicas, medicação).
- **Verificação de identidade (KYC)** — ver secção própria.

## Verificação de identidade (KYC)

Módulo nativo para confirmar a identidade do utente: o utente faz upload do
documento (BI, Passaporte ou Autorização de Residência) e de uma selfie, num
fluxo passo-a-passo (`/conta/verificacao`); a administração revê e aprova ou
rejeita (`/admin/verificacoes`). Ao aprovar, o utente fica marcado como
verificado.

- **Imagens cifradas em repouso** (AES-256-GCM) e servidas apenas por uma rota
  protegida (`/api/verificacao/imagem/[key]`) acessível só ao dono ou a um
  administrador — nunca há URL pública dos documentos. `STORAGE_DRIVER=s3` é o
  encaixe para produção.
- **Análise honesta:** por omissão valida o formato do documento e encaminha
  para **revisão manual** (não inventa OCR/biometria). `VERIFICACAO_PROVIDER_URL`
  é o ponto único onde se liga um fornecedor real de OCR/biometria — ou o SIAC.
- Administradores definem-se em `PSN_ADMIN_DOCS` (lista de números de documento).

## Consulta de BI / NIF — dev.it.ao

A consulta de dados de cidadãos e empresas usa a API **«Consulta NIF Angola»**
(`https://dev.it.ao`), que funciona como proxy da fonte oficial (AGT). Em Angola,
o NIF de uma pessoa singular é o número do seu BI — por isso a consulta de BI usa
o mesmo endpoint de NIF.

- **Registo:** o botão «Carregar dados» consulta o BI e pré-preenche o nome
  (`/api/identidade/consultar`).
- **Verificação de identidade:** para o BI, a análise junta os dados oficiais
  para apoiar a revisão; o Passaporte permanece em revisão manual.
- **NIF:** consulta autenticada em `/api/identidade/nif/{nif}`.

Configurar com `ITAO_API_KEY` (a chave é um **segredo** — fica só no `.env`). O
domínio `dev.it.ao` tem de estar na allowlist de egress de rede do ambiente.
Sem chave ou sem rede, o portal degrada com elegância (mantém a inferência local
da província do BI).

## Pagamentos — Pay4all (é+ / é-Kwanza)

Os pagamentos são processados pelo parceiro **Pay4all, S.A.** (Grupo BAI, Licença BNA nº 426),
através do produto **é+**, com três canais de cobrança:

| Canal | Como o utente paga |
|---|---|
| **Multicaixa Express** | Recebe a cobrança na app MCX Express e confirma com o cartão. |
| **Referência EMIS** | Paga em qualquer banco/ATM/Multicaixa com Entidade `10111` + referência. |
| **é-Kwanza** | Lê o código QR na carteira digital é-Kwanza. |

Seguro de Saúde (cobertura da seguradora) e Pagamento ao Estado (RUPE) são tratados fora da Pay4all.

O adaptador (`src/lib/pagamentos/pay4all.ts`) é fiel aos fluxos documentados e **configurável por
variáveis de ambiente**. Enquanto `PAY4ALL_API_URL`/`PAY4ALL_API_KEY` não estiverem definidos,
opera em **modo simulado** (gera referências/QR de demonstração) para o fluxo funcionar de ponta a
ponta. As confirmações de pagamento chegam ao webhook `POST /api/pagamentos/webhook`, validado por
assinatura HMAC-SHA256.

> Nota: os caminhos de endpoint e os formatos de pedido/resposta estão centralizados em
> `ENDPOINTS`/`mapearResposta()` e devem ser confirmados com a documentação técnica da Pay4all
> (fornecida após a adesão).

## Identidade visual

Cores da **Bandeira de Angola** segundo a regra 60/30/10:
**60%** base neutra (branco + preto da bandeira para texto, garantindo legibilidade),
**30%** vermelho de Angola (cabeçalhos e superfícies de marca),
**10%** dourado do emblema (botões de ação e destaques).

Os logótipos das seguradoras são servidos pelo próprio portal em
`public/seguradoras/`; as relações entre prestadores e coberturas foram
carregadas a partir do levantamento consolidado de saúde e seguros de Angola.

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
  lib/                 # auth, validação, documentos (BI), moeda, identidade (dev.it.ao), pagamentos
```

## Próximos passos (pós-MVP)

- Validação em produção da consulta de BI/NIF (dev.it.ao) e mapeamento final dos campos da resposta.
- Integração de pagamentos com a **EMIS / Multicaixa Express** e **RUPE**.
- Notificações (SMS/push) e teleconsulta por vídeo.
- Painéis para profissionais e unidades de saúde.
- Interoperabilidade clínica com **HL7 FHIR** e ligação ao SIS/DHIS2 do MINSA.
