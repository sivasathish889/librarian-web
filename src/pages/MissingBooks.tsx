import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Card } from '../components/ui/Card';
import { 
  useGetMissingBooksQuery, 
  useLazySearchStudentsQuery, 
  useLazySearchBooksQuery, 
  useMarkBookMissingManualMutation 
} from '../store/features/apiSlice';
import { addToast } from '../store/features/toastSlice';
import { Search, Book as BookIcon, User as UserIcon, AlertCircle, CheckCircle2, Loader2, IndianRupee } from 'lucide-react';

export const MissingBooks = () => {
  const dispatch = useDispatch();
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [fineAmount, setFineAmount] = useState<string>('');
  const [page, setPage] = useState(1);

  const [triggerStudentSearch, { data: studentResults = [] }] = useLazySearchStudentsQuery();
  const [triggerBookSearch, { data: bookResults = [] }] = useLazySearchBooksQuery();

  
  const { data: missingData, isLoading: loadingMissing } = useGetMissingBooksQuery({ page, limit: 10 });
  const [markMissing, { isLoading: submitting }] = useMarkBookMissingManualMutation();

  const handleStudentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentSearch.trim()) {
      triggerStudentSearch({ name: studentSearch });
    }
  };

  const handleBookSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookSearch.trim()) {
      triggerBookSearch(bookSearch);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBook || !fineAmount) {
      dispatch(addToast({ message: 'Please select a student, a book, and enter fine amount', type: 'error' }));
      return;
    }

    try {
      await markMissing({
        userId: selectedStudent.id,
        bookId: selectedBook.id,
        fineAmount: parseFloat(fineAmount)
      }).unwrap();
      
      dispatch(addToast({ message: 'Missing book logged and fine generated', type: 'success' }));
      setSelectedStudent(null);
      setSelectedBook(null);
      setFineAmount('');
      setStudentSearch('');
      setBookSearch('');
    } catch (err: any) {
      dispatch(addToast({ message: err.data?.message || 'Failed to log missing book', type: 'error' }));
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Missing Books Management</h1>
        <p className="text-slate-500 text-lg">Log missing books and generate fines for students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Manual Entry Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-slate-200/60 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-sm sticky top-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Manual Entry
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Student Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Student</label>
                {!selectedStudent ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search student..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      />
                      <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <button 
                        type="button"
                        onClick={handleStudentSearch}
                        className="absolute right-2 top-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                      >
                        Search
                      </button>
                    </div>
                    {studentResults.length > 0 && (
                      <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl shadow-sm bg-slate-50 p-1 space-y-1">
                        {studentResults.map((s: any) => (
                          <div 
                            key={s.id}
                            onClick={() => setSelectedStudent(s)}
                            className="p-2 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-200 flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{s.name}</p>
                              <p className="text-[10px] text-slate-500">{s.registerNumber} • {s.department}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-bold text-blue-900">{selectedStudent.name}</p>
                        <p className="text-xs text-blue-700">{selectedStudent.registerNumber}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Book Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Book</label>
                {!selectedBook ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search book title or code..."
                        value={bookSearch}
                        onChange={(e) => setBookSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      />
                      <BookIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <button 
                        type="button"
                        onClick={handleBookSearch}
                        className="absolute right-2 top-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                      >
                        Search
                      </button>
                    </div>
                    {bookResults.length > 0 && (
                      <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl shadow-sm bg-slate-50 p-1 space-y-1">
                        {bookResults.map((b: any) => (
                          <div 
                            key={b.id}
                            onClick={() => setSelectedBook(b)}
                            className="p-2 hover:bg-white rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-200 flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                              <BookIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{b.title}</p>
                              <p className="text-[10px] text-slate-500">{b.bookCode}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <BookIcon className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-bold text-emerald-900">{selectedBook.title}</p>
                        <p className="text-xs text-emerald-700">{selectedBook.bookCode}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedBook(null)}
                      className="text-xs text-emerald-600 hover:underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Fine Amount */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Fine Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                  <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Log Missing & Create Fine
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>

        {/* Missing Books List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden shadow-xl shadow-slate-200/40 border-slate-200/60 bg-white">
            <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Recently Logged Missing Books</h3>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
                Total: {missingData?.pagination?.total || 0}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                    <th className="p-4">Student</th>
                    <th className="p-4">Book</th>
                    <th className="p-4">Log Date</th>
                    <th className="p-4">Fine</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingMissing ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Loading records...</td></tr>
                  ) : missingData?.data.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center font-bold text-slate-400 text-xs transition-colors">
                            {tx.user?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{tx.user?.name}</p>
                            <p className="text-[10px] font-mono text-slate-500">{tx.user?.registerNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-700">{tx.book?.title}</p>
                        <p className="text-[10px] font-mono text-slate-500">{tx.book?.bookCode}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(tx.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 flex items-center tracking-tight">
                          <IndianRupee className="w-3 h-3" />
                          {tx.Fine?.amount || '0.00'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 ring-red-200">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loadingMissing && missingData?.data.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">No missing book records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Placeholder */}
            {missingData?.pagination?.totalPages > 1 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center gap-2">
                {Array.from({ length: missingData.pagination.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
