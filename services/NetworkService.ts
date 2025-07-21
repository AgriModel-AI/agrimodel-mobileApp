// services/NetworkService.ts
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

class NetworkService {
  private listeners: ((isConnected: boolean) => void)[] = [];
  private isConnected: boolean = false;
  private unsubscribe: NetInfoSubscription | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Get initial network state
    NetInfo.fetch().then(state => {
      this.handleConnectivityChange(state);
    });

    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
  }

  private handleConnectivityChange = (state: NetInfoState) => {
    // const online = state.isConnected && state.isInternetReachable !== false;
    const online = state.isConnected && (state.isInternetReachable ?? true);

    
    if (this.isConnected !== online) {
      this.isConnected = !!online;
      this.notifyListeners();
    }
  };

  public addListener(listener: (isConnected: boolean) => void): () => void {
    this.listeners.push(listener);
    
    // Notify the new listener of the current state immediately
    listener(this.isConnected);
    
    // Return a function to remove the listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isConnected));
  }

  public isNetworkConnected(): boolean {
    return this.isConnected;
  }

  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export default new NetworkService();