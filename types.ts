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

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Homepage: undefined;
  QuestionnaireForm: undefined;
  SummaryScreen: undefined;
  ViewEvaluations: { projectName: string };
  ViewEvaluationDetail: { evaluationId: string };
  EditEvaluation: { evaluationId: string };
};
