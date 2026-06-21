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

// Seguradoras reais com presença em Angola (fonte: ARSEG / pesquisa de mercado).
// O logótipo é obtido por domínio (Clearbit) com reserva elegante no portal.
function logo(dominio: string) {
  return `https://logo.clearbit.com/${dominio}`;
}
const SEGURADORAS = [
  { nome: "ENSA Seguros", sigla: "ENSA", logoUrl: logo("ensa.co.ao") },
  { nome: "Fidelidade Angola", sigla: "FID", logoUrl: logo("fidelidade.co.ao") },
  { nome: "NOSSA Seguros", sigla: "NOSSA", logoUrl: logo("nossaseguros.ao") },
  { nome: "Global Seguros", sigla: "GLB", logoUrl: logo("globalseguros.co.ao") },
  { nome: "Saham Angola", sigla: "SAHAM", logoUrl: logo("saham.co.ao") },
  { nome: "BIC Seguros", sigla: "BIC", logoUrl: logo("bicseguros.ao") },
  { nome: "Tranquilidade Angola", sigla: "TRANQ", logoUrl: logo("tranquilidade.co.ao") },
  { nome: "AAA Seguros", sigla: "AAA", logoUrl: logo("aaaseguros.co.ao") },
  { nome: "Prudencial Seguros", sigla: "PRUD", logoUrl: logo("prudencial.co.ao") },
  { nome: "Fortaleza Seguros", sigla: "FORT", logoUrl: logo("fortalezaseguros.co.ao") },
  { nome: "Bonws Seguros", sigla: "BONWS", logoUrl: logo("bonws.co.ao") },
  { nome: "Confiança Seguros", sigla: "CONF", logoUrl: logo("confianca.co.ao") },
  { nome: "Universal Seguros", sigla: "UNIV", logoUrl: logo("universalseguros.co.ao") },
  { nome: "GA Angola Seguros", sigla: "GA", logoUrl: logo("ga-angola.com") },
  { nome: "Protteja Seguros", sigla: "PROT", logoUrl: logo("protteja.co.ao") },
  { nome: "Mundial Seguros", sigla: "MUND", logoUrl: logo("mundialseguros.co.ao") },
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
  logoUrl?: string;
  descricao?: string;
  rede?: string;
  especialidades?: string[];
  seguradoras?: string[];
  medicos?: { nome: string; especialidade: string }[];
}

const ESP_BASE = ["Clínica Geral", "Medicina Interna", "Pediatria", "Cirurgia Geral"];

