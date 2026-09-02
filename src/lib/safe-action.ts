import { createSafeActionClient } from 'next-safe-action';

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error('Server action failed:', e.message);
    return 'Oh no, something went wrong!';
  },
});
