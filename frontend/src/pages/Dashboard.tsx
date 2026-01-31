import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionsAPI } from '../services/api';
import type { Transaction, TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionType, setTransactionType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Edit Modal State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editType, setEditType] = useState<TransactionType>('income');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionsAPI.getAll();
        setTransactions(data);
      } catch (err) {
        setError('Fehler beim Laden der Transaktionen');
        console.error(err);
      }
    };

    fetchTransactions();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) return;

    setSubmitting(true);
    setError('');

    try {
      const newTransaction = await transactionsAPI.create({
        type: transactionType,
        amount: parseFloat(amount),
        category,
        description: description || undefined,
      });

      setTransactions([newTransaction, ...transactions]);
      setAmount('');
      setCategory('');
      setDescription('');
    } catch (err) {
      setError('Fehler beim Speichern der Buchung');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await transactionsAPI.delete(id);
      setTransactions(transactions.filter((t) => t._id !== id));
    } catch (err) {
      setError('Fehler beim Löschen der Buchung');
      console.error(err);
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditType(transaction.type);
    setEditAmount(transaction.amount.toString());
    setEditCategory(transaction.category);
    setEditDescription(transaction.description);
  };

  const closeEditModal = () => {
    setEditingTransaction(null);
    setEditType('income');
    setEditAmount('');
    setEditCategory('');
    setEditDescription('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction || !editAmount || !editCategory) return;

    setSubmitting(true);
    setError('');

    try {
      const updated = await transactionsAPI.update(editingTransaction._id, {
        type: editType,
        amount: parseFloat(editAmount),
        category: editCategory,
        description: editDescription,
      });

      setTransactions(transactions.map((t) => (t._id === updated._id ? updated : t)));
      closeEditModal();
    } catch (err) {
      setError('Fehler beim Aktualisieren der Buchung');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const editCategories = editType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">Haushaltsbuch</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Hallo, {user.name}</span>
              <Link
                to="/profile"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Übersicht */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Einnahmen Card */}
          <div className="bg-green-500 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-medium opacity-90 mb-3">Einnahmen</h3>
            {incomeTransactions.length > 0 ? (
              <div className="space-y-1 mb-3 text-sm max-h-48 overflow-y-auto">
                {incomeTransactions.map((t) => (
                  <div key={t._id} className="flex justify-between opacity-90">
                    <span className="truncate mr-2">
                      {t.category}{t.description ? ` - ${t.description}` : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <span>{t.amount.toFixed(2)} €</span>
                      <button
                        onClick={() => openEditModal(t)}
                        className="text-white/60 hover:text-white ml-1"
                        title="Bearbeiten"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="text-white/60 hover:text-white ml-1"
                        title="Löschen"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-75 mb-3">Keine Einnahmen</p>
            )}
            <div className="border-t border-white/30 pt-2">
              <p className="text-2xl font-bold">+{totalIncome.toFixed(2)} €</p>
            </div>
          </div>

          {/* Ausgaben Card */}
          <div className="bg-red-500 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-medium opacity-90 mb-3">Ausgaben</h3>
            {expenseTransactions.length > 0 ? (
              <div className="space-y-1 mb-3 text-sm max-h-48 overflow-y-auto">
                {expenseTransactions.map((t) => (
                  <div key={t._id} className="flex justify-between opacity-90">
                    <span className="truncate mr-2">
                      {t.category}{t.description ? ` - ${t.description}` : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <span>{t.amount.toFixed(2)} €</span>
                      <button
                        onClick={() => openEditModal(t)}
                        className="text-white/60 hover:text-white ml-1"
                        title="Bearbeiten"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="text-white/60 hover:text-white ml-1"
                        title="Löschen"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-75 mb-3">Keine Ausgaben</p>
            )}
            <div className="border-t border-white/30 pt-2">
              <p className="text-2xl font-bold">-{totalExpenses.toFixed(2)} €</p>
            </div>
          </div>

          {/* Verfügbar Card */}
          <div className={`rounded-lg shadow-lg p-6 text-white ${balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}>
            <h3 className="text-lg font-medium opacity-90 mb-3">Verfügbar</h3>
            <div className="space-y-1 mb-3 text-sm opacity-90">
              <div className="flex justify-between">
                <span>Einnahmen</span>
                <span>+{totalIncome.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>Ausgaben</span>
                <span>-{totalExpenses.toFixed(2)} €</span>
              </div>
            </div>
            <div className="border-t border-white/30 pt-2">
              <p className="text-2xl font-bold">{balance.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Formular */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Neue Buchung</h2>

            {/* Typ-Auswahl */}
            <div className="flex mb-4">
              <button
                type="button"
                onClick={() => {
                  setTransactionType('income');
                  setCategory('');
                }}
                className={`flex-1 py-3 text-center font-medium rounded-l-lg transition ${
                  transactionType === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Einnahme
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransactionType('expense');
                  setCategory('');
                }}
                className={`flex-1 py-3 text-center font-medium rounded-r-lg transition ${
                  transactionType === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Ausgabe
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
                  Betrag (€)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                  Kategorie
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kategorie wählen...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Beschreibung (optional)
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="z.B. Einkauf bei Rewe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 text-white font-medium rounded-lg transition ${
                  transactionType === 'income'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting
                  ? 'Wird gespeichert...'
                  : transactionType === 'income'
                  ? 'Einnahme hinzufügen'
                  : 'Ausgabe hinzufügen'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bearbeitungs-Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Buchung bearbeiten</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Typ-Auswahl */}
            <div className="flex mb-4">
              <button
                type="button"
                onClick={() => {
                  setEditType('income');
                  setEditCategory('');
                }}
                className={`flex-1 py-3 text-center font-medium rounded-l-lg transition ${
                  editType === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Einnahme
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditType('expense');
                  setEditCategory('');
                }}
                className={`flex-1 py-3 text-center font-medium rounded-r-lg transition ${
                  editType === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Ausgabe
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label htmlFor="editAmount" className="block text-gray-700 font-medium mb-2">
                  Betrag (€)
                </label>
                <input
                  type="number"
                  id="editAmount"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="editCategory" className="block text-gray-700 font-medium mb-2">
                  Kategorie
                </label>
                <select
                  id="editCategory"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kategorie wählen...</option>
                  {editCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="editDescription" className="block text-gray-700 font-medium mb-2">
                  Beschreibung (optional)
                </label>
                <input
                  type="text"
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="z.B. Einkauf bei Rewe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-3 text-white font-medium rounded-lg transition ${
                    editType === 'income'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? 'Wird gespeichert...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
