// services/CropDiseaseService.ts
import axiosInstance from '@/utils/axiosInstance';
import * as SQLite from 'expo-sqlite';
import NetworkService from './../NetworkService';

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
      console.error('Error initializing CropDiseaseService:', error);
      throw error;
    }
  }

  private async initDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Crops table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS crops (
          cropId INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          growingConditions TEXT,
          harvestTime TEXT,
          images TEXT,
          createdAt TEXT,
          lastUpdated TEXT
        )
      `);

      // Diseases table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS diseases (
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
        )
      `);

      console.log('Crop and Disease database initialized successfully');
    } catch (error) {
      console.error('Database init failed:', error);
      throw error;
    }
  }

  async syncCrops(): Promise<boolean> {
    if (!NetworkService.isNetworkConnected()) {
      console.log('No network connection, skipping crop sync');
      return false;
    }

    try {
      await this.initialize();

      // Fetch crops from server
      const response = await axiosInstance.get(`/crop`);
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
      const response = await axiosInstance.get(`/disease`);
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
    if (!this.db) throw new Error('Database not initialized');

    try {
      const timestamp = new Date().toISOString();
      
      for (const crop of crops) {
        await this.db.runAsync(
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
      }

      console.log(`Saved ${crops.length} crops to local database`);
    } catch (error) {
      console.error('Error saving crops:', error);
      throw error;
    }
  }

  private async saveDiseases(diseases: Disease[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const timestamp = new Date().toISOString();
      
      for (const disease of diseases) {
        await this.db.runAsync(
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
      }

      console.log(`Saved ${diseases.length} diseases to local database`);
    } catch (error) {
      console.error('Error saving diseases:', error);
      throw error;
    }
  }

  async getCrops(): Promise<Crop[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync('SELECT * FROM crops ORDER BY name');
      
      const crops: Crop[] = result.map((item: any) => ({
        cropId: item.cropId,
        name: item.name,
        description: item.description,
        growingConditions: item.growingConditions,
        harvestTime: item.harvestTime,
        images: JSON.parse(item.images || '[]'),
        createdAt: item.createdAt
      }));

      return crops;
    } catch (error) {
      console.error('Error getting crops:', error);
      throw error;
    }
  }

  async getDiseases(cropId?: number): Promise<Disease[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const query = cropId
        ? 'SELECT * FROM diseases WHERE cropId = ? ORDER BY name'
        : 'SELECT * FROM diseases ORDER BY name';
      const params = cropId ? [cropId] : [];
      
      const result = await this.db.getAllAsync(query, params);
      
      const diseases: Disease[] = result.map((item: any) => ({
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
      }));

      return diseases;
    } catch (error) {
      console.error('Error getting diseases:', error);
      throw error;
    }
  }

  async getDisease(diseaseId: number): Promise<Disease | null> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM diseases WHERE diseaseId = ?',
        [diseaseId]
      );

      if (result) {
        const item = result as any;
        return {
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
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting disease:', error);
      throw error;
    }
  }

  async getDiseaseByLabel(label: string): Promise<Disease | null> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM diseases WHERE label = ?',
        [label]
      );

      if (result) {
        const item = result as any;
        return {
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
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting disease:', error);
      throw error;
    }
  }
}

export default new CropDiseaseService();