import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import {
  useGetBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useDeleteBulkBooksMutation
} from '../store/features/apiSlice';
import { addToast } from '../store/features/toastSlice';
import { Search, BookOpen, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  publisher?: string;
  bookCount?: number;
  accessionNumbers?: string[];
  rackNumber?: string;
  stock: number;
}

const LIMIT = 10;
const emptyForm = { id: 0, title: '', author: '', publisher: '', bookCount: 1, accessionNumbersStr: '', rackNumber: '' };

export const Books = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data, isLoading: loading, isFetching } = useGetBooksQuery({ page, limit: LIMIT, search: query });
  const books = data?.books || [];
  const pagination = data?.pagination || { page: 1, total: 0, limit: LIMIT, totalPages: 1 };

  const [createBook, { isLoading: creating }] = useCreateBookMutation();
  const [updateBook, { isLoading: updating }] = useUpdateBookMutation();
  const [deleteBook] = useDeleteBookMutation();
  const [deleteBulkBooks, { isLoading: deletingBulk }] = useDeleteBulkBooksMutation();

  const saving = creating || updating;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openAdd = () => {
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (book: Book) => {
    setFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      bookCount: book.bookCount || book.stock || 1,
      accessionNumbersStr: (book.accessionNumbers || []).join(', '),
      rackNumber: book.rackNumber || ''
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const accNos = formData.accessionNumbersStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        bookCount: Number(formData.bookCount) || (accNos.length > 0 ? accNos.length : 1),
        accessionNumbers: accNos,
        rackNumber: formData.rackNumber
      };

      if (formData.id) {
        await updateBook({ id: formData.id, ...payload }).unwrap();
        dispatch(addToast({ message: 'Book updated successfully!', type: 'success' }));
      } else {
        await createBook(payload).unwrap();
        dispatch(addToast({ message: 'Book created successfully!', type: 'success' }));
      }
      setShowForm(false);
    } catch {
      // Error toast is handled automatically by the error middleware
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this book? This cannot be undone.')) return;
    try {
      await deleteBook(id).unwrap();
      dispatch(addToast({ message: 'Book deleted successfully.', type: 'success' }));
      setSelectedIds(prev => prev.filter(i => i !== id));
      if (books.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      }
    } catch {
      // Error toast is handled automatically by the error middleware
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected book(s)? This action cannot be undone.`)) return;

    try {
      await deleteBulkBooks(selectedIds).unwrap();
      dispatch(addToast({ message: `${selectedIds.length} book(s) deleted successfully.`, type: 'success' }));
      setSelectedIds([]);
      if (books.length <= selectedIds.length && page > 1) {
        setPage(prev => prev - 1);
      }
    } catch {
      // Error toast handled by middleware
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const allCurrentSelected = books.length > 0 && books.every((b: Book) => selectedIds.includes(b.id));

  const toggleSelectAll = () => {
    if (books.length === 0) return;
    if (allCurrentSelected) {
      const currentBookIds = new Set(books.map((b: Book) => b.id));
      setSelectedIds(prev => prev.filter(id => !currentBookIds.has(id)));
    } else {
      const currentBookIds = books.map((b: Book) => b.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentBookIds])));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Book Catalog</h1>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deletingBulk}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors shadow-sm animate-in fade-in duration-150"
            >
              <Trash2 size={16} /> Delete Selected ({selectedIds.length})
            </button>
          )}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Book
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowForm(false); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">{formData.id ? 'Edit Book' : 'New Book'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <Input label="Author" required value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
              <Input label="Publisher" value={formData.publisher} onChange={e => setFormData({ ...formData, publisher: e.target.value })} />
              <Input label="Book Count" type="number" required value={formData.bookCount || ''} onChange={e => setFormData({ ...formData, bookCount: Number(e.target.value) })} />
              <div className="md:col-span-2">
                <Input label="Accession Numbers (comma separated)" placeholder="e.g. ACC-101, ACC-102" value={formData.accessionNumbersStr} onChange={e => setFormData({ ...formData, accessionNumbersStr: e.target.value })} />
              </div>
              <Input label="Rack Number" value={formData.rackNumber} onChange={e => setFormData({ ...formData, rackNumber: e.target.value })} />
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-60 transition-colors shadow-sm">
                  {saving ? 'Saving…' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, author, publisher or accession no…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors">
          Search
        </button>
        {query && (
          <button type="button" onClick={() => { setSearch(''); setQuery(''); setPage(1); }} className="px-4 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Clear
          </button>
        )}
        {isFetching && !loading && (
          <span className="text-xs text-slate-400 animate-pulse self-center">Searching…</span>
        )}
      </form>

      {/* Book Table */}
      <Card className="overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-sm font-semibold text-slate-500 bg-slate-50/50">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={books.length > 0 && allCurrentSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#1e3a8a]"
                  title="Select All"
                />
              </th>
              <th className="p-4 rounded-tl-lg">#</th>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Publisher</th>
              <th className="p-4">Accession No(s)</th>
              <th className="p-4">Rack</th>
              <th className="p-4 text-center">Copies</th>
              <th className="p-4 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <BookOpen className="w-8 h-8 animate-pulse" />
                    <span className="text-sm">Loading books…</span>
                  </div>
                </td>
              </tr>
            ) : books.map((book: Book, idx: number) => {
              const isSelected = selectedIds.includes(book.id);
              return (
                <tr
                  key={book.id}
                  className={`border-b border-slate-100 transition-colors ${
                    isSelected ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(book.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#1e3a8a]"
                    />
                  </td>
                  <td className="p-4 text-slate-400 text-sm">{(page - 1) * LIMIT + idx + 1}</td>
                  <td className="p-4 font-medium text-slate-900">{book.title}</td>
                  <td className="p-4 text-slate-600">{book.author}</td>
                  <td className="p-4 text-slate-500 text-sm">{book.publisher || '—'}</td>
                  <td className="p-4 font-mono text-sm text-slate-500 max-w-[200px] truncate">
                    {book.accessionNumbers && book.accessionNumbers.length > 0 ? book.accessionNumbers.join(', ') : '—'}
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{book.rackNumber || '—'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      book.stock === 0 ? 'bg-red-100 text-red-700'
                      : book.stock <= 3 ? 'bg-orange-100 text-orange-700'
                      : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {book.stock === 0 ? 'Out of Stock' : `${book.stock} available`}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button onClick={() => openEdit(book)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(book.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && books.length === 0 && (
              <tr>
                <td colSpan={9} className="p-10 text-center text-slate-500 text-sm">
                  No books found{query ? ` for "${query}"` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-900">{(page - 1) * LIMIT + 1}</span> to{' '}
            <span className="text-slate-900">{Math.min(page * LIMIT, pagination.total)}</span> of{' '}
            <span className="text-slate-900">{pagination.total}</span> books
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
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 ${
                      pageNum === page
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

