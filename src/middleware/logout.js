import { destroyCookie } from 'nookies';

// Logout function to clear cookies
export const logoutUser = () => {
  destroyCookie(null, 'userType', { path: '/' });
  destroyCookie(null, 'userId', { path: '/' });
};
