export interface AdminMember {
  role: string;
  name: string;
  codigo: string;
  specialty: string;
  cycle: string;
  photo: string;
}

export interface AdminList {
  id: string;
  name: string;
  acronym: string;
  color: string;
  logo: string;
  presentation: string;
  members: AdminMember[];
}

export interface ConteoState {
  electoresHabiles: string;
  votantes: string;
  votes: Record<string, number>;
}
