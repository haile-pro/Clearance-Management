import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
   if (error.response?.status === 401 && (error.response.data as { expired?: boolean })?.expired) {
  
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      console.error("API Error Response:", error.response.data);
      console.error("API Error Status:", error.response.status);
    } else if (error.request) {
      console.error("API No Response Error:", error.request);
    } else {
      console.error("API Request Setup Error:", error.message);
    }
    return Promise.reject(error);
  }
);

interface DashboardStats {
  pendingRequests: number;
  completedClearances: number;
  averageProcessingTime: string;
  rejectionRate: string;
  totalUsers: number;
  totalRequests: number;
  requestsByType: {
    [key: string]: number;
  };
  recentRequests: Array<{
    id: string;
    requester: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export const getAdminDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get<DashboardStats>('/requests/admin-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw error;
  }
};


export const submitClearanceRequest = async (formData: FormData) => {
  try {
    const response = await apiClient.post('/requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting clearance request:', error);
    throw error;
  }
};
export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (username: string, email: string, password: string) => {
  const response = await apiClient.post('/auth/register', { username, email, password });
  return response.data;
};

export const getUserDashboardStats = async () => {
  const response = await apiClient.get('/requests/user-stats');
  return response.data;
};




export const getClearanceRequests = async () => {
  const response = await apiClient.get('/requests');
  return response.data;
};
export const getClearanceRequestDetails = async (requestId: string) => {
  if (!requestId) {
    throw new Error('Request ID is required');
  }
  try {
    const response = await apiClient.get(`/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clearance request details:', error);
    throw error;
  }
};

export const updateClearanceRequest = async (requestId: string, updateData: any) => {
  const response = await apiClient.put(`/requests/${requestId}`, updateData);
  return response.data;
};

// ... other imports and functions

export const addComment = async (requestId: string, comment: string) => {
  try {
    const response = await apiClient.post(`/requests/${requestId}/comments`, { text: comment });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


export const getUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
};



export default apiClient;