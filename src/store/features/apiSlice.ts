import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// const baseQueryWithReauth: BaseQueryFn<
//   string | FetchArgs,
//   unknown,
//   FetchBaseQueryError
// > = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);

//   if (result.error && (result.error.status === 401 || result.error.status === 403)) {
//     api.dispatch(logout());
//   }

//   return result;
// };

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Students', 'Books', 'Transactions', 'Dashboard'],
  endpoints: (builder) => ({
    // Student search with separate filters
    searchStudents: builder.query<any[], { registerNumber?: string; name?: string; department?: string }>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.registerNumber) params.set('registerNumber', filters.registerNumber);
        if (filters.name) params.set('name', filters.name);
        if (filters.department) params.set('department', filters.department);
        return `/users/search?${params.toString()}`;
      },
      providesTags: ['Students'],
    }),

    // Book search (used by IssueBook page)
    searchBooks: builder.query<any[], string>({
      query: (search) => `/books?search=${encodeURIComponent(search)}`,
      providesTags: ['Books'],
    }),

    // Get all books (with optional search)
    getBooks: builder.query<any[], string | void>({
      query: (search) => search ? `/books?search=${encodeURIComponent(search)}` : '/books',
      providesTags: ['Books'],
    }),

    // Create book
    createBook: builder.mutation<any, { title: string; author: string; bookCode: string; rackNumber?: string; stock: number }>({
      query: (body) => ({
        url: '/books',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Books', 'Dashboard'],
    }),

    // Update book
    updateBook: builder.mutation<any, { id: number; title: string; author: string; bookCode: string; rackNumber?: string; stock: number }>({
      query: ({ id, ...body }) => ({
        url: `/books/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Books', 'Dashboard'],
    }),

    // Delete book
    deleteBook: builder.mutation<any, number>({
      query: (id) => ({
        url: `/books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Books', 'Dashboard'],
    }),

    // Issue book
    issueBook: builder.mutation<any, { userId: number; bookId: number }>({
      query: (body) => ({
        url: '/transactions/issue',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Books', 'Transactions', 'Dashboard'],
    }),

    // Get all transactions
    getTransactions: builder.query<any[], void>({
      query: () => '/transactions',
      providesTags: ['Transactions'],
    }),

    // Dashboard stats
    getDashboard: builder.query<any, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),

    // Get issued books with server-side search + pagination
    getIssuedBooks: builder.query<any, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 25, search = '' }) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        return `/transactions/issued?${params.toString()}`;
      },
      providesTags: ['Transactions'],
    }),

    // Return book
    returnBook: builder.mutation<any, number>({
      query: (transactionId) => ({
        url: `/transactions/${transactionId}/return`,
        method: 'PUT',
      }),
      invalidatesTags: ['Books', 'Transactions', 'Dashboard'],
    }),

    // Get issued books for a specific user
    getIssuedBooksByUser: builder.query<any[], number>({
      query: (userId) => `/transactions/issued-by-user/${userId}`,
      providesTags: ['Transactions'],
    }),

    // Get returned books with server-side search + pagination
    getReturnedBooks: builder.query<any, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 25, search = '' }) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        return `/transactions/returned?${params.toString()}`;
      },
      providesTags: ['Transactions'],
    }),

    // Get missing books with server-side search + pagination
    getMissingBooks: builder.query<any, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 25, search = '' }) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        return `/transactions/missing?${params.toString()}`;
      },
      providesTags: ['Transactions'],
    }),

    // Mark book as missing (manual entry)
    markBookMissingManual: builder.mutation<any, { userId: number; bookId: number; fineAmount: number }>({
      query: (body) => ({
        url: '/transactions/missing-manual',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Books', 'Transactions', 'Dashboard'],
    }),

    // Login
    login: builder.mutation<{ user: any; token: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const {
  useLazySearchStudentsQuery,
  useLazySearchBooksQuery,
  useIssueBookMutation,
  useReturnBookMutation,
  useLazyGetIssuedBooksByUserQuery,
  useGetReturnedBooksQuery,
  useGetTransactionsQuery,
  useGetDashboardQuery,
  useGetIssuedBooksQuery,
  useGetBooksQuery,
  useGetMissingBooksQuery,
  useMarkBookMissingManualMutation,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useLoginMutation,
} = apiSlice;
