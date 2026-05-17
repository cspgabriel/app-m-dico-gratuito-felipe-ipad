/**
 * Templates de anamnese e evolução por especialidade.
 * Estruturas baseadas na prática clínica padrão brasileira.
 * São pontos de partida — o médico edita livremente.
 */

export interface TemplateField {
  queixa?: string;
  hda?: string;
  antecedentes?: string;
  exameFisico?: string;
  hipoteseDiagnostica?: string;
  conduta?: string;
}

export interface SpecialtyTemplate {
  id: string;
  specialty: string;
  name: string;
  fields: TemplateField;
}

export const SPECIALTY_TEMPLATES: SpecialtyTemplate[] = [
  {
    id: 'clinica-geral',
    specialty: 'Clínica Geral',
    name: 'Consulta de rotina',
    fields: {
      queixa: 'Consulta de rotina. Paciente assintomático(a).',
      hda: 'Sem queixas no momento. Última consulta há _____ meses.',
      antecedentes: 'HAS: nega / sim\nDM: nega / sim\nDLP: nega / sim\nTabagismo: nega / ex / atual\nEtilismo: nega / social / abusivo\nAlergias: ____\nMedicações em uso: ____\nCirurgias prévias: ____',
      exameFisico: 'BEG, LOTE, AAA, hidratado(a), normocorado(a), afebril\nPA: ____ mmHg | FC: ____ bpm | FR: ____ irpm | SatO2: ____% | Tax: ____°C\nPeso: ____ kg | Altura: ____ m | IMC: ____\nACV: RCR 2T, BNF, sem sopros\nAR: MV+ universalmente, sem RA\nAbdome: plano, flácido, indolor, RHA+, sem VMG\nNeuro: vígil, orientado, sem déficits focais',
      hipoteseDiagnostica: 'Paciente hígido(a). Z00.0 — Exame geral.',
      conduta: 'Mantida rotina. Solicitados exames de rotina.\nReavaliar em ____ meses.',
    },
  },
  {
    id: 'cardio-rotina',
    specialty: 'Cardiologia',
    name: 'Avaliação cardiovascular',
    fields: {
      queixa: 'Avaliação cardiológica.',
      hda: 'Refere ____ há ____.\nDor torácica: nega / sim (caracterizar: tipo, irradiação, fatores de melhora/piora)\nDispneia: nega / esforço / repouso (NYHA I/II/III/IV)\nPalpitações: nega / sim\nSíncope: nega / sim\nEdema MMII: nega / sim',
      antecedentes: 'FRCV — HAS: __ | DM: __ | DLP: __ | Tabagismo: __ | Obesidade: __ | História familiar de DAC: __\nIAM/AVC prévio: __\nMedicações cardiológicas em uso: ____',
      exameFisico: 'PA: ____ mmHg (sentado e em pé)\nFC: ____ bpm | Ritmo: regular / irregular\nAusculta cardíaca: RCR 2T, BNF / B3 / B4 / sopro (sistólico/diastólico, intensidade, foco)\nAusculta pulmonar: MV+ / crepitantes em bases\nPulsos periféricos: presentes e simétricos / assimetrias\nMMII: sem edema / edema +__/4+',
      hipoteseDiagnostica: 'HAS estágio __ / DAC estável / IC NYHA __ / Arritmia em investigação',
      conduta: 'Solicitados: ECG, ECO TT, Holter 24h, MAPA, perfil lipídico, hemograma, função renal.\nAjustar medicação: ____\nRetorno em ____ dias com resultados.',
    },
  },
  {
    id: 'derma-lesao',
    specialty: 'Dermatologia',
    name: 'Avaliação de lesão',
    fields: {
      queixa: 'Lesão cutânea em ____ há ____.',
      hda: 'Lesão localizada em ____.\nTempo de evolução: ____\nSintomas associados (prurido, dor, sangramento): ____\nAlteração de cor / tamanho / forma: ____\nExposição solar / trauma prévio: ____',
      antecedentes: 'Fototipo Fitzpatrick: I / II / III / IV / V / VI\nHistória de câncer de pele pessoal/familiar: __\nLesões prévias removidas: __\nUso de imunossupressores: __',
      exameFisico: 'Lesão única / múltiplas em ____\nMorfologia: mácula / pápula / nódulo / placa / vesícula / pústula\nDimensões: ____ x ____ mm\nBordas: regulares / irregulares\nCor: ____ / hetero ou homogênea\nABCDE: A: __ | B: __ | C: __ | D: __ | E: __\nDermatoscopia: ____',
      hipoteseDiagnostica: 'Nevo melanocítico / Ceratose seborreica / CBC / CEC / Melanoma a esclarecer',
      conduta: 'Biópsia incisional / excisional\nFotoproteção FPS 50+ recomendada\nRetorno com resultado anatomopatológico.',
    },
  },
  {
    id: 'pediatria-puer',
    specialty: 'Pediatria',
    name: 'Puericultura / Consulta de rotina',
    fields: {
      queixa: 'Puericultura — consulta de rotina.',
      hda: 'Acompanhamento de desenvolvimento.\nAleitamento: materno exclusivo / misto / fórmula\nAlimentação complementar (se >6m): ____\nSono: ____ horas/noite\nDiurese / Evacuações: normais',
      antecedentes: 'Gestação: ____ semanas, intercorrências: ____\nParto: vaginal / cesárea, motivo: ____\nAPGAR: __/__\nPeso ao nascer: ____ g | Estatura: ____ cm\nTriagem neonatal: completa / pendente\nVacinação: em dia conforme PNI / pendências: ____',
      exameFisico: 'Peso atual: ____ kg (P__) | Estatura: ____ cm (P__) | PC: ____ cm (P__)\nIMC: ____ (P__)\nBEG, ativo, reativo, corado, hidratado, afebril\nFontanela anterior: __ x __ cm, normotensa\nMarcos do desenvolvimento: adequados para idade / atraso em ____\nAusculta CR: normais\nAbdome: sem alterações',
      hipoteseDiagnostica: 'RNT AIG / crescimento e desenvolvimento adequados',
      conduta: 'Mantido aleitamento.\nVacinas conforme calendário.\nOrientações de prevenção de acidentes.\nRetorno em ____ meses.',
    },
  },
  {
    id: 'gineco-rotina',
    specialty: 'Ginecologia',
    name: 'Consulta ginecológica de rotina',
    fields: {
      queixa: 'Consulta ginecológica de rotina.',
      hda: 'Sem queixas / queixas: ____\nDUM: __/__/____ | Ciclo: regular ____ dias / irregular\nDispareunia: nega / sim\nSinusorragia / sangramento intermenstrual: nega / sim\nCorrimento: nega / sim (características)',
      antecedentes: 'GO: G__ P__ A__ (V__/C__)\nMenarca: ____ anos | Sexarca: ____ anos\nMétodo contraceptivo: ____\nÚltima citologia: __/__/____ — resultado: ____\nÚltima mamografia: __/__/____ — BI-RADS: ____\nDST prévias: __\nCirurgias ginecológicas: __',
      exameFisico: 'Mamas: simétricas, sem nódulos palpáveis, sem retrações / alterações em ____\nAbdome: plano, sem massas, indolor\nExame especular: vagina / colo de aspecto: ____\nToque bimanual: útero AVF, móvel, indolor, anexos sem massas',
      hipoteseDiagnostica: 'Paciente hígida ginecologicamente / Achado: ____',
      conduta: 'Solicitado: citologia oncótica, USG transvaginal, mamografia (se ≥40a)\nMantido método contraceptivo / nova prescrição: ____\nRetorno anual.',
    },
  },
  {
    id: 'ortopedia-dor',
    specialty: 'Ortopedia',
    name: 'Dor musculoesquelética',
    fields: {
      queixa: 'Dor em ____ há ____.',
      hda: 'Dor localizada em ____.\nIrradiação: ____\nFator desencadeante: trauma / esforço / espontânea\nCaracterística: mecânica / inflamatória\nIntensidade EVA: ____/10\nFatores de melhora: ____ | piora: ____\nParestesias / fraqueza: ____',
      antecedentes: 'Cirurgias ortopédicas prévias: ____\nDoenças osteomusculares: ____\nProfissão / atividade física: ____',
      exameFisico: 'Inspeção: edema / hematoma / deformidade em ____\nPalpação: dor à palpação de ____\nADM: ____° (ativa) / ____° (passiva)\nForça muscular: ____/5\nTestes específicos: ____\nNeurológico segmentar: sensibilidade ____ / reflexos ____',
      hipoteseDiagnostica: 'Lombalgia mecânica / Tendinite / Lesão ligamentar / Síndrome compressiva',
      conduta: 'Solicitado: RX, RM, USG\nPrescrição: AINH ____ + relaxante muscular ____\nFisioterapia\nRetorno em 15 dias.',
    },
  },
  {
    id: 'psiq-primeira',
    specialty: 'Psiquiatria',
    name: 'Primeira consulta / Avaliação',
    fields: {
      queixa: 'Refere ____ há ____.',
      hda: 'Início: ____ (insidioso / agudo)\nSintomas: humor (depressivo, eufórico, irritado), ansiedade, sono (insônia inicial/intermediária/terminal), apetite, energia, libido, anedonia, ideação suicida (ativa/passiva), pensamentos intrusivos\nFator desencadeante: ____\nImpacto funcional: trabalho / família / social',
      antecedentes: 'Episódios prévios: __\nInternações psiquiátricas: __\nTentativa de suicídio: __ (quando, método)\nMedicações psiquiátricas usadas: ____ (resposta)\nÁlcool/drogas: __\nDoenças clínicas: __\nHistória familiar psiquiátrica: __',
      exameFisico: 'Exame psíquico:\nApresentação: cooperativo / hostil / desorganizado\nConsciência: vígil / rebaixada\nOrientação: AAA\nAtenção: hipo / hiper / tenacidade preservada\nMemória: recente / remota preservadas\nHumor: ____ | Afeto: congruente / incongruente, embotado, lábil\nPensamento — curso: ____ | forma: ____ | conteúdo: ____\nPercepção: alucinações ____\nJuízo crítico: preservado / prejudicado\nIdeação suicida: presente / ausente | Plano: ____',
      hipoteseDiagnostica: 'F32.x — Episódio depressivo / F41.x — Ansiedade / F31.x — Transtorno bipolar',
      conduta: 'Iniciado: ____ ____ mg\nPsicoterapia recomendada (TCC / psicanálise)\nOrientações sobre crise / contatos de emergência (CVV 188)\nRetorno em 15-21 dias.',
    },
  },
  {
    id: 'endocrino-dm',
    specialty: 'Endocrinologia',
    name: 'Acompanhamento de DM / Tireoide',
    fields: {
      queixa: 'Acompanhamento de ____.',
      hda: 'DM tipo __ diagnosticado em ____.\nGlicemias capilares: jejum ____ | pós-prandial ____\nHipoglicemias: nega / sim (frequência)\nSintomas: polidpsia / poliúria / perda de peso\nAdesão à dieta / atividade física: ____',
      antecedentes: 'Complicações: retinopatia / nefropatia / neuropatia\nÚltima HbA1c: ____ % em ____\nÚltimo exame de fundo de olho: ____\nMedicações em uso: ____',
      exameFisico: 'Peso: ____ kg | Altura: ____ m | IMC: ____ | CA: ____ cm\nPA: ____ mmHg | FC: ____ bpm\nTireoide: não palpável / palpável (caracterizar)\nPés: sensibilidade preservada / reduzida\nMonofilamento: ____ | Diapasão: ____\nLesões em pés: ____',
      hipoteseDiagnostica: 'DM tipo 2 — controle adequado / inadequado | E11.x',
      conduta: 'Solicitado: HbA1c, glicemia jejum, perfil lipídico, função renal, microalbuminúria, TSH, fundo de olho\nAjustada medicação: ____\nOrientações nutricionais e atividade física.\nRetorno em ____ meses.',
    },
  },
];

export const SPECIALTIES = Array.from(new Set(SPECIALTY_TEMPLATES.map(t => t.specialty))).sort();

export function templatesForSpecialty(specialty?: string): SpecialtyTemplate[] {
  if (!specialty) return SPECIALTY_TEMPLATES;
  return SPECIALTY_TEMPLATES.filter(t => t.specialty === specialty);
}
