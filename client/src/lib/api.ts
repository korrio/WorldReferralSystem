import { apiRequest } from "./queryClient";

export const referralApi = {
  assignReferral: async (ipAddress?: string, userAgent?: string) => {
    const response = await apiRequest("POST", "/api/assign-referral", {
      ipAddress,
      userAgent,
    });
    return response.json();
  },
  
  getStats: async () => {
    const response = await apiRequest("GET", "/api/stats");
    return response.json();
  },
  
  getMembers: async () => {
    const response = await apiRequest("GET", "/api/members");
    return response.json();
  },
};