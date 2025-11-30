import React, { createContext, useState, useContext, useEffect } from 'react';

const AssociationContext = createContext();

export const useAssociation = () => useContext(AssociationContext);

export const AssociationProvider = ({ children }) => {
  const [currentAssociation, setCurrentAssociation] = useState(null);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);

  // تحميل الجمعيات فقط (بدون تحميل الاختيار المحفوظ)
  useEffect(() => {
    loadAssociations();
  }, []);

  const loadAssociations = async () => {
    try {
      const data = await window.electronAPI.getAssociations();
      setAssociations(data);
    } catch (error) {
      console.error('Error loading associations:', error);
    } finally {
      setLoading(false);
    }
  };

  // دالة اختيار الجمعية (بدون حفظ في localStorage)
  const selectAssociation = async (associationId) => {
    try {
      const association = associations.find(a => a.id === associationId);
      
      if (association) {
        setCurrentAssociation(association);
        setSelectedAssociation(associationId);
      }
    } catch (error) {
      console.error('Error selecting association:', error);
    }
  };

  // دالة تبديل الجمعية / الخروج
  const logoutAssociation = () => {
    setCurrentAssociation(null);
    setSelectedAssociation(null);
  };

  // دالة جلب مجالات المداخيل
  const getIncomeFields = async () => {
    if (!selectedAssociation) return [];
    try {
      return await window.electronAPI.getIncomeFields(selectedAssociation);
    } catch (error) {
      console.error('Error loading income fields:', error);
      return [];
    }
  };

  // دالة جلب مجالات المصاريف
  const getExpenseFields = async () => {
    if (!selectedAssociation) return [];
    try {
      return await window.electronAPI.getExpenseFields(selectedAssociation);
    } catch (error) {
      console.error('Error loading expense fields:', error);
      return [];
    }
  };

  // دالة جلب التصنيفات حسب النوع
  const getCategoriesByType = async (type) => {
    if (type === 'income') {
      return await getIncomeFields();
    } else if (type === 'expense') {
      return await getExpenseFields();
    }
    return [];
  };

  return (
    <AssociationContext.Provider value={{ 
      currentAssociation,
      selectedAssociation,
      associations,
      loading,
      selectAssociation, 
      logoutAssociation,  // ← غيّرت الاسم لـ logoutAssociation
      getCategoriesByType,
      getIncomeFields,
      getExpenseFields
    }}>
      {children}
    </AssociationContext.Provider>
  );
};
