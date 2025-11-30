import React from 'react';
import { useAssociation } from '../context/AssociationContext';

const Header = () => {
  const { currentAssociation, logoutAssociation } = useAssociation();

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: 'rgba(0,0,0,0.3)',
      color: 'white',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* زر الخروج/التبديل */}
      <button 
        onClick={logoutAssociation}
        style={{
          backgroundColor: '#fbbf24',
          color: '#1f2937',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fbbf24'}
      >
        ◀ تبديل الجمعية
      </button>

      {/* اسم الجمعية الحالية */}
      <h2 style={{ 
        margin: 0, 
        fontSize: '22px',
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1
      }}>
        {currentAssociation ? currentAssociation.name : 'نظام إدارة الجمعيات'}
      </h2>

      {/* التاريخ */}
      <div style={{ 
        fontSize: '14px',
        opacity: 0.8,
        minWidth: '150px',
        textAlign: 'left'
      }}>
        الجمعة، 28 نونبر 2025
      </div>
    </header>
  );
};

export default Header;
