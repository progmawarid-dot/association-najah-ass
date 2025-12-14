import React, { useState } from 'react';
import { getAvailableTemplates, getAssociationTemplate } from '../data/associationTemplates';

/**
 * SetupWizard - معالج الإعداد الأولي للجمعية
 * يقوم بتحميل القوالب الرسمية تلقائياً بناءً على نوع الجمعية المختار
 */
const SetupWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [associationData, setAssociationData] = useState({
    name: '',
    type: '',
    templateData: null
  });

  // الحصول على أنواع الجمعيات المتاحة
  const availableTypes = getAvailableTemplates();

  // الانتقال للخطوة التالية
  const handleNext = () => {
    if (step === 1 && selectedType) {
      const template = getAssociationTemplate(selectedType);
      setAssociationData({
        ...associationData,
        type: selectedType,
        templateData: template
      });
      setStep(2);
    } else if (step === 2 && associationData.name) {
      setStep(3);
    } else if (step === 3) {
      // إتمام الإعداد
      if (onComplete) {
        onComplete({
          ...associationData,
          setupComplete: true,
          setupDate: new Date().toISOString()
        });
      }
    }
  };

  // الرجوع للخطوة السابقة
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // رسم الخطوة 1: اختيار نوع الجمعية
  const renderStep1 = () => (
    <div className="setup-step">
      <h2 className="text-2xl font-bold mb-6 text-right">اختر نوع الجمعية</h2>
      <p className="text-gray-600 mb-8 text-right">
        اختر نوع الجمعية لتحميل المجالات الرسمية تلقائياً
      </p>
      
      <div className="space-y-4">
        {availableTypes.map((type) => {
          const template = getAssociationTemplate(type);
          const isAvailable = template && template.incomeCategories && template.incomeCategories.length > 0;
          
          return (
            <div
              key={type}
              onClick={() => isAvailable && setSelectedType(type)}
              className={`
                p-6 border-2 rounded-lg cursor-pointer transition-all
                ${selectedType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 text-right">
                  <h3 className="text-lg font-semibold mb-2">{type}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {template?.description || 'لا يوجد وصف'}
                  </p>
                  
                  {isAvailable && (
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">
                        ✓ {template.incomeCategories?.length || 0} أقسام مداخيل
                      </span>
                      <span className="text-blue-600">
                        ✓ {template.expenseCategories?.length || 0} أقسام مصاريف
                      </span>
                    </div>
                  )}
                  
                  {!isAvailable && (
                    <span className="text-amber-600 text-sm">قيد الإعداد - سيتم إضافته قريباً</span>
                  )}
                  
                  {template?.officialReference && (
                    <p className="text-xs text-gray-500 mt-2">
                      📋 {template.officialReference}
                    </p>
                  )}
                </div>
                
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${selectedType === type ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                `}>
                  {selectedType === type && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // رسم الخطوة 2: إدخال معلومات الجمعية
  const renderStep2 = () => (
    <div className="setup-step">
      <h2 className="text-2xl font-bold mb-6 text-right">معلومات الجمعية</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-right">
        <p className="text-sm text-blue-800">
          <strong>نوع الجمعية المختار:</strong> {selectedType}
        </p>
        {associationData.templateData && (
          <p className="text-xs text-blue-600 mt-2">
            ✓ تم تحميل {associationData.templateData.incomeCategories?.length || 0} أقسام مداخيل
            و {associationData.templateData.expenseCategories?.length || 0} أقسام مصاريف تلقائياً
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-right font-semibold mb-2">
            اسم الجمعية *
          </label>
          <input
            type="text"
            value={associationData.name}
            onChange={(e) => setAssociationData({ ...associationData, name: e.target.value })}
            placeholder="مثال: جمعية دعم مدرسة النجاح - مؤسسة..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir="rtl"
          />
        </div>
      </div>
    </div>
  );

  // رسم الخطوة 3: ملخص ومراجعة
  const renderStep3 = () => {
    const template = associationData.templateData;
    
    return (
      <div className="setup-step">
        <h2 className="text-2xl font-bold mb-6 text-right">مراجعة وتأكيد</h2>
        
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-right">جاهز للبدء!</h3>
          </div>
          
          <div className="space-y-3 text-right">
            <p><strong>اسم الجمعية:</strong> {associationData.name}</p>
            <p><strong>نوع الجمعية:</strong> {associationData.type}</p>
          </div>
        </div>

        {template && (
          <div className="space-y-6">
            {/* المداخيل */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-right flex items-center gap-2">
                <span className="text-green-600">💰</span>
                المداخيل ({template.incomeCategories?.length || 0} أقسام)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.incomeCategories?.map((category, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded p-3 text-right">
                    <p className="font-semibold text-sm">{category.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {category.subcategories?.length || 0} مجال فرعي
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* المصاريف */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-right flex items-center gap-2">
                <span className="text-red-600">📤</span>
                المصاريف ({template.expenseCategories?.length || 0} أقسام)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.expenseCategories?.map((category, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded p-3 text-right">
                    <p className="font-semibold text-sm">{category.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {category.subcategories?.length || 0} مجال فرعي
                    </p>
                    {category.note && (
                      <p className="text-xs text-amber-600 mt-1">{category.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* القواعد المالية */}
            {template.financialRules && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-right flex items-center gap-2">
                  <span>⚖️</span>
                  القواعد المالية الإلزامية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">•</span>
                    <span>الحد الأقصى للدفع النقدي: <strong>{template.financialRules.cashLimit} درهم</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">•</span>
                    <span>صندوق النقدية: <strong>{template.financialRules.minCashBox}-{template.financialRules.maxCashBox} درهم</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">•</span>
                    <span>عدد المتنافسين: <strong>{template.financialRules.minCompetitors} على الأقل</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">•</span>
                    <span>حفظ الوثائق: <strong>{template.financialRules.documentRetention} سنوات</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 معالج الإعداد الأولي
          </h1>
          <p className="text-gray-600">
            إعداد الجمعية بالمجالات الرسمية تلقائياً
          </p>
        </div>

        {/* مؤشر التقدم */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                  `}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`
                      flex-1 h-1 mx-2
                      ${step > s ? 'bg-blue-600' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
                <p className={`text-sm mt-2 text-center ${step >= s ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {s === 1 && 'اختر النوع'}
                  {s === 2 && 'المعلومات'}
                  {s === 3 && 'المراجعة'}
                </p>
              </div>
            
            ))}
          </div>
        </div>

        {/* محتوى الخطوة */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* أزرار التنقل */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all
              ${step === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            ← السابق
          </button>

          <button
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedType) ||
              (step === 2 && !associationData.name.trim())
            }
            className={`
              px-8 py-3 rounded-lg font-semibold transition-all
              ${(step === 1 && !selectedType) || (step === 2 && !associationData.name.trim())
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              }
            `}
          >
            {step === 3 ? '✓ إنهاء الإعداد' : 'التالي →'}
          </button>
        </div>

        {/* تذييل */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            🔒 جميع المجالات مستخرجة من الدليل المسطري الرسمي
          </p>
          <p className="mt-1">
            وزارة التربية الوطنية - دليل مسطري في شأن التدبير المالي 2009-2014
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
