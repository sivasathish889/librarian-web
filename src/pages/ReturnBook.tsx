import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Card } from '../components/ui/Card';
import { useLazySearchStudentsQuery, useLazyGetIssuedBooksByUserQuery, useReturnBookMutation } from '../store/features/apiSlice';
import { addToast } from '../store/features/toastSlice';
import { User, BookOpen, CheckCircle, ArrowRight, Loader2, Hash, Building2, RotateCcw, Calendar, Clock } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  registerNumber: string | null;
  department: string | null;
  activeBooks: number;
}

interface IssuedTransaction {
  id: number;
  issueDate: string;
  book: {
    id: number;
    title: string;
    author: string;
    bookCode: string;
    rackNumber: string | null;
  };
}

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

export const ReturnBook = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState<1 | 2>(1);

  // Student filter fields
  const [registerNumber, setRegisterNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Selected transaction for return
  const [selectedTransaction, setSelectedTransaction] = useState<IssuedTransaction | null>(null);

  // RTK Query hooks
  const [searchStudents, { data: students = [], isFetching: studentLoading }] = useLazySearchStudentsQuery();
  const [fetchIssuedBooks, { data: issuedBooks = [], isFetching: booksLoading }] = useLazyGetIssuedBooksByUserQuery();
  const [returnBook, { isLoading: returning }] = useReturnBookMutation();

  const [returnSuccess, setReturnSuccess] = useState(false);

  // Trigger student search when any filter changes
  useEffect(() => {
    const hasFilter = registerNumber.trim().length >= 1 || studentName.trim().length >= 2 || department.trim().length >= 2;
    if (hasFilter) {
      const debounceTimer = setTimeout(() => {
        searchStudents({ registerNumber: registerNumber.trim(), name: studentName.trim(), department: department.trim() });
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [registerNumber, studentName, department, searchStudents]);

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStep(2);
    fetchIssuedBooks(student.id);
  };

  const selectTransaction = (tx: IssuedTransaction) => {
    setSelectedTransaction(tx);
  };

  const handleReturn = async () => {
    if (!selectedTransaction) return;
    try {
      await returnBook(selectedTransaction.id).unwrap();
      setReturnSuccess(true);
      dispatch(addToast({ message: `"${selectedTransaction.book.title}" returned successfully!`, type: 'success' }));
    } catch {
      // Error toast handled by middleware
    }
  };

  const resetAll = () => {
    setStep(1);
    setRegisterNumber('');
    setStudentName('');
    setDepartment('');
    setSelectedStudent(null);
    setSelectedTransaction(null);
    setReturnSuccess(false);
  };

  const hasAnyFilter = registerNumber.trim() || studentName.trim() || department.trim();
  const stepLabels = ['Find Student', 'Select Book & Return'];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 p-8">
      <h1 className="text-2xl font-bold text-slate-800">Return Book</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-2">
        {stepLabels.map((label, idx) => {
          const stepNum = (idx + 1) as 1 | 2;
          const isActive = step === stepNum;
          const isDone = step > stepNum || returnSuccess;
          return (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isDone ? 'bg-emerald-100 text-emerald-700' :
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
                  'bg-slate-100 text-slate-400'
                }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-emerald-500 text-white' :
                  isActive ? 'bg-white/20 text-white' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                  {isDone ? '✓' : stepNum}
                </span>
                {label}
              </div>
              {idx < 1 && <ArrowRight className={`w-4 h-4 ${step > stepNum ? 'text-emerald-400' : 'text-slate-300'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Success State */}
      {returnSuccess ? (
        <Card className="p-8 bg-white shadow-sm border border-slate-100 rounded-2xl text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Book Returned Successfully!</h2>
          <p className="text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">{selectedTransaction?.book.title}</span> has been returned by <span className="font-semibold text-slate-700">{selectedStudent?.name}</span>
          </p>
          {selectedStudent?.registerNumber && (
            <p className="text-sm text-slate-400">Reg. No: {selectedStudent.registerNumber}</p>
          )}
          <p className="text-sm text-slate-400 mb-6">Returned at {new Date().toLocaleString()}</p>
          <button
            onClick={resetAll}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Return Another Book
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Search Panel */}
          <Card className="p-6 bg-white shadow-sm border border-slate-100 rounded-2xl">
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Step 1: Find Student</h3>
                    <p className="text-sm text-slate-500">Filter by register number, name, or department</p>
                  </div>
                </div>

                {/* 3 Separate Filter Inputs */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="return-filter-register-number"
                      type="text"
                      placeholder="Register Number"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-all"
                      autoFocus
                    />
                  </div>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="return-filter-student-name"
                      type="text"
                      placeholder="Student Name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="return-filter-department"
                      type="text"
                      placeholder="Department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-all"
                    />
                  </div>
                </div>

                {studentLoading && (
                  <div className="flex items-center justify-center gap-2 py-3 text-sm text-blue-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                  </div>
                )}

                {/* Student Results */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(students as Student[]).map(s => (
                    <button
                      key={s.id}
                      onClick={() => selectStudent(s)}
                      disabled={s.activeBooks === 0}
                      className={`w-full flex items-center justify-between p-3 border rounded-xl transition-all text-left group ${s.activeBooks > 0
                        ? 'border-slate-100 hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
                        : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {s.registerNumber && <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{s.registerNumber}</span>}
                            {s.department && <span>• {s.department}</span>}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${s.activeBooks > 0
                        ? 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
                        : 'bg-slate-100 text-slate-400'
                        }`}>
                        {s.activeBooks > 0 ? `${s.activeBooks} issued` : 'No books'}
                      </span>
                    </button>
                  ))}
                  {hasAnyFilter && !studentLoading && students.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No students found</p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Step 2: Select Issued Book</h3>
                    <p className="text-sm text-slate-500">Choose the book to return</p>
                  </div>
                </div>

                {booksLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-blue-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading issued books...
                  </div>
                ) : (issuedBooks as IssuedTransaction[]).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No issued books found for this student</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(issuedBooks as IssuedTransaction[]).map(tx => {
                      const days = getDaysOut(tx.issueDate);
                      const isSelected = selectedTransaction?.id === tx.id;
                      return (
                        <button
                          key={tx.id}
                          onClick={() => selectTransaction(tx)}
                          className={`w-full flex items-center justify-between p-3 border rounded-xl transition-all text-left group ${isSelected
                            ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
                            : 'border-slate-100 hover:bg-emerald-50 hover:border-emerald-200'
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-sm truncate">{tx.book.title}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-mono">{tx.book.bookCode}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(tx.issueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <DaysBadge days={days} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Right: Summary Panel */}
          <Card className="p-6 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-4">Return Summary</h3>

            {/* Selected Student */}
            <div className={`p-4 rounded-xl mb-4 transition-all ${selectedStudent ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-dashed border-slate-200'}`}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Student</p>
              {selectedStudent ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{selectedStudent.name}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      {selectedStudent.registerNumber && <span className="font-mono text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{selectedStudent.registerNumber}</span>}
                      {selectedStudent.department && <span className="text-xs">• {selectedStudent.department}</span>}
                    </div>
                  </div>
                  <button onClick={() => { setSelectedStudent(null); setStep(1); setSelectedTransaction(null); }} className="text-xs text-blue-500 hover:underline flex-shrink-0">Change</button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No student selected yet</p>
              )}
            </div>

            {/* Selected Book */}
            <div className={`p-4 rounded-xl mb-6 transition-all ${selectedTransaction ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-dashed border-slate-200'}`}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Book to Return</p>
              {selectedTransaction ? (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{selectedTransaction.book.title}</p>
                    <p className="text-sm text-slate-500">{selectedTransaction.book.author}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 font-mono">{selectedTransaction.book.bookCode}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {getDaysOut(selectedTransaction.issueDate)} days out
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTransaction(null)} className="text-xs text-blue-500 hover:underline">Change</button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">{selectedStudent ? 'Select a book from the list' : 'No book selected yet'}</p>
              )}
            </div>

            {/* Return Button */}
            <button
              id="return-book-confirm-btn"
              onClick={handleReturn}
              disabled={!selectedStudent || !selectedTransaction || returning}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all mt-auto ${selectedStudent && selectedTransaction && !returning
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
                }`}
            >
              {returning ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Returning...</span>
              ) : (
                'Confirm & Return Book'
              )}
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};
