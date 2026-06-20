# Pôr o PSN online (deploy)

O Portal de Saúde Nacional é uma app **Next.js + PostgreSQL**. Abaixo está o
caminho mais rápido para ter um **link público para testar**.

## Opção recomendada: Render (1 clique, via blueprint)

O repositório já inclui um `render.yaml` que cria o serviço web **e** a base de
dados PostgreSQL automaticamente.

1. Criar conta em <https://render.com> e ligar a conta ao GitHub (repo `am26dev/PSN`).
2. **New → Blueprint** e escolher o repositório/branch `claude/angola-health-portal-uw0mjy`.
   A Render lê o `render.yaml` e provisiona tudo (web + Postgres + segredos).
3. Antes do primeiro deploy, definir os segredos no painel do serviço:
   - `ITAO_API_KEY` — a chave da consulta de BI/NIF (dev.it.ao).
   - `PSN_ADMIN_DOCS` — o(s) número(s) de BI que devem ser administradores.
   - (Opcional) chaves `PAY4ALL_*` quando tiver as credenciais do parceiro.
4. Fazer **Deploy**. No fim, a Render dá um URL público do tipo
   `https://psn-portal.onrender.com` — é esse o link para testar.
5. **Carregar os dados de demonstração** (uma vez): no separar **Shell** do
   serviço, correr `npm run db:seed` (cria hospitais, clínicas, farmácias e
   seguradoras). O `db:push` já corre sozinho a cada deploy.

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
