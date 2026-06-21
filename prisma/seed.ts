import { PrismaClient, type TipoUnidade, type Papel } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

// Contas de teste criadas automaticamente no arranque (para login imediato).
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

// Seguradoras de saúde com presença em Angola (dados ilustrativos do MVP).
const SEGURADORAS = [
  { nome: "ENSA Seguros", sigla: "ENSA" },
  { nome: "Fidelidade Angola", sigla: "FID" },
  { nome: "Global Seguros", sigla: "GLB" },
  { nome: "NOSSA Seguros", sigla: "NOSSA" },
  { nome: "Saham Angola", sigla: "SAHAM" },
];

const ESPECIALIDADES = [
  "Clínica Geral", "Pediatria", "Ginecologia-Obstetrícia", "Cardiologia",
  "Ortopedia", "Oftalmologia", "Otorrinolaringologia", "Dermatologia",
  "Medicina Interna", "Cirurgia Geral", "Estomatologia", "Psiquiatria",
  "Neurologia", "Urologia", "Análises Clínicas",
];

interface UnidadeSeed {
  nome: string;
  tipo: TipoUnidade;
  provincia: string;
  municipio: string;
  morada?: string;
  telefone?: string;
  urgencia24h?: boolean;
  horario?: string;
  especialidades?: string[];
  seguradoras?: string[];
  medicos?: { nome: string; especialidade: string }[];
}

const UNIDADES: UnidadeSeed[] = [
  {
    nome: "Hospital Geral de Luanda",
    tipo: "HOSPITAL_PUBLICO",
    provincia: "Luanda",
    municipio: "Luanda",
    morada: "Rua Comandante Gika",
    telefone: "+244 222 000 100",
    urgencia24h: true,
    horario: "24 horas",
    especialidades: ["Clínica Geral", "Medicina Interna", "Cirurgia Geral", "Cardiologia", "Ortopedia"],
    medicos: [
      { nome: "Dr. Joaquim Bengui", especialidade: "Cardiologia" },
      { nome: "Dra. Maria Sebastião", especialidade: "Medicina Interna" },
    ],
  },
  {
    nome: "Hospital dos Cajueiros",
    tipo: "HOSPITAL_PUBLICO",
    provincia: "Luanda",
    municipio: "Cazenga",
    telefone: "+244 222 000 200",
    urgencia24h: true,
    horario: "24 horas",
    especialidades: ["Clínica Geral", "Pediatria", "Ginecologia-Obstetrícia"],
    medicos: [{ nome: "Dra. Esperança Lutucuta", especialidade: "Pediatria" }],
  },
  {
    nome: "Hospital Pediátrico David Bernardino",
    tipo: "HOSPITAL_PUBLICO",
    provincia: "Luanda",
    municipio: "Luanda",
    telefone: "+244 222 000 300",
    urgencia24h: true,
    horario: "24 horas",
    especialidades: ["Pediatria", "Clínica Geral"],
    medicos: [{ nome: "Dr. António Kiala", especialidade: "Pediatria" }],
  },
  {
    nome: "Hospital Central do Huambo",
    tipo: "HOSPITAL_PUBLICO",
    provincia: "Huambo",
    municipio: "Huambo",
    telefone: "+244 241 000 100",
    urgencia24h: true,
    horario: "24 horas",
    especialidades: ["Clínica Geral", "Cirurgia Geral", "Ortopedia"],
  },
  {
    nome: "Hospital Geral de Benguela",
    tipo: "HOSPITAL_PUBLICO",
    provincia: "Benguela",
    municipio: "Benguela",
    telefone: "+244 272 000 100",
    urgencia24h: true,
    horario: "24 horas",
    especialidades: ["Clínica Geral", "Medicina Interna", "Pediatria"],
  },
  {
    nome: "Clínica Sagrada Esperança",
    tipo: "CLINICA_PRIVADA",
    provincia: "Luanda",
    municipio: "Luanda",
    morada: "Ilha de Luanda",
    telefone: "+244 222 430 000",
    urgencia24h: true,
    horario: "Seg-Dom, 24 horas",
    especialidades: ["Cardiologia", "Dermatologia", "Oftalmologia", "Ginecologia-Obstetrícia", "Ortopedia"],
    seguradoras: ["ENSA Seguros", "Fidelidade Angola", "NOSSA Seguros", "Saham Angola"],
    medicos: [
      { nome: "Dr. Paulo Quessongo", especialidade: "Cardiologia" },
      { nome: "Dra. Inês Capitão", especialidade: "Dermatologia" },
    ],
  },
  {
    nome: "Clínica Girassol",
    tipo: "CLINICA_PRIVADA",
    provincia: "Luanda",
    municipio: "Luanda",
    morada: "Rua Manuel Fernando Caldeira",
    telefone: "+244 222 700 000",
    urgencia24h: true,
    horario: "Seg-Dom, 24 horas",
    especialidades: ["Neurologia", "Cardiologia", "Urologia", "Medicina Interna", "Estomatologia"],
    seguradoras: ["ENSA Seguros", "Global Seguros", "Saham Angola"],
    medicos: [{ nome: "Dr. Manuel Domingos", especialidade: "Neurologia" }],
  },
  {
    nome: "Clínica Multiperfil",
    tipo: "CLINICA_PRIVADA",
    provincia: "Luanda",
    municipio: "Belas",
    telefone: "+244 222 019 000",
    horario: "Seg-Sáb, 07h-20h",
    especialidades: ["Pediatria", "Ginecologia-Obstetrícia", "Oftalmologia", "Otorrinolaringologia"],
    seguradoras: ["Fidelidade Angola", "NOSSA Seguros"],
    medicos: [{ nome: "Dra. Teresa Mukinha", especialidade: "Ginecologia-Obstetrícia" }],
  },
  {
    nome: "Clínica do Huambo Saúde+",
    tipo: "CLINICA_PRIVADA",
    provincia: "Huambo",
    municipio: "Huambo",
    telefone: "+244 241 200 000",
    horario: "Seg-Sáb, 08h-18h",
    especialidades: ["Clínica Geral", "Análises Clínicas", "Estomatologia"],
    seguradoras: ["ENSA Seguros", "Global Seguros"],
  },
  {
    nome: "Farmácia Central de Luanda",
    tipo: "FARMACIA",
    provincia: "Luanda",
    municipio: "Luanda",
    morada: "Rua Rainha Ginga",
    telefone: "+244 222 333 444",
    urgencia24h: true,
    horario: "24 horas",
    seguradoras: ["ENSA Seguros", "Fidelidade Angola", "NOSSA Seguros"],
  },
  {
    nome: "Farmácia Popular do Kilamba",
    tipo: "FARMACIA",
    provincia: "Luanda",
    municipio: "Belas",
    horario: "Seg-Dom, 08h-22h",
    seguradoras: ["NOSSA Seguros", "Saham Angola"],
  },
  {
    nome: "Farmácia Benguela Saúde",
    tipo: "FARMACIA",
    provincia: "Benguela",
    municipio: "Benguela",
    horario: "Seg-Sáb, 08h-20h",
    seguradoras: ["Global Seguros"],
  },
];

