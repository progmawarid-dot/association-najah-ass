import React, { useState, useEffect } from 'react';
import { useAssociation } from '../../context/AssociationContext';

// =============================================================================
// 1. المكون الرئيسي: ExpenseRegister
// =============================================================================
const ExpenseRegister = () => {
  const { selectedAssociation, currentAssociation } = useAssociation();
  const [expenseFields, setExpenseFields] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [filters, setFilters] = useState({
    fiscal_year: new Date().getFullYear().toString(),
    start_date: '',
    end_date: '',
    expense_field_id: 'all'
  });

  useEffect(() => {
    if (selectedAssociation) {
      loadExpenseFields();
      loadExpenses();
    }
  }, [selectedAssociation, filters]);

  const loadExpenseFields = async () => {
    if (!selectedAssociation) return;
    try {
      const fields = await window.electronAPI.getExpenseFields(selectedAssociation);
      setExpenseFields(fields);
    } catch (error) { console.error('Error loading fields:', error); }
  };

  const loadExpenses = async () => {
    if (!selectedAssociation) return;
    setLoading(true);
    try {
      const data = await window.electronAPI.getExpenseTransactions({
        ...filters,
        association_id: selectedAssociation
      });
      setExpenses(data);
    } catch (error) { console.error('Error loading expenses:', error); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('⚠️ هل أنت متأكد تماماً من حذف هذا المصروف؟')) {
      try {
        await window.electronAPI.deleteExpenseTransaction(id);
        alert('✅ تم الحذف بنجاح');
        loadExpenses();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('❌ حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="expense-register">
      <div className="page-header">
        <div className="header-left">
          <h1>📉 سجل المصاريف (التدبير الذكي)</h1>
          {currentAssociation && <div className="association-badge">{currentAssociation.name}</div>}
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={handleAddNew}>➕ تسجيل نفقة جديدة</button>
          <button className="btn-export">📥 تصدير</button>
          <button className="btn-print">🖨️ طباعة</button>
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-card stat-expense">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-label">إجمالي النفقات</div>
            <div className="stat-value">{totalExpense.toFixed(2)} درهم</div>
            <div className="stat-details">عدد العمليات: {expenses.length}</div>
          </div>
        </div>
      </div>

      <div className="table-wrapper" style={{ position: 'relative', overflowX: 'auto', height: 'calc(100vh - 280px)' }}>
        <table className="journal-table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#4f46e5' }}>
            <tr>
              <th style={{ minWidth: '90px' }}>التاريخ</th>
              <th style={{ minWidth: '200px' }}>البيان</th>
              <th>المجال</th>
              <th>الحالة</th>
              <th>طريقة الدفع</th>
              <th>المبلغ</th>
              <th>المستفيد</th>
              <th style={{ minWidth: '180px' }}>الوثائق والإثباتات</th>
              <th style={{ minWidth: '100px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan={9} className="empty-state">لا توجد نفقات مسجلة</td></tr>
            ) : (
              expenses.map((expense) => {
                const isDone = expense.service_status === 'fait';
                return (
                  <tr key={expense.id} className="row-credit">
                    <td>{new Date(expense.date).toLocaleDateString('ar-MA')}</td>
                    <td>{expense.description}</td>
                    <td><span className="type-badge type-expense">{expense.expense_field_name}</span></td>
                    
                    <td>
                      {isDone ? (
                        <span style={{background:'#dcfce7', color:'#166534', padding:'4px 8px', borderRadius:'12px', fontSize:'11px', fontWeight:'bold'}}>✅ منجز</span>
                      ) : (
                        <span style={{background:'#fef9c3', color:'#854d0e', padding:'4px 8px', borderRadius:'12px', fontSize:'11px', fontWeight:'bold'}}>⏳ في طور الإنجاز</span>
                      )}
                    </td>

                    <td>
                      {isDone && expense.payment_method === 'cash' ? 'نقداً' : 
                       (isDone && expense.payment_method === 'bank' ? 'شيك/تحويل' : '-')}
                    </td>
                    
                    <td className="cell-amount expense">
                      {isDone ? `-${Number(expense.amount || 0).toFixed(2)}` : '0.00'}
                    </td>
                    
                    <td>
                      <div style={{fontWeight:'bold', color:'#fff', fontSize:'12px'}}>{expense.beneficiary_name || '-'}</div>
                      {expense.beneficiary_cin && <div style={{fontSize:'10px', color:'#9ca3af'}}>CIN: {expense.beneficiary_cin}</div>}
                    </td>

                    {/* ✅ عمود الوثائق المرتب (أمر أداء -> فاتورة -> دفع) */}
                    <td style={{ textAlign: 'right', fontSize: '11px', verticalAlign: 'middle', padding: '8px' }}>
                      
                      {/* 1. القمة: أمر بالأداء */}
                      {expense.op_number && (
                        <div style={{ color: '#fbbf24', marginBottom: '4px', borderBottom:'1px solid #333', paddingBottom:'2px' }}>
                          <span style={{ opacity: 0.7 }}>أمر أداء:</span> 
                          <span style={{ fontWeight: 'bold', color: '#fff', marginRight: '4px' }}>{expense.op_number}</span>
                        </div>
                      )}

                      {/* 2. الوسط: الوثيقة المثبتة */}
                      {expense.invoice_number && (
                        <div style={{ color: '#a78bfa', marginBottom: '4px' }}>
                          <span style={{ opacity: 0.8 }}>
                            {expense.invoice_type === 'statement' ? 'إشهاد:' : (expense.invoice_type === 'bon' ? 'بون:' : 'فاتورة:')}
                          </span>
                          <span style={{ fontWeight: 'bold', color: '#fff', marginRight: '4px' }}>{expense.invoice_number}</span>
                        </div>
                      )}

                      {/* 3. الأسفل: أداة الدفع */}
                      {isDone && (
                        expense.payment_method === 'bank' ? (
                          expense.check_number && (
                            <div style={{ color: '#60a5fa' }}>
                              <span style={{ opacity: 0.7 }}>شيك رقم:</span>
                              <span style={{ fontWeight: 'bold', color: '#fff', marginRight: '4px' }}>{expense.check_number}</span>
                            </div>
                          )
                        ) : (
                          expense.bc_number && (
                            <div style={{ color: '#f87171' }}>
                              <span style={{ opacity: 0.7 }}>سند صندوق:</span>
                              <span style={{ fontWeight: 'bold', color: '#fff', marginRight: '4px' }}>{expense.bc_number}</span>
                            </div>
                          )
                        )
                      )}
                    </td>
                    
                    <td className="cell-actions">
                      <button className="btn-icon" title="تعديل" onClick={() => handleEdit(expense)}>✏️</button>
                      <button className="btn-icon" title="حذف" onClick={() => handleDelete(expense.id)}>🗑️</button>
                      <button className="btn-icon" title="طباعة">🖨️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {expenses.length > 0 && (
            <tfoot style={{ position: 'sticky', bottom: 0, background: '#4f46e5', color: 'white', fontWeight: 'bold' }}>
              <tr>
                <td colSpan={5} style={{ textAlign: 'right', padding: '10px' }}>المجموع الإجمالي</td>
                <td style={{ padding: '10px' }}>-{totalExpense.toFixed(2)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {showModal && (
        <SmartExpenseModal
          selectedAssociation={selectedAssociation}
          expenseFields={expenseFields}
          editingExpense={editingExpense}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadExpenses(); }}
        />
      )}
    </div>
  );
};

// =============================================================================
// 2. المكون الفرعي: SmartExpenseModal (بنظام المراحل والأزرار)
// =============================================================================
const SmartExpenseModal = ({ selectedAssociation, expenseFields, editingExpense, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // المرحلة 1: الالتزام
    date: new Date().toISOString().split('T')[0],
    expense_field_id: '',
    description: '',
    amount: '',
    beneficiary_name: '',
    beneficiary_cin: '',
    beneficiary_vehicle: '',
    
    // الوثيقة المثبتة
    invoice_type: 'invoice',
    invoice_number: '',

    service_status: 'encours',

    // المرحلة 2: الأمر بالصرف
    op_number: '',
    op_date: '',

    // المرحلة 3: الأداء
    payment_method: 'cash',
    bc_number: '',
    check_number: '',
    bl_number: '',
    payment_status: 'non_paye',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        ...editingExpense,
        amount: editingExpense.amount || '',
        service_status: editingExpense.service_status || 'encours',
        payment_method: editingExpense.payment_method || 'cash',
        invoice_type: editingExpense.invoice_type || 'invoice',
        invoice_number: editingExpense.invoice_number || '',
        notes: editingExpense.notes || ''
      });
    }
  }, []);

  // --- دوال توليد الأرقام (عند الضغط على الأزرار) ---
  const generateOP = async () => {
    if (!formData.amount || formData.amount <= 0) {
      alert('يجب تحديد المبلغ أولاً!');
      return;
    }
    const year = new Date().getFullYear();
    const op = await window.electronAPI.getNextDocumentNumber({ type: 'expense', year, association_id: selectedAssociation });
    setFormData(prev => ({ 
      ...prev, 
      op_number: op, 
      op_date: new Date().toISOString().split('T')[0],
      service_status: 'fait' 
    }));
  };

  const generateBC = async () => {
    const year = new Date().getFullYear();
    const bc = await window.electronAPI.getNextDocumentNumber({ type: 'cash_payment', year, association_id: selectedAssociation });
    setFormData(prev => ({ ...prev, bc_number: bc, payment_status: 'paye' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // تنظيف البيانات
      const payload = {
        association_id: selectedAssociation,
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        op_number: formData.op_number || '',
        bc_number: formData.bc_number || '',
        check_number: formData.check_number || '',
        invoice_number: formData.invoice_number || '',
        invoice_type: formData.invoice_type || 'invoice',
        notes: formData.notes || '',
        reference_number: ''
      };

      if (editingExpense) {
         await window.electronAPI.deleteExpenseTransaction(editingExpense.id);
         await window.electronAPI.addExpenseTransaction(payload);
      } else {
        await window.electronAPI.addExpenseTransaction(payload);
      }

      onSuccess();
      alert('✅ تم حفظ العملية وتحديث المراحل');
    } catch (error) {
      console.error(error);
      alert('❌ حدث خطأ أثناء الحفظ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h2 style={{margin:0}}>{editingExpense ? '✏️ تدبير النفقة' : '➕ نفقة جديدة'}</h2>
          <div style={{fontSize:'12px', color:'#9ca3af'}}>
            {formData.op_number ? <span style={{color:'#10b981'}}>● مرحلة الأداء</span> : <span style={{color:'#fbbf24'}}>● مرحلة الالتزام</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          
          {/* ================= المرحلة 1: الالتزام والخدمة ================= */}
          <div className="step-block" style={{borderLeft: '4px solid #6366f1', paddingLeft: '15px', marginBottom: '20px'}}>
            <h4 style={{color: '#6366f1', margin: '0 0 10px 0'}}>1. الالتزام والوثائق (Engagement)</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>التاريخ</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>المجال</label>
                <select value={formData.expense_field_id} onChange={e => setFormData({...formData, expense_field_id: e.target.value})} required>
                  <option value="">-- اختر المجال --</option>
                  {expenseFields.map(f => <option key={f.id} value={f.id}>{f.name_ar}</option>)}
                </select>
              </div>
            </div>

            {/* الوثيقة المثبتة */}
            <div className="form-row" style={{background:'#2d2d2d', padding:'10px', borderRadius:'6px', marginBottom:'10px'}}>
              <div className="form-group" style={{flex:1}}>
                <label style={{color:'#a78bfa', fontSize:'12px'}}>نوع الوثيقة</label>
                <select value={formData.invoice_type} onChange={e => setFormData({...formData, invoice_type: e.target.value})} style={{fontSize:'13px'}}>
                  <option value="invoice">🧾 فاتورة</option>
                  <option value="bon">📝 بون</option>
                  <option value="statement">📜 إشهاد</option>
                </select>
              </div>
              <div className="form-group" style={{flex:2}}>
                <label style={{color:'#a78bfa', fontSize:'12px'}}>رقمها / المرجع</label>
                <input type="text" placeholder="رقم الفاتورة..." value={formData.invoice_number} onChange={e => setFormData({...formData, invoice_number: e.target.value})} style={{fontSize:'13px'}} />
              </div>
            </div>

            <div className="form-group">
              <label>البيان</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required autoFocus />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>المبلغ (درهم)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required 
                  disabled={!!formData.op_number} 
                  style={formData.op_number ? {background: '#2d2d2d', color: '#9ca3af'} : {}}
                />
              </div>
              <div className="form-group">
                <label>المستفيد</label>
                <input type="text" value={formData.beneficiary_name} onChange={e => setFormData({...formData, beneficiary_name: e.target.value})} placeholder="الاسم..." />
              </div>
            </div>
            <div className="form-row">
               <div className="form-group"><input placeholder="CIN" value={formData.beneficiary_cin} onChange={e => setFormData({...formData, beneficiary_cin: e.target.value})} /></div>
               <div className="form-group"><input placeholder="Matricule" value={formData.beneficiary_vehicle} onChange={e => setFormData({...formData, beneficiary_vehicle: e.target.value})} /></div>
            </div>
          </div>

          {/* ================= المرحلة 2: الأمر بالصرف ================= */}
          <div className="step-block" style={{borderLeft: '4px solid #fbbf24', paddingLeft: '15px', marginBottom: '20px', opacity: formData.amount > 0 ? 1 : 0.5}}>
            <h4 style={{color: '#fbbf24', margin: '0 0 10px 0'}}>2. الأمر بالصرف (Ordonnancement)</h4>
            
            {!formData.op_number ? (
              <button type="button" className="btn-action" style={{background: '#fbbf24', color: '#000', fontWeight: 'bold', width:'100%'}} onClick={generateOP}>
                ⚙️ إصدار أمر بالأداء (Authorization)
              </button>
            ) : (
              <div style={{background: '#2d2d2d', padding: '10px', borderRadius: '6px', display: 'flex', gap: '10px', alignItems: 'center'}}>
                <div style={{flex: 1}}>
                  <label style={{fontSize: '11px', color: '#9ca3af'}}>رقم الأمر بالأداء</label>
                  <input type="text" value={formData.op_number} onChange={e=>setFormData({...formData, op_number: e.target.value})} style={{color: '#fbbf24', fontWeight: 'bold', border:'1px solid #fbbf24'}} />
                </div>
                <div style={{color: '#10b981', fontSize: '20px'}}>🔒</div>
              </div>
            )}
          </div>

          {/* ================= المرحلة 3: الأداء الفعلي ================= */}
          {formData.op_number && (
            <div className="step-block" style={{borderLeft: '4px solid #10b981', paddingLeft: '15px', marginBottom: '20px'}}>
              <h4 style={{color: '#10b981', margin: '0 0 10px 0'}}>3. الأداء (Paiement)</h4>
              
              <div className="form-group">
                <div style={{display: 'flex', gap: '10px', marginBottom:'10px'}}>
                  <label style={{cursor: 'pointer', background: formData.payment_method === 'cash' ? '#10b981' : '#333', padding: '8px 15px', borderRadius: '6px', flex: 1, textAlign: 'center'}}>
                    <input type="radio" name="pay_method" value="cash" checked={formData.payment_method === 'cash'} onChange={() => setFormData({...formData, payment_method: 'cash'})} style={{display: 'none'}} />
                    💵 نقداً
                  </label>
                  <label style={{cursor: 'pointer', background: formData.payment_method === 'bank' ? '#3b82f6' : '#333', padding: '8px 15px', borderRadius: '6px', flex: 1, textAlign: 'center'}}>
                    <input type="radio" name="pay_method" value="bank" checked={formData.payment_method === 'bank'} onChange={() => setFormData({...formData, payment_method: 'bank'})} style={{display: 'none'}} />
                    🏦 شيك
                  </label>
                </div>
              </div>

              {formData.payment_method === 'cash' ? (
                <div>
                  {!formData.bc_number ? (
                    <button type="button" className="btn-action" style={{width: '100%', background: '#333', border: '1px dashed #10b981', color: '#10b981'}} onClick={generateBC}>
                      + إصدار سند الصندوق (Cash Voucher)
                    </button>
                  ) : (
                    <div className="form-group">
                      <label style={{color: '#f87171'}}>رقم سند الصندوق</label>
                      <input type="text" value={formData.bc_number} onChange={e=>setFormData({...formData, bc_number: e.target.value})} style={{background: '#1f2937', border: '1px solid #f87171', color: '#f87171', fontWeight: 'bold'}} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label style={{color: '#60a5fa'}}>رقم الشيك / التحويل</label>
                  <input type="text" value={formData.check_number} onChange={e => setFormData({...formData, check_number: e.target.value, payment_status: 'paye'})} placeholder="أدخل رقم الشيك..." style={{border:'1px solid #60a5fa'}} />
                </div>
              )}
            </div>
          )}

          <div className="form-actions" style={{marginTop:'20px', borderTop: '1px solid #333', paddingTop: '15px'}}>
            <button type="button" className="btn-cancel" onClick={onClose}>إغلاق</button>
            <button type="submit" className="btn-submit" disabled={loading}>💾 حفظ التغييرات</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseRegister;
