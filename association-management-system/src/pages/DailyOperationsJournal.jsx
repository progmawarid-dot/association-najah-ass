import { useState, useEffect } from 'react';
import { useAssociation } from '../context/AssociationContext';

function DailyOperationsJournal() {
  const { selectedAssociation, currentAssociation } = useAssociation();
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    currentBalance: 0,
    bankBalance: 0,
    cashBalance: 0
  });
  const [filters, setFilters] = useState({
    fiscal_year: '2025',
    start_date: '',
    end_date: '',
    operation_type: 'all',
    source_register: 'all'
  });

  useEffect(() => {
    if (selectedAssociation) {
      loadBalance();
      loadOperations();
    }
  }, [selectedAssociation, filters]);

  const loadBalance = async () => {
    if (!selectedAssociation) return;

    try {
      const balance = await window.electronAPI.getCurrentBalance(selectedAssociation);
      const currentBalance = balance.bank_balance + balance.cash_balance;
      
      setStats(prev => ({
        ...prev,
        currentBalance: currentBalance,
        bankBalance: balance.bank_balance,
        cashBalance: balance.cash_balance
      }));
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadOperations = async () => {
    if (!selectedAssociation) return;

    setLoading(true);
    try {
      const data = await window.electronAPI.getDailyOperationsJournal({
        ...filters,
        association_id: selectedAssociation
      });
      setOperations(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading operations:', error);
      alert('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalIncome = data
      .filter(op => op.movement_type === 'debit')
      .reduce((sum, op) => sum + op.amount, 0);
    
    const totalExpense = data
      .filter(op => op.movement_type === 'credit')
      .reduce((sum, op) => sum + op.amount, 0);
    
    setStats(prev => ({
      ...prev,
      totalIncome,
      totalExpense
    }));
  };

  return (
    <div className="daily-operations-journal">
      <div className="page-header">
        <div className="header-left">
          <h1>السجل اليومي للعمليات</h1>
          {currentAssociation && (
            <div className="association-badge">
              <span className="association-label">{currentAssociation.name}</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-export">📊 تصدير Excel</button>
          <button className="btn-print">🖨️ طباعة</button>
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-card stat-balance">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-label">الرصيد الإجمالي الحالي</span>
            <span className="stat-value">{stats.currentBalance.toFixed(2)} درهم</span>
            <span className="stat-details">
              البنك: {stats.bankBalance.toFixed(2)} | الصندوق: {stats.cashBalance.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="stat-card stat-income">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <span className="stat-label">إجمالي المداخيل</span>
            <span className="stat-value">+{stats.totalIncome.toFixed(2)} درهم</span>
          </div>
        </div>
        
        <div className="stat-card stat-expense">
          <div className="stat-icon">📉</div>
          <div className="stat-content">
            <span className="stat-label">إجمالي المصاريف</span>
            <span className="stat-value">-{stats.totalExpense.toFixed(2)} درهم</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>السنة المالية</label>
          <select 
            value={filters.fiscal_year}
            onChange={(e) => setFilters({...filters, fiscal_year: e.target.value})}
          >
            <option value="">كل السنوات</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>من تاريخ</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({...filters, start_date: e.target.value})}
          />
        </div>
        
        <div className="filter-group">
          <label>إلى تاريخ</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({...filters, end_date: e.target.value})}
          />
        </div>
        
        <div className="filter-group">
          <label>نوع العملية</label>
          <select 
            value={filters.operation_type}
            onChange={(e) => setFilters({...filters, operation_type: e.target.value})}
          >
            <option value="all">الكل</option>
            <option value="income">مدخول</option>
            <option value="expense">مصروف</option>
            <option value="transfer">تحويل</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>السجل المصدر</label>
          <select 
            value={filters.source_register}
            onChange={(e) => setFilters({...filters, source_register: e.target.value})}
          >
            <option value="all">الكل</option>
            <option value="bank">البنك</option>
            <option value="cash">الصندوق</option>
            <option value="income">المداخيل</option>
            <option value="expense">المصاريف</option>
          </select>
        </div>

        <button className="btn-reset" onClick={() => setFilters({
          fiscal_year: '2025',
          start_date: '',
          end_date: '',
          operation_type: 'all',
          source_register: 'all'
        })}>
          🔄 إعادة تعيين
        </button>
      </div>

      {loading ? (
        <div className="loading">جاري التحميل...</div>
      ) : (
        <div className="table-container">
          <table className="journal-table">
            <thead>
              <tr>
                <th>الرقم الترتيبي</th>
                <th>التاريخ</th>
                <th>بيان العملية</th>
                <th>نوع العملية</th>
                <th>المدخول</th>
                <th>المصروف</th>
                <th>الرصيد</th>
                <th>المرجع</th>
                <th>السجل المصدر</th>
              </tr>
            </thead>
            <tbody>
              {operations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>لا توجد عمليات مسجلة</p>
                  </td>
                </tr>
              ) : (
                operations.map((op) => (
                  <tr key={op.id} className={`row-${op.movement_type}`}>
                    <td className="cell-number">{op.operation_number}</td>
                    <td className="cell-date">
                      {new Date(op.operation_date).toLocaleDateString('ar-MA')}
                    </td>
                    <td className="cell-description">{op.operation_description}</td>
                    <td className="cell-type">
                      <span className={`type-badge type-${op.operation_type}`}>
                        {op.operation_type_ar}
                      </span>
                    </td>
                    <td className="cell-amount income">
                      {op.movement_type === 'debit' ? (
                        <span className="amount-value">+{op.amount.toFixed(2)}</span>
                      ) : (
                        <span className="amount-placeholder">-</span>
                      )}
                    </td>
                    <td className="cell-amount expense">
                      {op.movement_type === 'credit' ? (
                        <span className="amount-value">-{op.amount.toFixed(2)}</span>
                      ) : (
                        <span className="amount-placeholder">-</span>
                      )}
                    </td>
                    <td className="cell-amount balance">
                      <span className="balance-value">{op.balance_after.toFixed(2)}</span>
                    </td>
                    <td className="cell-reference">
                      {op.reference_number && (
                        <span className="reference-badge">{op.reference_number}</span>
                      )}
                    </td>
                    <td className="cell-source">
                      <span className={`source-badge source-${op.source_register}`}>
                        {op.source_register_ar}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {operations.length > 0 && (
              <tfoot>
                <tr className="totals-row">
                  <td colSpan="4">المجموع الإجمالي</td>
                  <td className="total-income">
                    +{stats.totalIncome.toFixed(2)}
                  </td>
                  <td className="total-expense">
                    -{stats.totalExpense.toFixed(2)}
                  </td>
                  <td className="final-balance">
                    {stats.currentBalance.toFixed(2)}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

export default DailyOperationsJournal;
