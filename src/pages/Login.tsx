import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/features/authSlice';
import { useLoginMutation } from '../store/features/apiSlice';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login({ email, password }).unwrap();

      if (data.user?.role !== 'LIBRARIAN' && data.user?.role !== 'ADMIN') {
        throw new Error('Access denied. Staff only.');
      }

      dispatch(loginSuccess({ user: data.user, token: data.token }));
    } catch {
      // RTK Query handles the error state automatically for API errors.
      // Only non-API errors (like role check) need manual handling.
    }
  };

  const errorMessage = error
    ? ('data' in error ? (error.data as any)?.message : 'Login failed')
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-500">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Librarian Portal</h1>
          <p className="text-slate-500 mt-2">Sign in to manage library operations</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

          <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700" isLoading={isLoading}>
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
};
