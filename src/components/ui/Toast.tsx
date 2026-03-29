import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast, type Toast } from '../../store/features/toastSlice';
import type { RootState } from '../../store/store';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const TOAST_DURATION = 5000;

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-500',
    text: 'text-emerald-800',
    progress: 'bg-emerald-400',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    text: 'text-red-800',
    progress: 'bg-red-400',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    text: 'text-blue-800',
    progress: 'bg-blue-400',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useDispatch();
  const Icon = icons[toast.type];
  const style = styles[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div
      className={`flex items-start gap-3 w-80 px-4 py-3 rounded-xl border shadow-lg ${style.bg} animate-slide-in-right relative overflow-hidden`}
      role="alert"
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.icon}`} />
      <p className={`text-sm font-medium flex-1 ${style.text}`}>{toast.message}</p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5">
        <div
          className={`h-full ${style.progress} animate-toast-progress`}
        />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useSelector((state: RootState) => state.toast.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
