-- ========== الجمعيات ==========
CREATE TABLE IF NOT EXISTS associations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  logo TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========== السنوات المالية ==========
CREATE TABLE IF NOT EXISTS fiscal_years (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT 0,
  opening_balance_cash REAL DEFAULT 0,
  opening_balance_bank REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id),
  UNIQUE(association_id, year)
);

-- ========== الحسابات ==========
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('cash', 'bank')),
  current_balance REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id)
);

-- ========== التصنيفات ==========
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  type TEXT CHECK(type IN ('income', 'expense')),
  code TEXT,
  parent_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id),
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- ========== طرق الدفع ==========
CREATE TABLE IF NOT EXISTS payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  code TEXT,
  account_type TEXT CHECK(account_type IN ('cash', 'bank')),
  requires_check_number BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id)
);

-- ========== مجالات الصرف ==========
CREATE TABLE IF NOT EXISTS expense_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id)
);

-- ========== مجالات المداخيل ==========
CREATE TABLE IF NOT EXISTS income_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id)
);

-- ========== الأعضاء ==========
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  join_date DATE,
  member_type TEXT DEFAULT 'active',
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id)
);

-- ========== المعاملات العامة ==========
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  fiscal_year_id INTEGER NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_type TEXT NOT NULL CHECK(transaction_type IN ('income', 'expense', 'transfer')),
  category_id INTEGER,
  description TEXT,
  amount REAL NOT NULL CHECK(amount > 0),
  payment_method_id INTEGER,
  from_account_id INTEGER,
  to_account_id INTEGER,
  reference_number TEXT,
  member_id INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id),
  FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (from_account_id) REFERENCES accounts(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- ========== سجل البنك ==========
CREATE TABLE IF NOT EXISTS bank_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  fiscal_year_id INTEGER NOT NULL,
  transaction_date DATE NOT NULL,
  operation_label TEXT NOT NULL,
  bank_operation_type TEXT,
  reference_name TEXT,
  reference_number TEXT,
  payment_method_id INTEGER NOT NULL,
  check_number TEXT,
  third_party_code TEXT,
  third_party_identity TEXT,
  amount REAL NOT NULL CHECK(amount > 0),
  movement_type TEXT NOT NULL CHECK(movement_type IN ('deposit', 'withdrawal')),
  balance_after REAL,
  notes TEXT,
  transaction_id INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id),
  FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ========== سجل الصندوق ==========
