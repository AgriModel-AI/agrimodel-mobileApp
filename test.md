# Plant Disease Diagnosis App Implementation

I'll create a comprehensive implementation for your agricultural diagnosis app that works offline and handles all the requirements. Let's start with the core services and components.

## Core Services Setup

### 1. Model Service

```typescript
// services/ModelService.ts
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import axios from '@/utils/axiosInstance';
import { API_BASE_URL } from '@/config';
import NetworkService from './NetworkService';

// Model related types
export interface ModelInfo {
  modelId: string;
  version: string;
  fileSize: number;
  fileHash: string;
  configSize: number;
  configHash: string;
  accuracy: number;
  releaseDate: string;
  isActive: boolean;
}

export interface ModelRating {
  offlineId: string;
  modelId: string;
  rating: number;
  feedback?: string;
  diagnosisResult?: string;
  diagnosisCorrect?: boolean;
  cropType?: string;
  deviceInfo?: string;
  synced: boolean;
  createdAt: string;
}

class ModelService {
  private db: SQLite.SQLiteDatabase;
  private modelDir = FileSystem.documentDirectory + 'models/';
  private initialized = false;

  constructor() {
    this.db = SQLite.openDatabase('agridiagnosis.db');
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(this.modelDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.modelDir, { intermediates: true });
      }

      // Initialize database tables
      await this.initDatabase();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing ModelService:', error);
      throw error;
    }
  }

  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Model information table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS model (
              modelId TEXT PRIMARY KEY,
              version TEXT NOT NULL,
              fileSize INTEGER NOT NULL,
              fileHash TEXT NOT NULL,
              configSize INTEGER NOT NULL,
              configHash TEXT NOT NULL,
              accuracy REAL,
              modelPath TEXT NOT NULL,
              configPath TEXT NOT NULL,
              downloadDate TEXT NOT NULL,
              lastUsed TEXT
            )`
          );

          // Model ratings table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS model_ratings (
              offlineId TEXT PRIMARY KEY,
              modelId TEXT NOT NULL,
              rating INTEGER NOT NULL,
              feedback TEXT,
              diagnosisResult TEXT,
              diagnosisCorrect INTEGER,
              cropType TEXT,
              deviceInfo TEXT,
              synced INTEGER DEFAULT 0,
              createdAt TEXT NOT NULL
            )`
          );
        },
        (error) => {
          console.error('Database init transaction failed:', error);
          reject(error);
        },
        () => {
          console.log('Database initialized successfully');
          resolve();
        }
      );
    });
  }

  async checkForUpdates(): Promise<boolean> {
    if (!NetworkService.isNetworkConnected()) {
      console.log('No network connection, skipping model update check');
      return false;
    }

    try {
      await this.initialize();

      // Get current model info
      const currentModel = await this.getCurrentModel();
      
      // Fetch latest model info from server
      const response = await axios.get(`${API_BASE_URL}/api/v1/models/latest`);
      const latestModel: ModelInfo = response.data.model;

      // If we already have the latest model, skip download
      if (currentModel && currentModel.modelId === latestModel.modelId) {
        console.log('Already have the latest model version');
        return false;
      }

      // Download the model
      console.log(`New model available: v${latestModel.version}`);
      await this.downloadModel(latestModel);
      
      return true;
    } catch (error) {
      console.error('Error checking for model updates:', error);
      return false;
    }
  }

  async downloadModel(modelInfo: ModelInfo): Promise<boolean> {
    try {
      await this.initialize();

      // File paths for local storage
      const modelPath = `${this.modelDir}${modelInfo.modelId}.tflite`;
      const configPath = `${this.modelDir}${modelInfo.modelId}_config.json`;

      // Download model file
      const modelDownloadResult = await FileSystem.downloadAsync(
        `${API_BASE_URL}/api/v1/models/${modelInfo.modelId}/download`,
        modelPath
      );

      if (modelDownloadResult.status !== 200) {
        throw new Error(`Model download failed with status ${modelDownloadResult.status}`);
      }

      // Download config file
      const configDownloadResult = await FileSystem.downloadAsync(
        `${API_BASE_URL}/api/v1/models/${modelInfo.modelId}/config`,
        configPath
      );

      if (configDownloadResult.status !== 200) {
        // Delete model file if config download fails
        await FileSystem.deleteAsync(modelPath);
        throw new Error(`Config download failed with status ${configDownloadResult.status}`);
      }

      // Verify model file hash
      const modelContents = await FileSystem.readAsStringAsync(modelPath, { encoding: FileSystem.EncodingType.Base64 });
      const modelHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, modelContents);

      if (modelHash !== modelInfo.fileHash) {
        console.error('Model hash mismatch, deleting corrupted files');
        await FileSystem.deleteAsync(modelPath);
        await FileSystem.deleteAsync(configPath);
        throw new Error('Model integrity check failed');
      }

      // Verify config file hash
      const configContents = await FileSystem.readAsStringAsync(configPath, { encoding: FileSystem.EncodingType.Base64 });
      const configHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, configContents);

      if (configHash !== modelInfo.configHash) {
        console.error('Config hash mismatch, deleting corrupted files');
        await FileSystem.deleteAsync(modelPath);
        await FileSystem.deleteAsync(configPath);
        throw new Error('Config integrity check failed');
      }

      // Save model info to database
      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx) => {
            // Get current model to delete later
            tx.executeSql(
              'SELECT modelPath, configPath FROM model LIMIT 1',
              [],
              async (_, { rows }) => {
                // Clear current model table (we only keep one model)
                tx.executeSql('DELETE FROM model', [], async () => {
                  // Insert new model
                  tx.executeSql(
                    `INSERT INTO model (
                      modelId, version, fileSize, fileHash, configSize, configHash,
                      accuracy, modelPath, configPath, downloadDate, lastUsed
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                      modelInfo.modelId,
                      modelInfo.version,
                      modelInfo.fileSize,
                      modelInfo.fileHash,
                      modelInfo.configSize,
                      modelInfo.configHash,
                      modelInfo.accuracy,
                      modelPath,
                      configPath,
                      new Date().toISOString(),
                      new Date().toISOString()
                    ],
                    async (_, result) => {
                      // Delete old model files if they exist
                      if (rows.length > 0) {
                        const oldModel = rows.item(0);
                        try {
                          if (oldModel.modelPath) {
                            await FileSystem.deleteAsync(oldModel.modelPath);
                          }
                          if (oldModel.configPath) {
                            await FileSystem.deleteAsync(oldModel.configPath);
                          }
                        } catch (error) {
                          console.warn('Could not delete old model files:', error);
                        }
                      }
                      console.log(`Model v${modelInfo.version} downloaded successfully`);
                      resolve(true);
                    },
                    (_, error) => {
                      console.error('Error saving model info:', error);
                      reject(error);
                      return false;
                    }
                  );
                });
              }
            );
          },
          (error) => {
            console.error('Transaction error:', error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Error downloading model:', error);
      throw error;
    }
  }

  async getCurrentModel(): Promise<ModelInfo | null> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM model LIMIT 1',
            [],
            (_, { rows }) => {
              if (rows.length > 0) {
                const model = rows.item(0);
                resolve({
                  modelId: model.modelId,
                  version: model.version,
                  fileSize: model.fileSize,
                  fileHash: model.fileHash,
                  configSize: model.configSize,
                  configHash: model.configHash,
                  accuracy: model.accuracy,
                  releaseDate: model.downloadDate,
                  isActive: true
                });
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              console.error('Error getting current model:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async getModelFilePaths(): Promise<{ modelPath: string; configPath: string } | null> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT modelPath, configPath FROM model LIMIT 1',
            [],
            (_, { rows }) => {
              if (rows.length > 0) {
                const model = rows.item(0);
                resolve({
                  modelPath: model.modelPath,
                  configPath: model.configPath
                });
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              console.error('Error getting model paths:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async saveModelRating(rating: Omit<ModelRating, 'synced' | 'createdAt'>): Promise<string> {
    await this.initialize();

    const offlineId = rating.offlineId || this.generateUUID();
    const timestamp = new Date().toISOString();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT INTO model_ratings (
              offlineId, modelId, rating, feedback, diagnosisResult,
              diagnosisCorrect, cropType, deviceInfo, synced, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              offlineId,
              rating.modelId,
              rating.rating,
              rating.feedback || null,
              rating.diagnosisResult || null,
              rating.diagnosisCorrect ? 1 : 0,
              rating.cropType || null,
              rating.deviceInfo || null,
              0, // Not synced
              timestamp
            ],
            (_, result) => {
              resolve(offlineId);
            },
            (_, error) => {
              console.error('Error saving model rating:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async getUnsyncedRatings(): Promise<ModelRating[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM model_ratings WHERE synced = 0',
            [],
            (_, { rows }) => {
              const ratings: ModelRating[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                ratings.push({
                  offlineId: item.offlineId,
                  modelId: item.modelId,
                  rating: item.rating,
                  feedback: item.feedback,
                  diagnosisResult: item.diagnosisResult,
                  diagnosisCorrect: item.diagnosisCorrect === 1,
                  cropType: item.cropType,
                  deviceInfo: item.deviceInfo,
                  synced: false,
                  createdAt: item.createdAt
                });
              }
              resolve(ratings);
            },
            (_, error) => {
              console.error('Error getting unsynced ratings:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async markRatingsAsSynced(offlineIds: string[]): Promise<void> {
    if (offlineIds.length === 0) return;
    
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          const placeholders = offlineIds.map(() => '?').join(',');
          const query = `UPDATE model_ratings SET synced = 1 WHERE offlineId IN (${placeholders})`;
          
          tx.executeSql(
            query,
            offlineIds,
            (_, result) => {
              resolve();
            },
            (_, error) => {
              console.error('Error marking ratings as synced:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export default new ModelService();
```

### 2. Crop and Disease Service

```typescript
// services/CropDiseaseService.ts
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import axios from '@/utils/axiosInstance';
import { API_BASE_URL } from '@/config';
import NetworkService from './NetworkService';

export interface Crop {
  cropId: number;
  name: string;
  description: string;
  growingConditions: string;
  harvestTime: string;
  images: string[];
  createdAt: string;
}

export interface Disease {
  diseaseId: number;
  name: string;
  description: string;
  label: string;
  symptoms: string;
  treatment: string;
  prevention: string;
  images: string[];
  relatedDiseases: number[];
  cropId: number;
  cropName: string;
  createdAt: string;
}

class CropDiseaseService {
  private db: SQLite.SQLiteDatabase;
  private initialized = false;

  constructor() {
    this.db = SQLite.openDatabase('agridiagnosis.db');
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize database tables
      await this.initDatabase();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing CropDiseaseService:', error);
      throw error;
    }
  }

  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Crops table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS crops (
              cropId INTEGER PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              growingConditions TEXT,
              harvestTime TEXT,
              images TEXT,
              createdAt TEXT,
              lastUpdated TEXT
            )`
          );

          // Diseases table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS diseases (
              diseaseId INTEGER PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              label TEXT NOT NULL,
              symptoms TEXT,
              treatment TEXT,
              prevention TEXT,
              images TEXT,
              relatedDiseases TEXT,
              cropId INTEGER,
              cropName TEXT,
              createdAt TEXT,
              lastUpdated TEXT
            )`
          );
        },
        (error) => {
          console.error('Database init transaction failed:', error);
          reject(error);
        },
        () => {
          console.log('Crop and Disease database initialized successfully');
          resolve();
        }
      );
    });
  }

  async syncCrops(): Promise<boolean> {
    if (!NetworkService.isNetworkConnected()) {
      console.log('No network connection, skipping crop sync');
      return false;
    }

    try {
      await this.initialize();

      // Fetch crops from server
      const response = await axios.get(`${API_BASE_URL}/api/v1/crop`);
      const crops: Crop[] = response.data.data;

      // Save crops to database
      await this.saveCrops(crops);
      
      return true;
    } catch (error) {
      console.error('Error syncing crops:', error);
      return false;
    }
  }

  async syncDiseases(): Promise<boolean> {
    if (!NetworkService.isNetworkConnected()) {
      console.log('No network connection, skipping disease sync');
      return false;
    }

    try {
      await this.initialize();

      // Fetch diseases from server
      const response = await axios.get(`${API_BASE_URL}/api/v1/diseases`);
      const diseases: Disease[] = response.data.data;

      // Save diseases to database
      await this.saveDiseases(diseases);
      
      return true;
    } catch (error) {
      console.error('Error syncing diseases:', error);
      return false;
    }
  }

  private async saveCrops(crops: Crop[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          const timestamp = new Date().toISOString();
          
          crops.forEach(crop => {
            tx.executeSql(
              `INSERT OR REPLACE INTO crops (
                cropId, name, description, growingConditions, harvestTime, 
                images, createdAt, lastUpdated
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                crop.cropId,
                crop.name,
                crop.description,
                crop.growingConditions,
                crop.harvestTime,
                JSON.stringify(crop.images),
                crop.createdAt,
                timestamp
              ]
            );
          });
        },
        (error) => {
          console.error('Error saving crops:', error);
          reject(error);
        },
        () => {
          console.log(`Saved ${crops.length} crops to local database`);
          resolve();
        }
      );
    });
  }

  private async saveDiseases(diseases: Disease[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          const timestamp = new Date().toISOString();
          
          diseases.forEach(disease => {
            tx.executeSql(
              `INSERT OR REPLACE INTO diseases (
                diseaseId, name, description, label, symptoms, treatment, prevention,
                images, relatedDiseases, cropId, cropName, createdAt, lastUpdated
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                disease.diseaseId,
                disease.name,
                disease.description,
                disease.label,
                disease.symptoms,
                disease.treatment,
                disease.prevention,
                JSON.stringify(disease.images),
                JSON.stringify(disease.relatedDiseases),
                disease.cropId,
                disease.cropName,
                disease.createdAt,
                timestamp
              ]
            );
          });
        },
        (error) => {
          console.error('Error saving diseases:', error);
          reject(error);
        },
        () => {
          console.log(`Saved ${diseases.length} diseases to local database`);
          resolve();
        }
      );
    });
  }

  async getCrops(): Promise<Crop[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM crops ORDER BY name',
            [],
            (_, { rows }) => {
              const crops: Crop[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                crops.push({
                  cropId: item.cropId,
                  name: item.name,
                  description: item.description,
                  growingConditions: item.growingConditions,
                  harvestTime: item.harvestTime,
                  images: JSON.parse(item.images || '[]'),
                  createdAt: item.createdAt
                });
              }
              resolve(crops);
            },
            (_, error) => {
              console.error('Error getting crops:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async getDiseases(cropId?: number): Promise<Disease[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          const query = cropId
            ? 'SELECT * FROM diseases WHERE cropId = ? ORDER BY name'
            : 'SELECT * FROM diseases ORDER BY name';
          const params = cropId ? [cropId] : [];
          
          tx.executeSql(
            query,
            params,
            (_, { rows }) => {
              const diseases: Disease[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                diseases.push({
                  diseaseId: item.diseaseId,
                  name: item.name,
                  description: item.description,
                  label: item.label,
                  symptoms: item.symptoms,
                  treatment: item.treatment,
                  prevention: item.prevention,
                  images: JSON.parse(item.images || '[]'),
                  relatedDiseases: JSON.parse(item.relatedDiseases || '[]'),
                  cropId: item.cropId,
                  cropName: item.cropName,
                  createdAt: item.createdAt
                });
              }
              resolve(diseases);
            },
            (_, error) => {
              console.error('Error getting diseases:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async getDisease(diseaseId: number): Promise<Disease | null> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM diseases WHERE diseaseId = ?',
            [diseaseId],
            (_, { rows }) => {
              if (rows.length > 0) {
                const item = rows.item(0);
                resolve({
                  diseaseId: item.diseaseId,
                  name: item.name,
                  description: item.description,
                  label: item.label,
                  symptoms: item.symptoms,
                  treatment: item.treatment,
                  prevention: item.prevention,
                  images: JSON.parse(item.images || '[]'),
                  relatedDiseases: JSON.parse(item.relatedDiseases || '[]'),
                  cropId: item.cropId,
                  cropName: item.cropName,
                  createdAt: item.createdAt
                });
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              console.error('Error getting disease:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }
}

export default new CropDiseaseService();
```

### 3. Diagnosis Service

```typescript
// services/DiagnosisService.ts
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from '@/utils/axiosInstance';
import { API_BASE_URL } from '@/config';
import ModelService from './ModelService';
import NetworkService from './NetworkService';
import TensorflowLite from '@tensorflow/tfjs-react-native';
import { Platform } from 'react-native';
import * as tf from '@tensorflow/tfjs';

export interface DiagnosisResult {
  diagnosisId: string;
  modelId: string;
  modelVersion: string;
  cropId?: number;
  cropName?: string;
  imageUri: string;
  serverImageUrl?: string;
  diseaseId?: number;
  diseaseName: string;
  diseaseLabel: string;
  diseaseDescription: string;
  diseaseSymptoms: string;
  diseaseTreatment: string;
  diseasePrevention: string;
  confidence: number;
  timestamp: string;
  isRated: boolean;
}

class DiagnosisService {
  private db: SQLite.SQLiteDatabase;
  private initialized = false;

  constructor() {
    this.db = SQLite.openDatabase('agridiagnosis.db');
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize database tables
      await this.initDatabase();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing DiagnosisService:', error);
      throw error;
    }
  }

  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Diagnoses table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS diagnoses (
              diagnosisId TEXT PRIMARY KEY,
              modelId TEXT NOT NULL,
              modelVersion TEXT NOT NULL,
              cropId INTEGER,
              cropName TEXT,
              imageUri TEXT NOT NULL,
              serverImageUrl TEXT,
              diseaseId INTEGER,
              diseaseName TEXT NOT NULL,
              diseaseLabel TEXT NOT NULL,
              diseaseDescription TEXT,
              diseaseSymptoms TEXT,
              diseaseTreatment TEXT,
              diseasePrevention TEXT,
              confidence REAL NOT NULL,
              timestamp TEXT NOT NULL,
              synced INTEGER DEFAULT 0,
              isRated INTEGER DEFAULT 0
            )`
          );
        },
        (error) => {
          console.error('Database init transaction failed:', error);
          reject(error);
        },
        () => {
          console.log('Diagnosis database initialized successfully');
          resolve();
        }
      );
    });
  }

  async diagnose(imageUri: string, cropType: string): Promise<DiagnosisResult> {
    await this.initialize();

    // If online, use server API for diagnosis
    if (NetworkService.isNetworkConnected()) {
      try {
        return await this.diagnoseOnline(imageUri, cropType);
      } catch (error) {
        console.error('Online diagnosis failed, falling back to local model:', error);
      }
    }

    // Fallback to local model if offline or server error
    return await this.diagnoseOffline(imageUri, cropType);
  }

  private async diagnoseOnline(imageUri: string, cropType: string): Promise<DiagnosisResult> {
    // Prepare form data with image
    const formData = new FormData();
    
    // Get file extension
    const extension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Add the image file
    formData.append('image', {
      uri: imageUri,
      name: `diagnosis.${extension}`,
      type: `image/${extension === 'jpg' ? 'jpeg' : extension}`
    } as any);

    // Add crop type
    formData.append('crop_type', cropType);

    // Send to server
    const response = await axios.post(`${API_BASE_URL}/api/v1/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = response.data;
    
    // Generate a unique ID for this diagnosis
    const diagnosisId = this.generateUUID();
    
    // Create diagnosis result object
    const diagnosisResult: DiagnosisResult = {
      diagnosisId,
      modelId: result.modelId,
      modelVersion: result.version,
      cropId: result.cropId,
      cropName: result.cropName,
      imageUri,
      serverImageUrl: result.image_url,
      diseaseId: result.diseaseId,
      diseaseName: result.diseaseName,
      diseaseLabel: result.diseaseLabel,
      diseaseDescription: result.diseaseDescription,
      diseaseSymptoms: result.diseaseSymptoms,
      diseaseTreatment: result.diseaseTreatment,
      diseasePrevention: result.diseasePrevention,
      confidence: result.confident,
      timestamp: new Date().toISOString(),
      isRated: false
    };

    // Save to local database
    await this.saveDiagnosis(diagnosisResult, true);

    return diagnosisResult;
  }

  private async diagnoseOffline(imageUri: string, cropType: string): Promise<DiagnosisResult> {
    // Get model paths
    const modelPaths = await ModelService.getModelFilePaths();
    if (!modelPaths) {
      throw new Error('No model available for offline diagnosis');
    }

    // Get current model info
    const modelInfo = await ModelService.getCurrentModel();
    if (!modelInfo) {
      throw new Error('No model information available');
    }

    // Load model configuration
    let modelConfig;
    try {
      const configContent = await FileSystem.readAsStringAsync(modelPaths.configPath);
      modelConfig = JSON.parse(configContent);
    } catch (error) {
      throw new Error('Failed to load model configuration: ' + error);
    }

    // Prepare image for inference
    const processedImage = await this.preprocessImage(imageUri, modelConfig);

    // Initialize TensorFlow.js if needed
    if (!tf.ready) {
      await tf.ready();
    }

    // Load and run the model
    const model = await TensorflowLite.loadTFLiteModel(modelPaths.modelPath);
    
    // Run inference
    const predictions = await model.predict(processedImage);
    
    // Process results
    const result = this.processResults(predictions, modelConfig, cropType);

    // Generate a unique ID for this diagnosis
    const diagnosisId = this.generateUUID();
    
    // Create diagnosis result object
    const diagnosisResult: DiagnosisResult = {
      diagnosisId,
      modelId: modelInfo.modelId,
      modelVersion: modelInfo.version,
      imageUri,
      diseaseName: result.name,
      diseaseLabel: result.label,
      diseaseDescription: result.description,
      diseaseSymptoms: result.symptoms,
      diseaseTreatment: result.treatment,
      diseasePrevention: result.prevention,
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
      isRated: false
    };

    // Save to local database
    await this.saveDiagnosis(diagnosisResult, false);

    return diagnosisResult;
  }

  private async preprocessImage(uri: string, modelConfig: any): Promise<tf.Tensor> {
    // Resize the image to match model input size
    const inputShape = modelConfig.input_shape || [1, 224, 224, 3];
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: inputShape[1], height: inputShape[2] } }],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 0.9 }
    );

    // Load image as tensor
    const imgTensor = await tf.image.fromURL(resizedImage.uri);
    
    // Normalize the image
    const normalization = modelConfig.input_normalization || {
      mean: [0.485, 0.456, 0.406],
      std: [0.229, 0.224, 0.225]
    };

    // Apply normalization
    const normalized = tf.tidy(() => {
      // Cast to float32 and normalize to [0, 1]
      const floatImg = tf.cast(imgTensor, 'float32').div(tf.scalar(255));
      
      // Apply mean and std normalization
      const meanTensor = tf.tensor1d(normalization.mean);
      const stdTensor = tf.tensor1d(normalization.std);
      
      return floatImg.sub(meanTensor).div(stdTensor);
    });

    // Expand dimensions to match model input shape (add batch dimension)
    const batched = normalized.expandDims(0);
    
    return batched;
  }

  private processResults(predictions: any, modelConfig: any, cropType: string): any {
    // Find the class with highest confidence
    let maxIndex = 0;
    let maxConfidence = 0;

    // Convert predictions to array if needed
    const predArray = Array.isArray(predictions) ? predictions : predictions.arraySync()[0];
    
    // Find highest confidence prediction
    predArray.forEach((confidence: number, index: number) => {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        maxIndex = index;
      }
    });

    // Get class info from config
    const classInfo = modelConfig.classes.find((c: any) => c.id === maxIndex) || {
      id: maxIndex,
      name: "Unknown",
      label: "unknown",
      description: "Could not identify the disease",
      symptoms: "N/A",
      treatment: "Please consult with an agricultural expert",
      prevention: "N/A"
    };

    return {
      ...classInfo,
      confidence: maxConfidence
    };
  }

  private async saveDiagnosis(diagnosis: DiagnosisResult, synced: boolean): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            `INSERT INTO diagnoses (
              diagnosisId, modelId, modelVersion, cropId, cropName, imageUri,
              serverImageUrl, diseaseId, diseaseName, diseaseLabel, diseaseDescription,
              diseaseSymptoms, diseaseTreatment, diseasePrevention, confidence,
              timestamp, synced, isRated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              diagnosis.diagnosisId,
              diagnosis.modelId,
              diagnosis.modelVersion,
              diagnosis.cropId || null,
              diagnosis.cropName || null,
              diagnosis.imageUri,
              diagnosis.serverImageUrl || null,
              diagnosis.diseaseId || null,
              diagnosis.diseaseName,
              diagnosis.diseaseLabel,
              diagnosis.diseaseDescription || null,
              diagnosis.diseaseSymptoms || null,
              diagnosis.diseaseTreatment || null,
              diagnosis.diseasePrevention || null,
              diagnosis.confidence,
              diagnosis.timestamp,
              synced ? 1 : 0,
              diagnosis.isRated ? 1 : 0
            ],
            (_, result) => {
              resolve();
            },
            (_, error) => {
              console.error('Error saving diagnosis:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async getDiagnoses(): Promise<DiagnosisResult[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM diagnoses ORDER BY timestamp DESC',
            [],
            (_, { rows }) => {
              const diagnoses: DiagnosisResult[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                diagnoses.push({
                  diagnosisId: item.diagnosisId,
                  modelId: item.modelId,
                  modelVersion: item.modelVersion,
                  cropId: item.cropId,
                  cropName: item.cropName,
                  imageUri: item.imageUri,
                  serverImageUrl: item.serverImageUrl,
                  diseaseId: item.diseaseId,
                  diseaseName: item.diseaseName,
                  diseaseLabel: item.diseaseLabel,
                  diseaseDescription: item.diseaseDescription,
                  diseaseSymptoms: item.diseaseSymptoms,
                  diseaseTreatment: item.diseaseTreatment,
                  diseasePrevention: item.diseasePrevention,
                  confidence: item.confidence,
                  timestamp: item.timestamp,
                  isRated: item.isRated === 1
                });
              }
              resolve(diagnoses);
            },
            (_, error) => {
              console.error('Error getting diagnoses:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async getDiagnosis(diagnosisId: string): Promise<DiagnosisResult | null> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM diagnoses WHERE diagnosisId = ?',
            [diagnosisId],
            (_, { rows }) => {
              if (rows.length > 0) {
                const item = rows.item(0);
                resolve({
                  diagnosisId: item.diagnosisId,
                  modelId: item.modelId,
                  modelVersion: item.modelVersion,
                  cropId: item.cropId,
                  cropName: item.cropName,
                  imageUri: item.imageUri,
                  serverImageUrl: item.serverImageUrl,
                  diseaseId: item.diseaseId,
                  diseaseName: item.diseaseName,
                  diseaseLabel: item.diseaseLabel,
                  diseaseDescription: item.diseaseDescription,
                  diseaseSymptoms: item.diseaseSymptoms,
                  diseaseTreatment: item.diseaseTreatment,
                  diseasePrevention: item.diseasePrevention,
                  confidence: item.confidence,
                  timestamp: item.timestamp,
                  isRated: item.isRated === 1
                });
              } else {
                resolve(null);
              }
            },
            (_, error) => {
              console.error('Error getting diagnosis:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async markDiagnosisAsRated(diagnosisId: string): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE diagnoses SET isRated = 1 WHERE diagnosisId = ?',
            [diagnosisId],
            (_, result) => {
              resolve();
            },
            (_, error) => {
              console.error('Error marking diagnosis as rated:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async getUnsyncedDiagnoses(): Promise<DiagnosisResult[]> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM diagnoses WHERE synced = 0',
            [],
            (_, { rows }) => {
              const diagnoses: DiagnosisResult[] = [];
              for (let i = 0; i < rows.length; i++) {
                const item = rows.item(i);
                diagnoses.push({
                  diagnosisId: item.diagnosisId,
                  modelId: item.modelId,
                  modelVersion: item.modelVersion,
                  cropId: item.cropId,
                  cropName: item.cropName,
                  imageUri: item.imageUri,
                  serverImageUrl: item.serverImageUrl,
                  diseaseId: item.diseaseId,
                  diseaseName: item.diseaseName,
                  diseaseLabel: item.diseaseLabel,
                  diseaseDescription: item.diseaseDescription,
                  diseaseSymptoms: item.diseaseSymptoms,
                  diseaseTreatment: item.diseaseTreatment,
                  diseasePrevention: item.diseasePrevention,
                  confidence: item.confidence,
                  timestamp: item.timestamp,
                  isRated: item.isRated === 1
                });
              }
              resolve(diagnoses);
            },
            (_, error) => {
              console.error('Error getting unsynced diagnoses:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async markDiagnosesAsSynced(diagnosisIds: string[]): Promise<void> {
    if (diagnosisIds.length === 0) return;
    
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          const placeholders = diagnosisIds.map(() => '?').join(',');
          const query = `UPDATE diagnoses SET synced = 1 WHERE diagnosisId IN (${placeholders})`;
          
          tx.executeSql(
            query,
            diagnosisIds,
            (_, result) => {
              resolve();
            },
            (_, error) => {
              console.error('Error marking diagnoses as synced:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export default new DiagnosisService();
```

### 4. Subscription Service

```typescript
// services/SubscriptionService.ts
import * as SQLite from 'expo-sqlite';
import axios from '@/utils/axiosInstance';
import { API_BASE_URL } from '@/config';
import NetworkService from './NetworkService';

export interface SubscriptionPlan {
  planId: number;
  name: string;
  description: string;
  dailyAttempts: number | null;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercentage: number;
  isActive: boolean;
  isPlanFree: boolean;
}

export interface UserSubscription {
  subscriptionId: number | null;
  userId: number;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isActive: boolean;
  subscriptionType: string;
}

export interface UsageInfo {
  date: string;
  attemptsUsed: number;
  dailyLimit: number | "Unlimited";
  remainingAttempts: number | "Unlimited";
  limitReached: boolean;
  isUnlimited: boolean;
}

export interface SubscriptionUsage {
  usage: UsageInfo;
  subscription: UserSubscription;
}

class SubscriptionService {
  private db: SQLite.SQLiteDatabase;
  private initialized = false;

  constructor() {
    this.db = SQLite.openDatabase('agridiagnosis.db');
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize database tables
      await this.initDatabase();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing SubscriptionService:', error);
      throw error;
    }
  }

  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Subscription plans table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS subscription_plans (
              planId INTEGER PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              dailyAttempts INTEGER,
              monthlyPrice REAL NOT NULL,
              yearlyPrice REAL NOT NULL,
              yearlyDiscountPercentage REAL,
              isActive INTEGER NOT NULL DEFAULT 1,
              isPlanFree INTEGER NOT NULL DEFAULT 0,
              lastUpdated TEXT
            )`
          );

          // User subscription table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS user_subscription (
              subscriptionId INTEGER,
              userId INTEGER NOT NULL,
              planId INTEGER NOT NULL,
              planName TEXT NOT NULL,
              startDate TEXT NOT NULL,
              endDate TEXT NOT NULL,
              isActive INTEGER NOT NULL DEFAULT 1,
              subscriptionType TEXT NOT NULL,
              lastUpdated TEXT
            )`
          );

          // Daily usage table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS daily_usage (
              date TEXT NOT NULL,
              attemptsUsed INTEGER NOT NULL DEFAULT 0,
              lastUpdated TEXT,
              PRIMARY KEY (date)
            )`
          );
        },
        (error) => {
          console.error('Database init transaction failed:', error);
          reject(error);
        },
        () => {
          console.log('Subscription database initialized successfully');
          resolve();
        }
      );
    });
  }

  async fetchSubscriptionUsage(forceRefresh = false): Promise<SubscriptionUsage | null> {
    await this.initialize();

    // If online and forced refresh, get from server
    if (NetworkService.isNetworkConnected() && forceRefresh) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/subscriptions/usage`);
        const usage = response.data.data;
        
        // Save to local database
        await this.saveSubscriptionUsage(usage);
        
        return usage;
      } catch (error) {
        console.error('Error fetching subscription usage:', error);
      }
    }

    // Try to get from local database
    const localUsage = await this.getLocalSubscriptionUsage();
    
    // If we have local data, return it
    if (localUsage) {
      return localUsage;
    }
    
    // If online but no local data, try to fetch from server
    if (NetworkService.isNetworkConnected()) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/subscriptions/usage`);
        const usage = response.data.data;
        
        // Save to local database
        await this.saveSubscriptionUsage(usage);
        
        return usage;
      } catch (error) {
        console.error('Error fetching subscription usage:', error);
      }
    }
    
    return null;
  }

  async recordUsageAttempt(): Promise<SubscriptionUsage | null> {
    await this.initialize();

    // If online, record via API
    if (NetworkService.isNetworkConnected()) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/subscriptions/usage`);
        const usage = response.data.data;
        
        // Save to local database
        await this.saveSubscriptionUsage(usage);
        
        return usage;
      } catch (error: any) {
        // Check if daily limit reached
        if (error.response && error.response.status === 403) {
          // Return the current usage information
          const currentUsage = await this.fetchSubscriptionUsage(true);
          return currentUsage;
        }
        console.error('Error recording usage attempt:', error);
      }
    }

    // If offline, update local count
    const currentUsage = await this.getLocalSubscriptionUsage();
    if (currentUsage) {
      // Increment attempts used
      currentUsage.usage.attemptsUsed += 1;
      
      // Update remaining attempts
      if (typeof currentUsage.usage.dailyLimit === 'number') {
        currentUsage.usage.remainingAttempts = Math.max(
          0, 
          currentUsage.usage.dailyLimit - currentUsage.usage.attemptsUsed
        );
        currentUsage.usage.limitReached = currentUsage.usage.attemptsUsed >= currentUsage.usage.dailyLimit;
      }
      
      // Save updated usage
      await this.saveSubscriptionUsage(currentUsage);
      
      return currentUsage;
    }
    
    return null;
  }

  private async saveSubscriptionUsage(usage: SubscriptionUsage): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          const timestamp = new Date().toISOString();
          
          // Save subscription info
          tx.executeSql('DELETE FROM user_subscription');
          tx.executeSql(
            `INSERT INTO user_subscription (
              subscriptionId, userId, planId, planName, startDate, 
              endDate, isActive, subscriptionType, lastUpdated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              usage.subscription.subscriptionId,
              usage.subscription.userId,
              usage.subscription.planId,
              usage.subscription.planName,
              usage.subscription.startDate,
              usage.subscription.endDate,
              usage.subscription.isActive ? 1 : 0,
              usage.subscription.subscriptionType,
              timestamp
            ]
          );

          // Save daily usage
          tx.executeSql('DELETE FROM daily_usage WHERE date = ?', [usage.usage.date]);
          tx.executeSql(
            `INSERT INTO daily_usage (date, attemptsUsed, lastUpdated) VALUES (?, ?, ?)`,
            [usage.usage.date, usage.usage.attemptsUsed, timestamp]
          );
        },
        (error) => {
          console.error('Error saving subscription usage:', error);
          reject(error);
        },
        () => {
          resolve();
        }
      );
    });
  }

  private async getLocalSubscriptionUsage(): Promise<SubscriptionUsage | null> {
    await this.initialize();

    const today = new Date().toISOString().split('T')[0];

    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Get subscription info
          tx.executeSql(
            'SELECT * FROM user_subscription LIMIT 1',
            [],
            (_, { rows: subRows }) => {
              if (subRows.length === 0) {
                resolve(null);
                return;
              }

              const sub = subRows.item(0);
              
              // Get daily usage
              tx.executeSql(
                'SELECT * FROM daily_usage WHERE date = ?',
                [today],
                (_, { rows: usageRows }) => {
                  // If no usage record for today, create one
                  const attemptsUsed = usageRows.length > 0 ? usageRows.item(0).attemptsUsed : 0;
                  
                  // Determine if unlimited
                  const isUnlimited = sub.planId === 1; // Assuming plan ID 1 is unlimited
                  const dailyLimit = isUnlimited ? "Unlimited" : (sub.dailyAttempts || 0);
                  const remainingAttempts = isUnlimited ? "Unlimited" : Math.max(0, (sub.dailyAttempts || 0) - attemptsUsed);
                  
                  const usage: SubscriptionUsage = {
                    subscription: {
                      subscriptionId: sub.subscriptionId,
                      userId: sub.userId,
                      planId: sub.planId,
                      planName: sub.planName,
                      startDate: sub.startDate,
                      endDate: sub.endDate,
                      daysRemaining: Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                      isActive: sub.isActive === 1,
                      subscriptionType: sub.subscriptionType
                    },
                    usage: {
                      date: today,
                      attemptsUsed,
                      dailyLimit,
                      remainingAttempts,
                      limitReached: !isUnlimited && attemptsUsed >= (sub.dailyAttempts || 0),
                      isUnlimited
                    }
                  };
                  
                  resolve(usage);
                },
                (_, error) => {
                  console.error('Error getting daily usage:', error);
                  reject(error);
                  return false;
                }
              );
            },
            (_, error) => {
              console.error('Error getting subscription:', error);
              reject(error);
              return false;
            }
          );
        },
        (error) => reject(error)
      );
    });
  }

  async hasReachedDailyLimit(): Promise<boolean> {
    const usage = await this.fetchSubscriptionUsage();
    
    if (!usage) {
      // If we can't determine usage, assume limit not reached
      return false;
    }
    
    return usage.usage.limitReached;
  }

  async isFreeSubscription(): Promise<boolean> {
    const usage = await this.fetchSubscriptionUsage();
    
    if (!usage) {
      // If we can't determine subscription type, assume not free
      return false;
    }
    
    return usage.subscription.subscriptionType === 'free';
  }
}

