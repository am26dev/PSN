# Relatório de Progresso — Portal de Saúde Nacional (PSN)

**Data:** 18 de Agosto de 2026
**Estado actual:** MVP funcional, sem produção

---

## 1. O que é o PSN

Plataforma web para cidadãos angolanos agendarem consultas médicas, verificarem identidade e consultarem o histórico clínico. Inclui:

- **Público:** directório de hospitais, clínicas e farmácias; marcação de consultas; pagamento online.
- **Utentes:** ficha de saúde, agregado familiar, verificação de identidade (BI/passaporte).
- **Médicos:** pesquisa de paciente, registo de consultas, exames e patologias.
- **Administração:** gestão de unidades, utilizadores, verificações e conteúdo do site.

---

## 2. O que foi feito neste ciclo

### 2.1 Arquitectura em camadas (service layer)

**Antes:** a lógica de negócio, acesso a dados e HTTP estavam misturados nos route handlers. Cada rota repetia queries ao banco de dados e regras de validação.

**Depois:** separação em três camadas:

| Camada | Responsabilidade | Exemplo |
|---|---|---|
| **Route handlers** | Receber pedido HTTP, validar, chamar serviço, responder | `src/app/api/marcacoes/route.ts` |
| **Services** | Lógica de negócio, regras, transações | `src/lib/services/marcacao.service.ts` |
| **Prisma** | Acesso a dados (único ponto de contacto com a BD) | `src/lib/prisma.ts` |

**Resultado:** 13 services de domínio criados (auth, marcacao, ficha, dependente, perfil, verificacao, identidade, unidade, conteudo, ficheiro, utenteAdmin, medico, pagamento) + 4 novos (utente, seguro, dashboard, verificacao leitura).

### 2.2 Eliminação de chamadas directas ao banco de dados

**Antes:** 38 chamadas directas ao Prisma espalhadas por páginas e API routes.

**Depois:** zero. Toda a camada `app/` (pages + API routes) agora chama o banco de dados exclusivamente via services.

| Camada | Chamadas directas ao Prisma |
|---|---|
| API routes (23 rotas) | 0 |
| Pages server-component (16 páginas) | 0 |
| Services (17 ficheiros) | Único ponto de contacto |

### 2.3 Cache ISR (revalidação incremental)

Dados que mudam pouco ficam em cache, evitando consultas repetidas ao banco:

- **Directório de unidades:** cache de 1 hora
- **Contagens da home page:** cache de 1 hora
- **Listas de seguradoras:** cache de 1 hora
- **Painel de administração:** cache de 5 minutos

### 2.4 Testes e build

| Verificação | Resultado |
|---|---|
| Typecheck (`tsc --noEmit`) | 0 erros |
| Testes unitários (`npm test`) | 19/19 verdes |
| Build de produção (`npm run build`) | Exit 0, 37 rotas compiladas |

---

## 3. Impacto

| Métrica | Antes | Depois |
|---|---|---|
| Ficheiros com lógica de negócio nos handlers | ~30 | 0 |
| Queries duplicadas entre rotas | Sim (ex: unidades público + admin) | Não (serviço partilhado) |
| chamadas directas ao Prisma em pages/routes | 38 | 0 |
| Services de domínio | 13 | 17 |
| Ficheiros de configuração/infra | — | Criados (services, repositories) |

---

## 4. O que falta para produção

| Prioridade | Item | Estado |
|---|---|---|
| **P0** | Migrations Prisma (hoje usa `db push`) | Pendente |
| **P0** | Rate limiting (login, KYC, API externa) | Pendente |
| **P0** | Storage S3 (hoje usa disco local) | Pendente |
| **P1** | Auto-admin perigoso (primeira conta fica ADMIN) | Pendente |
| **P1** | Lint/CI (eslint não está configurado) | Pendente |
| **P1** | Testes de rotas e integração | Pendente |
| **P2** | Normalização de documento (BI com pontos) | Pendente |
| **P2** | Headers de segurança (CSP) | Pendente |
| **P2** | Backup PostgreSQL agendado | Pendente |

**Bloqueio externo:** credenciais Pay4all / it.ao / SIAC e definição do alvo de produção (Render vs VPS).

---

## 5. Próximos passos

1. Criar migrations Prisma (`prisma migrate dev`)
2. Adicionar middleware de rate limit
3. Implementar encaixe S3/R2 para armazenamento
4. Configurar lint e CI
5. Expandir testes para rotas críticas + e2e

---

*Relatório gerado automaticamente. Contactar o equipa de desenvolvimento para detalhes técnicos.*
