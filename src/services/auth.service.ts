import axios, { AxiosResponse } from "axios";
import { ENV } from "@/config/env";

interface AuthResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export class AuthService {
  private apiUrl: string = ENV.api_url;

  async login(
    email: string,
    password: string,
    authtype: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(`${this.apiUrl}/login`, { email, password, authtype });
  }

  async oneTapLogin(
    email: string,
    oneTapUser: boolean,
  ): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(`${this.apiUrl}/login`, { email, oneTapUser });
  }

  async loginV2(
    email: string,
    password: string,
    code: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(`${this.apiUrl}/v2/login`, { email, password, code });
  }

  async register(
    name: string,
    email: string,
    password: string,
    country: string,
    authtype: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(`${this.apiUrl}/register`, {
      name,
      email,
      password,
      country,
      authtype,
    });
  }

  async googleLogin(
    code: string,
    country: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(`${this.apiUrl}/google-login`, { code, country });
  }

  getGoogleOAuthUrl(): string {
    return `${this.apiUrl}/v2/google`;
  }

  async forgotPassword(email: string): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(`${this.apiUrl}/forgot-password`, { email });
  }

  async resetPassword(
    key: string,
    password: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(`${this.apiUrl}/reset-password/${key}`, { password });
  }

  async resendVerificationEmail(
    email: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(`${this.apiUrl}/send-verify-email`, { email });
  }

  async verifyEmail(key: string): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(`${this.apiUrl}/verify-email/${key}`);
  }

  async regenerateToken(token: string): Promise<AxiosResponse<AuthResponse>> {
    return axios.get(`${this.apiUrl}/token-generate`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addUserPermission(
    token: string,
    code: string,
    type: string,
  ): Promise<AxiosResponse<AuthResponse>> {
    return axios.post(
      `${this.apiUrl}/user-permission`,
      { code, type },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  }

  async checkPermissions(token: string): Promise<AxiosResponse<AuthResponse>> {
    return axios.get(`${this.apiUrl}/check-permission`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export default AuthService;