export default new SubscriptionService();
```

### 5. Sync Service

```typescript
// services/SyncService.ts
import NetworkService from './NetworkService';
import ModelService from './ModelService';
import CropDiseaseService from './CropDiseaseService';
import DiagnosisService from './DiagnosisService';
import SubscriptionService from './SubscriptionService';
import axios from '@/utils/axiosInstance';
import { API_BASE_URL } from '@/config';
import { store } from '@/store';
import { addDistrict } from '@/store/slices/userDetailsSlice';

class SyncService {
  private isSyncing = false;

  async performSync(): Promise<boolean> {
    if (this.isSyncing || !NetworkService.isNetworkConnected()) {
      return false;
    }

    try {
      this.isSyncing = true;
      console.log('Starting sync operation...');

      // 1. Check for model updates
      await ModelService.checkForUpdates();

      // 2. Sync crops and diseases
      await CropDiseaseService.syncCrops();
      await CropDiseaseService.syncDiseases();

      // 3. Sync unsynced model ratings
      await this.syncModelRatings();

      // 4. Sync unsynced diagnoses
      await this.syncDiagnoses();

      // 5. Sync subscription usage
      await SubscriptionService.fetchSubscriptionUsage(true);

      // 6. Process any pending user detail updates
      await this.processPendingUserDetailActions();

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
        await axios.post(`${API_BASE_URL}/api/v1/models/${rating.modelId}/rate`, {
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
        await axios.post(`${API_BASE_URL}/api/v1/diagnoses/sync`, {
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
```

## Redux Store Configuration

### Subscription Slice

```typescript
// store/slices/subscriptionSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../persistConfig';
import SubscriptionService, { SubscriptionUsage } from '@/services/SubscriptionService';
import NetworkService from '@/services/NetworkService';
import axios from '@/utils/axiosInstance';
import { API_BASE_URL } from '@/config';

interface SubscriptionState {
  currentUsage: SubscriptionUsage | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: SubscriptionState = {
  currentUsage: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchSubscriptionUsage = createAsyncThunk<
  SubscriptionUsage | null,
  boolean | undefined,
  { state: RootState }
>('subscription/fetchUsage', async (forceRefresh = false, { getState }) => {
  return await SubscriptionService.fetchSubscriptionUsage(forceRefresh);
});

export const recordUsageAttempt = createAsyncThunk<
  SubscriptionUsage | null,
  void,
  { state: RootState }
>('subscription/recordUsage', async (_, { getState }) => {
  return await SubscriptionService.recordUsageAttempt();
});

export const subscribeToNewPlan = createAsyncThunk<
  SubscriptionUsage | null,
  { planId: number; subscriptionType: 'monthly' | 'yearly'; paymentMethod: string; transactionId: string },
  { state: RootState; rejectValue: string }
>('subscription/subscribe', async (subscriptionData, { rejectWithValue }) => {
  if (!NetworkService.isNetworkConnected()) {
    return rejectWithValue('Cannot subscribe while offline');
  }

  try {
    // Make API call to subscribe
    const response = await axios.post(`${API_BASE_URL}/api/v1/subscriptions`, subscriptionData);
    
    // Get updated usage
    return await SubscriptionService.fetchSubscriptionUsage(true);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to create subscription'
    );
  }
});

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    resetSubscription(state) {
      state.currentUsage = null;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUsage = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchSubscriptionUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      })
      .addCase(recordUsageAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordUsageAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUsage = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(recordUsageAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      })
      .addCase(subscribeToNewPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeToNewPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUsage = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(subscribeToNewPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      });
  },
});

export const { resetSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
```

### Diagnosis Slice

```typescript
// store/slices/diagnosisSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../persistConfig';
import DiagnosisService, { DiagnosisResult } from '@/services/DiagnosisService';
import ModelService from '@/services/ModelService';
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
  { imageUri: string; cropType: string },
  { state: RootState; rejectValue: string }
>('diagnosis/create', async ({ imageUri, cropType }, { dispatch, rejectWithValue }) => {
  try {
    // Record usage attempt first
    const usageResult = await dispatch(recordUsageAttempt()).unwrap();
    
    // Check if daily limit reached
    if (usageResult?.usage.limitReached) {
      return rejectWithValue('Daily usage limit reached');
    }
    
    // Perform diagnosis
    const result = await DiagnosisService.diagnose(imageUri, cropType);
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
        manufacturer: Platform.manufacturer,
        model: Platform.model
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
```

## Main Screen Implementation

### DiagnosisScreen

```tsx
// screens/DiagnosisScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { RootState } from '@/store/persistConfig';
import { AppDispatch } from '@/store';
import { createDiagnosis, clearError } from '@/store/slices/diagnosisSlice';
import { fetchSubscriptionUsage } from '@/store/slices/subscriptionSlice';
import { addDistrict } from '@/store/slices/userDetailsSlice';
import DistrictSelector from '@/components/DistrictSelector';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import SyncService from '@/services/SyncService';
import ModelService from '@/services/ModelService';
import { useTheme } from '@/theme';

const DiagnosisScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  const { isConnected } = useNetworkStatus();
  
  const userDetails = useSelector((state: RootState) => state.userDetails.userDetails);
  const subscriptionUsage = useSelector((state: RootState) => state.subscription.currentUsage);
  const diagnosisError = useSelector((state: RootState) => state.diagnosis.error);
  const diagnosisLoading = useSelector((state: RootState) => state.diagnosis.loading);
  const currentDiagnosis = useSelector((state: RootState) => state.diagnosis.currentDiagnosis);
  
  const [modelStatus, setModelStatus] = useState<'unknown' | 'available' | 'downloading' | 'unavailable'>('unknown');
  const [showDistrictSelector, setShowDistrictSelector] = useState(false);
  const [selectedCropType, setSelectedCropType] = useState('');
  
  // Check for model, sync data, and check district on screen focus
  useFocusEffect(
    useCallback(() => {
      const checkRequirements = async () => {
        // Sync data if online
        if (isConnected) {
          SyncService.performSync().catch(console.error);
        }
        
        // Check if model is available
        try {
          setModelStatus('checking');
          const model = await ModelService.getCurrentModel();
          
          if (model) {
            setModelStatus('available');
          } else if (isConnected) {
            setModelStatus('downloading');
            const updated = await ModelService.checkForUpdates();
            setModelStatus(updated ? 'available' : 'unavailable');
          } else {
            setModelStatus('unavailable');
          }
        } catch (error) {
          console.error('Error checking model:', error);
          setModelStatus('unavailable');
        }
        
        // Fetch subscription usage
        dispatch(fetchSubscriptionUsage());
      };
      
      checkRequirements();
      
      // Check if district is set
      if (userDetails && !userDetails.district) {
        setShowDistrictSelector(true);
      }
    }, [dispatch, isConnected, userDetails])
  );
  
  // Handle diagnosis errors
  useEffect(() => {
    if (diagnosisError) {
      Alert.alert('Diagnosis Error', diagnosisError);
      dispatch(clearError());
    }
  }, [diagnosisError, dispatch]);
  
  // Navigate to result when diagnosis is complete
  useEffect(() => {
    if (currentDiagnosis) {
      navigation.navigate('DiagnosisResult');
    }
  }, [currentDiagnosis, navigation]);
  
  const handleDistrictSelect = async (district: string) => {
    if (!district) {
      Alert.alert('Error', 'Please select a district');
      return;
    }
    
    const formData = new FormData();
    formData.append('district', district);
    
    try {
      await dispatch(addDistrict(formData)).unwrap();
      setShowDistrictSelector(false);
    } catch (error) {
      console.error('Failed to add district:', error);
      Alert.alert('Error', 'Failed to update district. Please try again.');
    }
  };
  
  const handleStartDiagnosis = async () => {
    // Check if user has a district
    if (!userDetails?.district) {
      setShowDistrictSelector(true);
      return;
    }
    
    // Check subscription status
    if (!subscriptionUsage) {
      if (!isConnected) {
        Alert.alert(
          'Offline Mode', 
          'Please connect to the internet to check your subscription status before diagnosing.'
        );
        return;
      }
      
      // Try to fetch subscription info
      try {
        await dispatch(fetchSubscriptionUsage(true)).unwrap();
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch subscription information. Please try again.');
        return;
      }
    }
    
    // Check if daily limit reached
    if (subscriptionUsage?.usage.limitReached) {
      if (subscriptionUsage.subscription.subscriptionType === 'free') {
        Alert.alert(
          'Free Plan Limit Reached',
          'You have reached your daily limit on the free plan. Would you like to upgrade?',
          [
            { text: 'Not Now', style: 'cancel' },
            { 
              text: 'Upgrade', 
              onPress: () => navigation.navigate('Subscriptions') 
            },
          ]
        );
      } else {
        Alert.alert(
          'Daily Limit Reached',
          'You have reached your daily diagnosis limit. Please try again tomorrow.'
        );
      }
      return;
    }
    
    // Check if model is available
    if (modelStatus !== 'available') {
      if (!isConnected) {
        Alert.alert(
          'Model Not Available',
          'Please connect to the internet to download the diagnosis model.'
        );
      } else {
        Alert.alert(
          'Model Not Ready',
          'The diagnosis model is not ready. Please wait for it to download.'
        );
      }
      return;
    }
    
    // Show image picker
    showImagePicker();
  };
  
  const showImagePicker = async () => {
    Alert.alert(
      'Select Image Source',
      'Where would you like to get the image from?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: takePicture 
        },
        { 
          text: 'Gallery', 
          onPress: selectFromGallery 
        },
      ]
    );
  };
  
  const takePicture = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permission to take pictures');
      return;
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        processDiagnosisImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };
  
  const selectFromGallery = async () => {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need media library permission to select images');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        processDiagnosisImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  const processDiagnosisImage = async (imageUri: string) => {
    // Ask for crop type
    Alert.prompt(
      'Crop Type',
      'What type of crop is this?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Diagnose',
          onPress: (cropType) => {
            if (!cropType) {
              Alert.alert('Error', 'Please enter a crop type');
              return;
            }
            
            // Dispatch create diagnosis action
            dispatch(createDiagnosis({ imageUri, cropType }));
          }
        }
      ],
      'plain-text',
      selectedCropType
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Plant Disease Diagnosis
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('DiagnosisHistory')}
          >
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Subscriptions')}
          >
            <Ionicons name="card-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Subscription Banner */}
      {subscriptionUsage && (
        <SubscriptionBanner 
          usage={subscriptionUsage.usage}
          subscription={subscriptionUsage.subscription}
        />
      )}
      
      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Network Status */}
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Network:</Text>
            <View style={styles.statusValueContainer}>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: isConnected ? theme.colors.success : theme.colors.warning }
              ]} />
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                {isConnected ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Model:</Text>
            <View style={styles.statusValueContainer}>
              {modelStatus === 'checking' && (
                <>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>Checking...</Text>
                </>
              )}
              {modelStatus === 'available' && (
                <>
                  <View style={[styles.statusIndicator, { backgroundColor: theme.colors.success }]} />
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>Ready</Text>
                </>
              )}
              {modelStatus === 'downloading' && (
                <>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>Downloading...</Text>
                </>
              )}
              {modelStatus === 'unavailable' && (
                <>
                  <View style={[styles.statusIndicator, { backgroundColor: theme.colors.danger }]} />
                  <Text style={[styles.statusValue, { color: theme.colors.text }]}>Not Available</Text>
                </>
              )}
            </View>
          </View>
        </View>
        
        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
            How to Diagnose Plant Diseases
          </Text>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.instructionNumber}>1</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
                Take a Clear Photo
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                Make sure the affected plant part is clearly visible and well-lit.
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.instructionNumber}>2</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
                Identify the Crop Type
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                Enter the type of crop you're diagnosing for more accurate results.
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.instructionIcon, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.instructionNumber}>3</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={[styles.instructionTitle, { color: theme.colors.text }]}>
                Review Results
              </Text>
              <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                Get disease identification and treatment recommendations.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Diagnosis Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.diagnosisButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleStartDiagnosis}
          disabled={diagnosisLoading}
        >
          {diagnosisLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialCommunityIcons name="leaf-maple" size={24} color="white" />
              <Text style={styles.diagnosisButtonText}>Start Diagnosis</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* District Selection Modal */}
      <DistrictSelector
        visible={showDistrictSelector}
        onSelectDistrict={handleDistrictSelect}
        onClose={() => setShowDistrictSelector(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  diagnosisButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  diagnosisButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
});

