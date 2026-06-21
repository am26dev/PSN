import { PrismaClient, type Papel, type TipoUnidade } from "@prisma/client";
import argon2 from "argon2";
import unidadesJson from "./data/unidades-saude-angola.json";

const prisma = new PrismaClient();

interface UnidadeFonte {
  fonteExternaId: string;
  nome: string;
  tipo: TipoUnidade;
  tipoOriginal: string;
  provincia: string;
  municipio: string;
  morada: string;
  telefone: string;
  email: string;
  servicos: string;
  seguradoras: string[];
  especialidades: string[];
  fonteUrl: string;
  validacao: string;
  observacoes: string;
}

const UNIDADES = unidadesJson as unknown as UnidadeFonte[];

const UTENTES_TESTE: {
  numeroDocumento: string;
  nomeCompleto: string;
  sexo: "MASCULINO" | "FEMININO";
  papel: Papel;
  password: string;
  telefone?: string;
  provincia?: string;
  municipio?: string;
}[] = [
  {
    numeroDocumento: "004952656LA049",
    nomeCompleto: "Alfredo Cutunga Muanza",
    sexo: "MASCULINO",
    papel: "ADMIN",
    password: "Admin2026",
    provincia: "Luanda",
    municipio: "Cazenga",
  },
  {
    numeroDocumento: "003456789LA042",
    nomeCompleto: "Maria João Teixeira",
    sexo: "FEMININO",
    papel: "UTENTE",
    password: "Utente2026",
    provincia: "Luanda",
    municipio: "Luanda",
  },
  {
    numeroDocumento: "006151112LA041",
    nomeCompleto: "Carlos Domingos Neto",
    sexo: "MASCULINO",
    papel: "UTENTE",
    password: "Utente2026",
    provincia: "Luanda",
    municipio: "Belas",
  },
  {
    numeroDocumento: "009988776BG011",
    nomeCompleto: "Ana Pereira dos Santos",
    sexo: "FEMININO",
    papel: "UTENTE",
    password: "Utente2026",
    provincia: "Benguela",
    municipio: "Benguela",
  },
];

// Logótipos fornecidos para o portal. Os ficheiros são servidos localmente,
// evitando dependências de serviços externos de logótipos.
const SEGURADORAS = [
  { nome: "Aliança Seguros", sigla: "ALIANÇA", logoUrl: "/seguradoras/alianca.png" },
  { nome: "BIC Seguros", sigla: "BIC", logoUrl: "/seguradoras/bic.png" },
  { nome: "Confiança Seguros", sigla: "CONFIANÇA", logoUrl: "/seguradoras/confianca.png" },
  { nome: "ENSA Seguros", sigla: "ENSA", logoUrl: "/seguradoras/ensa.png" },
  { nome: "Fidelidade Angola", sigla: "FIDELIDADE", logoUrl: "/seguradoras/fidelidade.png" },
  { nome: "Fortaleza Seguros", sigla: "FORTALEZA", logoUrl: "/seguradoras/fortaleza.png" },
  { nome: "Giant Seguros", sigla: "GIANT", logoUrl: "/seguradoras/giant.png" },
  { nome: "Mundial Seguros", sigla: "MUNDIAL", logoUrl: "/seguradoras/mundial.png" },
  { nome: "NOSSA Seguros", sigla: "NOSSA", logoUrl: "/seguradoras/nossa.png" },
  { nome: "Prefira Seguros", sigla: "PREFIRA", logoUrl: "/seguradoras/prefira.jpg" },
  { nome: "Protteja Seguros", sigla: "PROTTEJA", logoUrl: "/seguradoras/proteja.jpg" },
  { nome: "Prudencial Seguros", sigla: "PRUDENCIAL", logoUrl: "/seguradoras/prudencial.png" },
  { nome: "Sanlam Seguros", sigla: "SANLAM", logoUrl: "/seguradoras/sanlam.png" },
  { nome: "SOL Seguros", sigla: "SOL", logoUrl: "/seguradoras/sol.png" },
  { nome: "STA Seguros", sigla: "STA", logoUrl: "/seguradoras/sta.png" },
  { nome: "Super Seguros", sigla: "SUPER", logoUrl: "/seguradoras/super.png" },
  { nome: "Tranquilidade Angola", sigla: "TRANQUILIDADE", logoUrl: "/seguradoras/tranquilidade.png" },
  { nome: "Trevo Seguros", sigla: "TREVO", logoUrl: "/seguradoras/trevo.png" },
  { nome: "UniSaúde", sigla: "UNISAÚDE", logoUrl: "/seguradoras/unisaude.png" },
  { nome: "VIVA Seguros", sigla: "VIVA", logoUrl: "/seguradoras/viva.png" },
  { nome: "VS Seguros", sigla: "VS", logoUrl: "/seguradoras/vs.jpg" },
  // Rede/gestora de prestadores indicada no levantamento, sem imagem no ZIP.
  { nome: "Saúde+", sigla: "SAÚDE+", logoUrl: null },
];

