import React, { useState, useEffect } from 'react';
import { useAssociation } from '../../context/AssociationContext';

const IncomeRegister = () => {
  const { selectedAssociation, currentAssociation } = useAssociation();
  const [incomeFields, setIncomeFields] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // حالة لتحرير عملية موجودة
  const [editingIncome, setEditingIncome] = useState(null);

  // الفلاتر
  const [filters, setFilters] = useState({
    fiscal_year: new Date().getFullYear().toString(),
    start_date: '',
    end_date: '',
    income_field_id: 'all'
  });

  useEffect(() => {
    if (selectedAssociation) {
      loadIncomeFields();
      loadIncomes();
    }
  }, [selectedAssociation, filters]);

  const loadIncomeFields = async () => {
    if (!selectedAssociation) return;
    try {
      const fields = await window.electronAPI.getIncomeFields(selectedAssociation);
      setIncomeFields(fields);
    } catch (error) {
      console.error('Error loading income fields:', error);
    }
  };

  // ✅ دالة جلب المداخيل (مصححة ومفعلة)
  const loadIncomes = async () => {
    if (!selectedAssociation) return;
    setLoading(true);
    try {
      const data = await window.electronAPI.getIncomeTransactions({
        ...filters, 
        association_id: selectedAssociation
      });
      setIncomes(data);
    } catch (error) {
      console.error('Error loading incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المدخول؟ سيتم حذفه أيضاً من الصندوق/البنك.')) return;
    
    try {
      await window.electronAPI.deleteIncomeTransaction(id);
      loadIncomes(); // تحديث الجدول
      alert('تم الحذف بنجاح ✅');
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('خطأ في الحذف');
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingIncome(null);
    setShowModal(true);
  };

  const totalIncome = incomes.reduce((sum, income) => sum + (Number(income.amount) || 0), 0);

  return (
    <div className="income-register">
      <div className="page-header">
        <div className="header-left">
          <h1>📊 سجل المداخيل</h1>
          {currentAssociation && (
            <div className="association-badge">
              <span className="association-label">{currentAssociation.name}</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={handleAddNew}>
            ➕ إضافة مدخول جديد
          </button>
          <button className="btn-export">📥 تصدير Excel</button>
          <button className="btn-print">🖨️ طباعة</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card stat-income">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">إجمالي المداخيل</div>
            <div className="stat-value">{totalIncome.toFixed(2)} درهم</div>
            <div className="stat-details">عدد العمليات: {incomes.length}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="journal-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>البيان</th>
              <th>المجال</th>
              <th>طريقة الدفع</th>
              <th>المبلغ</th>
              <th>المرجع</th>
              <th>ملاحظات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {incomes.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>لا توجد مداخيل مسجلة حالياً</p>
                  <p className="empty-hint">انقر على إضافة مدخول جديد للبدء</p>
                </td>
              </tr>
            ) : (
              incomes.map((income, index) => (
                <tr key={income.id} className="row-debit">
                  <td className="cell-date">{new Date(income.date).toLocaleDateString('ar-MA')}</td>
                  <td className="cell-description">{income.description}</td>
                  <td className="cell-type">
                    <span className="type-badge type-income">{income.income_field_name}</span>
                  </td>
                  <td className="cell-source">
                    <span className={`source-badge source-${income.payment_method === 'cash' ? 'cash' : 'bank'}`}>
                      {income.payment_method === 'cash' ? 'نقداً' : 'شيك/تحويل'}
                    </span>
                  </td>
                  <td className="cell-amount income">
                    <span className="amount-value">+{Number(income.amount).toFixed(2)}</span>
                  </td>
                  <td className="cell-reference">
                    <span className="reference-badge">{income.reference_number || '-'}</span>
                  </td>
                  <td>{income.notes || '-'}</td>
                  <td className="cell-actions">
                    <button className="btn-icon" title="تعديل" onClick={() => handleEdit(income)}>✏️</button>
                    <button className="btn-icon" title="حذف" onClick={() => handleDelete(income.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {incomes.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>
                  المجموع الإجمالي
                </td>
                <td className="total-income">{totalIncome.toFixed(2)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {showModal && (
        <IncomeModal 
          selectedAssociation={selectedAssociation}
          incomeFields={incomeFields}
          editingIncome={editingIncome}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadIncomes(); // تحديث الجدول
          }}
        />
      )}
    </div>
  );
};

// === مكون المودال المنفصل (مع الترقيم التلقائي) ===
const IncomeModal = ({ selectedAssociation, incomeFields, editingIncome, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: editingIncome?.date || new Date().toISOString().split('T')[0],
    description: editingIncome?.description || '',
    income_field_id: editingIncome?.income_field_id || '',
    amount: editingIncome?.amount || '',
    payment_method: editingIncome?.payment_method || 'cash', 
    reference_number: editingIncome?.reference_number || '', 
    notes: editingIncome?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  // توليد رقم الوصل تلقائياً عند الفتح إذا كانت العملية جديدة ونقداً
  useEffect(() => {
    if (!editingIncome && formData.payment_method === 'cash' && !formData.reference_number) {
      generateReceiptNumber();
    }
  }, [formData.payment_method]);

  const generateReceiptNumber = async () => {
    try {
      const num = await window.electronAPI.getNextDocumentNumber({
        type: 'income', // نوع الترقيم (RC)
        year: new Date().getFullYear(),
        association_id: selectedAssociation
      });
      setFormData(prev => ({ ...prev, reference_number: num }));
    } catch (error) {
      console.error("Error generating number:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        association_id: selectedAssociation,
        amount: parseFloat(formData.amount)
      };

      if (editingIncome) {
        // (ملاحظة: دالة التحديث تحتاج لإضافة في main.js لاحقاً إذا لم تكن موجودة)
        // await window.electronAPI.updateIncomeTransaction(editingIncome.id, payload);
        alert('خاصية التعديل قيد التطوير، يرجى الحذف والإضافة من جديد حالياً.');
      } else {
        await window.electronAPI.addIncomeTransaction(payload);
        alert('✅ تم الحفظ بنجاح وإدراج العملية في السجل المناسب');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving income:', error);
      alert('❌ خطأ في الحفظ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editingIncome ? '✏️ تعديل مدخول' : '➕ إضافة مدخول جديد'}</h2>
          <button className="btn-close" onClick={onClose}>✖</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>التاريخ *</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>مجال المدخول *</label>
              <select 
                value={formData.income_field_id} 
                onChange={(e) => setFormData({ ...formData, income_field_id: e.target.value })} 
                required
              >
                <option value="">اختر المجال</option>
                {incomeFields.map((field) => (
                  <option key={field.id} value={field.id}>{field.name_ar}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>البيان *</label>
            <input 
              type="text" 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              placeholder="وصف المدخول (مثلاً: انخراطات سنوية)" 
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
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                placeholder="0.00" 
                required 
              />
            </div>

            <div className="form-group">
              <label>طريقة الدفع *</label>
              <select 
                value={formData.payment_method} 
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value, reference_number: '' })} 
                required
              >
                <option value="cash">نقداً (للصندوق)</option>
                <option value="bank">شيك / تحويل (للبنك)</option>
              </select>
            </div>
          </div>

          {/* الحقل الذكي للرقم المرجعي */}
          <div className="form-group" style={{ 
            background: '#252525', 
            padding: '15px', 
            borderRadius: '8px', 
            border: '1px dashed #4b5563' 
          }}>
            <label style={{ color: '#fbbf24' }}>
              {formData.payment_method === 'cash' ? 'رقم وصل المداخيل (تلقائي)' : 'رقم الشيك / التحويل'}
            </label>
            <input
              type="text"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder={formData.payment_method === 'cash' ? 'جاري التوليد...' : 'أدخل رقم الشيك'}
              required
              style={formData.payment_method === 'cash' ? { fontWeight: 'bold', color: '#fbbf24', border: '1px solid #fbbf24' } : {}}
            />
            <small style={{ color: '#9ca3af', display: 'block', marginTop: '5px' }}>
              {formData.payment_method === 'cash' 
                ? 'يتم توليد رقم الوصل تلقائياً (RC-xxx/25) لضمان التسلسل.' 
                : 'أدخل رقم الشيك الموجود على الوثيقة البنكية.'}
            </small>
          </div>

          <div className="form-group">
            <label>ملاحظات</label>
            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              placeholder="ملاحظات إضافية (اختياري)" 
              rows={2} 
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : (editingIncome ? '💾 حفظ التعديلات' : '💾 حفظ المدخول')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeRegister;