export default DiagnosisScreen;
```

### DiagnosisResultScreen

```tsx
// screens/DiagnosisResultScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '@/store/persistConfig';
import { AppDispatch } from '@/store';
import { clearCurrentDiagnosis, rateDiagnosis } from '@/store/slices/diagnosisSlice';
import RatingModal from '@/components/RatingModal';
import { useTheme } from '@/theme';

const DiagnosisResultScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  
  const diagnosis = useSelector((state: RootState) => state.diagnosis.currentDiagnosis);
  
  const [showRating, setShowRating] = useState(false);
  const [activeTab, setActiveTab] = useState<'symptoms' | 'treatment' | 'prevention'>('symptoms');
  
  const handleBack = () => {
    dispatch(clearCurrentDiagnosis());
    navigation.goBack();
  };
  
  const handleShare = async () => {
    if (!diagnosis) return;
    
    try {
      await Share.share({
        message: `I found ${diagnosis.diseaseName} in my ${diagnosis.cropName || 'plant'} using the Plant Disease Diagnosis app!`,
        url: diagnosis.serverImageUrl,
        title: 'Plant Disease Diagnosis Result'
      });
    } catch (error) {
      console.error('Error sharing diagnosis:', error);
      Alert.alert('Error', 'Failed to share diagnosis');
    }
  };
  
  const handleRating = async (rating: number, feedback?: string, isCorrect?: boolean) => {
    if (!diagnosis) return;
    
    try {
      await dispatch(rateDiagnosis({
        diagnosisId: diagnosis.diagnosisId,
        rating,
        feedback,
        isCorrect
      })).unwrap();
      
      setShowRating(false);
      Alert.alert('Thank You', 'Your feedback helps us improve our diagnosis system.');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };
  
  if (!diagnosis) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>No diagnosis available</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Diagnosis')}>
          <Text style={{ color: theme.colors.primary }}>Go to Diagnosis</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Diagnosis Result
        </Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Plant Image */}
        <View style={[styles.imageContainer, { backgroundColor: theme.colors.card }]}>
          <Image 
            source={{ uri: diagnosis.imageUri }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        {/* Diagnosis Info */}
        <View style={[styles.resultCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={[styles.cropName, { color: theme.colors.text }]}>
                {diagnosis.cropName || 'Unknown Plant'}
              </Text>
              <Text style={[styles.diseaseName, { color: theme.colors.danger }]}>
                {diagnosis.diseaseName}
              </Text>
            </View>
            <View style={[styles.confidenceTag, { backgroundColor: getConfidenceColor(diagnosis.confidence, theme) }]}>
              <Text style={styles.confidenceText}>
                {(diagnosis.confidence * 100).toFixed(0)}% Confidence
              </Text>
            </View>
          </View>
          
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {diagnosis.diseaseDescription || 'No description available'}
          </Text>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'symptoms' && { borderBottomColor: theme.colors.primary }
              ]}
              onPress={() => setActiveTab('symptoms')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'symptoms' ? theme.colors.primary : theme.colors.text }
              ]}>
                Symptoms
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'treatment' && { borderBottomColor: theme.colors.primary }
              ]}
              onPress={() => setActiveTab('treatment')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'treatment' ? theme.colors.primary : theme.colors.text }
              ]}>
                Treatment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'prevention' && { borderBottomColor: theme.colors.primary }
              ]}
              onPress={() => setActiveTab('prevention')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'prevention' ? theme.colors.primary : theme.colors.text }
              ]}>
                Prevention
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'symptoms' && (
              <Text style={[styles.tabContentText, { color: theme.colors.text }]}>
                {diagnosis.diseaseSymptoms || 'No symptom information available'}
              </Text>
            )}
            {activeTab === 'treatment' && (
              <Text style={[styles.tabContentText, { color: theme.colors.text }]}>
                {diagnosis.diseaseTreatment || 'No treatment information available'}
              </Text>
            )}
            {activeTab === 'prevention' && (
              <Text style={[styles.tabContentText, { color: theme.colors.text }]}>
                {diagnosis.diseasePrevention || 'No prevention information available'}
              </Text>
            )}
          </View>
          
          {/* Footer */}
          <View style={styles.resultFooter}>
            <Text style={[styles.resultTimestamp, { color: theme.colors.placeholder }]}>
              Diagnosed on {new Date(diagnosis.timestamp).toLocaleString()}
            </Text>
            <Text style={[styles.resultVersion, { color: theme.colors.placeholder }]}>
              Model v{diagnosis.modelVersion}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Rate Button */}
      {!diagnosis.isRated && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => setShowRating(true)}
          >
            <Ionicons name="star" size={20} color="white" />
            <Text style={styles.rateButtonText}>Rate This Diagnosis</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Rating Modal */}
      <RatingModal
        visible={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={handleRating}
      />
    </View>
  );
};

