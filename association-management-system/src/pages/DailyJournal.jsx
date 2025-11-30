import React, { useState, useEffect } from 'react';

function DailyJournal() {
  const [associations, setAssociations] = useState([]);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fiscal_year: '2025',
    start_date: '',
    end_date: '',
    operation_type: 'all',
    source_register: 'all'
  });

  useEffect(() => {
    loadAssociations();
  }, []);

  useEffect(() => {
    if (selectedAssociation) {
      loadOperations();
    }
  }, [selectedAssociation, filters]);

  const loadAssociations = async () => {
    try {
      const data = await window.electronAPI.getAssociations();
      setAssociations(data);
      if (data.length > 0) {
        setSelectedAssociation(data[0].id);
      }
    } catch (error) {
      console.error('Error loading associations:', error);
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
    } catch (error) {
      console.error('Error loading operations:', error);
      alert('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const currentAssociation = associations.find(a => a.id === selectedAssociation);

  return (
    <div className="daily-journal">
      <div className="page-header">
        <div className="header-left">
          <h1>📖 السجل اليومي للعمليات</h1>
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

      <div className="filters-section">
        <div className="filter-group">
          <label>الجمعية</label>
          <select
            value={selectedAssociation || ''}
            onChange={(e) => setSelectedAssociation(Number(e.target.value))}
          >
            {associations.map(assoc => (
              <option key={assoc.id} value={assoc.id}>
                {assoc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>السنة المالية</label>
          <select
            value={filters.fiscal_year}
            onChange={(e) => setFilters({ ...filters, fiscal_year: e.target.value })}
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
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>إلى تاريخ</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>نوع العملية</label>
          <select
            value={filters.operation_type}
            onChange={(e) => setFilters({ ...filters, operation_type: e.target.value })}
          >
            <option value="all">الكل</option>
            <option value="income">مدخول</option>
            <option value="expense">مصروف</option>
            <option value="transfer">تحويل</option>
          </select>
        </div>

        <div className="filter-group">
          <label>السجل</label>
          <select
            value={filters.source_register}
            onChange={(e) => setFilters({ ...filters, source_register: e.target.value })}
          >
            <option value="all">الكل</option>
            <option value="bank">البنك</option>
            <option value="cash">الصندوق</option>
            <option value="income">المداخيل</option>
            <option value="expense">المصاريف</option>
          </select>
        </div>

        <button
          className="btn-reset"
          onClick={() =>
            setFilters({
              fiscal_year: '2025',
              start_date: '',
              end_date: '',
              operation_type: 'all',
              source_register: 'all'
            })
          }
        >
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
                <th>الرقم</th>
                <th>التاريخ</th>
                <th>البيان</th>
                <th>نوع العملية</th>
                <th>السجل</th>
                <th>المدين</th>
                <th>الدائن</th>
                <th>الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {operations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>لا توجد عمليات مسجلة</p>
                  </td>
                </tr>
              ) : (
                operations.map((op) => (
                  <tr key={op.id}>
                    <td>{op.operation_number}</td>
                    <td>{new Date(op.operation_date).toLocaleDateString('ar-MA')}</td>
                    <td>{op.operation_description}</td>
                    <td>
                      <span className={`type-badge type-${op.operation_type}`}>
                        {op.operation_type_ar}
                      </span>
                    </td>
                    <td>{op.source_register_ar}</td>
                    <td className="cell-amount debit">
                      {op.movement_type === 'debit' ? (
                        <span className="amount-value">+{op.amount.toFixed(2)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="cell-amount credit">
                      {op.movement_type === 'credit' ? (
                        <span className="amount-value">-{op.amount.toFixed(2)}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="cell-amount balance">
                      {op.balance_after.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DailyJournal;
