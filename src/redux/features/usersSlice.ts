import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "@/data/api";
import { User } from "./auth/authSlice";

// Extended User interface for admin purposes
export interface AdminUser extends User {
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface UserParticipation {
  _id: string;
  studentId: string;
  quizId: string;
  answers: Array<{
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    marksObtained: number;
    participantAnswer?: string;
    participantImages?: string[];
  }>;
  totalScore: number;
  status: "completed" | "failed" | "pending";
  createdAt: string;
  updatedAt: string;
  quiz?: {
    _id: string;
    title: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
  };
  event?: {
    _id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    status: "upcoming" | "ongoing" | "completed";
  };
}

export interface UserDetails {
  user: AdminUser;
  participations: UserParticipation[];
}

interface UsersState {
  users: AdminUser[];
  selectedUserDetails: UserDetails | null;
  loading: boolean;
  detailsLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUserDetails: null,
  loading: false,
  detailsLoading: false,
  error: null,
};

// Create axios instance with auth header
const createAuthAxios = () => {
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

  return authApi;
};

// Get All Users for Admin
export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const authApi = createAuthAxios();
      const response = await authApi.get("/auth/admin/users");
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to fetch users"
          : "Failed to fetch users";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get User Details with Participations
export const getUserDetails = createAsyncThunk(
  "users/getUserDetails",
  async (userId: string, { rejectWithValue }) => {
    try {
      const authApi = createAuthAxios();
      const response = await authApi.get(`/auth/admin/users/${userId}`);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to fetch user details"
          : "Failed to fetch user details";
      return rejectWithValue(errorMessage);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearSelectedUserDetails: (state) => {
      state.selectedUserDetails = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get All Users
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get User Details
    builder
      .addCase(getUserDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedUserDetails = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedUserDetails, clearError } = usersSlice.actions;
export default usersSlice.reducer;

// Selectors
export const selectAllUsers = (state: { users: UsersState }) =>
  state.users.users;
export const selectUsersLoading = (state: { users: UsersState }) =>
  state.users.loading;
export const selectSelectedUserDetails = (state: { users: UsersState }) =>
  state.users.selectedUserDetails;
export const selectDetailsLoading = (state: { users: UsersState }) =>
  state.users.detailsLoading;
export const selectUsersError = (state: { users: UsersState }) =>
  state.users.error;
