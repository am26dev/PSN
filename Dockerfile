# ── Dockerfile do PSN ────────────────────────────────────────────────────────
# 2 estágios: build → produção (imagem mínima final)

# 1) BUILD — instala tudo + gera o build do Next.js
FROM node:22-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# 2) PRODUÇÃO — imagem mínima com só o necessário
FROM node:22-alpine AS production
RUN apk add --no-cache libc6-compat postgresql-client netcat-openbsd
WORKDIR /app

# Copia do build: standalone (servidor + deps embaladas) + static + prisma + public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Copia o binário do prisma CLI (não incluído no standalone)
COPY --from=build /app/node_modules/prisma ./node_modules/prisma

# Entrypoint: migrations + iniciar servidor
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Pasta de uploads
RUN mkdir -p /app/.uploads/publico

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./entrypoint.sh"]
