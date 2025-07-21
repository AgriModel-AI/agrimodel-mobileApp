// services/SyncService.ts
import { store } from '@/redux/persistConfig';
import { addDistrict } from '@/redux/slices/userDetailsSlice';
import axiosInstance from '@/utils/axiosInstance';
import NetworkService from './../NetworkService';
import DiagnosisService from './DiagnosisService';
import ModelService from './ModelService';

class SyncService {
  private isSyncing = false;

  async performSync(): Promise<boolean> {
    if (this.isSyncing || !NetworkService.isNetworkConnected()) {
      return false;
    }

    try {
      this.isSyncing = true;
      console.log('Starting sync operation...');

      // await ModelService.clearAllData()

      // Process any pending user detail updates
      // await this.processPendingUserDetailActions();

      // 1. Check for model updates
      // await ModelService.checkForUpdates();

      // 2. Sync crops and diseases
      // await CropDiseaseService.syncCrops();
      // await CropDiseaseService.syncDiseases();

      // 3. Sync unsynced model ratings
      // await this.syncModelRatings();

      // 4. Sync unsynced diagnoses
      // await this.syncDiagnoses();

      // 5. Sync subscription usage
      // await SubscriptionService.fetchSubscriptionUsage(true);

      console.log('Sync completed successfully');
      return true;
    } catch (error) {
      console.error('Error during sync:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncModelRatings(): Promise<void> {
    const unsynced = await ModelService.getUnsyncedRatings();
    
    if (unsynced.length === 0) {
      return;
    }
    
    console.log(`Syncing ${unsynced.length} model ratings...`);
    
    const syncedIds: string[] = [];
    
    for (const rating of unsynced) {
      try {
        await axiosInstance.post(`/models/${rating.modelId}/rate`, {
          offlineId: rating.offlineId,
          rating: rating.rating,
          feedback: rating.feedback,
          diagnosisResult: rating.diagnosisResult,
          diagnosisCorrect: rating.diagnosisCorrect,
          cropType: rating.cropType,
          deviceInfo: rating.deviceInfo
        });
        
        syncedIds.push(rating.offlineId);
      } catch (error) {
        console.error(`Error syncing rating ${rating.offlineId}:`, error);
      }
    }
    
    if (syncedIds.length > 0) {
      await ModelService.markRatingsAsSynced(syncedIds);
      console.log(`Successfully synced ${syncedIds.length} model ratings`);
    }
  }

  private async syncDiagnoses(): Promise<void> {
    const unsynced = await DiagnosisService.getUnsyncedDiagnoses();
    
    if (unsynced.length === 0) {
      return;
    }
    
    console.log(`Syncing ${unsynced.length} diagnoses...`);
    
    const syncedIds: string[] = [];
    
    for (const diagnosis of unsynced) {
      try {
        // Implement API call to sync diagnosis results
        // This will depend on your specific API structure
        await axiosInstance.post(`/diagnoses/sync`, {
          diagnosisId: diagnosis.diagnosisId,
          modelId: diagnosis.modelId,
          modelVersion: diagnosis.modelVersion,
          cropName: diagnosis.cropName,
          diseaseLabel: diagnosis.diseaseLabel,
          diseaseName: diagnosis.diseaseName,
          confidence: diagnosis.confidence,
          timestamp: diagnosis.timestamp
        });
        
        syncedIds.push(diagnosis.diagnosisId);
      } catch (error) {
        console.error(`Error syncing diagnosis ${diagnosis.diagnosisId}:`, error);
      }
    }
    
    if (syncedIds.length > 0) {
      await DiagnosisService.markDiagnosesAsSynced(syncedIds);
      console.log(`Successfully synced ${syncedIds.length} diagnoses`);
    }
  }

  private async processPendingUserDetailActions(): Promise<void> {
    const state = store.getState();
    const pendingActions = state.userDetails.pendingActions;
    
    if (pendingActions.length === 0) {
      return;
    }
    
    console.log(`Processing ${pendingActions.length} pending user detail actions...`);
    
    for (const action of pendingActions) {
      try {
        if (action.type === 'userDetails/addDistrict') {
          await store.dispatch(addDistrict(action.payload));
        }
        // Add other action types as needed
      } catch (error) {
        console.error(`Error processing action ${action.type}:`, error);
      }
    }
  }
}

export default new SyncService();