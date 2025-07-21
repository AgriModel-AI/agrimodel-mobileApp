// services/SubscriptionService.ts
import axiosInstance from '@/utils/axiosInstance';
import * as SQLite from 'expo-sqlite';
import NetworkService from './../NetworkService';

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
  dailyAttempts: number;
  isPlanFree: boolean;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isActive: boolean;
  subscriptionType: string;
}

export interface UsageInfo {
  date: string;
  attemptsUsed: number;
  dailyLimit: number;
  remainingAttempts: number;
  limitReached: boolean;
  isUnlimited: boolean;
  synced: number;
}

export interface SubscriptionUsage {
  usage: UsageInfo;
  subscription: UserSubscription;
}

class SubscriptionService {
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
      console.error('Error initializing SubscriptionService:', error);
      throw error;
    }
  }

  private async initDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Subscription plans table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS subscription_plans (
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
        )
      `);

      // User subscription table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_subscription (
          subscriptionId INTEGER,
          userId INTEGER NOT NULL,
          planId INTEGER NOT NULL,
          planName TEXT NOT NULL,
          dailyAttempts INTEGER,
          isPlanFree INTEGER NOT NULL DEFAULT 0,
          startDate TEXT NOT NULL,
          endDate TEXT NOT NULL,
          isActive INTEGER NOT NULL DEFAULT 1,
          daysRemaining INTEGER,
          subscriptionType TEXT NOT NULL,
          lastUpdated TEXT
        )
      `);

      // Daily usage table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS daily_usage (
          date TEXT NOT NULL,
          attemptsUsed INTEGER NOT NULL DEFAULT 0,
          dailyLimit INTEGER,
          remainingAttempts INTEGER,
          limitReached INTEGER NOT NULL DEFAULT 0,
          isUnlimited INTEGER NOT NULL DEFAULT 0,
          synced INTEGER NOT NULL DEFAULT 0,
          lastUpdated TEXT,
          PRIMARY KEY (date)
        )
      `);

      console.log('Subscription database initialized successfully');
    } catch (error) {
      console.error('Database init failed:', error);
      throw error;
    }
  }

  async fetchSubscriptionUsage(forceRefresh = false): Promise<SubscriptionUsage | null> {
    await this.initialize();

    // If online and forced refresh, get from server
    if (NetworkService.isNetworkConnected() && forceRefresh) {
      try {
        const response = await axiosInstance.get(`/subscriptions/usage`);
        const usage = response.data.data;
        console.log(usage)
        // Save to local database
        await this.saveSubscriptionUsage(usage, true);
        
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
        const response = await axiosInstance.get(`/subscriptions/usage`);
        const usage = response.data.data;
        console.log(usage)
        // Save to local database
        await this.saveSubscriptionUsage(usage, true);
        
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
        const response = await axiosInstance.post(`/subscriptions/usage`);
        const usage = response.data.data;
        
        // Save to local database
        await this.saveSubscriptionUsage(usage, true);
        
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
      await this.saveSubscriptionUsage(currentUsage, false);

      console.log(currentUsage)
      
      return currentUsage;
    }
    
    return null;
  }

  private async saveSubscriptionUsage(usage: SubscriptionUsage, synced: boolean): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const timestamp = new Date().toISOString();
      
      // Use withTransactionAsync for atomic operations
      await this.db.withTransactionAsync(async () => {
        // Save subscription info
        await this.db!.runAsync('DELETE FROM user_subscription');
        await this.db!.runAsync(
          `INSERT INTO user_subscription (
            subscriptionId, userId, planId, planName, dailyAttempts, isPlanFree, startDate, 
            endDate, isActive, daysRemaining, subscriptionType, lastUpdated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            usage.subscription.subscriptionId,
            usage.subscription.userId,
            usage.subscription.planId,
            usage.subscription.planName,
            usage.subscription.dailyAttempts,
            usage.subscription.isPlanFree ? 1 : 0,
            usage.subscription.startDate,
            usage.subscription.endDate,
            usage.subscription.isActive ? 1 : 0,
            usage.subscription.daysRemaining,
            usage.subscription.subscriptionType,
            timestamp
          ]
        );

        // Save daily usage
        await this.db!.runAsync('DELETE FROM daily_usage WHERE date = ?', [usage.usage.date]);
        await this.db!.runAsync(
          `INSERT INTO daily_usage (date, attemptsUsed, dailyLimit, remainingAttempts, limitReached, isUnlimited, lastUpdated, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [usage.usage.date, usage.usage.attemptsUsed, usage.usage.dailyLimit, usage.usage.remainingAttempts, usage.usage.limitReached ? 1 : 0, usage.usage.isUnlimited ? 1 : 0 ,timestamp, synced]
        );
      });
    } catch (error) {
      console.error('Error saving subscription usage:', error);
      throw error;
    }
  }

  private async getLocalSubscriptionUsage(): Promise<SubscriptionUsage | null> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const today = new Date().toISOString().split('T')[0];

    try {
      // Get subscription info
      const subResult = await this.db.getFirstAsync('SELECT * FROM user_subscription LIMIT 1');
      
      if (!subResult) {
        return null;
      }

      const sub = subResult as any;
      
      // Get daily usage
      const usageResult = await this.db.getFirstAsync(
        'SELECT * FROM daily_usage WHERE date = ?',
        [today]
      );
      
      // If no usage record for today, create one
      const attemptsUsed = usageResult ? (usageResult as any).attemptsUsed : 0;
      
      // Determine if unlimited
      const isUnlimited = false; // Assuming plan ID 1 is unlimited
      const dailyLimit = usageResult ? (usageResult as any).dailyLimit : sub.dailyAttempts || 0;
      const remainingAttempts = usageResult ? (usageResult as any).remainingAttempts : Math.max(0, (sub.dailyAttempts || 0) - attemptsUsed);
      const limitReached = usageResult ? (usageResult as any).limitReached === 1 :  attemptsUsed >= (sub.dailyAttempts || 0)
      const synced = usageResult ? (usageResult as any).synced : 0;
      
      const usage: SubscriptionUsage = {
        subscription: {
          subscriptionId: sub.subscriptionId,
          userId: sub.userId,
          planId: sub.planId,
          planName: sub.planName,
          dailyAttempts: sub.dailyAttempts,
          isPlanFree: sub.isPlanFree === 1,
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
          limitReached,
          isUnlimited,
          synced
        }
      };
      
      return usage;
    } catch (error) {
      console.error('Error getting local subscription usage:', error);
      throw error;
    }
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