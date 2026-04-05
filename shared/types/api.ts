export type Role = "viewer" | "analyst" | "admin";

export type UserStatus = "active" | "inactive";

export type RecordType = "income" | "expense";

export type Id = string;

export type ISODateString = string;

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  error: null;
};

export type ApiFailure = {
  success: false;
  message: string;
  data: null;
  error: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type User = {
  _id: Id;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type FinancialRecord = {
  _id: Id;
  userId: Id;
  amount: number;
  type: RecordType;
  category: string;
  date: ISODateString;
  description?: string;
  notes?: string;
  isDeleted: boolean;
  deletedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type AuthToken = {
  token: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type CreateFinancialRecordRequest = {
  amount: number;
  type: RecordType;
  category: string;
  date: ISODateString;
  description?: string;
  notes?: string;
};

export type UpdateFinancialRecordRequest =
  Partial<CreateFinancialRecordRequest>;