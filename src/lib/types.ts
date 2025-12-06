export type User = {
  id: string;
  email: string;
  name?: string;
};

export type AuthResponse = {
  token: string;
  refreshToken?: string;
  user: User;
};

export type Category = {
  id: string;
  name: string;
  color?: string;
  isDefault?: boolean;
};

export type Account = {
  id: string;
  name: string;
  initialBalance?: number;
  currentBalance?: number;
  totalSpent?: number;
};

export type Expense = {
  id: string;
  amount: number;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  accountId?: string;
  accountName?: string;
  source?: "manual" | "auto";
  merchantName?: string;
  verified?: boolean;
  createdAt?: string;
};

export type MerchantPattern = {
  id: string;
  merchantName: string;
  categoryId: string;
  matchType: "exact" | "contains";
  isActive?: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
