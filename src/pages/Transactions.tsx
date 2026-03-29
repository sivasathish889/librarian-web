import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useGetTransactionsQuery } from '../store/features/apiSlice';

export const Transactions = () => {
  const { data: transactions = [], isLoading: loading } = useGetTransactionsQuery();
  const [filter, setFilter] = useState<'ALL' | 'ISSUED' | 'RETURNED' | 'MISSING'>('ALL');

  const filtered = filter === 'ALL' ? transactions : transactions.filter((t: any) => t.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 p-8">
      <h1 className="text-2xl font-bold text-slate-800">All Transactions</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'ISSUED', 'RETURNED', 'MISSING'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-sm font-semibold text-slate-500 bg-slate-50/50">
              <th className="p-4 rounded-tl-lg">ID</th>
              <th className="p-4">Student</th>
              <th className="p-4">Book Title</th>
              <th className="p-4">Book Code</th>
              <th className="p-4">Issue Date</th>
              <th className="p-4">Return Date</th>
              <th className="p-4 rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading...</td></tr>
            ) : filtered.map((tx: any) => (
              <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-mono text-sm text-slate-600">#{tx.id}</td>
                <td className="p-4">
                  <span className="font-medium text-slate-900">{tx.user?.name}</span>
                  <span className="text-xs text-slate-500 block">{tx.user?.email}</span>
                </td>
                <td className="p-4 text-slate-600">{tx.book?.title}</td>
                <td className="p-4 font-mono text-sm">{tx.book?.bookCode}</td>
                <td className="p-4 text-sm text-slate-600">{new Date(tx.issueDate).toLocaleDateString()}</td>
                <td className="p-4 text-sm text-slate-600">{tx.returnDate ? new Date(tx.returnDate).toLocaleDateString() : '—'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    tx.status === 'ISSUED' ? 'bg-blue-100 text-blue-700' :
                    tx.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-700' :
                    tx.status === 'MISSING' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-slate-500">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
