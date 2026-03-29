import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { useGetReturnedBooksQuery } from '../store/features/apiSlice';
import { Search, BookOpen, Clock, RotateCcw, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const LIMIT = 25;

export const ReturnedBooks = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input — 400ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 when search changes
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useGetReturnedBooksQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch,
  });

  const transactions = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Returned Books</h1>
          <p className="text-sm text-slate-500 mt-1">History of books returned by students</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
          <RotateCcw className="w-6 h-6" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, register number, or book…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition shadow-sm"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            Clear
          </button>
        )}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-500 font-medium animate-pulse">
            <Clock className="w-3 h-3" />
            Searching…
          </div>
        )}
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden shadow-sm !p-0 border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr className="border-b text-xs font-bold text-slate-500 bg-slate-50/80 uppercase tracking-wider">
                <th className="px-6 py-4">#</th>
                <th className="px-4 py-4">Student</th>
                <th className="px-4 py-4">Reg. No.</th>
                <th className="px-4 py-4">Book Details</th>
                <th className="px-4 py-4">Book Code</th>
                <th className="px-6 py-4">Returned On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                        <RotateCcw className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-sm font-medium text-slate-400 animate-pulse">Loading return history…</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <BookOpen className="w-12 h-12 text-slate-300" />
                      <p className="text-slate-500 font-medium">
                        {debouncedSearch ? `No returned books matching "${debouncedSearch}"` : 'No return records found.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any, idx: number) => (
                  <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 text-sm font-mono">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-100">
                          {tx.user?.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{tx.user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{tx.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono border border-slate-200">
                        {tx.user?.registerNumber || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{tx.book?.title}</p>
                        <p className="text-xs text-slate-500 truncate">{tx.book?.author}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-500 italic">
                      {tx.book?.bookCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        {tx.returnDate ? new Date(tx.returnDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '—'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination Controls */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-900">{(page - 1) * LIMIT + 1}</span> to <span className="text-slate-900">{Math.min(page * LIMIT, pagination.total)}</span> of <span className="text-slate-900">{pagination.total}</span> records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-white hover:text-blue-600 border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                else pageNum = page - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 ${pageNum === page
                        ? 'bg-[#1e3a8a] text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.totalPages}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-white hover:text-blue-600 border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 bg-slate-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
