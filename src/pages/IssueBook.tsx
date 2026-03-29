import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Card } from '../components/ui/Card';
import { useLazySearchStudentsQuery, useLazySearchBooksQuery, useIssueBookMutation } from '../store/features/apiSlice';
import { addToast } from '../store/features/toastSlice';
import { Search, User, BookOpen, CheckCircle, ArrowRight, Loader2, Hash, Building2 } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  registerNumber: string | null;
  department: string | null;
  activeBooks: number;
}

interface Book {
  id: number;
  title: string;
  author: string;
  bookCode: string;
  stock: number;
  rackNumber: string | null;
}

export const IssueBook = () => {
  const dispatch = useDispatch();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Student filter fields
  const [registerNumber, setRegisterNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Book search
  const [bookQuery, setBookQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // RTK Query hooks
  const [searchStudents, { data: students = [], isFetching: studentLoading }] = useLazySearchStudentsQuery();
  const [searchBooks, { data: books = [], isFetching: bookLoading }] = useLazySearchBooksQuery();
  const [issueBook, { isLoading: issuing }] = useIssueBookMutation();

  const [issueSuccess, setIssueSuccess] = useState(false);

  // Trigger student search when any filter changes
  useEffect(() => {
    const hasFilter = registerNumber.trim().length >= 1 || studentName.trim().length >= 2 || department.trim().length >= 2;
    if (hasFilter) {
      const debounceTimer = setTimeout(() => {
        searchStudents({ registerNumber: registerNumber.trim(), name: studentName.trim(), department: department.trim() });
      }, 500)
      return () => clearTimeout(debounceTimer)
    }
  }, [registerNumber, studentName, department, searchStudents]);

  // Trigger book search
  useEffect(() => {
    if (bookQuery.trim().length >= 2) {
      const debounceTimer = setTimeout(() => {
        searchBooks(bookQuery.trim());
      }, 500)
      return () => clearTimeout(debounceTimer)
    }
  }, [bookQuery, searchBooks]);

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStep(2);
  };

  const selectBook = (book: Book) => {
    setSelectedBook(book);
    setStep(3);
  };

  const handleIssue = async () => {
    if (!selectedStudent || !selectedBook) return;
    try {
      await issueBook({ userId: selectedStudent.id, bookId: selectedBook.id }).unwrap();
      setIssueSuccess(true);
      dispatch(addToast({ message: `"${selectedBook.title}" issued to ${selectedStudent.name}!`, type: 'success' }));
    } catch {
      // Error toast is handled automatically by the error middleware
    }
  };

  const resetAll = () => {
    setStep(1);
    setRegisterNumber('');
    setStudentName('');
    setDepartment('');
    setSelectedStudent(null);
    setBookQuery('');
    setSelectedBook(null);
    setIssueSuccess(false);
  };

  const hasAnyFilter = registerNumber.trim() || studentName.trim() || department.trim();
  const stepLabels = ['Find Student', 'Select Book', 'Confirm & Issue'];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 p-8">
      <h1 className="text-2xl font-bold text-slate-800">Issue Book</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-2">
        {stepLabels.map((label, idx) => {
          const stepNum = (idx + 1) as 1 | 2 | 3;
          const isActive = step === stepNum;
          const isDone = step > stepNum || issueSuccess;
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
              {idx < 2 && <ArrowRight className={`w-4 h-4 ${step > stepNum ? 'text-emerald-400' : 'text-slate-300'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Success State */}
      {issueSuccess ? (
        <Card className="p-8 bg-white shadow-sm border border-slate-100 rounded-2xl text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Book Issued Successfully!</h2>
          <p className="text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">{selectedBook?.title}</span> has been issued to <span className="font-semibold text-slate-700">{selectedStudent?.name}</span>
          </p>
          {selectedStudent?.registerNumber && (
            <p className="text-sm text-slate-400">Reg. No: {selectedStudent.registerNumber}</p>
          )}
          <p className="text-sm text-slate-400 mb-6">Transaction recorded at {new Date().toLocaleString()}</p>
          <button
            onClick={resetAll}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Issue Another Book
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
                      id="filter-register-number"
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
                      id="filter-student-name"
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
                      id="filter-department"
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
                      className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left group"
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
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700">
                        {s.activeBooks} active
                      </span>
                    </button>
                  ))}
                  {hasAnyFilter && !studentLoading && students.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No students found</p>
                  )}
                </div>
              </>
            )}

            {step >= 2 && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Step 2: Select Book</h3>
                    <p className="text-sm text-slate-500">Search by title, author, or code</p>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="book-search-input"
                    type="text"
                    placeholder="Type book title, author, or code..."
                    value={bookQuery}
                    onChange={(e) => setBookQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition-all"
                    autoFocus={step === 2}
                  />
                  {bookLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {(books as Book[]).map(b => (
                    <button
                      key={b.id}
                      onClick={() => b.stock > 0 ? selectBook(b) : null}
                      disabled={b.stock <= 0}
                      className={`w-full flex items-center justify-between p-3 border rounded-xl transition-all text-left group ${b.stock > 0
                        ? 'border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer'
                        : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{b.title}</p>
                        <p className="text-xs text-slate-500">{b.author} • <span className="font-mono">{b.bookCode}</span></p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${b.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {b.stock > 0 ? `${b.stock} in stock` : 'Out of stock'}
                      </span>
                    </button>
                  ))}
                  {bookQuery.length >= 2 && !bookLoading && books.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No books found</p>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Right: Summary Panel */}
          <Card className="p-6 bg-white shadow-sm border border-slate-100 rounded-2xl flex flex-col">
            <h3 className="font-semibold text-slate-800 mb-4">Issue Summary</h3>

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
                  <button onClick={() => { setSelectedStudent(null); setStep(1); setSelectedBook(null); }} className="text-xs text-blue-500 hover:underline flex-shrink-0">Change</button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No student selected yet</p>
              )}
            </div>

            {/* Selected Book */}
            <div className={`p-4 rounded-xl mb-6 transition-all ${selectedBook ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-dashed border-slate-200'}`}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Book</p>
              {selectedBook ? (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{selectedBook.title}</p>
                    <p className="text-sm text-slate-500">{selectedBook.author}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">{selectedBook.bookCode}{selectedBook.rackNumber ? ` • Rack: ${selectedBook.rackNumber}` : ''}</p>
                  </div>
                  <button onClick={() => { setSelectedBook(null); setStep(2); }} className="text-xs text-blue-500 hover:underline">Change</button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No book selected yet</p>
              )}
            </div>



            {/* Issue Button */}
            <button
              id="issue-book-confirm-btn"
              onClick={handleIssue}
              disabled={!selectedStudent || !selectedBook || issuing}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all mt-auto ${selectedStudent && selectedBook && !issuing
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
                }`}
            >
              {issuing ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Issuing...</span>
              ) : (
                'Confirm & Issue Book'
              )}
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};
