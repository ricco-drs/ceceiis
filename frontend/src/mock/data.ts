export interface ListMember {
  role: string;
  name: string;
  photo: string;
  specialty?: string;
  cycle?: string;
  codigo?: string;
}

export interface ElectionList {
  id: string;
  name: string;
  acronym: string;
  color: string;
  logo: string;
  presentation: string;
  members: ListMember[];
}

export interface ListResult {
  id: string;
  name: string;
  presidentName: string;
  acronym: string;
  color: string;
  votes: number;
  percentage: number;
  logo: string;
  candidateImage: string;
}

export interface ActSummary {
  counted: number;
  observed: number;
  missing: number;
  total: number;
  percentage: number;
  eligible: number;
  lastUpdated: string;
}

// Drive IDs to Direct Links (Download format for better reliability)
const photos = {
  h1: "https://drive.google.com/uc?export=download&id=1aEyw8rHD_3OVAhaMQHvmAutSYD95tCTa",
  h2: "https://drive.google.com/uc?export=download&id=1OIg7ZwXcnSdmziRXyjkx9Qp9Jw6CqCdI",
  h3: "https://drive.google.com/uc?export=download&id=1ewK4pD9_fX6a0kMUKtP4EywcbhoNqxQK",
  h4: "https://drive.google.com/uc?export=download&id=1N98JHtcgePRnokLgt5-EQT0GtH3G2FcF",
  m1: "https://drive.google.com/uc?export=download&id=18jbgLdwZM4SDJLgjmnFZVq2iTMKTkbEc",
  m2: "https://drive.google.com/uc?export=download&id=1fxRG8kLwV4fkZkjnSNOkv9RUgsrhLlle",
  m3: "https://drive.google.com/uc?export=download&id=1qxad8RJTo7QUkbv5gHsO0vL5BPziL4fA",
  m4: "https://drive.google.com/uc?export=download&id=1h2IFDUsw29wZXpKy47eY1PU54eAxnX0l",
  m5: "https://drive.google.com/uc?export=download&id=1LPprYAavbMMfUaui97oTZEN63_gu2Al5",
  m6: "https://drive.google.com/uc?export=download&id=1Ieiryk8VxbSOpR2RDvVwE7mdsoLcnRxo",
};

const commonMembers: ListMember[] = [
  { role: "Presidente", name: "Carlos Eduardo Mendoza", photo: photos.h1, specialty: "Ing. Sistemas", cycle: "2024-1", codigo: "20210234A" },
  { role: "Vicepresidente", name: "Ana Lucía Torres", photo: photos.m1, specialty: "Ing. Industrial", cycle: "2024-1", codigo: "20210456B" },
  { role: "Segundo Vicepresidente", name: "Roberto Sánchez", photo: photos.h2, specialty: "Ing. Sistemas", cycle: "2024-2", codigo: "20200890C" },
  { role: "Coordinador Industrial", name: "María Fernanda Quispe", photo: photos.m2, specialty: "Ing. Industrial", cycle: "2025-1", codigo: "20220123D" },
  { role: "Coordinador Sistemas", name: "Javier Pineda", photo: photos.h3, specialty: "Ing. Sistemas", cycle: "2025-1", codigo: "20220456E" },
  { role: "Coordinador Software", name: "Elena Ramos", photo: photos.m3, specialty: "Ing. Software", cycle: "2024-2", codigo: "20210987F" },
  { role: "Coordinador de Deportes", name: "Daniel Alcántara", photo: photos.h4, specialty: "Ing. Industrial", cycle: "2023-2", codigo: "20200543G" },
  { role: "Coordinador de Cultura", name: "Sofía Beltrán", photo: photos.m4, specialty: "Ing. Sistemas", cycle: "2025-1", codigo: "20220777H" },
  { role: "Prensa", name: "Valeria Soto", photo: photos.m5, specialty: "Ing. Software", cycle: "2026-1", codigo: "20230111I" },
  { role: "Relaciones Publicas", name: "Gabriela Ortiz", photo: photos.m6, specialty: "Ing. Sistemas", cycle: "2026-1", codigo: "20230222J" },
];

export const electionLists: ElectionList[] = [
  {
    id: "list-innovacion",
    name: "Innovación FIIS",
    acronym: "INNO",
    color: "#2B78C5",
    logo: "https://img.icons8.com/color/96/gear.png",
    presentation: "Somos un equipo comprometido con la excelencia académica y la innovación tecnológica en nuestra facultad. Buscamos transformar el CEIIS en un centro de gestión eficiente.",
    members: commonMembers,
  },
  {
    id: "list-union",
    name: "Unión Estudiantil",
    acronym: "UNIO",
    color: "#22C55E",
    logo: "https://img.icons8.com/color/96/bookmark.png",
    presentation: "Nuestra prioridad es el bienestar del estudiante. Queremos una facultad más inclusiva, con mejores espacios de estudio y representación real ante las autoridades.",
    members: commonMembers,
  },
  {
    id: "list-fuerza",
    name: "Fuerza CEIIS",
    acronym: "FUER",
    color: "#EF4444",
    logo: "https://img.icons8.com/color/96/fire-element.png",
    presentation: "Representamos la fuerza y el espíritu de la FIIS. Venimos a renovar las tradiciones y fortalecer la identidad de nuestra comunidad estudiantil.",
    members: commonMembers,
  },
];

export const mockSummary: ActSummary = {
  counted: 0,
  observed: 0,
  missing: 50,
  total: 50,
  eligible: 50,
  percentage: 0,
  lastUpdated: new Date().toISOString(),
};

export const mockResults: ListResult[] = electionLists.map(l => {
  const president = l.members.find(m => m.role === "Presidente");
  return {
    id: l.id,
    name: l.name,
    presidentName: president?.name || "Sin candidato",
    acronym: l.acronym,
    color: l.color,
    votes: 0,
    percentage: 0,
    logo: l.logo,
    candidateImage: president?.photo || l.logo,
  };
});

export const participationData = [
  { name: "Votaron", value: 0, color: "#0F172A" },
  { name: "No votaron", value: 50, color: "#CBD5E1" },
];

export const electionRoles = [
  "Presidente",
  "Vicepresidente",
  "Segundo Vicepresidente",
  "Coordinador Industrial",
  "Coordinador Sistemas",
  "Coordinador Software",
  "Coordinador de Deportes",
  "Coordinador de Cultura",
  "Prensa",
  "Relaciones Publicas",
];
