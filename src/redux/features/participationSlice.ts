import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "@/data/api";

// Types
export interface IAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  marksObtained: number;
  participantAnswer?: string;
  participantImages?: string[];
}

export interface IStudent {
  _id: string;
  fullNameEnglish: string;
  fullNameBangla: string;
  contact: string;
}

export interface IQuiz {
  _id: string;
  title: string;
  eventId: string;
  duration: number;
  totalMarks: number;
  questions: unknown[];
  isActive: boolean;
  passingMarks: number;
  instructions: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IParticipation {
  _id: string;
  studentId: string | IStudent;
  quizId: string | IQuiz;
  answers: IAnswer[];
  totalScore: number;
  status: "completed" | "failed" | "pending";
  createdAt: string;
  updatedAt: string;
}

export interface ParticipationState {
  participations: IParticipation[];
  loading: boolean;
  error: string | null;
}

// Async thunks
export const fetchParticipations = createAsyncThunk<IParticipation[]>(
  "participations/fetchAll",
  async (_, { getState }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const res = await axios.get(`${api}/participations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data as IParticipation[];
  }
);

export const createParticipation = createAsyncThunk<
  IParticipation,
  {
    studentId: string;
    quizId: string;
    answers: IAnswer[];
    totalScore: number;
    status: "completed" | "failed" | "pending";
  }
>("participations/create", async (participationData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const res = await axios.post(`${api}/participations`, participationData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data as IParticipation;
});

export const checkParticipation = createAsyncThunk(
  "participations/check",
  async ({ studentId, quizId }: { studentId: string; quizId: string }) => {
    const res = await axios.post(`${api}/participations/check`, {
      studentId,
      quizId,
    });
    return res.data;
  }
);

export const updateParticipation = createAsyncThunk<
  IParticipation,
  { id: string; data: Partial<IParticipation> }
>("participations/update", async ({ id, data }) => {
  const res = await axios.patch(`${api}/participations/${id}`, data);
  return res.data.data as IParticipation;
});

export const deleteParticipation = createAsyncThunk<string, string>(
  "participations/delete",
  async (id) => {
    await axios.delete(`${api}/participations/${id}`);
    return id;
  }
);

export const getParticipationById = createAsyncThunk<IParticipation, string>(
  "participations/getById",
  async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const res = await axios.get(`${api}/participations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data as IParticipation;
  }
);

export const getParticipationsByQuiz = createAsyncThunk<
  IParticipation[],
  string
>("participations/getByQuiz", async (quizId) => {
  const res = await axios.get(`${api}/participations/quiz/${quizId}`);
  return res.data.data as IParticipation[];
});

// Slice
const initialState: ParticipationState = {
  participations: [],
  loading: false,
  error: null,
};

const participationSlice = createSlice({
  name: "participations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParticipations.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchParticipations.fulfilled,
        (state, action: PayloadAction<IParticipation[]>) => {
          state.loading = false;
          state.participations = action.payload;
        }
      )
      .addCase(fetchParticipations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching participations";
      })
      .addCase(
        createParticipation.fulfilled,
        (state, action: PayloadAction<IParticipation>) => {
          state.participations.push(action.payload);
        }
      )
      .addCase(checkParticipation.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkParticipation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkParticipation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error checking participation";
      })
      .addCase(updateParticipation.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateParticipation.fulfilled,
        (state, action: PayloadAction<IParticipation>) => {
          state.loading = false;
          const index = state.participations.findIndex(
            (p) => p._id === action.payload._id
          );
          if (index !== -1) {
            state.participations.splice(index, 1, action.payload);
          }
        }
      )
      .addCase(updateParticipation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error updating participation";
      })
      .addCase(
        deleteParticipation.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.participations = state.participations.filter(
            (p) => p._id !== action.payload
          );
        }
      )
      .addCase(getParticipationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getParticipationById.fulfilled,
        (state, action: PayloadAction<IParticipation>) => {
          state.loading = false;
          const existingIndex = state.participations.findIndex(
            (p) => p._id === action.payload._id
          );
          if (existingIndex !== -1) {
            state.participations[existingIndex] = action.payload;
          } else {
            state.participations.push(action.payload);
          }
        }
      )
      .addCase(getParticipationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching participation";
      })
      .addCase(getParticipationsByQuiz.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getParticipationsByQuiz.fulfilled,
        (state, action: PayloadAction<IParticipation[]>) => {
          state.loading = false;
          // Merge with existing participations, avoiding duplicates
          const newParticipations = action.payload.filter(
            (newPart) =>
              !state.participations.some(
                (existing) => existing._id === newPart._id
              )
          );
          state.participations = [
            ...state.participations,
            ...newParticipations,
          ];
        }
      )
      .addCase(getParticipationsByQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Error fetching quiz participations";
      });
  },
});

export default participationSlice.reducer;
