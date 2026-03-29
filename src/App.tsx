import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from './store/store';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';

import { Transactions } from './pages/Transactions';
import { IssueBook } from './pages/IssueBook';
import { ReturnBook } from './pages/ReturnBook';
import { MissingBooks } from './pages/MissingBooks';
import { Books } from './pages/Books';
import { IssuedBooks } from './pages/IssuedBooks';
import { ReturnedBooks } from './pages/ReturnedBooks';
import { ToastContainer } from './components/ui/Toast';
import type { JSX } from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />

          <Route path="transactions" element={<Transactions />} />
          <Route path="issue-book" element={<IssueBook />} />
          <Route path="return-book" element={<ReturnBook />} />
          <Route path="missing-books" element={<MissingBooks />} />
          <Route path="books" element={<Books />} />
          <Route path="issued-books" element={<IssuedBooks />} />
          <Route path="returned-books" element={<ReturnedBooks />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
