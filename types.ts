// types.ts
export type Response = string | null;

export type Responses = {
  [dimension: string]: {
    [subDimension: string]: Response;
  };
};

export interface RadioChangeHandler {
  (dimension: string, subDimension: string, value: string): void;
}

export interface Enterprise {
  id: string;
  nome: string;
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Homepage: undefined;
  Form: undefined;
  SummaryScreen: undefined;
  ViewEvaluations: { projectName: string };
  ViewEvaluationDetail: { evaluationId: string };
  EditEvaluation: { evaluationId: string };
  AdminDashboard: undefined;
};
