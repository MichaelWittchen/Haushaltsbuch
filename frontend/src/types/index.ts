export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: Date;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  createdAt: string;
}

export interface CreateTransactionData {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
}

export interface UpdateTransactionData {
  type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string;
}

export const INCOME_CATEGORIES = [
  'Gehalt',
  'Nebenjob',
  'Zinsen',
  'Geschenke',
  'Sonstiges',
] as const;

export const EXPENSE_CATEGORIES = [
  'Miete',
  'Lebensmittel',
  'Transport',
  'Kleidung',
  'Freizeit',
  'Gesundheit',
  'Versicherungen',
  'Abonnements',
  'Sonstiges',
] as const;
