#!/usr/bin/env bash
# Arranque do PSN na Render.
# Espera pela base de dados (que pode demorar a ficar disponível no 1.º deploy),
# aplica o schema, carrega os dados de demonstração e inicia o servidor.

echo "==> A preparar a base de dados…"
ok=0
for i in $(seq 1 10); do
  if npm run db:push; then
    echo "==> Schema aplicado com sucesso."
    ok=1
    break
  fi
  echo "==> Base de dados ainda não disponível (tentativa $i/10) — nova tentativa em 10s…"
  sleep 10
done

if [ "$ok" != "1" ]; then
  echo "==> ERRO: não foi possível ligar à base de dados após várias tentativas."
  exit 1
fi

# Dados de demonstração (idempotente). Não bloqueia o arranque se falhar.
npm run db:seed || echo "==> Aviso: carregamento de dados de demonstração não concluído."

echo "==> A iniciar o servidor…"
npm run start
