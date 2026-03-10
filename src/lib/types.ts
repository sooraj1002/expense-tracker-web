export type ApiErrorPayload = {
  code: string;
  message: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: ApiErrorPayload | null;
};

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type AuthResponse = {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
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

export type CategoryBasic = {
  categoryId: string;
  categoryName: string;
  color: string;
  isDefault: boolean;
};

export type Expense = {
  id: string;
  userId?: string;
  amount: number;
  category?: CategoryBasic;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  accountId: string;
  accountName?: string;
  date: string;
  tags: string[];
  merchantId?: string;
  source?: "manual" | "auto";
  merchantName?: string;
  verified?: boolean;
  rawData?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCategoryInput = {
  name: string;
  color: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreateAccountInput = {
  name: string;
  initialBalance: number;
};

export type UpdateAccountInput = Partial<CreateAccountInput>;

export type CreateExpenseInput = {
  amount: number;
  categoryId: string;
  accountId: string;
  date: string;
  description?: string;
  tags?: string[];
};

export type UpdateExpenseInput = Partial<CreateExpenseInput> & {
  verified?: boolean;
};

export type PaginatedResponse<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  limit: number;
  total: number;
  totalPages: number;
  totalAmount: number;
};
