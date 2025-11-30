const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Associations
  getAssociations: () => ipcRenderer.invoke('get-associations'),
  addAssociation: (data) => ipcRenderer.invoke('add-association', data),
  getCurrentBalance: (id) => ipcRenderer.invoke('get-current-balance', id),
  
  // Fields & Settings
  getIncomeFields: (id) => ipcRenderer.invoke('get-income-fields', id),
  getExpenseFields: (id) => ipcRenderer.invoke('get-expense-fields', id),
  getPaymentMethods: (id) => ipcRenderer.invoke('get-payment-methods', id), 

  // Transactions
  addIncomeTransaction: (data) => ipcRenderer.invoke('add-income-transaction', data),
  deleteIncomeTransaction: (id) => ipcRenderer.invoke('delete-income-transaction', id),
  
  addExpenseTransaction: (data) => ipcRenderer.invoke('add-expense-transaction', data),
  deleteExpenseTransaction: (id) => ipcRenderer.invoke('delete-expense-transaction', id),

  // Registers
  getBankTransactions: (filter) => ipcRenderer.invoke('get-bank-transactions', filter),
  addBankTransaction: (data) => ipcRenderer.invoke('add-bank-transaction', data),

  getCashTransactions: (filter) => ipcRenderer.invoke('get-cash-transactions', filter),
  addCashTransaction: (data) => ipcRenderer.invoke('add-cash-transaction', data),
  deleteCashTransaction: (id) => ipcRenderer.invoke('delete-cash-transaction', id),

  getDailyOperationsJournal: (filter) => ipcRenderer.invoke('get-daily-operations-journal', filter),


    getIncomeTransactions: (filter) => ipcRenderer.invoke('get-income-transactions', filter),
  getExpenseTransactions: (filter) => ipcRenderer.invoke('get-expense-transactions', filter),


  getNextDocumentNumber: (params) => ipcRenderer.invoke('get-next-document-number', params),

deleteExpenseTransaction: (id) => ipcRenderer.invoke('delete-expense-transaction', id),

  getCheckbooks: (id) => ipcRenderer.invoke('get-checkbooks', id),
  addCheckbook: (data) => ipcRenderer.invoke('add-checkbook', data),
  cancelCheck: (data) => ipcRenderer.invoke('cancel-check', data),


});
 
