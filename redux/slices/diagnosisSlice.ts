// store/slices/diagnosisSlice.ts
import DiagnosisService, { DiagnosisResult } from '@/services/storage/DiagnosisService';
import ModelService from '@/services/storage/ModelService';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { RootState } from '../persistConfig';
import { recordUsageAttempt } from './subscriptionSlice';

interface DiagnosisState {
  diagnoses: DiagnosisResult[];
  currentDiagnosis: DiagnosisResult | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: DiagnosisState = {
  diagnoses: [],
  currentDiagnosis: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchDiagnoses = createAsyncThunk<
  DiagnosisResult[],
  void,
  { state: RootState }
>('diagnosis/fetchAll', async (_, { getState }) => {
  return await DiagnosisService.getDiagnoses();
});

export const createDiagnosis = createAsyncThunk<
  DiagnosisResult,
  { imageUri: string; },
  { state: RootState; rejectValue: string }
>('diagnosis/create', async ({ imageUri }, { dispatch, rejectWithValue }) => {
  try {
    // Record usage attempt first
    const usageResult = await dispatch(recordUsageAttempt()).unwrap();
    
    // Check if daily limit reached
    if (usageResult?.usage.limitReached) {
      return rejectWithValue('Daily usage limit reached');
    }
    
    // Perform diagnosis
    const result = await DiagnosisService.diagnose(imageUri);
    return result;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create diagnosis');
  }
});

export const rateDiagnosis = createAsyncThunk<
  boolean,
  { diagnosisId: string; rating: number; feedback?: string; isCorrect?: boolean },
  { state: RootState; rejectValue: string }
>('diagnosis/rate', async ({ diagnosisId, rating, feedback, isCorrect }, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const diagnosis = state.diagnosis.diagnoses.find(d => d.diagnosisId === diagnosisId);
    
    if (!diagnosis) {
      return rejectWithValue('Diagnosis not found');
    }
    
    // Save rating to model service
    await ModelService.saveModelRating({
      offlineId: `rating-${diagnosisId}`,
      modelId: diagnosis.modelId,
      rating,
      feedback,
      diagnosisResult: diagnosis.diseaseName,
      diagnosisCorrect: isCorrect,
      cropType: diagnosis.cropName,
      deviceInfo: JSON.stringify({
        platform: Platform.OS,
        version: Platform.Version,
        manufacturer: 'manufacturer',
        model: 'model'
      })
    });
    
    // Mark diagnosis as rated
    await DiagnosisService.markDiagnosisAsRated(diagnosisId);
    
    return true;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to rate diagnosis');
  }
});

const diagnosisSlice = createSlice({
  name: 'diagnosis',
  initialState,
  reducers: {
    setCurrentDiagnosis(state, action: PayloadAction<DiagnosisResult | null>) {
      state.currentDiagnosis = action.payload;
    },
    clearCurrentDiagnosis(state) {
      state.currentDiagnosis = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiagnoses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiagnoses.fulfilled, (state, action) => {
        state.loading = false;
        state.diagnoses = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchDiagnoses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      })
      .addCase(createDiagnosis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDiagnosis.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDiagnosis = action.payload;
        state.diagnoses = [action.payload, ...state.diagnoses];
      })
      .addCase(createDiagnosis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      })
      .addCase(rateDiagnosis.fulfilled, (state, action) => {
        // Update the rated status in our list
        const diagnosisId = action.meta.arg.diagnosisId;
        state.diagnoses = state.diagnoses.map(diagnosis => {
          if (diagnosis.diagnosisId === diagnosisId) {
            return { ...diagnosis, isRated: true };
          }
          return diagnosis;
        });
        
        // Update current diagnosis if it's the one we rated
        if (state.currentDiagnosis?.diagnosisId === diagnosisId) {
          state.currentDiagnosis = { ...state.currentDiagnosis, isRated: true };
        }
      });
  },
});

export const { 
  setCurrentDiagnosis, 
  clearCurrentDiagnosis,
  clearError
} = diagnosisSlice.actions;
export default diagnosisSlice.reducer;