CREATE TABLE IF NOT EXISTS cash_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  fiscal_year_id INTEGER NOT NULL,
  transaction_date DATE NOT NULL,
  cash_receipt_number TEXT,
  operation_label TEXT NOT NULL,
  category_id INTEGER,
  expense_field_id INTEGER,
  payment_method_id INTEGER NOT NULL,
  check_number TEXT,
  third_party_code TEXT,
  third_party_identity TEXT,
  receipt_number TEXT,
  amount REAL NOT NULL CHECK(amount > 0),
  movement_type TEXT NOT NULL CHECK(movement_type IN ('receipt', 'payment')),
  balance_after REAL,
  document_type TEXT,
  document_number TEXT,
  reference_type TEXT,
  reference_number TEXT,
  notes TEXT,
  transaction_id INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id),
  FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (expense_field_id) REFERENCES expense_fields(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ========== سجل المداخيل ==========
CREATE TABLE IF NOT EXISTS income_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  fiscal_year_id INTEGER NOT NULL,
  transaction_date DATE NOT NULL,
  income_field_id INTEGER NOT NULL,
  income_type TEXT NOT NULL,
  payment_method_id INTEGER NOT NULL,
  check_number TEXT,
  check_amount REAL,
  transfer_receipt_number TEXT,
  cash_receipt_number TEXT,
  collector_identity TEXT,
  amount REAL NOT NULL CHECK(amount > 0),
  amount_type TEXT CHECK(amount_type IN ('credit', 'debit')),
  reference_type TEXT,
  reference_number TEXT,
  notes TEXT,
  target_account_id INTEGER,
  transaction_id INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id),
  FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id),
  FOREIGN KEY (income_field_id) REFERENCES income_fields(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (target_account_id) REFERENCES accounts(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ========== سجل المصاريف ==========
CREATE TABLE IF NOT EXISTS expense_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  fiscal_year_id INTEGER NOT NULL,
  transaction_date DATE NOT NULL,
  expense_field_id INTEGER NOT NULL,
  operation_label TEXT NOT NULL,
  payment_method_id INTEGER NOT NULL,
  check_number TEXT,
  check_amount REAL,
  third_party_code TEXT,
  third_party_identity TEXT,
  transfer_receipt_number TEXT,
  cash_receipt_number TEXT,
  amount REAL NOT NULL CHECK(amount > 0),
  amount_type TEXT DEFAULT 'debit' CHECK(amount_type = 'debit'),
  reference_type TEXT,
  reference_number TEXT,
  justification_type TEXT,
  justification_number TEXT,
  notes TEXT,
  source_account_id INTEGER,
  transaction_id INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id),
  FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id),
  FOREIGN KEY (expense_field_id) REFERENCES expense_fields(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (source_account_id) REFERENCES accounts(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ========== سجل الشيكات ==========
CREATE TABLE IF NOT EXISTS checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  fiscal_year_id INTEGER NOT NULL,
  check_number TEXT NOT NULL,
  check_date DATE NOT NULL,
  check_amount REAL NOT NULL CHECK(check_amount > 0),
  check_type TEXT NOT NULL CHECK(check_type IN ('outgoing', 'incoming')),
  check_status TEXT NOT NULL DEFAULT 'pending' CHECK(check_status IN ('pending', 'cashed', 'deposited', 'bounced', 'cancelled', 'deferred')),
  third_party_code TEXT,
  third_party_identity TEXT,
  bank_name TEXT,
  bank_account TEXT,
  actual_date DATE,
  operation_label TEXT,
  notes TEXT,
  transaction_id INTEGER,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (association_id) REFERENCES associations(id),
  FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ========== المستخدمون ==========
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user', 'viewer')),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========== السجل اليومي للعمليات ==========
CREATE TABLE IF NOT EXISTS daily_operations_journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  association_id INTEGER NOT NULL,
  operation_number INTEGER NOT NULL,
  fiscal_year_id INTEGER NOT NULL,
  operation_date DATE NOT NULL,
  reference_number TEXT,
  reference_type TEXT,
  operation_description TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK(operation_type IN ('income', 'expense', 'transfer')),
  amount REAL NOT NULL CHECK(amount > 0),
  movement_type TEXT NOT NULL CHECK(movement_type IN ('debit', 'credit')),
  balance_after REAL NOT NULL,
  bank_transaction_id INTEGER,
  cash_transaction_id INTEGER,
  income_transaction_id INTEGER,
  expense_transaction_id INTEGER,
  check_id INTEGER,
  source_register TEXT CHECK(source_register IN ('bank', 'cash', 'income', 'expense', 'check', 'transfer')),
  payment_method_id INTEGER,
  affected_account_id INTEGER,
  notes TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES associations(id),
  FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id),
  FOREIGN KEY (bank_transaction_id) REFERENCES bank_transactions(id),
  FOREIGN KEY (cash_transaction_id) REFERENCES cash_transactions(id),
  FOREIGN KEY (income_transaction_id) REFERENCES income_transactions(id),
  FOREIGN KEY (expense_transaction_id) REFERENCES expense_transactions(id),
  FOREIGN KEY (check_id) REFERENCES checks(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (affected_account_id) REFERENCES accounts(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE(association_id, fiscal_year_id, operation_number)
);

-- ========== Indexes للأداء ==========
CREATE INDEX IF NOT EXISTS idx_fiscal_years_association ON fiscal_years(association_id);
CREATE INDEX IF NOT EXISTS idx_accounts_association ON accounts(association_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_association ON transactions(association_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_association ON bank_transactions(association_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date ON cash_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_association ON cash_transactions(association_id);
CREATE INDEX IF NOT EXISTS idx_income_transactions_date ON income_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_income_transactions_association ON income_transactions(association_id);
CREATE INDEX IF NOT EXISTS idx_expense_transactions_date ON expense_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_expense_transactions_association ON expense_transactions(association_id);
CREATE INDEX IF NOT EXISTS idx_checks_status ON checks(check_status);
CREATE INDEX IF NOT EXISTS idx_checks_association ON checks(association_id);
CREATE INDEX IF NOT EXISTS idx_daily_journal_date ON daily_operations_journal(operation_date);
CREATE INDEX IF NOT EXISTS idx_daily_journal_association ON daily_operations_journal(association_id);
