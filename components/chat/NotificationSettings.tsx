'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Bell, Volume2, Smartphone } from 'lucide-react';
import { notificationManager, type NotificationSettings } from '@/lib/notificationUtils';
import { toast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  className?: string;
  variant?: 'icon' | 'button';
}

export default function NotificationSettings({ className, variant = 'icon' }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    browserNotifications: true,
    mobileNotifications: true,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Load current settings
    setSettings(notificationManager.getSettings());
    setIsSupported(notificationManager.isSupported());
    
    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationManager.updateSettings(newSettings);
    
    toast({
      title: 'Settings updated',
      description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await notificationManager.requestPermission();
      if (granted) {
        setPermissionStatus('granted');
        toast({
          title: 'Permission granted',
          description: 'You will now receive notifications',
        });
      } else {
        setPermissionStatus('denied');
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to request notification permission',
        variant: 'destructive',
      });
    }
  };

  const testNotification = async () => {
    try {
      await notificationManager.sendChatNotification('Test User', 'This is a test notification to verify your settings are working correctly.');
      toast({
        title: 'Test notification sent',
        description: 'Check if you received the notification and sound',
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test notification',
        variant: 'destructive',
      });
    }
  };

  if (!isSupported) {
    return null; // Don't show anything if notifications aren't supported
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 notification-settings-button ${className}`}
          aria-label="Notification Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Permission Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Browser Permission</Label>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <span className="text-sm">
                {permissionStatus === 'granted' ? '✅ Granted' : 
                 permissionStatus === 'denied' ? '❌ Denied' : '⚠️ Not set'}
              </span>
              {permissionStatus !== 'granted' && (
                <Button
                  size="sm"
                  onClick={handleRequestPermission}
                  disabled={permissionStatus === 'denied'}
                >
                  {permissionStatus === 'denied' ? 'Enable in Browser' : 'Request Permission'}
                </Button>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Notification Preferences</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="enabled" className="text-sm">Enable Notifications</Label>
                </div>
                <Switch
                  id="enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <Label htmlFor="sound" className="text-sm">Notification Sound</Label>
                </div>
                <Switch
                  id="sound"
                  checked={settings.sound}
                  onCheckedChange={(checked) => handleSettingChange('sound', checked)}
                  disabled={!settings.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="browserNotifications" className="text-sm">Browser Notifications</Label>
                </div>
                <Switch
                  id="browserNotifications"
                  checked={settings.browserNotifications}
                  onCheckedChange={(checked) => handleSettingChange('browserNotifications', checked)}
                  disabled={!settings.enabled || permissionStatus !== 'granted'}
                />
              </div>

              {notificationManager.isMobile() && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label htmlFor="mobileNotifications" className="text-sm">Mobile Vibrations</Label>
                  </div>
                  <Switch
                    id="mobileNotifications"
                    checked={settings.mobileNotifications}
                    onCheckedChange={(checked) => handleSettingChange('mobileNotifications', checked)}
                    disabled={!settings.enabled}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Test Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={testNotification}
              disabled={!settings.enabled || permissionStatus !== 'granted'}
              className="w-full"
              variant="outline"
            >
              Test Notification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 