// Hospitais públicos provinciais reais (um a vários por província).
const HOSPITAIS_PUBLICOS: UnidadeSeed[] = [
  { nome: "Hospital Geral de Luanda", tipo: "HOSPITAL_PUBLICO", provincia: "Luanda", municipio: "Luanda", morada: "Rua Comandante Gika", urgencia24h: true, horario: "24 horas", especialidades: ["Clínica Geral", "Medicina Interna", "Cirurgia Geral", "Cardiologia", "Ortopedia"] },
  { nome: "Hospital Geral Américo Boavida", tipo: "HOSPITAL_PUBLICO", provincia: "Luanda", municipio: "Maianga", urgencia24h: true, horario: "24 horas", especialidades: ["Clínica Geral", "Cardiologia", "Neurologia", "Cirurgia Geral"] },
  { nome: "Hospital Josina Machel (Maria Pia)", tipo: "HOSPITAL_PUBLICO", provincia: "Luanda", municipio: "Ingombota", urgencia24h: true, horario: "24 horas", especialidades: ["Clínica Geral", "Ortopedia", "Cirurgia Geral", "Medicina Interna"] },
  { nome: "Hospital Pediátrico David Bernardino", tipo: "HOSPITAL_PUBLICO", provincia: "Luanda", municipio: "Luanda", urgencia24h: true, horario: "24 horas", especialidades: ["Pediatria", "Clínica Geral"] },
  { nome: "Hospital Geral dos Cajueiros", tipo: "HOSPITAL_PUBLICO", provincia: "Luanda", municipio: "Cazenga", urgencia24h: true, horario: "24 horas", logoUrl: "https://logo.clearbit.com/hgc.gov.ao", especialidades: ["Clínica Geral", "Pediatria", "Ginecologia-Obstetrícia"] },
  { nome: "Hospital Materno-Infantil Lucrécia Paím", tipo: "HOSPITAL_PUBLICO", provincia: "Luanda", municipio: "Ingombota", urgencia24h: true, horario: "24 horas", especialidades: ["Ginecologia-Obstetrícia", "Pediatria"] },
  { nome: "Hospital Geral do Kilamba", tipo: "HOSPITAL_PUBLICO", provincia: "Luanda", municipio: "Belas", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Central de Benguela", tipo: "HOSPITAL_PUBLICO", provincia: "Benguela", municipio: "Catumbela", urgencia24h: true, horario: "24 horas", especialidades: ["Clínica Geral", "Medicina Interna", "Pediatria", "Cirurgia Geral"] },
  { nome: "Hospital Geral do Lobito", tipo: "HOSPITAL_PUBLICO", provincia: "Benguela", municipio: "Lobito", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Central do Huambo", tipo: "HOSPITAL_PUBLICO", provincia: "Huambo", municipio: "Huambo", urgencia24h: true, horario: "24 horas", especialidades: ["Clínica Geral", "Cirurgia Geral", "Ortopedia", "Pediatria"] },
  { nome: "Hospital Central da Huíla – Dr. António Agostinho Neto", tipo: "HOSPITAL_PUBLICO", provincia: "Huíla", municipio: "Lubango", urgencia24h: true, horario: "24 horas", especialidades: ["Clínica Geral", "Medicina Interna", "Cirurgia Geral"] },
  { nome: "Hospital Central de Cabinda", tipo: "HOSPITAL_PUBLICO", provincia: "Cabinda", municipio: "Cabinda", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral do Bié (Kuito)", tipo: "HOSPITAL_PUBLICO", provincia: "Bié", municipio: "Kuito", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral de Ondjiva", tipo: "HOSPITAL_PUBLICO", provincia: "Cunene", municipio: "Ondjiva", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Provincial de Menongue", tipo: "HOSPITAL_PUBLICO", provincia: "Cuando Cubango", municipio: "Menongue", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral do Sumbe", tipo: "HOSPITAL_PUBLICO", provincia: "Cuanza Sul", municipio: "Sumbe", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral de N'dalatando", tipo: "HOSPITAL_PUBLICO", provincia: "Cuanza Norte", municipio: "Cazengo", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral de Malanje", tipo: "HOSPITAL_PUBLICO", provincia: "Malanje", municipio: "Malanje", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral do Luena", tipo: "HOSPITAL_PUBLICO", provincia: "Moxico", municipio: "Luena", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral do Namibe", tipo: "HOSPITAL_PUBLICO", provincia: "Namibe", municipio: "Moçâmedes", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral do Uíge", tipo: "HOSPITAL_PUBLICO", provincia: "Uíge", municipio: "Uíge", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Provincial do Zaire", tipo: "HOSPITAL_PUBLICO", provincia: "Zaire", municipio: "M'banza Kongo", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral do Dundo", tipo: "HOSPITAL_PUBLICO", provincia: "Lunda Norte", municipio: "Chitato", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral de Saurimo", tipo: "HOSPITAL_PUBLICO", provincia: "Lunda Sul", municipio: "Saurimo", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
  { nome: "Hospital Geral do Bengo (Caxito)", tipo: "HOSPITAL_PUBLICO", provincia: "Bengo", municipio: "Dande", urgencia24h: true, horario: "24 horas", especialidades: ESP_BASE },
];

// Clínicas e hospitais privados reais.
const CLINICAS_PRIVADAS: UnidadeSeed[] = [
  { nome: "Clínica Sagrada Esperança – Ilha de Luanda", rede: "Clínica Sagrada Esperança", tipo: "CLINICA_PRIVADA", provincia: "Luanda", municipio: "Luanda", morada: "Ilha de Luanda", urgencia24h: true, horario: "24 horas", logoUrl: "https://logo.clearbit.com/clinicasagradaesperanca.co.ao", descricao: "A maior rede privada de saúde de Angola, presente em várias províncias.", especialidades: ["Cardiologia", "Dermatologia", "Oftalmologia", "Ginecologia-Obstetrícia", "Ortopedia"], seguradoras: ["ENSA Seguros", "Fidelidade Angola", "NOSSA Seguros", "Saham Angola"] },
  { nome: "Clínica Sagrada Esperança – Talatona", rede: "Clínica Sagrada Esperança", tipo: "CLINICA_PRIVADA", provincia: "Luanda", municipio: "Belas", urgencia24h: true, horario: "24 horas", logoUrl: "https://logo.clearbit.com/clinicasagradaesperanca.co.ao", especialidades: ["Clínica Geral", "Pediatria", "Cardiologia"], seguradoras: ["ENSA Seguros", "Fidelidade Angola", "NOSSA Seguros"] },
  { nome: "Clínica Sagrada Esperança – Benguela", rede: "Clínica Sagrada Esperança", tipo: "CLINICA_PRIVADA", provincia: "Benguela", municipio: "Benguela", horario: "Seg-Sáb, 08h-20h", logoUrl: "https://logo.clearbit.com/clinicasagradaesperanca.co.ao", especialidades: ["Clínica Geral", "Pediatria"], seguradoras: ["ENSA Seguros", "Fidelidade Angola"] },
  { nome: "Clínica Girassol", tipo: "CLINICA_PRIVADA", provincia: "Luanda", municipio: "Luanda", morada: "Rua Manuel Fernando Caldeira", urgencia24h: true, horario: "24 horas", logoUrl: "https://logo.clearbit.com/clinicagirassol.co.ao", descricao: "Hospital privado de referência em cardiologia, neurologia e ortopedia.", especialidades: ["Neurologia", "Cardiologia", "Urologia", "Medicina Interna", "Estomatologia"], seguradoras: ["ENSA Seguros", "Global Seguros", "Saham Angola"] },
  { nome: "Clínica Multiperfil", tipo: "CLINICA_PRIVADA", provincia: "Luanda", municipio: "Belas", horario: "Seg-Sáb, 07h-20h", especialidades: ["Pediatria", "Ginecologia-Obstetrícia", "Oftalmologia", "Otorrinolaringologia"], seguradoras: ["Fidelidade Angola", "NOSSA Seguros"] },
  { nome: "Clínica Endiama", tipo: "CLINICA_PRIVADA", provincia: "Luanda", municipio: "Ingombota", horario: "Seg-Sex, 07h-19h", especialidades: ["Clínica Geral", "Cardiologia", "Análises Clínicas"], seguradoras: ["ENSA Seguros", "Global Seguros"] },
  { nome: "Clínica do Lobito", tipo: "CLINICA_PRIVADA", provincia: "Benguela", municipio: "Lobito", horario: "Seg-Sáb, 08h-19h", especialidades: ["Clínica Geral", "Pediatria", "Análises Clínicas"], seguradoras: ["ENSA Seguros"] },
  { nome: "Clínica do Huambo Saúde+", tipo: "CLINICA_PRIVADA", provincia: "Huambo", municipio: "Huambo", horario: "Seg-Sáb, 08h-18h", especialidades: ["Clínica Geral", "Análises Clínicas", "Estomatologia"], seguradoras: ["ENSA Seguros", "Global Seguros"] },
];

// Redes de farmácias.
const FARMACIAS: UnidadeSeed[] = [
  { nome: "Farmácia Popular – Morro Bento", rede: "Farmácia Popular", tipo: "FARMACIA", provincia: "Luanda", municipio: "Belas", morada: "Rua Pedro de Castro Van-Dúnem Loy", urgencia24h: true, horario: "08h-21h", logoUrl: "https://logo.clearbit.com/farmaciapopular.co.ao", seguradoras: ["ENSA Seguros", "Fidelidade Angola", "NOSSA Seguros"] },
  { nome: "Farmácia Popular – Camama", rede: "Farmácia Popular", tipo: "FARMACIA", provincia: "Luanda", municipio: "Kilamba Kiaxi", horario: "08h-21h", logoUrl: "https://logo.clearbit.com/farmaciapopular.co.ao", seguradoras: ["NOSSA Seguros", "Saham Angola"] },
  { nome: "Farmácia Popular – Luanda Porto", rede: "Farmácia Popular", tipo: "FARMACIA", provincia: "Luanda", municipio: "Ingombota", morada: "Rua Major Kanhangulo", horario: "08h-21h", logoUrl: "https://logo.clearbit.com/farmaciapopular.co.ao", seguradoras: ["Fidelidade Angola"] },
  { nome: "Farmácia Popular – Lubango", rede: "Farmácia Popular", tipo: "FARMACIA", provincia: "Huíla", municipio: "Lubango", horario: "08h-21h", logoUrl: "https://logo.clearbit.com/farmaciapopular.co.ao", seguradoras: ["ENSA Seguros"] },
  { nome: "Farmácia Central de Luanda", tipo: "FARMACIA", provincia: "Luanda", municipio: "Luanda", morada: "Rua Rainha Ginga", urgencia24h: true, horario: "24 horas", seguradoras: ["ENSA Seguros", "NOSSA Seguros"] },
  { nome: "Farmácia Benguela Saúde", tipo: "FARMACIA", provincia: "Benguela", municipio: "Benguela", horario: "Seg-Sáb, 08h-20h", seguradoras: ["Global Seguros"] },
  { nome: "Farmácia do Lubango", tipo: "FARMACIA", provincia: "Huíla", municipio: "Lubango", horario: "Seg-Sáb, 08h-20h", seguradoras: ["ENSA Seguros"] },
  { nome: "Farmácia do Huambo", tipo: "FARMACIA", provincia: "Huambo", municipio: "Huambo", horario: "Seg-Sáb, 08h-20h", seguradoras: ["Fidelidade Angola"] },
];

const UNIDADES: UnidadeSeed[] = [
  ...HOSPITAIS_PUBLICOS,
  ...CLINICAS_PRIVADAS,
  ...FARMACIAS,
];

async function main() {
  console.log("A semear a base de dados do PSN…");

  // Seguradoras
  const seguradoras = new Map<string, string>();
  for (const s of SEGURADORAS) {
    const r = await prisma.seguradora.upsert({
      where: { nome: s.nome },
      update: { sigla: s.sigla, logoUrl: s.logoUrl },
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

  // Unidades — aditivo e idempotente: cria apenas as que ainda não existem
  // (por nome), preservando dados e edições do admin nas já existentes.
  let criadas = 0;
  for (const u of UNIDADES) {
    const existe = await prisma.unidade.findFirst({ where: { nome: u.nome } });
    if (existe) {
      // Backfill de rede/logótipo em falta (não sobrepõe edições do admin).
      const dados: { rede?: string; logoUrl?: string } = {};
      if (u.rede && !existe.rede) dados.rede = u.rede;
      if (u.logoUrl && !existe.logoUrl) dados.logoUrl = u.logoUrl;
      if (Object.keys(dados).length > 0) {
        await prisma.unidade.update({ where: { id: existe.id }, data: dados });
      }
      continue;
    }
    criadas++;
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
        logoUrl: u.logoUrl,
        descricao: u.descricao,
        rede: u.rede,
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
    `Concluído: ${SEGURADORAS.length} seguradoras, ${ESPECIALIDADES.length} especialidades, ${UNIDADES.length} unidades no catálogo (${criadas} novas criadas).`,
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
