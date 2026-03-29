import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { useGetIssuedBooksQuery } from '../store/features/apiSlice';
import { Search, BookOpen, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const LIMIT = 25;

const getDaysOut = (issueDate: string): number => {
  const issued = new Date(issueDate);
  const now = new Date();
  return Math.floor((now.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24));
};

const DaysBadge = ({ days }: { days: number }) => {
  const color =
    days > 30 ? 'bg-red-100 text-red-700' :
      days > 14 ? 'bg-amber-100 text-amber-700' :
        'bg-emerald-100 text-emerald-700';

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>
      {days}d
    </span>
  );
};

export const IssuedBooks = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input — 400ms delay to avoid spamming API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 when search changes
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useGetIssuedBooksQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch,
  });
  const transactions = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };
  const stats = data?.stats || { totalIssued: 0, overdueCount: 0, criticalCount: 0 };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Issued Books</h1>
        <p className="text-sm text-slate-500 mt-1">Books currently checked out by students</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 !p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Issued</p>
            <p className="text-2xl font-bold text-slate-800">{isLoading ? '—' : stats.totalIssued}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 !p-4 bg-gradient-to-br from-amber-50 to-white border border-amber-100">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Overdue (&gt;14d)</p>
            <p className="text-2xl font-bold text-slate-800">{isLoading ? '—' : stats.overdueCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 !p-4 bg-gradient-to-br from-red-50 to-white border border-red-100">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Critical (&gt;30d)</p>
            <p className="text-2xl font-bold text-slate-800">{isLoading ? '—' : stats.criticalCount}</p>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, register number, or book…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        )}
        {isFetching && !isLoading && (
          <span className="text-xs text-slate-400 animate-pulse">Searching…</span>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-x-auto shadow-sm !p-0">
        <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '48px' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr className="border-b text-sm font-semibold text-slate-500 bg-slate-50/50">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Register No.</th>
              <th className="px-4 py-3">Book Title</th>
              <th className="px-4 py-3">Book Code</th>
              <th className="px-4 py-3">Issue Date</th>
              <th className="px-4 py-3 text-center">Days Out</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <BookOpen className="w-8 h-8 animate-pulse" />
                    <span className="text-sm">Loading issued books…</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-500 text-sm">
                  {debouncedSearch ? `No issued books matching "${debouncedSearch}"` : 'No books are currently issued.'}
                </td>
              </tr>
            ) : (
              transactions.map((tx: any, idx: number) => {
                const days = getDaysOut(tx.issueDate);
                return (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-sm">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="truncate">
                        <span className="font-medium text-slate-900">{tx.user?.name}</span>
                        <span className="text-xs text-slate-500 block truncate">{tx.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-600 truncate">{tx.user?.registerNumber || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium truncate">{tx.book?.title}</td>
                    <td className="px-4 py-3 font-mono text-sm text-slate-500 truncate">{tx.book?.bookCode}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{new Date(tx.issueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <DaysBadge days={days} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Show pages around the current page
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pageNum === page
                    ? 'bg-[#1e3a8a] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