// Helper function to get confidence color
const getConfidenceColor = (confidence: number, theme: any) => {
  if (confidence >= 0.9) return theme.colors.success;
  if (confidence >= 0.75) return theme.colors.info;
  if (confidence >= 0.5) return theme.colors.warning;
  return theme.colors.danger;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropName: {
    fontSize: 16,
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  confidenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  confidenceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 100,
  },
  tabContentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resultFooter: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTimestamp: {
    fontSize: 12,
  },
  resultVersion: {
    fontSize: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  rateButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default DiagnosisResultScreen;
```

## Components

### DistrictSelector Component

```tsx
// components/DistrictSelector.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

// Rwanda districts
const rwandaDistricts = [
  'Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe',
  'Ngoma', 'Nyagatare', 'Rwamagana', 'Burera', 'Gakenke', 'Gicumbi', 'Musanze',
  'Rulindo', 'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza',
  'Nyaruguru', 'Ruhango', 'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke',
  'Rubavu', 'Rusizi', 'Rutsiro',
];

interface DistrictSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectDistrict: (district: string) => void;
}

const DistrictSelector: React.FC<DistrictSelectorProps> = ({
  visible,
  onClose,
  onSelectDistrict
}) => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  // Filter districts based on search text
  const filteredDistricts = rwandaDistricts.filter(district => 
    district.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const handleSelect = (district: string) => {
    setSelectedDistrict(district);
  };
  
  const handleConfirm = () => {
    onSelectDistrict(selectedDistrict);
  };
  
  const renderDistrict = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.districtItem,
        selectedDistrict === item && { backgroundColor: theme.colors.primary + '20' }
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[
        styles.districtText, 
        { color: theme.colors.text },
        selectedDistrict === item && { color: theme.colors.primary, fontWeight: 'bold' }
      ]}>
        {item}
      </Text>
      {selectedDistrict === item && (
        <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Your District
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.modalSubtitle, { color: theme.colors.text }]}>
            Please select your district to help us provide location-specific disease information.
          </Text>
          
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="search" size={20} color={theme.colors.placeholder} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search districts..."
              placeholderTextColor={theme.colors.placeholder}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.placeholder} />
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={filteredDistricts}
            renderItem={renderDistrict}
            keyExtractor={(item) => item}
            style={styles.districtList}
            contentContainerStyle={styles.districtListContent}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: theme.colors.primary },
                !selectedDistrict && { opacity: 0.5 }
              ]}
              onPress={handleConfirm}
              disabled={!selectedDistrict}
            >
              <Text style={styles.confirmButtonText}>Confirm Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  districtList: {
    flex: 1,
  },
  districtListContent: {
    paddingBottom: 8,
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  districtText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  confirmButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DistrictSelector;
```

### SubscriptionBanner Component

```tsx
// components/SubscriptionBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UsageInfo, UserSubscription } from '@/services/SubscriptionService';
import { useTheme } from '@/theme';

interface SubscriptionBannerProps {
  usage: UsageInfo;
  subscription: UserSubscription;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ usage, subscription }) => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  const isFree = subscription.subscriptionType === 'free';
  
  // Determine banner color based on usage and plan type
  const getBannerColor = () => {
    if (usage.limitReached) {
      return theme.colors.danger;
    }
    if (isFree) {
      return theme.colors.warning;
    }
    return theme.colors.success;
  };
  
  // Navigate to subscription screen
  const handleUpgrade = () => {
    navigation.navigate('Subscriptions');
  };
  
  return (
    <View style={[styles.banner, { backgroundColor: getBannerColor() }]}>
      <View style={styles.bannerContent}>
        <View style={styles.usageInfo}>
          <Text style={styles.usageText}>
            {usage.limitReached 
              ? 'Daily limit reached' 
              : `${usage.attemptsUsed}/${usage.dailyLimit === 'Unlimited' ? '∞' : usage.dailyLimit} diagnoses used today`
            }
          </Text>
          <Text style={styles.planText}>
            {subscription.planName} Plan
          </Text>
        </View>
        
        {(isFree || usage.limitReached) && (
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeText}>
              {isFree ? 'Upgrade' : 'View Plans'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageInfo: {
    flex: 1,
  },
  usageText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  planText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  upgradeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 4,
  },
});

