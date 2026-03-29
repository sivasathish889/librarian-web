import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import { addToast } from '../features/toastSlice';

/**
 * RTK Query global error middleware.
 * Intercepts all rejected API actions and dispatches an error toast.
 * Skips the login endpoint since that page handles errors inline.
 */
export const errorMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  if (isRejectedWithValue(action)) {
    // Skip login endpoint — it shows errors inline on the page
    const endpointName = action.meta?.arg?.endpointName;
    if (endpointName === 'login') {
      return next(action);
    }

    // Extract a human-readable message from the error payload
    const payload = action.payload as any;
    let message = 'Something went wrong. Please try again.';

    if (payload?.data?.message) {
      message = payload.data.message;
    } else if (payload?.error) {
      message = payload.error;
    } else if (typeof payload?.data === 'string') {
      message = payload.data;
    } else if (payload?.status === 'FETCH_ERROR') {
      message = 'Network error. Please check your connection.';
    }

    storeApi.dispatch(addToast({ message, type: 'error' }));
  }

  return next(action);
};
