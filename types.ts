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
