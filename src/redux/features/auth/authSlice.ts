// src/redux/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AxiosError } from "axios";
import { api } from "@/data/api";
import { toast } from "sonner";

// Define types
export interface User {
  _id: string;
  fullNameBangla: string;
  fullNameEnglish: string;
  contact: string;
  contactType: "phone" | "email";
  role: "student" | "admin";
  whatsappNumber?: string;
  age?: number;
  grade?: string;
  institutionName?: string;
  institutionAddress?: string;
  rollId?: string;
  address?: string;
  profileImage?: string;
  bloodGroup?: string;
  parentContact?: string;
  specialNeeds?: string;
  hasSmartphone?: boolean;
  interests?: string[];
  futureGoals?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender?: string;
  union?: string;
  postOffice?: string;
  upazila?: string;
  district?: string;
  division?: string;
  internetUsage?: "always" | "sometimes" | "never";
  preferredSubjects?: string[];
}

export interface RegisterPayload {
  fullNameBangla: string;
  fullNameEnglish: string;
  contact: string;
  contactType: "phone" | "email";
  password: string;
  age?: number;
  grade?: string;
  institutionAddress?: string;
  rollId?: string;
  address?: string;
  bloodGroup?: string;
  parentContact?: string;
  interests?: string[];
  futureGoals?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean; // Add this to track initialization
  userCheckLoading: boolean;
  userCheckError: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isAuthInitialized: false, // Initialize as false
  userCheckLoading: false,
  userCheckError: null,
};

// Create axios instance with auth header
const authApi = axios.create({
  baseURL: api,
});

// Add auth token to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// Async thunks
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Set the token in the axios instance
        authApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await authApi.get("/auth/profile");
        const user = response.data.data;
        console.log("Initialize Auth User:", user);
        return { user, token };
      }
      return rejectWithValue("No token found");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      console.error("Initialize Auth Error:", err.response?.data);
      localStorage.removeItem("token");
      return rejectWithValue(
        err.response?.data?.message || "Failed to initialize auth"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { contact, password }: { contact: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.post("/auth/login", { contact, password });
      const { user, token } = response.data.data;
      console.log("Login Response:", { user, token });
      localStorage.setItem("token", token);
      return { user, token };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      console.error("Login Error:", err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.post("/auth/register", userData);
      const { user, token } = response.data.data;
      console.log("Register Response:", { user, token });
      localStorage.setItem("token", token);
      return { user, token };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      console.error("Register Error:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const checkUserExists = createAsyncThunk(
  "auth/checkUserExists",
  async (
    {
      contact,
      contactType,
    }: { contact: string; contactType: "phone" | "email" },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.post("/auth/check-user", {
        contact,
        contactType,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to check user"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const token =
        localStorage.getItem("token") ||
        (getState() as { auth: AuthState }).auth.token;

      if (token) {
        try {
          await authApi.post(
            "/auth/logout",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (apiError) {
          console.warn(
            "Logout API call failed, but clearing local data:",
            apiError
          );
        }
      }
      localStorage.removeItem("token");
      dispatch(clearCredentials());
      return true;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      localStorage.removeItem("token");
      dispatch(clearCredentials());
      return rejectWithValue(
        err.response?.data?.message || "Logout completed with warnings"
      );
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.get("/auth/profile");
      console.log("Fetched User Profile:", response.data.data); // লগ যোগ করা
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      console.error("Fetch Profile Error:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: FormData, { rejectWithValue }) => {
    try {
      const response = await authApi.put("/auth/profile", profileData);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        err.response?.data?.message || "Failed to change password"
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isAuthInitialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isAuthInitialized = true;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isAuthInitialized = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isAuthInitialized = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check user exists
    builder
      .addCase(checkUserExists.pending, (state) => {
        state.userCheckLoading = true;
        state.userCheckError = null;
      })
      .addCase(checkUserExists.fulfilled, (state) => {
        state.userCheckLoading = false;
        state.userCheckError = null;
      })
      .addCase(checkUserExists.rejected, (state, action) => {
        state.userCheckLoading = false;
        state.userCheckError = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Fetch profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthInitialized = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        toast.success("Password changed successfully");
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error((action.payload as string) || "Failed to change password");
      });
  },
});

// Export actions
export const { setCredentials, clearCredentials, setError, clearError } =
  authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsAuthInitialized = (state: { auth: AuthState }) =>
  state.auth.isAuthInitialized;
export const selectUserCheckLoading = (state: { auth: AuthState }) =>
  state.auth.userCheckLoading;
export const selectUserCheckError = (state: { auth: AuthState }) =>
  state.auth.userCheckError;
