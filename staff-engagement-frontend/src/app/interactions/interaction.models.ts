export enum InteractionType {
  NOTE = 'NOTE',
  CALL = 'CALL',
  MEETING = 'MEETING',
  EMAIL = 'EMAIL'
}

export interface InteractionEmployeeRef {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface InteractionResponse {
  id: number;
  author: InteractionEmployeeRef;
  subject: InteractionEmployeeRef;
  note: string;
  type: InteractionType;
  date: string;
}

export interface CreateInteractionRequest {
  subjectId: number;
  note: string;
  type: InteractionType;
  date: string;
}

export interface UpdateInteractionRequest {
  subjectId: number;
  note: string;
  type: InteractionType;
  date: string;
}
