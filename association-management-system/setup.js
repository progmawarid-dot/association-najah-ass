// setup.js
const fs = require('fs');
const path = require('path');

const structure = {
  'electron': {
    'database': {
      'init.js': '',
      'schema.sql': ''
    },
    'main.js': '',
    'preload.js': ''
  },
  'src': {
    'components': {
      'Dashboard.jsx': '',
      'Sidebar.jsx': '',
      'Header.jsx': ''
    },
    'pages': {
      'bank': {
        'BankRegister.jsx': '',
        'BankTransactionForm.jsx': ''
      },
      'cash': {
        'CashRegister.jsx': '',
        'CashTransactionForm.jsx': ''
      },
      'income': {
        'IncomeRegister.jsx': '',
        'IncomeTransactionForm.jsx': ''
      },
      'expense': {
        'ExpenseRegister.jsx': '',
        'ExpenseTransactionForm.jsx': ''
      },
      'checks': {
        'ChecksList.jsx': '',
        'CheckForm.jsx': ''
      },
      'reports': {
        'DailyJournal.jsx': '',
        'BudgetReport.jsx': '',
        'BalanceReport.jsx': ''
      },
      'settings': {
        'FiscalYears.jsx': '',
        'Categories.jsx': ''
      }
    },
    'styles': {
      'main.css': ''
    },
    'utils': {
      'api.js': ''
    },
    'App.jsx': '',
    'main.jsx': ''
  },
  'public': {
    'index.html': ''
  },
  'build': {}
};

function createStructure(base, struct) {
  Object.keys(struct).forEach(key => {
    const currentPath = path.join(base, key);
    const value = struct[key];

    if (typeof value === 'object' && Object.keys(value).length > 0) {
      // إنشاء مجلد
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
        console.log(`✅ Created folder: ${currentPath}`);
      }
      // استدعاء recursive للمستوى التالي
      createStructure(currentPath, value);
    } else {
      // إنشاء ملف فارغ
      const dir = path.dirname(currentPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(currentPath)) {
        fs.writeFileSync(currentPath, '');
        console.log(`✅ Created file: ${currentPath}`);
      }
    }
  });
}

// إنشاء الهيكل
console.log('🚀 Creating project structure...\n');
createStructure(__dirname, structure);

// إنشاء ملفات الجذر
const rootFiles = [
  'package.json',
  'vite.config.js',
  'electron-builder.yml',
  '.gitignore',
  'README.md'
];

rootFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`✅ Created file: ${filePath}`);
  }
});

console.log('\n✨ Project structure created successfully!');
console.log('📁 Total folders and files ready.');
console.log('\nNext steps:');
console.log('1. Run: npm init -y');
console.log('2. Install dependencies');
console.log('3. Start coding! 🎉');
