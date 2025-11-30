import React, { useState, useEffect } from 'react';
import { useAssociation } from '../../context/AssociationContext';

const ChecksList = () => {
  const { selectedAssociation } = useAssociation();
  const [checkbooks, setCheckbooks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // بيانات للعمليات
  const [selectedCheckForCancel, setSelectedCheckForCancel] = useState(null);
  
  // نموذج إضافة دفتر
  const [newBook, setNewBook] = useState({
    bank_name: 'البنك الشعبي',
    series_name: `دفتر ${new Date().getFullYear()}/1`,
    start_number: '',
    end_number: '',
    alert_threshold: 5
  });

  // نموذج الإلغاء
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (selectedAssociation) {
      loadCheckbooks();
    }
  }, [selectedAssociation]);

  const loadCheckbooks = async () => {
    try {
      // تأكد أن هذه الدالة موجودة في preload.js و main.js باسم getCheckbooks أو get-checkbooks
      const data = await window.electronAPI.getCheckbooks(selectedAssociation);
      setCheckbooks(data);
    } catch (err) { console.error("Error loading checkbooks:", err); }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await window.electronAPI.addCheckbook({ ...newBook, association_id: selectedAssociation });
      setShowAddModal(false);
      loadCheckbooks();
    } catch (err) { alert('خطأ في الإضافة'); }
  };

  const handleCancelCheck = async () => {
    if (!cancelReason) return alert('المرجو ذكر السبب');
    try {
      await window.electronAPI.cancelCheck({
        association_id: selectedAssociation,
        checkbook_id: selectedCheckForCancel.bookId,
        check_number: selectedCheckForCancel.number,
        reason: cancelReason
      });
      setShowCancelModal(false);
      setCancelReason('');
      loadCheckbooks();
    } catch (err) { alert('خطأ'); }
  };

  // دالة لرسم مصفوفة الشيكات
  const renderCheckGrid = (book) => {
    const checks = [];
    // حماية من الحلقات اللانهائية
    const start = parseInt(book.start_number);
    const end = parseInt(book.end_number);
    
    if (isNaN(start) || isNaN(end) || end < start) return null;

    for (let i = start; i <= end; i++) {
      // هل هو مصروف؟
      const used = book.checks_data && book.checks_data.used.find(c => parseInt(c.check_number) === i);
      // هل هو ملغى؟
      const cancelled = book.checks_data && book.checks_data.cancelled.find(c => parseInt(c.check_number) === i);

      let statusClass = 'available';
      let title = `شيك رقم ${i} (متاح)`;

      if (used) {
        statusClass = 'used';
        title = `تم صرفه: ${used.amount} درهم للمستفيد ${used.beneficiary_name}`;
      } else if (cancelled) {
        statusClass = 'cancelled';
        title = `ملغى: ${cancelled.reason}`;
      }

      checks.push(
        <div 
          key={i} 
          className={`check-item ${statusClass}`} 
          title={title}
          onClick={() => {
            if (statusClass === 'available') {
              setSelectedCheckForCancel({ bookId: book.id, number: i });
              setShowCancelModal(true);
            }
          }}
        >
          {i}
        </div>
      );
    }
    return <div className="check-grid">{checks}</div>;
  };

  return (
    <div className="checkbook-page">
      <div className="page-header">
        <h1>🏦 إدارة دفاتر الشيكات</h1>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>+ تسجيل دفتر جديد</button>
      </div>

      <div className="books-container">
        {checkbooks.length === 0 ? (
          <div className="empty-state">لا توجد دفاتر مسجلة</div>
        ) : (
          checkbooks.map(book => (
            <div key={book.id} className="book-card">
              <div className="book-header">
                <h3>{book.series_name} <span className="bank-badge">{book.bank_name}</span></h3>
                <div className="book-stats">
                  <span className="stat remaining">متبقي: {book.stats?.remaining || 0}</span>
                  <span className="stat used">مصروف: {book.stats?.used || 0}</span>
                  <span className="stat cancelled">ملغى: {book.stats?.cancelled || 0}</span>
                </div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${book.stats ? ((book.stats.used + book.stats.cancelled) / book.stats.total) * 100 : 0}%`}}
                ></div>
              </div>

              {renderCheckGrid(book)}
            </div>
          ))
        )}
      </div>

      {/* مودال إضافة دفتر */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>تسجيل دفتر شيكات جديد</h2>
            <form onSubmit={handleAddBook}>
              <div className="form-group">
                <label>اسم البنك</label>
                <input value={newBook.bank_name} onChange={e => setNewBook({...newBook, bank_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>اسم الدفتر</label>
                <input value={newBook.series_name} onChange={e => setNewBook({...newBook, series_name: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>من رقم</label>
                  <input type="number" required value={newBook.start_number} onChange={e => setNewBook({...newBook, start_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>إلى رقم</label>
                  <input type="number" required value={newBook.end_number} onChange={e => setNewBook({...newBook, end_number: e.target.value})} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>إلغاء</button>
                <button type="submit">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال الإلغاء */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{color:'#ef4444'}}>إلغاء الشيك رقم {selectedCheckForCancel?.number}</h2>
            <div className="form-group">
              <label>سبب الإلغاء</label>
              <input value={cancelReason} onChange={e => setCancelReason(e.target.value)} autoFocus />
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowCancelModal(false)}>تراجع</button>
              <button type="button" className="btn-danger" onClick={handleCancelCheck}>تأكيد</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .checkbook-page { padding: 20px; color: #fff; }
        .books-container { display: grid; gap: 20px; }
        .book-card { background: #1f2937; border-radius: 10px; padding: 20px; border: 1px solid #374151; }
        .book-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .bank-badge { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px; }
        .book-stats { display: flex; gap: 10px; font-size: 13px; }
        .stat.remaining { color: #10b981; }
        .stat.used { color: #60a5fa; }
        .stat.cancelled { color: #ef4444; }
        .progress-bar { height: 6px; background: #374151; border-radius: 3px; margin-bottom: 20px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); }
        .check-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 8px; }
        .check-item { background: #374151; border-radius: 4px; padding: 8px 4px; text-align: center; font-size: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
        .check-item:hover { transform: translateY(-2px); }
        .check-item.available { color: #fff; border-color: #4b5563; }
        .check-item.available:hover { border-color: #10b981; background: #064e3b; }
        .check-item.used { background: #1e3a8a; color: #93c5fd; border-color: #3b82f6; cursor: default; }
        .check-item.cancelled { background: #7f1d1d; color: #fca5a5; border-color: #ef4444; text-decoration: line-through; cursor: help; }
        .btn-danger { background: #ef4444; color: white; border: none; }
      `}</style>
    </div>
  );
};

export default ChecksList;
