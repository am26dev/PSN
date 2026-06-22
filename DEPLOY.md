# Pôr o PSN online (deploy)

O Portal de Saúde Nacional é uma app **Next.js + PostgreSQL**. Abaixo está o
caminho mais rápido para ter um **link público para testar**.

## A forma mais simples (botão, sem nada para preencher)

1. Carregar no botão **Deploy to Render** (no topo do `README.md`).
2. **Iniciar sessão com o GitHub** e autorizar o acesso ao repositório.
3. Carregar em **Apply / Create** e esperar uns minutos.

No fim, a Render mostra um endereço público (ex.: `https://psn-portal.onrender.com`)
— **é esse o link para testar**. Para um primeiro teste **não precisas de
preencher nada**: a app funciona sem as chaves (a consulta de BI/NIF entra em
modo local) e a **primeira conta que criares no site fica automaticamente como
administrador**.

O schema e os **dados de demonstração** (hospitais, clínicas, farmácias e
seguradoras) são carregados automaticamente — sem passos manuais.

### Quando quiseres ativar tudo (opcional, depois)

No painel do serviço na Render → **Environment**, define:
- `ITAO_API_KEY` — a chave da consulta de BI/NIF (dev.it.ao).
- `PSN_ADMIN_DOCS` — número(s) de BI que devem ser administradores.
- chaves `PAY4ALL_*` — quando tiveres as credenciais do parceiro.

## Em alternativa: New → Blueprint (manual)

1. Criar conta em <https://render.com> e ligar ao GitHub (repo `am26dev/PSN`).
2. **New → Blueprint** e escolher a branch `claude/angola-health-portal-uw0mjy`.
3. **Apply** — a Render lê o `render.yaml` e provisiona tudo (web + Postgres).

### Notas importantes

- **Egress aberto:** ao contrário do ambiente de desenvolvimento, a Render deixa
  contactar a `dev.it.ao` — por isso a **chave de consulta de BI/NIF passa a
  funcionar e pode ser validada** em produção.
- **Plano gratuito:** o serviço “adormece” após inatividade (primeiro acesso é
  mais lento) e a base de dados gratuita expira após ~30 dias. Suficiente para
  testar; para produção, usar planos pagos.
- **Imagens da verificação (KYC):** no plano gratuito o disco é efémero (as
  imagens carregadas perdem-se ao reiniciar). Para persistência, adicionar um
  disco (plano pago, `mountPath: /var/data`, `STORAGE_DIR=/var/data/uploads`) ou
  implementar o encaixe S3.

## Primeiro teste após o deploy

1. Abrir o URL → **Criar conta** com um BI (ex.: o que estiver em `PSN_ADMIN_DOCS`
   para entrar como administrador).
2. Explorar: **Encontrar unidade** (diretório), marcar uma consulta (pagamento
   em modo simulado se não houver chaves Pay4all), **A minha conta** →
   **Verificação de identidade**, e **Admin → Verificações**.

## Alternativa: Vercel + Postgres gerido (Neon/Supabase)

A app corre bem na Vercel (deteta Next.js automaticamente). Requer:
- uma base de dados PostgreSQL gerida (Neon/Supabase) → `DATABASE_URL`;
- as mesmas variáveis de ambiente (ver `.env.example`);
- **importante:** a Vercel é *serverless* (sistema de ficheiros só de leitura),
  por isso a verificação de identidade exige o **encaixe S3** para guardar as
  imagens. Para um teste rápido, a Render é mais simples.

## Variáveis de ambiente

Ver `.env.example` para a lista completa e a descrição de cada variável.
