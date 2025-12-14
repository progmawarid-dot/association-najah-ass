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
    loadDashboardData();
  }, [selectedAssociation]); // Recharge si l'association change

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Connecter ici la requête IPC Electron vers SQLite
      // Exemple de données simulées en attendant le backend :
      // const data = await window.electronAPI.getStats(selectedAssociation);
      
      // Simulation pour l'affichage (à retirer une fois connecté à la DB)
      setTimeout(() => {
        setStats({
          total_balance: 15000.00,
          cash_balance: 5000.00,
          bank_balance: 10000.00,
          total_income: 20000.00,
          total_expenses: 5000.00,
          operations_count: 12
        });
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-lg">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-arabic">لوحة التحكم</h1>
          {currentAssociation && (
            <p className="text-gray-500 mt-1 text-sm font-medium">
              Association: <span className="text-blue-600">{currentAssociation.name}</span>
            </p>
          )}
        </div>
        
        <button
          onClick={() => navigate('/operations/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 font-medium"
        >
          <span>+</span> New Operation
        </button>
      </div>

      {/* Stats Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Total Balance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Balance</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {(stats.total_balance || 0).toFixed(2)} <span className="text-sm text-gray-500">MAD</span>
          </p>
        </div>

        {/* Card 2: Cash Balance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500 transition-shadow hover:shadow-md">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Caisse (Cash)</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {(stats.cash_balance || 0).toFixed(2)} <span className="text-sm text-gray-500">MAD</span>
          </p>
        </div>

        {/* Card 3: Bank Balance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 transition-shadow hover:shadow-md">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Banque (Bank)</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {(stats.bank_balance || 0).toFixed(2)} <span className="text-sm text-gray-500">MAD</span>
          </p>
        </div>

        {/* Card 4: Total Income */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Income</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recettes</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            +{(stats.total_income || 0).toFixed(2)} <span className="text-sm text-gray-500">MAD</span>
          </p>
        </div>

        {/* Card 5: Total Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
           <div className="flex justify-between items-start">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Expenses</h3>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Dépenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            -{(stats.total_expenses || 0).toFixed(2)} <span className="text-sm text-gray-500">MAD</span>
          </p>
        </div>

        {/* Card 6: Operations Count */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Operations</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {stats.operations_count}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total transactions enregistrées</p>
        </div>
      </div>

      {/* Quick Actions Footer (Optional but kept from original structure) */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button 
          onClick={() => navigate('/reports')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          View Reports
        </button>
        <button 
          onClick={() => navigate('/members')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Manage Members
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
