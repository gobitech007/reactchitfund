import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DataService } from '../../services';
import { ChitListItem } from '../../utils/interface-utils';
import { RootState } from '../store';

interface DataState {
  chitList: ChitListItem[];
  loading: boolean;
  error: string | null;
  id: string;
}

const initialState: DataState = {
  chitList: [],
  loading: false,
  error: null,
  id: ''
};

// Async thunks
// In dataSlice.ts
export const fetchChitList = createAsyncThunk(
  'data/fetchChitList',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get the current user ID from the auth state
      const userId = (getState() as RootState).auth.currentUser?.id;
      
      // Add pagination parameters
      const response = await DataService.getChitList(userId, 0, 10);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data || []; // Return empty array if data is null
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch chit list');
    }
  }
);

export const createChit = createAsyncThunk(
  'data/createChit',
  async (chitData: Partial<ChitListItem>, { rejectWithValue }) => {
    try {
      const response = await DataService.createChit(chitData);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create chit');
    }
  }
);

export const updateChit = createAsyncThunk(
  'data/updateChit',
  async ({ id, data }: { id: string; data: Partial<ChitListItem> }, { rejectWithValue }) => {
    try {
      const response = await DataService.updateChit(id, data);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update chit');
    }
  }
);

export const deleteChit = createAsyncThunk(
  'data/deleteChit',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await DataService.deleteChit(id);
      
      if (response.error) {
        return rejectWithValue(response.error);
      }
      
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete chit');
    }
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    clearDataError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chit list
      .addCase(fetchChitList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChitList.fulfilled, (state, action: PayloadAction<ChitListItem[]>) => {
        state.loading = false;
        state.chitList = action.payload || [];
      })
      .addCase(fetchChitList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create chit
      .addCase(createChit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChit.fulfilled, (state, action: PayloadAction<ChitListItem>) => {
        state.loading = false;
        state.chitList.push(action.payload);
      })
      .addCase(createChit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update chit
      .addCase(updateChit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChit.fulfilled, (state, action: PayloadAction<ChitListItem>) => {
        state.loading = false;
        const index = state.chitList.findIndex(chit => chit.id === action.payload.id);
        if (index !== -1) {
          state.chitList[index] = action.payload;
        }
      })
      .addCase(updateChit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete chit
      .addCase(deleteChit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChit.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.chitList = state.chitList.filter(chit => chit.id !== action.payload);
      })
      .addCase(deleteChit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDataError } = dataSlice.actions;
export default dataSlice.reducer;