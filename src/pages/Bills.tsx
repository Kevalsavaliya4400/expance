import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, where, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { BILL_STATUS, BILL_CATEGORIES } from '../constants/bills';
import { format, isAfter, isSameDay, isToday, addDays } from 'date-fns';
import { AlertCircle, Check, Clock, Plus, MoreVertical, Trash2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AddBillModal from '../components/AddBillModal';

interface Bill {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: Date;
  status: keyof typeof BILL_STATUS;
  currency: string;
}

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<keyof typeof BILL_STATUS | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [highlightedBillId, setHighlightedBillId] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { formatAmount } = useCurrency();
  const location = useLocation();

  useEffect(() => {
    // Get billId from URL search params
    const searchParams = new URLSearchParams(location.search);
    const billId = searchParams.get('highlight');
    if (billId) {
      setHighlightedBillId(billId);
      // Clear the highlight after 3 seconds
      setTimeout(() => {
        setHighlightedBillId(null);
      }, 3000);
    }
  }, [location]);

  useEffect(() => {
    if (!currentUser) return;

    const billsRef = collection(db, 'users', currentUser.uid, 'bills');
    let q = query(billsRef, orderBy('dueDate', 'asc'));

    if (filter !== 'all') {
      q = query(q, where('status', '==', filter));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const billData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const dueDate = data.dueDate instanceof Timestamp 
          ? data.dueDate.toDate() 
          : new Date(data.dueDate);

        return {
          id: doc.id,
          ...data,
          dueDate,
        };
      }) as Bill[];

      setBills(billData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, filter]);

  const handleStatusChange = async (billId: string, newStatus: keyof typeof BILL_STATUS) => {
    if (!currentUser) return;

    try {
      const billRef = doc(db, 'users', currentUser.uid, 'bills', billId);
      await updateDoc(billRef, { 
        status: newStatus,
        lastUpdated: new Date()
      });
      
      toast.success(`Bill marked as ${newStatus}`);
      setSelectedBill(null);
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast.error('Failed to update bill status');
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!currentUser || !window.confirm('Are you sure you want to delete this bill?')) return;

    try {
      const billRef = doc(db, 'users', currentUser.uid, 'bills', billId);
      await deleteDoc(billRef);
      toast.success('Bill deleted successfully');
      setSelectedBill(null);
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill');
    }
  };

  const getBillCategory = (categoryId: string) => {
    return BILL_CATEGORIES.find((cat) => cat.id === categoryId) || {
      name: 'Other',
      icon: '📝',
    };
  };

  const getStatusTag = (status: keyof typeof BILL_STATUS, dueDate: Date) => {
    const isOverdue = isAfter(new Date(), dueDate) && status === BILL_STATUS.PENDING;
    const isDueToday = isToday(dueDate);
    const isDueTomorrow = isSameDay(dueDate, addDays(new Date(), 1));

    if (status === BILL_STATUS.PAID) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <Check className="w-4 h-4" />
          Paid
        </span>
      );
    }

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          Overdue
        </span>
      );
    }

    if (isDueToday) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Clock className="w-4 h-4" />
          Due Today
        </span>
      );
    }

    if (isDueTomorrow) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <Clock className="w-4 h-4" />
          Due Tomorrow
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        <Clock className="w-4 h-4" />
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Sort bills: Due Today first, then Overdue, then by due date
  const sortedBills = [...bills].sort((a, b) => {
    const isADueToday = isToday(a.dueDate);
    const isBDueToday = isToday(b.dueDate);
    const isAOverdue = isAfter(new Date(), a.dueDate) && a.status === BILL_STATUS.PENDING;
    const isBOverdue = isAfter(new Date(), b.dueDate) && b.status === BILL_STATUS.PENDING;

    if (isADueToday && !isBDueToday) return -1;
    if (!isADueToday && isBDueToday) return 1;
    if (isAOverdue && !isBOverdue) return -1;
    if (!isAOverdue && isBOverdue) return 1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bills</h1>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="input"
          >
            <option value="all">All Bills</option>
            <option value={BILL_STATUS.PENDING}>Pending</option>
            <option value={BILL_STATUS.PAID}>Paid</option>
            <option value={BILL_STATUS.OVERDUE}>Overdue</option>
          </select>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedBills.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No bills found</p>
          </div>
        ) : (
          sortedBills.map((bill) => {
            const category = getBillCategory(bill.category);
            const isOverdue = isAfter(new Date(), bill.dueDate) && bill.status === BILL_STATUS.PENDING;
            const isDueToday = isToday(bill.dueDate);
            const isHighlighted = highlightedBillId === bill.id;

            return (
              <div
                key={bill.id}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all ${
                  isDueToday ? 'border-l-4 border-yellow-500' :
                  isOverdue ? 'border-l-4 border-red-500' :
                  bill.status === BILL_STATUS.PAID ? 'border-l-4 border-green-500' : ''
                } ${
                  isHighlighted ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900 animate-pulse' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                    {category.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{bill.title}</h3>
                      {bill.status === BILL_STATUS.PAID && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusTag(bill.status, bill.dueDate)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Due {format(bill.dueDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {formatAmount(bill.amount, bill.currency)}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedBill(selectedBill === bill.id ? null : bill.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {selectedBill === bill.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={() => {
                            setEditingBill(bill);
                            setSelectedBill(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                          Edit Bill
                        </button>
                        <button
                          onClick={() => handleDeleteBill(bill.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Bill
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        {Object.entries(BILL_STATUS).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => handleStatusChange(bill.id, value)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {value === BILL_STATUS.PAID && <Check className="w-4 h-4 text-green-500" />}
                            {value === BILL_STATUS.PENDING && <Clock className="w-4 h-4 text-yellow-500" />}
                            {value === BILL_STATUS.OVERDUE && <AlertCircle className="w-4 h-4 text-red-500" />}
                            Mark as {value}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddBillModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editBill={editingBill}
        onEditComplete={() => setEditingBill(null)}
      />
    </div>
  );
}