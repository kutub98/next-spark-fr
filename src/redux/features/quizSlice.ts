import { api } from "@/data/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Quiz {
  _id: string;
  title: string;
  duration: number;
  totalMarks: number;
  questions: string[];
  isActive: boolean;
  passingMarks: number;
  instructions?: string;
  eventId:
    | string
    | {
        _id: string;
        title: string;
        [key: string]: unknown;
      };
  [key: string]: unknown;
}

interface QuizState {
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  selectedQuiz: null,
  loading: false,
  error: null,
};

// Create Quiz Thunk
export const createQuiz = createAsyncThunk(
  "quizzes/createQuiz",
  async (quizData: Partial<Quiz>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${api}/quizzes`, quizData);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to create quiz"
          : "Failed to create quiz";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get All Quizzes Thunk
export const getQuizzes = createAsyncThunk(
  "quizzes/getQuizzes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${api}/quizzes?populate=eventId`);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to fetch quizzes"
          : "Failed to fetch quizzes";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get Quiz By ID Thunk
export const getQuizById = createAsyncThunk(
  "quizzes/getQuizById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${api}/quizzes/${id}?populate=eventId`);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to fetch quiz"
          : "Failed to fetch quiz";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get Quizzes By Event ID Thunk
export const getQuizzesByEventId = createAsyncThunk(
  "quizzes/getQuizzesByEventId",
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${api}/quizzes/event/${eventId}?populate=eventId`
      );
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to fetch quizzes for this event"
          : "Failed to fetch quizzes for this event";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update Quiz Thunk
export const updateQuiz = createAsyncThunk(
  "quizzes/updateQuiz",
  async (
    { id, data }: { id: string; data: Partial<Quiz> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(`${api}/quizzes/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to update quiz"
          : "Failed to update quiz";
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete Quiz Thunk
export const deleteQuiz = createAsyncThunk(
  "quizzes/deleteQuiz",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${api}/quizzes/${id}`);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to delete quiz"
          : "Failed to delete quiz";
      return rejectWithValue(errorMessage);
    }
  }
);

const quizSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    clearSelectedQuiz: (state) => {
      state.selectedQuiz = null;
    },
  },
  extraReducers: (builder) => {
    // Create Quiz
    builder
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Quizzes By Event ID
    builder
      .addCase(getQuizzesByEventId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuizzesByEventId.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(getQuizzesByEventId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get All Quizzes
    builder
      .addCase(getQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(getQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Quiz By ID
    builder
      .addCase(getQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedQuiz = action.payload;
      })
      .addCase(getQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Quiz
    builder
      .addCase(updateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.quizzes.findIndex(
          (quiz) => quiz._id === action.payload._id
        );
        if (index !== -1) {
          state.quizzes.splice(index, 1, action.payload);
        }
        if (state.selectedQuiz?._id === action.payload._id) {
          state.selectedQuiz = action.payload;
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Quiz
    builder
      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = state.quizzes.filter(
          (quiz) => quiz._id !== action.payload
        );
        if (state.selectedQuiz?._id === action.payload) {
          state.selectedQuiz = null;
        }
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedQuiz } = quizSlice.actions;
export default quizSlice.reducer;
