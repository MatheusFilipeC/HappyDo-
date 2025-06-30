export interface CreateTask {
  titulo: string;
  descricao: string;
  categoria: string;
  frequencia: string;
  dataInicio: string;
  dataFim: string;
  diasSemana?: string;
}