const ESPECIALIDADES_BASE = [
  "Clínica Geral",
  "Pediatria",
  "Ginecologia-Obstetrícia",
  "Cardiologia",
  "Ortopedia",
  "Oftalmologia",
  "Otorrinolaringologia",
  "Dermatologia",
  "Medicina Interna",
  "Cirurgia Geral",
  "Estomatologia",
  "Psiquiatria",
  "Neurologia",
  "Urologia",
  "Análises Clínicas",
  "Nefrologia",
  "Pneumologia",
  "Gastroenterologia",
  "Fisioterapia e Reabilitação",
  "Endocrinologia",
  "Reumatologia",
  "Infecciologia",
  "Hematologia",
  "Imagiologia",
];

function nulo(valor: string) {
  return valor || null;
}

function normalizar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function chaveUnidade(nome: string, provincia: string, municipio: string) {
  return [nome, provincia, municipio].map(normalizar).join("|");
}

function chaveNomeProvincia(nome: string, provincia: string) {
  return [nome, provincia].map(normalizar).join("|");
}

async function main() {
  console.log("A carregar a rede nacional de saúde do PSN…");

  const nomesAtivos = SEGURADORAS.map((s) => s.nome);
  await prisma.seguradora.updateMany({
    where: { nome: { notIn: nomesAtivos } },
    data: { ativo: false },
  });

  const seguradoras = new Map<string, string>();
  for (const seguradora of SEGURADORAS) {
    const registo = await prisma.seguradora.upsert({
      where: { nome: seguradora.nome },
      update: { sigla: seguradora.sigla, logoUrl: seguradora.logoUrl, ativo: true },
      create: { ...seguradora, ativo: true },
    });
    seguradoras.set(seguradora.nome, registo.id);
  }

  const nomesEspecialidades = new Set(ESPECIALIDADES_BASE);
  for (const unidade of UNIDADES) {
    for (const nome of unidade.especialidades) nomesEspecialidades.add(nome);
  }

  const especialidades = new Map<string, string>();
  for (const nome of nomesEspecialidades) {
    const registo = await prisma.especialidade.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
    especialidades.set(nome, registo.id);
  }

  for (const utente of UTENTES_TESTE) {
    const passwordHash = await argon2.hash(utente.password, { type: argon2.argon2id });
    await prisma.utente.upsert({
      where: { numeroDocumento: utente.numeroDocumento },
      update: {
        papel: utente.papel,
        nomeCompleto: utente.nomeCompleto,
        passwordHash,
      },
      create: {
        tipoDocumento: "BI",
        numeroDocumento: utente.numeroDocumento,
        nomeCompleto: utente.nomeCompleto,
        dataNascimento: new Date("1990-01-01"),
        sexo: utente.sexo,
        papel: utente.papel,
        telefone: utente.telefone ?? null,
        provincia: utente.provincia ?? null,
        municipio: utente.municipio ?? null,
        passwordHash,
        fichaSaude: { create: {} },
      },
    });
  }

  // Uma única leitura permite reconciliar os dados já existentes sem executar
  // uma consulta por unidade. O ID externo torna os arranques seguintes rápidos
  // e idempotentes; o nome/localização cobre a primeira atualização da base.
  const existentes = await prisma.unidade.findMany({
    select: {
      id: true,
      fonteExternaId: true,
      nome: true,
      provincia: true,
      municipio: true,
    },
  });
  const porFonte = new Map(
    existentes.filter((u) => u.fonteExternaId).map((u) => [u.fonteExternaId!, u]),
  );
  const porChave = new Map<string, typeof existentes>();
  const porNomeProvincia = new Map<string, typeof existentes>();
  for (const unidade of existentes) {
    const chave = chaveUnidade(unidade.nome, unidade.provincia, unidade.municipio);
    porChave.set(chave, [...(porChave.get(chave) ?? []), unidade]);
    const chaveCurta = chaveNomeProvincia(unidade.nome, unidade.provincia);
    porNomeProvincia.set(chaveCurta, [...(porNomeProvincia.get(chaveCurta) ?? []), unidade]);
  }
  const usados = new Set<string>();

  let criadas = 0;
  let atualizadas = 0;
  const tamanhoLote = 40;

  for (let inicio = 0; inicio < UNIDADES.length; inicio += tamanhoLote) {
    const lote = UNIDADES.slice(inicio, inicio + tamanhoLote);
    const operacoes = lote.map((unidade) => {
      const exato = porFonte.get(unidade.fonteExternaId);
      const candidatosChave = porChave.get(
        chaveUnidade(unidade.nome, unidade.provincia, unidade.municipio),
      );
      const candidatosNome = porNomeProvincia.get(
        chaveNomeProvincia(unidade.nome, unidade.provincia),
      );
      const existente =
        (exato && !usados.has(exato.id) ? exato : undefined) ??
        candidatosChave?.find((u) => !usados.has(u.id)) ??
        (candidatosNome?.length === 1 && !usados.has(candidatosNome[0].id)
          ? candidatosNome[0]
          : undefined);

      const relSeguradoras = unidade.seguradoras
        .map((nome) => seguradoras.get(nome))
        .filter((id): id is string => Boolean(id))
        .map((id) => ({ seguradora: { connect: { id } } }));
      const relEspecialidades = unidade.especialidades
        .map((nome) => especialidades.get(nome))
        .filter((id): id is string => Boolean(id))
        .map((id) => ({ especialidade: { connect: { id } } }));

      const dados = {
        fonteExternaId: unidade.fonteExternaId,
        nome: unidade.nome,
        tipo: unidade.tipo,
        provincia: unidade.provincia,
        municipio: unidade.municipio,
        morada: nulo(unidade.morada),
        telefone: nulo(unidade.telefone),
        email: nulo(unidade.email),
        servicos: nulo(unidade.servicos),
        fonteUrl: nulo(unidade.fonteUrl),
        validacao: nulo(unidade.validacao),
        observacoes: nulo(unidade.observacoes),
        ativo: true,
      };

      if (existente) {
        usados.add(existente.id);
        atualizadas++;
        return prisma.unidade.update({
          where: { id: existente.id },
          data: {
            ...dados,
            especialidades: { deleteMany: {}, create: relEspecialidades },
            seguradoras: { deleteMany: {}, create: relSeguradoras },
          },
        });
      }

      criadas++;
      return prisma.unidade.create({
        data: {
          ...dados,
          especialidades: { create: relEspecialidades },
          seguradoras: { create: relSeguradoras },
        },
      });
    });

    await prisma.$transaction(operacoes);
    console.log(`Unidades processadas: ${Math.min(inicio + tamanhoLote, UNIDADES.length)}/${UNIDADES.length}`);
  }

  console.log(
    `Concluído: ${UNIDADES.length} unidades (${criadas} novas, ${atualizadas} atualizadas), ` +
      `${SEGURADORAS.length} seguradoras/redes e ${nomesEspecialidades.size} especialidades.`,
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
