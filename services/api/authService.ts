// services/api/authService.ts
import { AxiosError } from 'axios';
import TokenManager from '../storage/TokenManager';
import axiosInstance from './../../utils/axiosInstance';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface SignupData {
  email: string;
  username: string;
  password: string;
  phone_number: string;
}

interface ApiError {
  message: string;
  status?: number;
}

class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {

      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/client/login`,
        { email, password }
      );
      
      const { access_token, refresh_token } = response.data;
      
      // Store tokens
      await TokenManager.setTokens(access_token, refresh_token);
      
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  static async signup(data: SignupData): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/signup`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  static async forgotPassword(email: string): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/password-reset`,
        { email }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  static async resetPassword(
    email: string, 
    token: string, 
    new_password: string, 
    confirm_password: string
  ): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/password-reset/verify`,
        { email, token, new_password, confirm_password }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  static async verifyCode(email: string, code: string): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/validate-code`,
        { email, code }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  static async resendCode(email: string): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/resend-code`,
        { email }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  static async logout(): Promise<void> {
    try {
      // Clear tokens
      await TokenManager.clearTokens();
    } catch (error) {
      console.error('Error during logout:', error);
      // Always clear tokens even if API call fails
      await TokenManager.clearTokens();
    }
  }

  static async checkAuth(): Promise<boolean> {
    try {
      return await TokenManager.hasTokens();
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  private static handleError(error: AxiosError): never {
    const errorResponse = error.response?.data as any;
    const apiError: ApiError = {
      message: errorResponse?.message || 'An unknown error occurred',
      status: error.response?.status
    };
    
    console.error('API Error:', apiError);
    throw apiError;
  }
}

export default AuthService;