async function main() {
  console.log("A semear a base de dados do PSN…");

  // Seguradoras
  const seguradoras = new Map<string, string>();
  for (const s of SEGURADORAS) {
    const r = await prisma.seguradora.upsert({
      where: { nome: s.nome },
      update: { sigla: s.sigla },
      create: s,
    });
    seguradoras.set(s.nome, r.id);
  }

  // Especialidades
  const especialidades = new Map<string, string>();
  for (const nome of ESPECIALIDADES) {
    const r = await prisma.especialidade.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
    especialidades.set(nome, r.id);
  }

  // Contas de teste (sempre garantidas, de forma idempotente).
  for (const u of UTENTES_TESTE) {
    const passwordHash = await argon2.hash(u.password, { type: argon2.argon2id });
    await prisma.utente.upsert({
      where: { numeroDocumento: u.numeroDocumento },
      update: { papel: u.papel, nomeCompleto: u.nomeCompleto, passwordHash },
      create: {
        tipoDocumento: "BI",
        numeroDocumento: u.numeroDocumento,
        nomeCompleto: u.nomeCompleto,
        dataNascimento: new Date("1990-01-01"),
        sexo: u.sexo,
        papel: u.papel,
        telefone: u.telefone ?? null,
        provincia: u.provincia ?? null,
        municipio: u.municipio ?? null,
        passwordHash,
        fichaSaude: { create: {} },
      },
    });
  }
  console.log(`Contas de teste garantidas: ${UTENTES_TESTE.length}.`);

  // Unidades — idempotente: só cria se ainda não houver unidades, para o seed
  // poder correr em cada deploy sem apagar dados (marcações, etc.).
  const jaExistem = await prisma.unidade.count();
  if (jaExistem > 0) {
    console.log(
      `Já existem ${jaExistem} unidades — seed de unidades ignorado.`,
    );
    console.log(
      `Concluído: ${SEGURADORAS.length} seguradoras e ${ESPECIALIDADES.length} especialidades garantidas.`,
    );
    return;
  }

  for (const u of UNIDADES) {
    await prisma.unidade.create({
      data: {
        nome: u.nome,
        tipo: u.tipo,
        provincia: u.provincia,
        municipio: u.municipio,
        morada: u.morada,
        telefone: u.telefone,
        urgencia24h: u.urgencia24h ?? false,
        horario: u.horario,
        especialidades: {
          create: (u.especialidades ?? []).map((nome) => ({
            especialidade: { connect: { id: especialidades.get(nome)! } },
          })),
        },
        seguradoras: {
          create: (u.seguradoras ?? []).map((nome) => ({
            seguradora: { connect: { id: seguradoras.get(nome)! } },
          })),
        },
        medicos: {
          create: (u.medicos ?? []).map((m) => ({
            nome: m.nome,
            disponivel: true,
            especialidade: { connect: { id: especialidades.get(m.especialidade)! } },
          })),
        },
      },
    });
  }

  console.log(
    `Concluído: ${SEGURADORAS.length} seguradoras, ${ESPECIALIDADES.length} especialidades, ${UNIDADES.length} unidades.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
