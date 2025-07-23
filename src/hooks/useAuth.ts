import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { 
  login, 
  logout, 
  register, 
  checkAuthStatus, 
  requestPasswordReset, 
  resetPassword 
} from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated, loading, error } = useAppSelector(state => state.auth);

  const loginUser = (credentials: any) => {
    return dispatch(login(credentials));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const registerUser = (userData: any) => {
    return dispatch(register(userData));
  };

  const checkAuth = () => {
    dispatch(checkAuthStatus());
  };

  const handleForgotPassword = (email: string) => {
    return dispatch(requestPasswordReset(email));
  };

  const handleResetPassword = (data: { token: string; password: string }) => {
    return dispatch(resetPassword(data));
  };

  return {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login: loginUser,
    logout: logoutUser,
    register: registerUser,
    checkAuth,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword
  };
};

export default useAuth;