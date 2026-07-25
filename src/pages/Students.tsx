import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} from '../store/features/apiSlice';
import { addToast } from '../store/features/toastSlice';
import { Search, UserPlus, Edit2, Trash2, X, ChevronLeft, ChevronRight, BookOpen, GraduationCap, Mail } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  registerNumber?: string;
  department?: string;
  activeBooks?: number;
  createdAt?: string;
}

const LIMIT = 10;
const emptyForm = { id: 0, name: '', email: '', password: '', registerNumber: '', department: '' };

export const Students = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const { data, isLoading: loading, isFetching } = useGetStudentsQuery({ page, limit: LIMIT, search: query });
  const students: Student[] = data?.students || [];
  const pagination = data?.pagination || { page: 1, total: 0, limit: LIMIT, totalPages: 1 };

  const [createStudent, { isLoading: creating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: updating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: deleting }] = useDeleteStudentMutation();

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

  const openAddModal = () => {
    setFormData({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (student: Student) => {
    setFormData({
      id: student.id,
      name: student.name,
      email: student.email,
      password: '',
      registerNumber: student.registerNumber || '',
      department: student.department || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      dispatch(addToast({ message: 'Name and Email are required.', type: 'error' }));
      return;
    }

    if (!formData.id && !formData.password.trim()) {
      dispatch(addToast({ message: 'Password is required for new student account.', type: 'error' }));
      return;
    }

    try {
      if (formData.id) {
        await updateStudent({
          id: formData.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          registerNumber: formData.registerNumber.trim(),
          department: formData.department.trim(),
          ...(formData.password.trim() ? { password: formData.password.trim() } : {}),
        }).unwrap();
        dispatch(addToast({ message: 'Student updated successfully!', type: 'success' }));
      } else {
        await createStudent({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          registerNumber: formData.registerNumber.trim(),
          department: formData.department.trim(),
        }).unwrap();
        dispatch(addToast({ message: 'Student created successfully!', type: 'success' }));
      }
      setShowModal(false);
      setFormData({ ...emptyForm });
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || 'Action failed', type: 'error' }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStudent(deleteTarget.id).unwrap();
      dispatch(addToast({ message: 'Student deleted successfully!', type: 'success' }));
      setDeleteTarget(null);
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || 'Delete failed', type: 'error' }));
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Management</h1>
          <p className="text-slate-500 text-sm mt-1">View, search, create, update, and manage student accounts.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-sm self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl">
        <form onSubmit={handleSearch} className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, register number, department, or email..."
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors"
          >
            Search
          </button>
        </form>
      </Card>

      {/* Table */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        {loading || isFetching ? (
          <div className="p-12 text-center text-slate-500">Loading student records...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {query ? `No students found matching "${query}".` : 'No student records available.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Register Number</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-center">Active Books</th>
                  <th className="py-4 px-6">Registered Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-700 font-medium">
                      {student.registerNumber || <span className="text-slate-400 font-normal">N/A</span>}
                    </td>
                    <td className="py-4 px-6">
                      {student.department ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {student.department}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          (student.activeBooks || 0) > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <BookOpen className="w-3 h-3" />
                        {student.activeBooks || 0} Issued
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-semibold text-slate-700">{(pagination.page - 1) * LIMIT + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(pagination.page * LIMIT, pagination.total)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{pagination.total}</span> students
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800">
                {formData.id ? 'Edit Student Details' : 'Add New Student'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name *"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Johnson"
                required
              />

              <Input
                label="Email Address *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. alex.johnson@example.com"
                required
              />

              <Input
                label={formData.id ? 'New Password (leave blank to keep current)' : 'Password *'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={formData.id ? '••••••••' : 'Enter password'}
                required={!formData.id}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Register Number"
                  type="text"
                  value={formData.registerNumber}
                  onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                  placeholder="e.g. REG2026001"
                />

                <Input
                  label="Department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#1e3a8a] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : formData.id ? 'Update Student' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Delete Student Account?</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete <span className="font-semibold text-slate-800">{deleteTarget.name}</span>? This action will permanently remove their profile and associated history.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
