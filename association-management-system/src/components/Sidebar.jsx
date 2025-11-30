import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'الرئيسية', labelEn: 'Dashboard', path: '/' },
    { id: 'bank',      icon: '🏦', label: 'سجل البنك', labelEn: 'Bank Register', path: '/bank' },
    { id: 'cash',      icon: '💰', label: 'سجل الصندوق', labelEn: 'Cash Register', path: '/cash' },
    { id: 'income',    icon: '📈', label: 'المداخيل', labelEn: 'Income', path: '/income' },
    { id: 'expense',   icon: '📉', label: 'المصاريف', labelEn: 'Expenses', path: '/expenses' },
    { id: 'checks',    icon: '💳', label: 'إدارة الشيكات', labelEn: 'Checks', path: '/checks' },
    { id: 'reports',   icon: '📊', label: 'التقارير', labelEn: 'Reports', path: '/reports' },
    { id: 'settings',  icon: '⚙️', label: 'الإعدادات', labelEn: 'Settings', path: '/settings' },
  ];

  // تحديد العنصر النشط من الـ URL
  const getActiveId = () => {
    const currentPath = location.pathname || '/';
    const found = menuItems.find(item => item.path === currentPath);
    return found ? found.id : 'dashboard';
  };

  const activeId = getActiveId();

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <h2>{isExpanded ? 'نظام إدارة الجمعيات' : 'نظام'}</h2>
        <button 
          className="toggle-btn" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '◀' : '▶'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeId === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {isExpanded && (
              <span className="label">
                <span className="label-ar">{item.label}</span>
                <span className="label-en">{item.labelEn}</span>
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
