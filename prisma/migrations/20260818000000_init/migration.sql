-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('BI', 'PASSAPORTE', 'AUTORIZACAO_RESIDENCIA');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('UTENTE', 'PROFISSIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "Parentesco" AS ENUM ('FILHO', 'CONJUGE', 'PAI', 'MAE', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoUnidade" AS ENUM ('HOSPITAL_PUBLICO', 'UNIDADE_HOSPITALAR', 'CLINICA_PRIVADA', 'CENTRO_MEDICO', 'CLINICA_DENTARIA', 'LABORATORIO', 'FISIOTERAPIA', 'OPTICA', 'PRESTADOR_SAUDE', 'FARMACIA');

-- CreateEnum
CREATE TYPE "EstadoMarcacao" AS ENUM ('PENDENTE', 'CONFIRMADA', 'CANCELADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('MULTICAIXA_EXPRESS', 'REFERENCIA_EMIS', 'E_KWANZA', 'SEGURO_SAUDE', 'PAGAMENTO_ESTADO');

-- CreateEnum
CREATE TYPE "EstadoPagamento" AS ENUM ('AGUARDA', 'PAGO', 'FALHADO', 'EXPIRADO', 'ISENTO');

-- CreateEnum
CREATE TYPE "EstadoVerificacao" AS ENUM ('PENDENTE', 'EM_ANALISE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "ResultadoBiometria" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "EstadoPatologia" AS ENUM ('ATIVA', 'CRONICA', 'RESOLVIDA');

-- CreateTable
CREATE TABLE "Utente" (
    "id" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "nacionalidade" TEXT NOT NULL DEFAULT 'Angolana',
    "nif" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "provincia" TEXT,
    "municipio" TEXT,
    "morada" TEXT,
    "passwordHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'UTENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "seguradoraId" TEXT,
    "numeroApolice" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "avatarKey" TEXT,
    "especialidadeMedica" TEXT,
    "numeroOrdem" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependente" (
    "id" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "parentesco" "Parentesco" NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT,
    "nomeCompleto" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dependente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FichaSaude" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "tipoSanguineo" TEXT,
    "alergias" TEXT,
    "doencasCronicas" TEXT,
    "medicacaoAtual" TEXT,
    "observacoes" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FichaSaude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seguradora" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT,
    "logoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seguradora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especialidade" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "Especialidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unidade" (
    "id" TEXT NOT NULL,
    "fonteExternaId" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" "TipoUnidade" NOT NULL,
    "provincia" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "morada" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "horario" TEXT,
    "urgencia24h" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "descricao" TEXT,
    "servicos" TEXT,
    "fonteUrl" TEXT,
    "validacao" TEXT,
    "observacoes" TEXT,
    "rede" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadeEspecialidade" (
    "unidadeId" TEXT NOT NULL,
    "especialidadeId" TEXT NOT NULL,

    CONSTRAINT "UnidadeEspecialidade_pkey" PRIMARY KEY ("unidadeId","especialidadeId")
);

-- CreateTable
CREATE TABLE "UnidadeSeguradora" (
    "unidadeId" TEXT NOT NULL,
    "seguradoraId" TEXT NOT NULL,

    CONSTRAINT "UnidadeSeguradora_pkey" PRIMARY KEY ("unidadeId","seguradoraId")
);

-- CreateTable
CREATE TABLE "Medico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "especialidadeId" TEXT NOT NULL,
    "numeroOrdem" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Medico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marcacao" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "dependenteId" TEXT,
    "unidadeId" TEXT NOT NULL,
    "especialidadeId" TEXT,
    "medicoId" TEXT,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "referenciaMedica" TEXT,
    "estado" "EstadoMarcacao" NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marcacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "marcacaoId" TEXT NOT NULL,
    "metodo" "MetodoPagamento" NOT NULL,
    "valorCentimos" INTEGER NOT NULL,
    "estado" "EstadoPagamento" NOT NULL DEFAULT 'AGUARDA',
    "referencia" TEXT,
    "entidade" TEXT,
    "referenciaEmis" TEXT,
    "qrCode" TEXT,
    "telefone" TEXT,
    "idParceiro" TEXT,
    "expiraEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verificacao" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "nomeCompleto" TEXT,
    "dataNascimento" TEXT,
    "nacionalidade" TEXT DEFAULT 'Angolana',
    "estado" "EstadoVerificacao" NOT NULL DEFAULT 'PENDENTE',
    "imagemFrenteKey" TEXT,
    "imagemVersoKey" TEXT,
    "selfieKey" TEXT,
    "ocrDados" JSONB,
    "resultadoBiometria" "ResultadoBiometria" NOT NULL DEFAULT 'PENDENTE',
    "pontuacaoRisco" DOUBLE PRECISION,
    "motivoRejeicao" TEXT,
    "revistoPorId" TEXT,
    "revistoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificacaoEvento" (
    "id" TEXT NOT NULL,
    "verificacaoId" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "metadata" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificacaoEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profissionalId" TEXT,
    "profissionalNome" TEXT,
    "unidadeNome" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,
    "diagnostico" TEXT,
    "notas" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exame" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profissionalId" TEXT,
    "profissionalNome" TEXT,
    "nome" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultado" TEXT,
    "notas" TEXT,
    "ficheiroKey" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patologia" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profissionalId" TEXT,
    "nome" TEXT NOT NULL,
    "estado" "EstadoPatologia" NOT NULL DEFAULT 'ATIVA',
    "desde" TEXT,
    "notas" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patologia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConteudoSite" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConteudoSite_pkey" PRIMARY KEY ("chave")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utente_numeroDocumento_key" ON "Utente"("numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Utente_email_key" ON "Utente"("email");

-- CreateIndex
CREATE INDEX "Utente_numeroDocumento_idx" ON "Utente"("numeroDocumento");

-- CreateIndex
CREATE INDEX "Dependente_responsavelId_idx" ON "Dependente"("responsavelId");

-- CreateIndex
CREATE UNIQUE INDEX "Sessao_tokenHash_key" ON "Sessao"("tokenHash");

-- CreateIndex
CREATE INDEX "Sessao_utenteId_idx" ON "Sessao"("utenteId");

-- CreateIndex
CREATE UNIQUE INDEX "FichaSaude_utenteId_key" ON "FichaSaude"("utenteId");

-- CreateIndex
CREATE UNIQUE INDEX "Seguradora_nome_key" ON "Seguradora"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Especialidade_nome_key" ON "Especialidade"("nome");

-- CreateIndex
CREATE INDEX "Unidade_provincia_municipio_idx" ON "Unidade"("provincia", "municipio");

-- CreateIndex
CREATE INDEX "Unidade_tipo_idx" ON "Unidade"("tipo");

-- CreateIndex
CREATE INDEX "Unidade_rede_idx" ON "Unidade"("rede");

-- CreateIndex
CREATE INDEX "Unidade_fonteExternaId_idx" ON "Unidade"("fonteExternaId");

-- CreateIndex
CREATE INDEX "Medico_unidadeId_idx" ON "Medico"("unidadeId");

-- CreateIndex
CREATE INDEX "Marcacao_utenteId_idx" ON "Marcacao"("utenteId");

-- CreateIndex
CREATE INDEX "Marcacao_unidadeId_dataHora_idx" ON "Marcacao"("unidadeId", "dataHora");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_marcacaoId_key" ON "Pagamento"("marcacaoId");

-- CreateIndex
CREATE INDEX "Pagamento_referenciaEmis_idx" ON "Pagamento"("referenciaEmis");

-- CreateIndex
CREATE INDEX "Pagamento_idParceiro_idx" ON "Pagamento"("idParceiro");

-- CreateIndex
CREATE INDEX "Verificacao_utenteId_idx" ON "Verificacao"("utenteId");

-- CreateIndex
CREATE INDEX "Verificacao_estado_idx" ON "Verificacao"("estado");

-- CreateIndex
CREATE INDEX "VerificacaoEvento_verificacaoId_idx" ON "VerificacaoEvento"("verificacaoId");

-- CreateIndex
CREATE INDEX "Consulta_pacienteId_idx" ON "Consulta"("pacienteId");

-- CreateIndex
CREATE INDEX "Exame_pacienteId_idx" ON "Exame"("pacienteId");

-- CreateIndex
CREATE INDEX "Patologia_pacienteId_idx" ON "Patologia"("pacienteId");

-- AddForeignKey
ALTER TABLE "Utente" ADD CONSTRAINT "Utente_seguradoraId_fkey" FOREIGN KEY ("seguradoraId") REFERENCES "Seguradora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependente" ADD CONSTRAINT "Dependente_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaSaude" ADD CONSTRAINT "FichaSaude_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadeEspecialidade" ADD CONSTRAINT "UnidadeEspecialidade_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadeEspecialidade" ADD CONSTRAINT "UnidadeEspecialidade_especialidadeId_fkey" FOREIGN KEY ("especialidadeId") REFERENCES "Especialidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadeSeguradora" ADD CONSTRAINT "UnidadeSeguradora_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadeSeguradora" ADD CONSTRAINT "UnidadeSeguradora_seguradoraId_fkey" FOREIGN KEY ("seguradoraId") REFERENCES "Seguradora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medico" ADD CONSTRAINT "Medico_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medico" ADD CONSTRAINT "Medico_especialidadeId_fkey" FOREIGN KEY ("especialidadeId") REFERENCES "Especialidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marcacao" ADD CONSTRAINT "Marcacao_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marcacao" ADD CONSTRAINT "Marcacao_dependenteId_fkey" FOREIGN KEY ("dependenteId") REFERENCES "Dependente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marcacao" ADD CONSTRAINT "Marcacao_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marcacao" ADD CONSTRAINT "Marcacao_especialidadeId_fkey" FOREIGN KEY ("especialidadeId") REFERENCES "Especialidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marcacao" ADD CONSTRAINT "Marcacao_medicoId_fkey" FOREIGN KEY ("medicoId") REFERENCES "Medico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_marcacaoId_fkey" FOREIGN KEY ("marcacaoId") REFERENCES "Marcacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificacao" ADD CONSTRAINT "Verificacao_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificacao" ADD CONSTRAINT "Verificacao_revistoPorId_fkey" FOREIGN KEY ("revistoPorId") REFERENCES "Utente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificacaoEvento" ADD CONSTRAINT "VerificacaoEvento_verificacaoId_fkey" FOREIGN KEY ("verificacaoId") REFERENCES "Verificacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Utente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exame" ADD CONSTRAINT "Exame_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exame" ADD CONSTRAINT "Exame_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Utente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patologia" ADD CONSTRAINT "Patologia_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patologia" ADD CONSTRAINT "Patologia_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Utente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

