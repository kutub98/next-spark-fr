// D:\PersonalClientWork\quiz-contest\quiz-contest-fr\src\redux\features\questionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "@/data/api";

// Types
export interface IQuestionFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: string;
}

export interface IQuestion {
  _id: string;
  quizId:
    | string
    | {
        _id: string;
        title: string;
        [key: string]: unknown;
      };
  questionType: "MCQ" | "Short" | "Written";
  text: string;
  options?: string[]; // Only for MCQ questions
  correctAnswer?: string; // For MCQ and Short questions
  marks: number;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  // For Short and Written questions - image upload support
  uploadedImages?: IQuestionFile[];
  // For Written questions - additional fields
  wordLimit?: number;
  timeLimit?: number; // in minutes
  // For participation responses
  participantAnswer?: string;
  participantImages?: IQuestionFile[];
  isAnswered?: boolean;
  answeredAt?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface QuestionState {
  questions: IQuestion[];
  loading: boolean;
  error: string | null;
}

// Fetch all questions
export const fetchQuestions = createAsyncThunk<IQuestion[]>(
  "questions/fetchAll",
  async () => {
    const res = await axios.get(`${api}/questions?populate=quizId`);
    return res.data.data as IQuestion[];
  }
);

// Fetch questions by quiz ID
export const fetchQuestionsByQuizId = createAsyncThunk<IQuestion[], string>(
  "questions/fetchByQuizId",
  async (quizId) => {
    const res = await axios.get(
      `${api}/questions/quiz/${quizId}?populate=quizId`
    );
    return res.data.data as IQuestion[];
  }
);
export const createQuestion = createAsyncThunk<IQuestion, Partial<IQuestion>>(
  "questions/create",
  async (questionData) => {
    const res = await axios.post(`${api}/questions`, questionData);
    return res.data.data as IQuestion;
  }
);

export const updateQuestion = createAsyncThunk<
  IQuestion,
  { id: string; data: Partial<IQuestion> }
>("questions/update", async ({ id, data }) => {
  const res = await axios.put(`${api}/questions/${id}`, data);
  return res.data.data as IQuestion;
});

export const deleteQuestion = createAsyncThunk<string, string>(
  "questions/delete",
  async (id) => {
    await axios.delete(`${api}/questions/${id}`);
    return id;
  }
);

// Bulk delete questions
export const bulkDeleteQuestions = createAsyncThunk<string[], string[]>(
  "questions/bulkDelete",
  async (ids) => {
    const response = await axios.delete(`${api}/questions/bulk`, {
      data: { questionIds: ids },
    });

    // Return the deleted IDs from the response
    return response.data.data?.deletedIds || ids;
  }
);

// Upload images for questions
export const uploadQuestionImages = createAsyncThunk<IQuestionFile[], FileList>(
  "questions/uploadImages",
  async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    const res = await axios.post(`${api}/questions/upload-images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data as IQuestionFile[];
  }
);

// Update question with images
export const updateQuestionWithImages = createAsyncThunk<
  IQuestion,
  { id: string; images: IQuestionFile[] }
>("questions/updateWithImages", async ({ id, images }) => {
  const res = await axios.put(`${api}/questions/${id}/images`, {
    uploadedImages: images,
  });
  return res.data.data as IQuestion;
});

// Get questions by type
export const fetchQuestionsByType = createAsyncThunk<
  IQuestion[],
  { type: string; quizId?: string }
>("questions/fetchByType", async ({ type, quizId }) => {
  const params = new URLSearchParams();
  if (quizId) params.append("quizId", quizId);
  params.append("populate", "quizId");

  const res = await axios.get(
    `${api}/questions/type/${type}?${params.toString()}`
  );
  return res.data.data as IQuestion[];
});

// Bulk import questions
export const importQuestions = createAsyncThunk<
  IQuestion[],
  Partial<IQuestion>[]
>("questions/import", async (questionsData) => {
  const res = await axios.post(`${api}/questions/bulk`, {
    questions: questionsData,
  });
  return res.data.data as IQuestion[];
});

// Slice
const initialState: QuestionState = {
  questions: [],
  loading: false,
  error: null,
};

const questionSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchQuestions.fulfilled,
        (state, action: PayloadAction<IQuestion[]>) => {
          state.loading = false;
          state.questions = action.payload;
        }
      )
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching questions";
      })
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        createQuestion.fulfilled,
        (state, action: PayloadAction<IQuestion>) => {
          state.loading = false;
          state.questions.push(action.payload);
        }
      )
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error creating question";
      })
      .addCase(updateQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateQuestion.fulfilled,
        (state, action: PayloadAction<IQuestion>) => {
          state.loading = false;
          const index = state.questions.findIndex(
            (q) => q._id === action.payload._id
          );
          if (index !== -1) {
            state.questions.splice(index, 1, action.payload);
          }
        }
      )
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error updating question";
      })
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        deleteQuestion.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.questions = state.questions.filter(
            (q) => q._id !== action.payload
          );
        }
      )
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error deleting question";
      })
      .addCase(bulkDeleteQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        bulkDeleteQuestions.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.loading = false;
          state.questions = state.questions.filter(
            (q) => !action.payload.includes(q._id)
          );
        }
      )
      .addCase(bulkDeleteQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error deleting questions";
      })
      .addCase(fetchQuestionsByQuizId.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchQuestionsByQuizId.fulfilled,
        (state, action: PayloadAction<IQuestion[]>) => {
          state.loading = false;
          state.questions = action.payload;
        }
      )
      .addCase(fetchQuestionsByQuizId.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Error fetching questions for quiz";
      })
      .addCase(uploadQuestionImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadQuestionImages.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadQuestionImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error uploading images";
      })
      .addCase(updateQuestionWithImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateQuestionWithImages.fulfilled,
        (state, action: PayloadAction<IQuestion>) => {
          state.loading = false;
          const index = state.questions.findIndex(
            (q) => q._id === action.payload._id
          );
          if (index !== -1) {
            state.questions.splice(index, 1, action.payload);
          }
        }
      )
      .addCase(updateQuestionWithImages.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Error updating question with images";
      })
      .addCase(fetchQuestionsByType.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchQuestionsByType.fulfilled,
        (state, action: PayloadAction<IQuestion[]>) => {
          state.loading = false;
          state.questions = action.payload;
        }
      )
      .addCase(fetchQuestionsByType.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Error fetching questions by type";
      })
      .addCase(importQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        importQuestions.fulfilled,
        (state, action: PayloadAction<IQuestion[]>) => {
          state.loading = false;
          state.questions.push(...action.payload);
        }
      )
      .addCase(importQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error importing questions";
      });
  },
});

export default questionSlice.reducer;
