export interface Paciente {
  id: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  nascimento?: string;
  sexo?: "M" | "F" | "Outro";
  convenio?: string;
  alergias?: string;
  medicacoes?: string;
  historico?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Anamnese {
  id: string;
  pacienteId: string;
  queixaPrincipal: string;
  hda: string;
  antecedentesPessoais?: string;
  antecedentesFamiliares?: string;
  habitosVida?: string;
  createdAt: string;
  userId: string;
}

export interface Consulta {
  id: string;
  pacienteId: string;
  data: string;
  queixa: string;
  exameFisico: string;
  conduta: string;
  cid10: string[];
  tuss: string[];
  userId: string;
}

export interface CID10 {
  codigo: string;
  descricao: string;
}

export interface TUSS {
  codigo: string;
  nome_exame: string;
}

export interface Exame {
  id: string;
  pacienteId: string;
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
  userId: string;
  dataUpload: string;
}
