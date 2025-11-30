import React, { useState } from 'react';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: '2025-01-01',
    to: '2025-01-31'
  });

  const reports = [
    {
      id: 'daily-journal',
      title: 'السجل اليومي',
      titleEn: 'Daily Journal',
      icon: '📋',
      description: 'سجل العمليات اليومية التفصيلي',
      color: '#3b82f6'
    },
    {
      id: 'balance-report',
      title: 'تقرير الرصيد',
      titleEn: 'Balance Report',
      icon: '💰',
      description: 'الأرصدة الحالية للبنك والصندوق',
      color: '#10b981'
    },
    {
      id: 'income-report',
      title: 'تقرير المداخيل',
      titleEn: 'Income Report',
      icon: '📈',
      description: 'تقرير شامل للمداخيل حسب الفترة',
      color: '#22c55e'
    },
    {
      id: 'expense-report',
      title: 'تقرير المصاريف',
      titleEn: 'Expense Report',
      icon: '📉',
      description: 'تقرير شامل للمصاريف حسب الفترة',
      color: '#ef4444'
    },
    {
      id: 'profit-loss',
      title: 'الأرباح والخسائر',
      titleEn: 'Profit & Loss',
      icon: '📊',
      description: 'تقرير الأرباح والخسائر الشهري',
      color: '#8b5cf6'
    },
    {
      id: 'cashflow',
      title: 'التدفق النقدي',
      titleEn: 'Cash Flow',
      icon: '💸',
      description: 'تقرير التدفقات النقدية الداخلة والخارجة',
      color: '#06b6d4'
    },
    {
      id: 'budget',
      title: 'تقرير الميزانية',
      titleEn: 'Budget Report',
      icon: '🎯',
      description: 'مقارنة الميزانية المخططة بالفعلية',
      color: '#f59e0b'
    },
    {
      id: 'checks',
      title: 'تقرير الشيكات',
      titleEn: 'Checks Report',
      icon: '📝',
      description: 'حالة الشيكات الصادرة والواردة',
      color: '#ec4899'
    }
  ];

  const quickReports = [
    {
      id: 'today',
      title: 'تقرير اليوم',
      icon: '📅',
      period: 'today'
    },
    {
      id: 'this-week',
      title: 'هذا الأسبوع',
      icon: '📆',
      period: 'week'
    },
    {
      id: 'this-month',
      title: 'هذا الشهر',
      icon: '📊',
      period: 'month'
    },
    {
      id: 'this-year',
      title: 'هذه السنة',
      icon: '📈',
      period: 'year'
    }
  ];

  const handleGenerateReport = (reportId) => {
    console.log(`Generating report: ${reportId} from ${dateRange.from} to ${dateRange.to}`);
    // هنا سيتم إنشاء التقرير الفعلي
    setSelectedReport(reportId);
  };

  const handleQuickReport = (period) => {
    const today = new Date();
    let from = new Date();
    
    switch(period) {
      case 'today':
        from = today;
        break;
      case 'week':
        from.setDate(today.getDate() - 7);
        break;
      case 'month':
        from.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        from.setFullYear(today.getFullYear() - 1);
        break;
      default:
        break;
    }

    setDateRange({
      from: from.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    });
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="header-left">
          <h1>📊 التقارير المالية</h1>
          <p className="page-subtitle">إنشاء وعرض التقارير المالية المختلفة</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">📥 تصدير الكل</button>
          <button className="btn-print">🖨️ طباعة</button>
        </div>
      </div>

      {/* فلاتر الفترة الزمنية */}
      <div className="filters-section">
        <div className="filter-group">
          <label>من تاريخ</label>
          <input 
            type="date" 
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>إلى تاريخ</label>
          <input 
            type="date" 
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>
        <button className="btn-apply-filter">✓ تطبيق</button>
      </div>

      {/* التقارير السريعة */}
      <div className="quick-reports-section">
        <h2 className="section-title">📌 تقارير سريعة</h2>
        <div className="quick-reports-grid">
          {quickReports.map((report) => (
            <button
              key={report.id}
              className="quick-report-card"
              onClick={() => handleQuickReport(report.period)}
            >
              <div className="quick-report-icon">{report.icon}</div>
              <div className="quick-report-title">{report.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* قائمة التقارير الرئيسية */}
      <div className="reports-section">
        <h2 className="section-title">📑 التقارير المتاحة</h2>
        <div className="reports-grid">
          {reports.map((report) => (
            <div 
              key={report.id} 
              className="report-card"
              style={{ borderColor: report.color }}
            >
              <div className="report-card-header">
                <div className="report-icon" style={{ backgroundColor: report.color }}>
                  {report.icon}
                </div>
                <div className="report-info">
                  <h3>{report.title}</h3>
                  <span className="report-title-en">{report.titleEn}</span>
                </div>
              </div>
              <p className="report-description">{report.description}</p>
              <div className="report-actions">
                <button 
                  className="btn-view-report"
                  onClick={() => handleGenerateReport(report.id)}
                  style={{ backgroundColor: report.color }}
                >
                  👁️ عرض التقرير
                </button>
                <button className="btn-export-single">📥 تصدير</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="stats-section">
        <h2 className="section-title">📈 إحصائيات سريعة</h2>
        <div className="quick-stats">
          <div className="stat-card stat-income">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">إجمالي المداخيل</div>
              <div className="stat-value">90000.00 درهم</div>
              <div className="stat-details">هذا الشهر</div>
            </div>
          </div>

          <div className="stat-card stat-expense">
            <div className="stat-icon">💸</div>
            <div className="stat-content">
              <div className="stat-label">إجمالي المصاريف</div>
              <div className="stat-value">40500.00 درهم</div>
              <div className="stat-details">هذا الشهر</div>
            </div>
          </div>

          <div className="stat-card stat-balance">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">صافي الربح</div>
              <div className="stat-value">49500.00 درهم</div>
              <div className="stat-details">هذا الشهر</div>
            </div>
          </div>

          <div className="stat-card stat-balance">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-label">عدد العمليات</div>
              <div className="stat-value">156 عملية</div>
              <div className="stat-details">هذا الشهر</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
