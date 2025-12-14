import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssociation } from '../context/AssociationContext';

function Dashboard() {
  const navigate = useNavigate();
  const { selectedAssociation, currentAssociation } = useAssociation();
  const [stats, setStats] = useState({
    total_balance: 0,
    cash_balance: 0,
    bank_balance: 0,
    total_income: 0,
    total_expenses: 0,
    operations_count: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAssociation) {
      loadDashboardData();
    }
  }, [selectedAssociation]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const balance = await window.electronAPI.getCurrentBalance(selectedAssociation);
      
      setStats({
        total_balance: balance.total_balance,
        cash_balance: balance.cash_balance,
        bank_balance: balance.bank_balance,
        total_income: 0,
        total_expenses: 0,
        operations_count: 0
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>الرئيسية</h1>
          {currentAssociation && (
            <p className="association-name">{currentAssociation.name}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">جاري التحميل...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>الرصيد الحالي</h3>
                <p className="stat-value">{(stats.total_balance || 0).toFixed(2)} درهم</p>
              </div>
            </div>

            <div className="stat-card income">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h3>إجمالي المداخيل</h3>
                <p className="stat-value">{(stats.total_income || 0).toFixed(2)} درهم</p>
              </div>
            </div>

            <div className="stat-card expense">
              <div className="stat-icon">📉</div>
              <div className="stat-info">
                <h3>إجمالي المصاريف</h3>
                <p className="stat-value">{(stats.total_expenses || 0).toFixed(2)} درهم</p>
              </div>
            </div>

            <div className="stat-card operations">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3>عدد العمليات</h3>
                <p className="stat-value">{stats.operations_count}</p>
              </div>
            </div>
          </div>
          <div className="quick-actions">
            <h2>الوصول السريع</h2>
            <div className="actions-grid">
              <button 
                className="action-card cash"
                onClick={() => navigate('/cash')}
              >
                <div className="action-icon">🏦</div>
                <h3>سجل الصندوق</h3>
                <p className="action-balance">{(stats.cash_balance || 0).toFixed(2)} درهم</p>
              </button>

              <button 
                className="action-card bank"
                onClick={() => navigate('/bank')}
              >
                <div className="action-icon">🏛️</div>
                <h3>سجل البنك</h3>
                <p className="action-balance">{(stats.bank_balance || 0).toFixed(2)} درهم</p>
              </button>

              <button 
                className="action-card journal"
                onClick={() => navigate('/journal')}
              >
                <div className="action-icon">📖</div>
                <h3>السجل اليومي</h3>
                <p className="action-desc">تصفح جميع العمليات</p>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;