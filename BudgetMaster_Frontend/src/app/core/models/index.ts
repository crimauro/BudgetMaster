// Base models
export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Auth models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  documentType: number;
  documentNumber: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  documentType: number;
  documentNumber: string;
}

// ExpenseType models
export interface ExpenseType extends BaseEntity {
  code: string;
  name: string;
  description: string;
}

export interface CreateExpenseTypeRequest {
  name: string;
  description: string;
}

export interface UpdateExpenseTypeRequest {
  code: string;
  name: string;
  description: string;
}

// MonetaryFund models
export interface MonetaryFund extends BaseEntity {
  name: string;
  description: string;
  initialBalance: number;
  balance: number;
  currentBalance: number;
  userId: number;
}

export interface CreateMonetaryFundRequest {
  name: string;
  description: string;
  initialBalance: number;
  userId: number;
}

export interface UpdateMonetaryFundRequest {
  name: string;
  description: string;
  balance: number;
}

// Budget models
export interface Budget extends BaseEntity {
  userId: number;
  expenseTypeId: number;
  amount: number;
  startDate: Date;
  endDate: Date;
  description: string;
  month: number;
  year: number;
  period: 'Monthly' | 'Quarterly' | 'Annual';
  assignedAmount: number;
  spentAmount: number;
  expenseType?: ExpenseType;
}

export interface CreateBudgetRequest {
  userId: number;
  expenseTypeId: number;
  amount: number;
  startDate: Date;
  endDate: Date;
  description: string;
  month: number;
  year: number;
}

export interface UpdateBudgetRequest {
  userId: number;
  expenseTypeId: number;
  amount: number;
  startDate: Date;
  endDate: Date;
  description: string;
  month: number;
  year: number;
}

// ExpenseRecord models
export interface ExpenseRecord extends BaseEntity {
  userId: number;
  expenseTypeId: number;
  monetaryFundId: number;
  amount: number;
  totalAmount: number;
  date: Date;
  expenseDate: Date;
  reference: string;
  description: string;
  commerceName?: string;
  documentType?: string;
  expenseType?: ExpenseType;
  monetaryFund?: MonetaryFund;
  expenseDetails?: ExpenseDetail[];
  details?: ExpenseRecordDetail[];
}

export interface ExpenseRecordDetail extends BaseEntity {
  expenseRecordId: number;
  expenseTypeId: number;
  itemName: string;
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  expenseType?: ExpenseType;
}

export interface ExpenseDetail extends BaseEntity {
  expenseRecordId: number;
  expenseTypeId: number;
  itemName: string;
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  expenseType?: ExpenseType;
}

export interface CreateExpenseRecordRequest {
  userId: number;
  expenseTypeId: number;
  monetaryFundId: number;
  amount: number;
  date: Date;
  description: string;
  commerceName?: string;
  documentType?: string;
  expenseDetails: CreateExpenseDetailRequest[];
}

export interface CreateExpenseDetailRequest {
  itemName: string;
  description: string;
  amount: number;
  expenseTypeId: number;
  quantity: number;
  unitPrice: number;
}

export interface UpdateExpenseRecordRequest {
  monetaryFundId: number;
  expenseTypeId: number;
  amount: number;
  date: Date;
  description: string;
}

// Deposit models
export interface Deposit extends BaseEntity {
  userId: number;
  monetaryFundId: number;
  amount: number;
  date: Date;
  description: string;
  monetaryFund?: MonetaryFund;
}

export interface CreateDepositRequest {
  userId: number;
  monetaryFundId: number;
  amount: number;
  date: Date;
  description: string;
}

export interface UpdateDepositRequest {
  monetaryFundId: number;
  amount: number;
  date: Date;
  description: string;
}

// Report models
export interface BudgetVsExecutionReport {
  userId: number;
  userName: string;
  month: number;
  year: number;
  generatedAt: Date;
  budgetItems: BudgetVsExecutionItem[];
  totalBudgeted: number;
  totalExecuted: number;
  totalVariance: number;
}

export interface BudgetVsExecutionItem {
  expenseTypeId: number;
  expenseTypeName: string;
  expenseTypeCode: string;
  budgetedAmount: number;
  executedAmount: number;
  variance: number;
  variancePercentage: number;
  isOverBudget: boolean;
}

export interface ExpenseSummaryReport {
  userId: number;
  userName: string;
  startDate: Date;
  endDate: Date;
  totalExpenses: number;
  totalDeposits: number;
  netBalance: number;
  expensesByType: ExpenseByTypeItem[];
  depositsByFund: DepositByFundItem[];
  generatedAt: Date;
}

export interface ExpenseByTypeItem {
  expenseTypeId: number;
  expenseTypeName: string;
  expenseTypeCode: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
}

export interface DepositByFundItem {
  monetaryFundId: number;
  monetaryFundName: string;
  totalAmount: number;
  transactionCount: number;
}

export interface MovementDto {
  id: number;
  date: Date;
  description: string;
  amount: number;
  type: 'Expense' | 'Deposit';
  monetaryFundName: string;
  expenseTypeName?: string;
  expenseTypeCode?: string;
  userName: string;
}

export interface MonthlyFinancialSummary {
  userId: number;
  userName: string;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  budgetCompliance: number;
  topExpenseCategories: ExpenseByTypeItem[];
  generatedAt: Date;
}
