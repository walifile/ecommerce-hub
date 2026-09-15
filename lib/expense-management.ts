export const EXPENSE_TYPES = ["advertising", "shipping", "salary", "miscellaneous"] as const;
export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export type ExpensePayload = {
  title: string;
  expenseType: ExpenseType;
  amount: number;
  date: string;
};

export type ExpenseInput = {
  title: unknown;
  expenseType: unknown;
  amount: unknown;
  date: unknown;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayUtc(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function isValidExpenseDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseExpenseInput(
  input: ExpenseInput,
  currentDate = todayUtc()
): { value?: ExpensePayload; error?: string } {
  const title = String(input.title ?? "").trim();
  const expenseType = String(input.expenseType ?? "miscellaneous").trim().toLowerCase();
  const amountText = String(input.amount ?? "").trim();
  const amount = amountText === "" ? Number.NaN : Number(amountText);
  const date = String(input.date ?? "").trim() || currentDate;

  if (!title || title.length > 120) {
    return { error: "Enter an expense title of 120 characters or less." };
  }
  if (!EXPENSE_TYPES.includes(expenseType as ExpenseType)) {
    return { error: "Select a valid expense type." };
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9_999_999_999.99) {
    return { error: "Enter a valid expense amount." };
  }
  if (!isValidExpenseDate(date)) return { error: "Enter a valid expense date." };
  if (date > currentDate) return { error: "Expense date cannot be in the future." };

  return {
    value: {
      title,
      expenseType: expenseType as ExpenseType,
      amount: Number(amount.toFixed(2)),
      date,
    },
  };
}

export function isValidRevision(value: string) {
  return Boolean(value && Number.isFinite(new Date(value).getTime()));
}

export type ExpenseListItem = {
  title: string;
  expenseType: ExpenseType;
  amount: number;
  date: string;
  createdAt: string;
};

export type ExpenseSort = "newest" | "oldest" | "highest" | "lowest" | "title";

export function filterExpenses<T extends ExpenseListItem>(
  expenses: T[],
  filters: { query?: string; type?: ExpenseType | "all"; from?: string; to?: string }
) {
  const query = filters.query?.trim().toLocaleLowerCase() ?? "";
  return expenses.filter((expense) => {
    if (query && !expense.title.toLocaleLowerCase().includes(query)) return false;
    if (filters.type && filters.type !== "all" && expense.expenseType !== filters.type) return false;
    if (filters.from && expense.date < filters.from) return false;
    if (filters.to && expense.date > filters.to) return false;
    return true;
  });
}

export function sortExpenses<T extends ExpenseListItem>(expenses: T[], sort: ExpenseSort) {
  return [...expenses].sort((a, b) => {
    if (sort === "oldest") return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
    if (sort === "highest") return b.amount - a.amount;
    if (sort === "lowest") return a.amount - b.amount;
    if (sort === "title") return a.title.localeCompare(b.title);
    return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
  });
}

export function expenseCsvCell(value: string | number) {
  let text = String(value);
  if (typeof value === "string" && /^\s*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildExpenseCsv(
  expenses: Array<{ title: string; type: string; date: string; amount: number }>
) {
  const rows = [
    ["Title", "Type", "Date", "Amount"],
    ...expenses.map((expense) => [expense.title, expense.type, expense.date, expense.amount.toFixed(2)]),
  ];
  return `\uFEFF${rows.map((row) => row.map(expenseCsvCell).join(",")).join("\r\n")}`;
}
