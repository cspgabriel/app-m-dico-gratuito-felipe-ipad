export interface Paciente {
  id: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  nascimento?: string;
  sexo?: "M" | "F" | "Outro";
  convenio?: string;
  registroAns?: string;
  planoSaude?: string;
  numeroCarteira?: string;
  validadeCarteira?: string;
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

export type TissGuideType = "consulta" | "sp_sadt" | "honorario";
export type TissGuideStatus = "draft" | "authorized" | "submitted" | "paid" | "glossed" | "cancelled";

export interface TissGuide {
  id: string;
  userId: string;
  pacienteId: string;
  consultaId: string;
  tipoGuia: TissGuideType;
  status: TissGuideStatus;
  numeroGuia: string;
  numeroGuiaOperadora?: string;
  numeroGuiaPrincipal?: string;
  operadora: string;
  registroAns?: string;
  planoSaude?: string;
  numeroCarteira?: string;
  validadeCarteira?: string;
  pacienteNome: string;
  pacienteCpf?: string;
  dataAtendimento: string;
  cid10: string[];
  tuss: string[];
  indicacaoClinica?: string;
  conduta?: string;
  caraterAtendimento?: "eletivo" | "urgencia";
  tipoConsulta?: "primeira" | "seguimento" | "pre_natal" | "referencia";
  senhaAutorizacao?: string;
  dataAutorizacao?: string;
  validadeSenha?: string;
  valorTotal?: number;
  loteId?: string;
  protocolo?: string;
  motivoGlosa?: string;
  createdAt: string;
  updatedAt: string;
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
