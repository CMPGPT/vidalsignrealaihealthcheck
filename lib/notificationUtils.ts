export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  browserNotifications: boolean;
  mobileNotifications: boolean;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private audioContext: AudioContext | null = null;
  private notificationSound: AudioBuffer | null = null;
  private settings: NotificationSettings = {
    enabled: true,
    sound: true,
    browserNotifications: true,
    mobileNotifications: true,
  };

  private constructor() {
    this.initializeAudio();
    this.loadSettings();
    this.registerServiceWorker();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadNotificationSound();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  private async loadNotificationSound() {
    try {
      // Create a simple notification sound using Web Audio API
      const sampleRate = this.audioContext!.sampleRate;
      const duration = 0.3; // 300ms
      const buffer = this.audioContext!.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate a pleasant notification tone
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const frequency = 800 + 200 * Math.sin(2 * Math.PI * 2 * t); // Frequency sweep
        data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.3;
      }

      this.notificationSound = buffer;
    } catch (error) {
      console.warn('Failed to load notification sound:', error);
    }
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load notification settings:', error);
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save notification settings:', error);
    }
  }

  public updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.warn('Failed to request notification permission:', error);
      return false;
    }
  }

  public async sendNotification(title: string, options: NotificationOptions = {}) {
    if (!this.settings.enabled) return;

    // Play sound if enabled
    if (this.settings.sound) {
      this.playNotificationSound();
    }

    // Send browser notification if enabled and permission granted
    if (this.settings.browserNotifications && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/icon.ico',
          badge: '/icon.ico',
          tag: 'chat-notification',
          requireInteraction: false,
          silent: !this.settings.sound, // Let browser handle sound if we're not playing our own
          ...options,
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      } catch (error) {
        console.warn('Failed to send browser notification:', error);
      }
    }

    // For mobile devices, we can also vibrate if supported
    if (this.settings.mobileNotifications && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch (error) {
        console.warn('Vibration not supported:', error);
      }
    }
  }

  private playNotificationSound() {
    if (!this.audioContext || !this.notificationSound) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.notificationSound;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  public async sendChatNotification(senderName: string, message: string) {
    const title = `New message from ${senderName}`;
    const options: NotificationOptions = {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      data: { type: 'chat', sender: senderName },
    };

    return this.sendNotification(title, options);
  }

  public isSupported(): boolean {
    return 'Notification' in window || 'vibrate' in navigator;
  }

  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}

// Export a singleton instance
export const notificationManager = NotificationManager.getInstance(); 