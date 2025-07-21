// services/DiagnosisService.ts
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as SQLite from 'expo-sqlite';
import NetworkService from './../NetworkService';
import ModelService from './ModelService';

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
  synced?: number;
  isRated: boolean;
}

class DiagnosisService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize database
      this.db = await SQLite.openDatabaseAsync('agridiagnosis.db');
      await this.initDatabase();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing DiagnosisService:', error);
      throw error;
    }
  }

  private async initDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Diagnoses table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS diagnoses (
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
        )
      `);

      console.log('Diagnosis database initialized successfully');
    } catch (error) {
      console.error('Database init failed:', error);
      throw error;
    }
  }

  async diagnose(imageUri: string): Promise<DiagnosisResult> {
    await this.initialize();

    // If online, use server API for diagnosis
    if (NetworkService.isNetworkConnected()) {
      try {
        return await this.diagnoseOnline(imageUri);
      } catch (error) {
        console.error('Online diagnosis failed, falling back to local model:', error);
      }
    }

    // Fallback to local model if offline or server error
    return await this.diagnoseOffline(imageUri);
  }

  private async diagnoseOnline(imageUri: string): Promise<DiagnosisResult> {
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

    // Send to server
    // const response = await axiosInstance.post(`/predict`, formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });

    // const result = response.data;
    
    // Generate a unique ID for this diagnosis
    const diagnosisId = this.generateUUID();
    
    // Create diagnosis result object
    // const diagnosisResult: DiagnosisResult = {
    //   diagnosisId,
    //   modelId: result.modelId,
    //   modelVersion: result.version,
    //   cropId: result.cropId,
    //   cropName: result.cropName,
    //   imageUri,
    //   serverImageUrl: result.image_url,
    //   diseaseId: result.diseaseId,
    //   diseaseName: result.diseaseName,
    //   diseaseLabel: result.diseaseLabel,
    //   diseaseDescription: result.diseaseDescription,
    //   diseaseSymptoms: result.diseaseSymptoms,
    //   diseaseTreatment: result.diseaseTreatment,
    //   diseasePrevention: result.diseasePrevention,
    //   confidence: result.confident,
    //   timestamp: new Date().toISOString(),
    //   isRated: false
    // };

    const diagnosisResult: DiagnosisResult = {
      diagnosisId,
      modelId: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
      modelVersion: "v1.0.0",
      cropId: 2,
      cropName: "result.cropName",
      imageUri,
      serverImageUrl: "https://res.cloudinary.com/dpbonkkjd/image/upload/v1751976161/tg64ifdrcu51r6wuklju.jpg",
      diseaseId: 1,
      diseaseName: "result.diseaseName",
      diseaseLabel: "result.diseaseLabel",
      diseaseDescription: "result.diseaseDescription",
      diseaseSymptoms: "result.diseaseSymptoms",
      diseaseTreatment: "result.diseaseTreatment",
      diseasePrevention: "result.diseasePrevention",
      confidence: 0.98,
      timestamp: new Date().toISOString(),
      isRated: false
    };

    // Save to local database
    await this.saveDiagnosis(diagnosisResult, true);

    return diagnosisResult;
  }

  private async diagnoseOffline(imageUri: string): Promise<DiagnosisResult> {
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
    await tf.ready();

    // Load the model - assuming it's a converted TensorFlow.js model
    const model = await tf.loadLayersModel(`file://${modelPaths.modelPath}`);
    
    // Run inference
    const predictions = model.predict(processedImage) as tf.Tensor;
    
    // Process results
    const result = this.processResults(predictions, modelConfig);

    // Clean up tensors
    predictions.dispose();
    processedImage.dispose();

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

    // Read the image file as binary data
    const imageData = await FileSystem.readAsStringAsync(resizedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to Uint8Array
    const imageBuffer = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));

    // Decode the image using TensorFlow.js
    let imgTensor: tf.Tensor;
    const extension = resizedImage.uri.split('.').pop()?.toLowerCase();
    
    if (extension === 'png') {
      imgTensor = decodeJpeg(imageBuffer);
    } else {
      // Default to JPEG
      imgTensor = decodeJpeg(imageBuffer);
    }
    
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
    
    // Clean up intermediate tensors
    imgTensor.dispose();
    
    return batched;
  }

  private processResults(predictions: tf.Tensor, modelConfig: any): any {
    // Get the prediction values
    const predArray = predictions.arraySync() as number[][];
    const confidences = predArray[0]; // First batch item
    
    // Find the class with highest confidence
    let maxIndex = 0;
    let maxConfidence = 0;

    confidences.forEach((confidence: number, index: number) => {
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
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
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
        ]
      );
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      throw error;
    }
  }

  async getDiagnoses(): Promise<DiagnosisResult[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync('SELECT * FROM diagnoses ORDER BY timestamp DESC');
      
      const diagnoses: DiagnosisResult[] = result.map((item: any) => ({
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
      }));

      return diagnoses;
    } catch (error) {
      console.error('Error getting diagnoses:', error);
      throw error;
    }
  }

  async getDiagnosis(diagnosisId: string): Promise<DiagnosisResult | null> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM diagnoses WHERE diagnosisId = ?',
        [diagnosisId]
      );

      if (result) {
        const item = result as any;
        return {
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
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting diagnosis:', error);
      throw error;
    }
  }

  async markDiagnosisAsRated(diagnosisId: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        'UPDATE diagnoses SET isRated = 1 WHERE diagnosisId = ?',
        [diagnosisId]
      );
    } catch (error) {
      console.error('Error marking diagnosis as rated:', error);
      throw error;
    }
  }

  async getUnsyncedDiagnoses(): Promise<DiagnosisResult[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync('SELECT * FROM diagnoses WHERE synced = 0');
      
      const diagnoses: DiagnosisResult[] = result.map((item: any) => ({
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
      }));

      return diagnoses;
    } catch (error) {
      console.error('Error getting unsynced diagnoses:', error);
      throw error;
    }
  }

  async markDiagnosesAsSynced(diagnosisIds: string[]): Promise<void> {
    if (diagnosisIds.length === 0) return;
    
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const placeholders = diagnosisIds.map(() => '?').join(',');
      const query = `UPDATE diagnoses SET synced = 1 WHERE diagnosisId IN (${placeholders})`;
      
      await this.db.runAsync(query, diagnosisIds);
    } catch (error) {
      console.error('Error marking diagnoses as synced:', error);
      throw error;
    }
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