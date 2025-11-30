import React, { useState, useEffect } from 'react';
import { useAssociation } from '../../context/AssociationContext';

const getDocumentTypeLabel = (type) => {
  const labels = {
    cash_voucher: 'سند الصندوق',
    payment_order: 'أمر بالأداء',
    cash_delivery: 'سند تسليم مبلغ نقدية',
    bank_withdraw: 'إذن بالسحب البنكي',
    receipt_income: 'وصل مداخيل',
  };
  return labels[type] || type;
};

function CashRegister() {
  const { selectedAssociation, currentAssociation } = useAssociation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);
  const [filters, setFilters] = useState({
    fiscal_year: '2025',
    start_date: '',
    end_date: '',
    movement_type: 'all',
  });

  useEffect(() => {
    if (selectedAssociation) {
      loadTransactions();
      loadBalance();
    }
  }, [selectedAssociation, filters]);

  const loadTransactions = async () => {
    if (!selectedAssociation) return;

    setLoading(true);
    try {
      const data = await window.electronAPI.getCashTransactions({
        ...filters,
        association_id: selectedAssociation,
      });
      setTransactions(data);
    } catch (error) {
      console.error('Error loading cash transactions:', error);
      alert('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    if (!selectedAssociation) return;

    try {
      const balance = await window.electronAPI.getCurrentBalance(
        selectedAssociation
      );
      setCashBalance(balance.cash_balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('هل تريد فعلاً حذف هذه العملية؟')) return;

    try {
      await window.electronAPI.deleteCashTransaction(id);
      await loadTransactions();
      await loadBalance();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('خطأ في حذف العملية');
    }
  };

  const handleAddTransaction = () => {
    setShowAddModal(true);
  };

  return (
    <div className="cash-register">
      <div className="page-header">
        <div className="header-left">
          <h1>سجل الصندوق</h1>
          {currentAssociation && (
            <div className="association-badge">
              <span className="association-label">
                {currentAssociation.name}
              </span>
            </div>
          )}
          <div className="cash-balance-badge">
            <span className="balance-label">رصيد الصندوق:</span>
            <span className="balance-amount">
              {cashBalance.toFixed(2)} درهم
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={handleAddTransaction}>
            ➕ إضافة عملية
          </button>
          <button className="btn-export">📊 تصدير Excel</button>
          <button className="btn-print">🖨️ طباعة</button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>السنة المالية</label>
          <select
            value={filters.fiscal_year}
            onChange={(e) =>
              setFilters({ ...filters, fiscal_year: e.target.value })
            }
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
            onChange={(e) =>
              setFilters({ ...filters, start_date: e.target.value })
            }
          />
        </div>

        <div className="filter-group">
          <label>إلى تاريخ</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) =>
              setFilters({ ...filters, end_date: e.target.value })
            }
          />
        </div>

        <div className="filter-group">
          <label>نوع الحركة</label>
          <select
            value={filters.movement_type}
            onChange={(e) =>
              setFilters({ ...filters, movement_type: e.target.value })
            }
          >
            <option value="all">الكل</option>
            <option value="receipt">إيصال دخل</option>
            <option value="payment">إيصال صرف</option>
          </select>
        </div>

        <button
          className="btn-reset"
          onClick={() =>
            setFilters({
              fiscal_year: '2025',
              start_date: '',
              end_date: '',
              movement_type: 'all',
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
          <table className="cash-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>بيان العملية</th>
                <th>نوع السند</th>
                <th>رقم السند</th>
                <th>رقم الإيصال</th>
                <th>المدخول</th>
                <th>المصروف</th>
                <th>الرصيد</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">
                    <div className="empty-icon">💰</div>
                    <p>لا توجد عمليات نقدية مسجلة</p>
                    <p className="empty-hint">
                      انقر على &quot;إضافة عملية&quot; لتسجيل أول عملية
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className={`row-${tx.movement_type}`}>
                    <td className="cell-date">
                      {new Date(tx.transaction_date).toLocaleDateString('ar-MA')}
                    </td>
                    <td className="cell-description">{tx.operation_label}</td>
                    <td>
                      {tx.document_type
                        ? getDocumentTypeLabel(tx.document_type)
                        : '-'}
                    </td>
                    <td>{tx.document_number || '-'}</td>
                    <td className="cell-reference">
                      {tx.receipt_number && (
                        <span className="receipt-badge">
                          {tx.receipt_number}
                        </span>
                      )}
                    </td>
                    <td className="cell-amount receipt">
                      {tx.movement_type === 'receipt' ? (
                        <span className="amount-value">
                          +{tx.amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="amount-placeholder">-</span>
                      )}
                    </td>
                    <td className="cell-amount payment">
                      {tx.movement_type === 'payment' ? (
                        <span className="amount-value">
                          -{tx.amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="amount-placeholder">-</span>
                      )}
                    </td>
                    <td className="cell-amount balance">
                      <span className="balance-value">
                        {tx.balance_after.toFixed(2)}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <button
                        className="btn-icon"
                        title="تعديل"
                        onClick={() => alert('التعديل لم يُفعّل بعد')}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        title="حذف"
                        onClick={() => handleDeleteTransaction(tx.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {transactions.length > 0 && (
              <tfoot>
                <tr className="totals-row">
                  <td
                    colSpan="5"
                    style={{
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: 'white',
                    }}
                  >
                    المجموع الإجمالي
                  </td>
                  <td className="total-receipt">
                    {transactions
                      .filter((tx) => tx.movement_type === 'receipt')
                      .reduce((sum, tx) => sum + tx.amount, 0)
                      .toFixed(2)}
                  </td>
                  <td className="total-payment">
                    {transactions
                      .filter((tx) => tx.movement_type === 'payment')
                      .reduce((sum, tx) => sum + tx.amount, 0)
                      .toFixed(2)}
                  </td>
                  <td className="final-balance">
                    {cashBalance.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {showAddModal && (
        <AddCashTransactionModal
          associationId={selectedAssociation}
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            setShowAddModal(false);
            await loadTransactions();
            await loadBalance();
          }}
        />
      )}
    </div>
  );
}

function AddCashTransactionModal({ associationId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    operation_label: '',
    movement_type: 'receipt',
    amount: '',
    receipt_number: '',
    document_type: '',
    document_number: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.operation_label || !formData.amount) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!formData.document_type || !formData.document_number) {
      alert('يرجى اختيار نوع السند وإدخال رقم السند');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        association_id: associationId,
        amount: parseFloat(formData.amount),
      };

      await window.electronAPI.addCashTransaction(payload);

      alert('✅ تم إضافة العملية بنجاح');
      onSuccess();
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      alert('❌ خطأ في إضافة العملية: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>إضافة عملية نقدية</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>التاريخ *</label>
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transaction_date: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>نوع العملية *</label>
              <select
                value={formData.movement_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    movement_type: e.target.value,
                  })
                }
                required
              >
                <option value="receipt">إيصال دخل (مدخول)</option>
                <option value="payment">إيصال صرف (مصروف)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>نوع السند الرئيسي *</label>
              <select
                value={formData.document_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    document_type: e.target.value,
                  })
                }
                required
              >
                <option value="">اختر نوع السند</option>
                <option value="cash_voucher">سند الصندوق</option>
                <option value="payment_order">أمر بالأداء</option>
                <option value="cash_delivery">سند تسليم مبلغ نقدية</option>
                <option value="bank_withdraw">إذن بالسحب البنكي</option>
                <option value="receipt_income">وصل مداخيل</option>
              </select>
            </div>

            <div className="form-group">
              <label>رقم السند *</label>
              <input
                type="text"
                value={formData.document_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    document_number: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>بيان العملية *</label>
            <input
              type="text"
              value={formData.operation_label}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  operation_label: e.target.value,
                })
              }
              placeholder="مثال: استلام رسوم التسجيل"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>المبلغ *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value,
                  })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>رقم الإيصال</label>
              <input
                type="text"
                value={formData.receipt_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receipt_number: e.target.value,
                  })
                }
                placeholder="اختياري"
              />
            </div>
          </div>

          <div className="form-group">
            <label>ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="ملاحظات إضافية (اختياري)"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : '✅ حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CashRegister;
