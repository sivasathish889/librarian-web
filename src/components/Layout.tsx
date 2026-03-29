import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../store/store';
import { logout } from '../store/features/authSlice';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, CheckSquare, RefreshCw, XSquare, LogOut, Library, BookMarked, RotateCcw } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Books', path: '/books', icon: Library },
    { name: 'Issue Book', path: '/issue-book', icon: CheckSquare },
    { name: 'Return Book', path: '/return-book', icon: RefreshCw },
    { name: 'Issued Books List', path: '/issued-books', icon: BookMarked },
    { name: 'Returned Books List', path: '/returned-books', icon: RotateCcw },
    { name: 'Missing Books', path: '/missing-books', icon: XSquare },
  ];

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col shadow-xl z-10 relative">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">LibraryOS</h2>
              <p className="text-xs text-blue-200">Librarian Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-blue-100 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10">
          <div className="p-4">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-emerald-400 text-emerald-900 flex items-center justify-center font-bold text-lg shadow-sm">
                {user?.name?.charAt(0) || 'L'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name || "Sarah Liu"}</p>
                <p className="text-xs text-blue-200 truncate">{user?.role || "Head Librarian"}</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="mt-2 w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-200 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 opacity-70" /> Back to Platforms
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#f8fafc]">
        <Outlet />
      </main>
    </div>
  );
};
