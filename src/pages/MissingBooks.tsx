import React from 'react';

export const MissingBooks = () => {
  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Missing Books</h1>
      <p className="text-slate-500">List of currently missing or overdue books.</p>
    </div>
  );
};
