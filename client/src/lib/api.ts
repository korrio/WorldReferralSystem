import { apiRequest } from "./queryClient";
import { type User, type InsertUser, type LoginCredentials, type InsertReferral } from "@shared/schema";

export const authApi = {
  register: async (userData: InsertUser) => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  },

  login: async (credentials: LoginCredentials) => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },
};

export const userApi = {
  getUser: async (id: string) => {
    const response = await apiRequest("GET", `/api/users/${id}`);
    return response.json();
  },

  getUserStats: async (id: string) => {
    const response = await apiRequest("GET", `/api/users/${id}/stats`);
    return response.json();
  },

  getUserReferrals: async (id: string) => {
    const response = await apiRequest("GET", `/api/users/${id}/referrals`);
    return response.json();
  },
};

export const referralApi = {
  createReferral: async (referralData: InsertReferral) => {
    const response = await apiRequest("POST", "/api/referrals", referralData);
    return response.json();
  },

  verifyReferral: async (id: string) => {
    const response = await apiRequest("PATCH", `/api/referrals/${id}/verify`);
    return response.json();
  },

  getStats: async () => {
    const response = await apiRequest("GET", "/api/referrals/stats");
    return response.json();
  },
};