export default SubscriptionBanner;
```

### RatingModal Component

```tsx
// components/RatingModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback?: string, isCorrect?: boolean) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);
  
  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    onSubmit(rating, feedback || undefined, isCorrect);
    
    // Reset form
    setRating(0);
    setFeedback('');
    setIsCorrect(undefined);
  };
  
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starContainer}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? theme.colors.warning : theme.colors.border}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Rate This Diagnosis
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              How accurate was the diagnosis?
            </Text>
            <View style={styles.starRating}>
              {renderStars()}
            </View>
            
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Was the diagnosis correct?
            </Text>
            <View style={styles.correctnessButtons}>
              <TouchableOpacity
                style={[
                  styles.correctnessButton,
                  { backgroundColor: theme.colors.background },
                  isCorrect === true && { backgroundColor: theme.colors.success }
                ]}
                onPress={() => setIsCorrect(true)}
              >
                <Text style={[
                  styles.correctnessText,
                  { color: theme.colors.text },
                  isCorrect === true && { color: 'white' }
                ]}>
                  Yes
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.correctnessButton,
                  { backgroundColor: theme.colors.background },
                  isCorrect === false && { backgroundColor: theme.colors.danger }
                ]}
                onPress={() => setIsCorrect(false)}
              >
                <Text style={[
                  styles.correctnessText,
                  { color: theme.colors.text },
                  isCorrect === false && { color: 'white' }
                ]}>
                  No
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.correctnessButton,
                  { backgroundColor: theme.colors.background },
                  isCorrect === undefined && isCorrect !== null && { backgroundColor: theme.colors.info }
                ]}
                onPress={() => setIsCorrect(undefined)}
              >
                <Text style={[
                  styles.correctnessText,
                  { color: theme.colors.text },
                  isCorrect === undefined && isCorrect !== null && { color: 'white' }
                ]}>
                  Not Sure
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Additional Feedback (Optional)
            </Text>
            <TextInput
              style={[
                styles.feedbackInput,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }
              ]}
              multiline
              placeholder="Share your thoughts about the diagnosis..."
              placeholderTextColor={theme.colors.placeholder}
              value={feedback}
              onChangeText={setFeedback}
              maxLength={500}
            />
            
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starContainer: {
    padding: 6,
  },
  correctnessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  correctnessButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  correctnessText: {
    fontWeight: '500',
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RatingModal;
```

## App Setup and Initialization

```tsx
// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, AppState, AppStateStatus } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from './store';
import { ThemeProvider } from './theme';
import RootNavigator from './navigation/RootNavigator';
import SyncService from './services/SyncService';
import NetworkService from './services/NetworkService';

const App = () => {
  // Handle app state changes for background syncing
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, sync if online
        if (NetworkService.isNetworkConnected()) {
          SyncService.performSync().catch(console.error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" />
            <RootNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
```

This implementation provides a complete solution for your agricultural disease diagnosis app with offline capabilities, subscription management, and all the features you've requested. The code is structured to handle:

1. **Offline Model Management**:
   - Downloads and stores models locally
   - Verifies integrity with hash checks
   - Handles updates when online

2. **User Flow Management**:
   - District selection
   - Subscription checking
   - Daily usage limits
   - Image capture and processing

3. **Diagnosis Process**:
   - Uses online API when connected
   - Falls back to local model when offline
   - Stores results for history

4. **Data Synchronization**:
   - Syncs ratings and diagnoses when online
   - Handles pending user detail actions
   - Updates local database with fresh data

The UI follows your theme specifications and includes all the screens and components needed for the complete user experience.