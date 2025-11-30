import React, { useState, useEffect } from 'react';
import { useAssociation } from '../../context/AssociationContext';

function BankRegister() {
  const { selectedAssociation, currentAssociation } = useAssociation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bankBalance, setBankBalance] = useState(0);
  const [filters, setFilters] = useState({
    fiscal_year: '2025',
    start_date: '',
    end_date: '',
    movement_type: 'all'
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
      const data = await window.electronAPI.getBankTransactions({
        ...filters,
        association_id: selectedAssociation
      });
      setTransactions(data);
    } catch (error) {
      console.error('Error loading bank transactions:', error);
      alert('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    if (!selectedAssociation) return;

    try {
      const balance = await window.electronAPI.getCurrentBalance(selectedAssociation);
      setBankBalance(balance.bank_balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  return (
    <div className="bank-register">
      <div className="page-header">
        <div className="header-left">
          <h1>سجل البنك</h1>
          {currentAssociation && (
            <div className="association-badge">
              <span className="association-label">{currentAssociation.name}</span>
            </div>
          )}
          <div className="bank-balance-badge">
            <span className="balance-label">رصيد البنك:</span>
            <span className="balance-amount">{bankBalance.toFixed(2)} درهم</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={() => setShowAddModal(true)}>
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
          <label>نوع الحركة</label>
          <select
            value={filters.movement_type}
            onChange={(e) => setFilters({ ...filters, movement_type: e.target.value })}
          >
            <option value="all">الكل</option>
            <option value="deposit">إيداع</option>
            <option value="withdrawal">سحب</option>
          </select>
        </div>

        <button
          className="btn-reset"
          onClick={() =>
            setFilters({
              fiscal_year: '2025',
              start_date: '',
              end_date: '',
              movement_type: 'all'
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
          <table className="bank-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>بيان العملية</th>
                <th>رقم الشيك</th>
                <th>طريقة الدفع</th>
                <th>الإيداع</th>
                <th>السحب</th>
                <th>الرصيد</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-icon">🏦</div>
                    <p>لا توجد عمليات بنكية مسجلة</p>
                    <p className="empty-hint">انقر على "إضافة عملية" لتسجيل أول عملية</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className={`row-${tx.movement_type}`}>
                    <td className="cell-date">
                      {new Date(tx.transaction_date).toLocaleDateString('ar-MA')}
                    </td>
                    <td className="cell-description">{tx.operation_label}</td>
                    <td className="cell-check">{tx.check_number || '-'}</td>
                    <td>{tx.payment_method_name || '-'}</td>
                    <td className="cell-amount deposit">
                      {tx.movement_type === 'deposit' ? (
                        <span className="amount-value">+{tx.amount.toFixed(2)}</span>
                      ) : (
                        <span className="amount-placeholder">-</span>
                      )}
                    </td>
                    <td className="cell-amount withdrawal">
                      {tx.movement_type === 'withdrawal' ? (
                        <span className="amount-value">-{tx.amount.toFixed(2)}</span>
                      ) : (
                        <span className="amount-placeholder">-</span>
                      )}
                    </td>
                    <td className="cell-amount balance">
                      <span className="balance-value">{tx.balance_after.toFixed(2)}</span>
                    </td>
                    <td className="cell-actions">
                      <button className="btn-icon" title="تعديل">✏️</button>
                      <button className="btn-icon" title="حذف">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {transactions.length > 0 && (
              <tfoot>
                <tr className="totals-row">
                  <td colSpan="4">المجموع</td>
                  <td className="total-deposit">
                    {transactions
                      .filter((tx) => tx.movement_type === 'deposit')
                      .reduce((sum, tx) => sum + tx.amount, 0)
                      .toFixed(2)}
                  </td>
                  <td className="total-withdrawal">
                    {transactions
                      .filter((tx) => tx.movement_type === 'withdrawal')
                      .reduce((sum, tx) => sum + tx.amount, 0)
                      .toFixed(2)}
                  </td>
                  <td className="final-balance">{bankBalance.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {showAddModal && (
        <AddBankTransactionModal
          associationId={selectedAssociation}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadTransactions();
            loadBalance();
          }}
        />
      )}
    </div>
  );
}

function AddBankTransactionModal({ associationId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    operation_label: '',
    movement_type: 'deposit',
    amount: '',
    payment_method_id: 2,
    check_number: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await window.electronAPI.getPaymentMethods(associationId);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.operation_label || !formData.amount) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      await window.electronAPI.addBankTransaction({
        ...formData,
        association_id: associationId,
        amount: parseFloat(formData.amount),
        payment_method_id: parseInt(formData.payment_method_id)
      });

      alert('✅ تم إضافة العملية بنجاح');
      onSuccess();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('❌ خطأ في إضافة العملية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>إضافة عملية بنكية</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>التاريخ *</label>
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) =>
                  setFormData({ ...formData, transaction_date: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>نوع العملية *</label>
              <select
                value={formData.movement_type}
                onChange={(e) =>
                  setFormData({ ...formData, movement_type: e.target.value })
                }
                required
              >
                <option value="deposit">إيداع</option>
                <option value="withdrawal">سحب</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>بيان العملية *</label>
            <input
              type="text"
              value={formData.operation_label}
              onChange={(e) =>
                setFormData({ ...formData, operation_label: e.target.value })
              }
              placeholder="مثال: إيداع شيك رقم 12345"
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
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>طريقة الدفع *</label>
              <select
                value={formData.payment_method_id}
                onChange={(e) =>
                  setFormData({ ...formData, payment_method_id: e.target.value })
                }
                required
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>رقم الشيك</label>
            <input
              type="text"
              value={formData.check_number}
              onChange={(e) =>
                setFormData({ ...formData, check_number: e.target.value })
              }
              placeholder="اختياري"
            />
          </div>

          <div className="form-group">
            <label>ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

export default BankRegister;
