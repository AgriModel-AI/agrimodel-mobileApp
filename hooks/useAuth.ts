// hooks/useAuth.ts
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import AuthService from '../services/api/authService';


interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    error: null
  });
  
  // Request state tracking
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false);
  const [isVerifyCodeLoading, setIsVerifyCodeLoading] = useState(false);
  const [isResendCodeLoading, setIsResendCodeLoading] = useState(false);
  
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const hasAuth = await AuthService.checkAuth();
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: hasAuth,
          isLoading: false
        }));
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to check authentication status'
        }));
      }
    };

    checkAuthentication();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Don't proceed if already loading
    if (isLoginLoading) return;

    
    setIsLoginLoading(true);
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      const response = await AuthService.login(email, password);
      setAuthState(prev => ({ 
        ...prev,
        isAuthenticated: true
      }));
      router.replace('/(authenticated)/(tabs)/home');
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setIsLoginLoading(false);
    }
  }, [isLoginLoading, router]);

  const signup = useCallback(async (
    email: string, 
    username: string, 
    password: string, 
    phone_number: string
  ) => {
    // Don't proceed if already loading
    if (isSignupLoading) return;
    
    setIsSignupLoading(true);
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      const response = await AuthService.signup({
        email, 
        username, 
        password, 
        phone_number
      });
      router.push(`/(auth)/verify?email=${encodeURIComponent(email)}`);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed. Please try again.';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setIsSignupLoading(false);
    }
  }, [isSignupLoading, router]);

  const forgotPassword = useCallback(async (email: string) => {
    // Don't proceed if already loading
    if (isForgotPasswordLoading) return;
    
    setIsForgotPasswordLoading(true);
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      const response = await AuthService.forgotPassword(email);
      router.push(`/(auth)/code?email=${encodeURIComponent(email)}`);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Request failed. Please try again.';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setIsForgotPasswordLoading(false);
    }
  }, [isForgotPasswordLoading, router]);

  const resetPassword = useCallback(async (
    email: string, 
    token: string, 
    password: string, 
    confirmPassword: string
  ) => {
    // Don't proceed if already loading
    if (isResetPasswordLoading) return;
    
    setIsResetPasswordLoading(true);
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      const response = await AuthService.resetPassword(
        email, 
        token, 
        password, 
        confirmPassword
      );
      router.replace('/(auth)/success');
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Password reset failed. Please try again.';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setIsResetPasswordLoading(false);
    }
  }, [isResetPasswordLoading, router]);

  const verifyCode = useCallback(async (email: string, code: string) => {
    // Don't proceed if already loading
    if (isVerifyCodeLoading) return;
    
    setIsVerifyCodeLoading(true);
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      const response = await AuthService.verifyCode(email, code);
      router.replace('/(auth)/success');
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Verification failed. Please try again.';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setIsVerifyCodeLoading(false);
    }
  }, [isVerifyCodeLoading, router]);

   const resendCode = useCallback(async (email: string) => {
    // Don't proceed if already loading
    if (isResendCodeLoading) return;
    
    setIsResendCodeLoading(true);
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      const response = await AuthService.resendCode(email);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resend code. Please try again.';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    } finally {
      setIsResendCodeLoading(false);
    }
  }, [isResendCodeLoading]);
  
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await AuthService.logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      router.replace('/(auth)/login');
    } catch (error: any) {
      const errorMessage = error.message || 'Logout failed. Please try again.';
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [router]);

  return {
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    login,
    isLoginLoading,
    signup,
    isSignupLoading,
    forgotPassword,
    isForgotPasswordLoading,
    resetPassword,
    isResetPasswordLoading,
    verifyCode,
    isVerifyCodeLoading,
    resendCode,
    isResendCodeLoading,
    logout
  };
};