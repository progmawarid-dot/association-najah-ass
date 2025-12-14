import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// === استيراد المكونات ===
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// === استيراد الصفحات (تأكد أن أسماء الملفات والمجلدات مطابقة) ===
import Dashboard from './pages/Dashboard';
import DailyOperationsJournal from './pages/DailyOperationsJournal';
import BankRegister from './pages/bank/BankRegister';
import CashRegister from './pages/cash/CashRegister';
import IncomeRegister from './pages/income/IncomeRegister';
import ExpenseRegister from './pages/expense/ExpenseRegister';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SetupWizard from './components/SetupWizard';
// إذا لم تنشئ صفحة الشيكات بعد، يمكنك تعليق السطر التالي مؤقتاً
import ChecksList from './pages/checks/ChecksList'; 

// === استيراد السياق والستايل ===
import { AssociationProvider, useAssociation } from './context/AssociationContext';
import './styles/main.css';

// === مكون بوابة اختيار الجمعية ===
const AssociationGateway = ({ children }) => {
  const { currentAssociation, selectAssociation, associations } = useAssociation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssocName, setNewAssocName] = useState('');

  const handleAddAssociation = async (e) => {
    e.preventDefault();
    if (!newAssocName.trim()) return;
    try {
      await window.electronAPI.addAssociation({ name: newAssocName });
      setNewAssocName('');
      setShowAddModal(false);
      window.location.reload(); // إعادة تحميل لتحديث القائمة
    } catch (error) {
      console.error("Error adding association:", error);
      alert("خطأ في إضافة الجمعية");
    }
  };

  // إذا تم اختيار جمعية، اعرض التطبيق
  if (currentAssociation) {
    return <div className="app-container">{children}</div>;
  }

  // إذا لم يتم الاختيار، اعرض شاشة البداية
  return (
    <div className="gateway-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', flexDirection: 'column', color: 'white' }}>
      <div className="gateway-card" style={{ background: '#2d2d2d', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', textAlign: 'center', width: '500px', border: '1px solid #404040' }}>
        <div className="logo" style={{ fontSize: '48px', marginBottom: '20px' }}>🏢</div>
        <h1 style={{ color: '#e0e0e0', marginBottom: '10px' }}>نظام تدبير الجمعيات الذكي</h1>
        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>مرحباً بك، الرجاء اختيار الجمعية للمتابعة</p>

        {associations.length > 0 ? (
          <div className="associations-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {associations.map((assoc) => (
              <button
                key={assoc.id}
                onClick={() => selectAssociation(assoc.id)}
                style={{
                  padding: '20px',
                  border: '2px solid #3b82f6',
                  borderRadius: '15px',
                  background: '#1a1a1a',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1a1a1a'}
              >
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📂</div>
                <div style={{ fontWeight: 'bold' }}>{assoc.name}</div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
            ⚠️ لا توجد جمعيات مسجلة.
          </div>
        )}

        <button 
          onClick={() => setShowAddModal(true)}
          style={{
            marginTop: '30px',
            padding: '12px 24px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ➕ إضافة جمعية جديدة
        </button>
      </div>

      {/* مودال إضافة جمعية */}
      {showAddModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#2d2d2d', padding: '30px', borderRadius: '15px', width: '400px', border: '1px solid #404040' }}>
            <h3 style={{ marginBottom: '20px', color: '#e0e0e0' }}>إضافة جمعية جديدة</h3>
            <form onSubmit={handleAddAssociation}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>اسم الجمعية</label>
                <input 
                  type="text" 
                  value={newAssocName}
                  onChange={(e) => setNewAssocName(e.target.value)}
                  placeholder="مثال: جمعية الهدى"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #404040', background: '#1a1a1a', color: 'white' }}
                  required 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', background: '#4b5563', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>إلغاء</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// === التطبيق الرئيسي ===
function App() {
  return (
    <AssociationProvider>
      <Router>
        <AssociationGateway>
          <div className="app">
            <Sidebar />
            <div className="main-content">
              <Header />
              <div className="content-area">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  
                  {/* === الروابط الرئيسية (مطابقة للسايدبار) === */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/bank" element={<BankRegister />} />
                  <Route path="/cash" element={<CashRegister />} />
                  <Route path="/income" element={<IncomeRegister />} />
                  <Route path="/expenses" element={<ExpenseRegister />} />
                  
                  {/* === روابط إضافية === */}
                  <Route path="/daily-journal" element={<DailyOperationsJournal />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* إذا لم يكن ملف ChecksList موجوداً، استخدم ديف مؤقت لتجنب الخطأ */}
                  <Route path="/checks" element={ChecksList ? <ChecksList /> : <div style={{color:'white', padding:'20px'}}>صفحة الشيكات قيد الإنجاز</div>} />
                  
                </Routes>
              </div>
            </div>
          </div>
        </AssociationGateway>
      </Router>
    </AssociationProvider>
  );
}

export default App;
