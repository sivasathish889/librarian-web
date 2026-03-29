import { Card } from '../components/ui/Card';
import { BookOpen, Users, CheckSquare, AlertTriangle, Bell, Menu } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useGetDashboardQuery } from '../store/features/apiSlice';

export const Dashboard = () => {
  const { data: stats, isLoading: loading } = useGetDashboardQuery();

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f8fafc]">
        <p className="text-slate-500">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative text-slate-400 hover:text-slate-600">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold shadow-md cursor-pointer">
            L
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto w-full max-w-[1600px] mx-auto">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{stats.totalBooks}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Total Books</p>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{stats.totalStudents}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Total Students</p>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{stats.issuedBooks}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Issued Books</p>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{stats.missingBooks}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Missing Books</p>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Book Activity</h3>
                <p className="text-sm text-slate-500">Monthly issued vs returned</p>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1e3a8a]"></div> Issued</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Returned</div>
              </div>
            </div>
            <div className="h-72 w-full">
              {stats.bookActivity && stats.bookActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.bookActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="Issued" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="Returned" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">No activity data</div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-slate-800">Books by Author</h3>
              <p className="text-sm text-slate-500">Distribution across authors</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
              {stats.booksByAuthor && stats.booksByAuthor.length > 0 ? (
                <>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.booksByAuthor} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {stats.booksByAuthor.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
                    {stats.booksByAuthor.map((author: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: author.color }}></div>
                        <span className="truncate">{author.name} ({author.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-slate-400">No author data</div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Issuances */}
        <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Issuances</h3>
          <div className="space-y-4">
            {stats.recentIssuances && stats.recentIssuances.length > 0 ? (
              stats.recentIssuances.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-800">{tx.user.name}</span>
                    <span className="text-sm text-slate-500">{tx.book.title} • {new Date(tx.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Issued</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No recent issuances.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
