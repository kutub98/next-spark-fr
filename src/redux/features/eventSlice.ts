import { api } from "@/data/api";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  quizzes: string[];
  isActive: boolean;
  status: "upcoming" | "ongoing" | "completed";
  participants: string[] | Participant[];
  [key: string]: unknown;
}

export interface Participant {
  _id: string;
  fullNameEnglish: string;
  fullNameBangla: string;
  contact: string;
  role: string;
}

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
};

// Create Event Thunk
export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData: Partial<Event>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${api}/events`, eventData);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to create event"
          : "Failed to create event";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get All Events Thunk
export const getEvents = createAsyncThunk(
  "events/getEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${api}/events`);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to fetch events"
          : "Failed to fetch events";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get Event By ID Thunk
export const getEventById = createAsyncThunk(
  "events/getEventById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${api}/events/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to fetch event"
          : "Failed to fetch event";
      return rejectWithValue(errorMessage);
    }
  }
);

// Update Event Thunk
export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async (
    { id, data }: { id: string; data: Partial<Event> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(`${api}/events/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to update event"
          : "Failed to update event";
      return rejectWithValue(errorMessage);
    }
  }
);

// Add Participant to Event Thunk
export const addParticipant = createAsyncThunk(
  "events/addParticipant",
  async (
    { eventId, studentId }: { eventId: string; studentId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${api}/events/add-participant`, {
        eventId,
        studentId,
      });
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to add participant"
          : "Failed to add participant";
      return rejectWithValue(errorMessage);
    }
  }
);

// Get Event with Participants Thunk
export const getEventWithParticipants = createAsyncThunk(
  "events/getEventWithParticipants",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${api}/events/${id}/participants`);
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to fetch event with participants"
          : "Failed to fetch event with participants";
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete Event Thunk
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${api}/events/${id}`);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to delete event"
          : "Failed to delete event";
      return rejectWithValue(errorMessage);
    }
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    // Create Event
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get All Events
    builder
      .addCase(getEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Event By ID
    builder
      .addCase(getEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Event
    builder
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex(
          (event) => event._id === action.payload._id
        );
        if (index !== -1) {
          state.events.splice(index, 1, action.payload);
        }
        if (state.selectedEvent?._id === action.payload._id) {
          state.selectedEvent = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Participant
    builder
      .addCase(addParticipant.pending, (state) => {
        // Don't set loading to true for addParticipant to avoid UI blocking
        state.error = null;
      })
      .addCase(addParticipant.fulfilled, (state, action) => {
        // Don't set loading to false since we didn't set it to true
        // Update the event in the events array
        const index = state.events.findIndex(
          (event) => event._id === action.payload._id
        );
        if (index !== -1) {
          state.events.splice(index, 1, action.payload);
        }
        // Update selected event if it's the same
        if (state.selectedEvent?._id === action.payload._id) {
          state.selectedEvent = action.payload;
        }
      })
      .addCase(addParticipant.rejected, (state, action) => {
        // Don't set loading to false since we didn't set it to true
        // Don't set error for addParticipant to avoid blocking event loading
        console.log("Add participant failed:", action.payload);
      });

    // Get Event with Participants
    builder
      .addCase(getEventWithParticipants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventWithParticipants.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(getEventWithParticipants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Event
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(
          (event) => event._id !== action.payload
        );
        if (state.selectedEvent?._id === action.payload) {
          state.selectedEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedEvent } = eventSlice.actions;
export default eventSlice.reducer;
