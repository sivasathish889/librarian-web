import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useGetBooksQuery, useCreateBookMutation, useUpdateBookMutation, useDeleteBookMutation } from '../store/features/apiSlice';
import { addToast } from '../store/features/toastSlice';
import { Search, BookOpen, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  bookCode: string;
  rackNumber?: string;
  stock: number;
}

const emptyForm = { id: 0, title: '', author: '', bookCode: '', rackNumber: '', stock: 0 };

export const Books = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });

  const { data: books = [], isLoading: loading } = useGetBooksQuery(query || undefined);
  const [createBook, { isLoading: creating }] = useCreateBookMutation();
  const [updateBook, { isLoading: updating }] = useUpdateBookMutation();
  const [deleteBook] = useDeleteBookMutation();

  const saving = creating || updating;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const openAdd = () => {
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (book: Book) => {
    setFormData({ id: book.id, title: book.title, author: book.author, bookCode: book.bookCode, rackNumber: book.rackNumber || '', stock: book.stock });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateBook(formData).unwrap();
        dispatch(addToast({ message: 'Book updated successfully!', type: 'success' }));
      } else {
        await createBook(formData).unwrap();
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
    } catch {
      // Error toast is handled automatically by the error middleware
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Book Catalog</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Book
        </button>
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
              <Input label="Book Code" required value={formData.bookCode} onChange={e => setFormData({ ...formData, bookCode: e.target.value })} />
              <Input label="Rack Number" value={formData.rackNumber} onChange={e => setFormData({ ...formData, rackNumber: e.target.value })} />
              <Input label="Stock" type="number" required value={formData.stock || ''} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
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
            placeholder="Search by title, author or code…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors">
          Search
        </button>
        {query && (
          <button type="button" onClick={() => { setSearch(''); setQuery(''); }} className="px-4 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Clear
          </button>
        )}
      </form>

      {/* Book Table */}
      <Card className="overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-sm font-semibold text-slate-500 bg-slate-50/50">
              <th className="p-4 rounded-tl-lg">#</th>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Book Code</th>
              <th className="p-4">Rack</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <BookOpen className="w-8 h-8 animate-pulse" />
                    <span className="text-sm">Loading books…</span>
                  </div>
                </td>
              </tr>
            ) : books.map((book: Book, idx: number) => (
              <tr key={book.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-400 text-sm">{idx + 1}</td>
                <td className="p-4 font-medium text-slate-900">{book.title}</td>
                <td className="p-4 text-slate-600">{book.author}</td>
                <td className="p-4 font-mono text-sm text-slate-500">{book.bookCode}</td>
                <td className="p-4 text-slate-500 text-sm">{book.rackNumber || '—'}</td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    book.stock === 0 ? 'bg-red-100 text-red-700'
                    : book.stock <= 3 ? 'bg-orange-100 text-orange-700'
                    : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {book.stock === 0 ? 'Out of Stock' : `${book.stock} left`}
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
            ))}
            {!loading && books.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-500 text-sm">
                  No books found{query ? ` for "${query}"` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
