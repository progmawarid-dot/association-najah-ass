const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let db;
let dbPath;

async function initDatabase(appPath) {
  const SQL = await initSqlJs();
  dbPath = path.join(appPath, 'association.db');
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS associations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS fiscal_years (id INTEGER PRIMARY KEY AUTOINCREMENT, association_id INTEGER, year INTEGER, is_active BOOLEAN)`,
    `CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, association_id INTEGER, name_ar TEXT, type TEXT, current_balance REAL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS payment_methods (id INTEGER PRIMARY KEY AUTOINCREMENT, association_id INTEGER, name_ar TEXT, name TEXT, account_type TEXT)`,
    `CREATE TABLE IF NOT EXISTS income_fields (id INTEGER PRIMARY KEY AUTOINCREMENT, association_id INTEGER, name_ar TEXT, name TEXT)`,
    `CREATE TABLE IF NOT EXISTS expense_fields (id INTEGER PRIMARY KEY AUTOINCREMENT, association_id INTEGER, name_ar TEXT, name TEXT)`,
    
    `CREATE TABLE IF NOT EXISTS income_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, association_id INTEGER, date TEXT, description TEXT, income_field_id INTEGER, amount REAL, payment_method TEXT, reference_number TEXT, notes TEXT)`,
    
    // ✅ هذا هو الجدول المحدث بكل الأعمدة الجديدة
    `CREATE TABLE IF NOT EXISTS expense_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        association_id INTEGER, 
        date TEXT, 
        description TEXT, 
        expense_field_id INTEGER, 
        amount REAL, 
        payment_method TEXT, 
        
        service_status TEXT,      
        payment_status TEXT,      
        
        op_number TEXT,           
        bc_number TEXT,           
        bl_number TEXT,           
        check_number TEXT,        
        
        invoice_type TEXT,        -- نوع الوثيقة (فاتورة/بون)
        invoice_number TEXT,      -- رقم الوثيقة
        
        beneficiary_name TEXT,    
        beneficiary_cin TEXT,     
        beneficiary_vehicle TEXT, 
        
        notes TEXT,
        reference_number TEXT
    )`,

        // جدول دفاتر الشيكات
    `CREATE TABLE IF NOT EXISTS checkbooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        association_id INTEGER,
        bank_account_name TEXT,   -- اسم البنك
        series_name TEXT,         -- اسم تعريفي للدفتر (مثلاً: دفتر 2025/1)
        start_number INTEGER,     -- أول رقم (مثلاً 500)
        end_number INTEGER,       -- آخر رقم (مثلاً 550)
        alert_threshold INTEGER DEFAULT 5, -- التنبيه عند تبقي X شيكات
        is_active BOOLEAN DEFAULT 1,
        created_at TEXT
    )`,

    // جدول الشيكات الملغاة (Talon)
    `CREATE TABLE IF NOT EXISTS cancelled_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        association_id INTEGER,
        checkbook_id INTEGER,
        check_number TEXT,
        cancellation_reason TEXT, -- سبب الإلغاء (خطأ في الكتابة، تمزق...)
        cancellation_date TEXT
    )`,


    `CREATE TABLE IF NOT EXISTS cash_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, association_id INTEGER, transaction_date TEXT, operation_label TEXT, movement_type TEXT, amount REAL, document_type TEXT, document_number TEXT, linked_income_id INTEGER, linked_expense_id INTEGER, balance_after REAL)`,
    `CREATE TABLE IF NOT EXISTS bank_transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, association_id INTEGER, transaction_date TEXT, operation_label TEXT, movement_type TEXT, amount REAL, check_number TEXT, payment_method_id INTEGER, linked_income_id INTEGER, linked_expense_id INTEGER, balance_after REAL)`
  ];

  tables.forEach(sql => db.run(sql));
  saveDatabase();
  return db;
}

function saveDatabase() {
  if(db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function executeQuery(sql) {
  const stmt = db.prepare(sql);
  const result = [];
  while (stmt.step()) result.push(stmt.getAsObject());
  stmt.free();
  return result;
}

module.exports = { initDatabase, saveDatabase, executeQuery, db: () => db };
