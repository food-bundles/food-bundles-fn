import { useState } from 'react';
import { 
  Bell, 
  Shield, 
  Globe, 
  Smartphone, 
  Mail, 
  Phone, 
  MessageSquare,
  Eye,
  EyeOff,
  Save,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FarmerSettings() {
  const [settings, setSettings] = useState({
    // Communication Preferences
    communicationMethod: "SMS",
    orderNotifications: true,
    paymentNotifications: true,
    marketUpdates: false,
    weatherAlerts: true,
    promotionalMessages: false,
    
    // Privacy Settings
    profileVisibility: "public",
    showContactInfo: true,
    showFarmLocation: true,
    allowDirectContact: true,
    
    // Account Security
    twoFactorEnabled: false,
    loginAlerts: true,
    
    // Business Settings
    autoAcceptOrders: false,
    minimumOrderValue: "50000",
    advancePaymentRequired: "50",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    workingHours: { start: "08:00", end: "17:00" },
    
    // Language and Region
    language: "English",
    currency: "RWF",
    timezone: "Africa/Kigali"
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleWorkingDayToggle = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically send the data to your backend
    console.log('Settings saved:', settings);
    setShowSuccessAlert(true);
    // Hide alert after 3 seconds
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 3000);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    // Handle password change logic
    console.log('Password change requested');
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswordChange(false);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              Communication Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="communicationMethod">Preferred Communication Method</Label>
              <Select 
                value={settings.communicationMethod} 
                onValueChange={(value) => handleSettingChange('communicationMethod', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMS">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      SMS
                    </div>
                  </SelectItem>
                  <SelectItem value="Email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="Phone">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Call
                    </div>
                  </SelectItem>
                  <SelectItem value="WhatsApp">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h5 className="font-medium">Notification Preferences</h5>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-gray-600">Receive alerts when payments are received</p>
                </div>
                <Switch 
                  checked={settings.paymentNotifications}
                  onCheckedChange={(checked) => handleSettingChange('paymentNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Market Updates</Label>
                  <p className="text-sm text-gray-600">Get updates about market prices and trends</p>
                </div>
                <Switch 
                  checked={settings.marketUpdates}
                  onCheckedChange={(checked) => handleSettingChange('marketUpdates', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control what information is visible to buyers and other users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Contact Information</Label>
                  <p className="text-sm text-gray-600">Display phone and email to potential buyers</p>
                </div>
                <Switch 
                  checked={settings.showContactInfo}
                  onCheckedChange={(checked) => handleSettingChange('showContactInfo', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Farm Location</Label>
                  <p className="text-sm text-gray-600">Display farm address on your profile</p>
                </div>
                <Switch 
                  checked={settings.showFarmLocation}
                  onCheckedChange={(checked) => handleSettingChange('showFarmLocation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Direct Contact</Label>
                  <p className="text-sm text-gray-600">Let buyers contact you directly</p>
                </div>
                <Switch 
                  checked={settings.allowDirectContact}
                  onCheckedChange={(checked) => handleSettingChange('allowDirectContact', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your account security and password settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <Switch 
                checked={settings.twoFactorEnabled}
                onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Login Alerts</Label>
                <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
              </div>
              <Switch 
                checked={settings.loginAlerts}
                onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
              />
            </div>

            <Separator />

            <div>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="w-full justify-start"
              >
                {showPasswordChange ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                Change Password
              </Button>

              {showPasswordChange && (
                <div className="mt-4 space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePasswordChange} size="sm" className="bg-green-600 hover:bg-green-700">
                      Update Password
                    </Button>
                    <Button onClick={() => setShowPasswordChange(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Language
            </CardTitle>
            <CardDescription>
              Set your preferred display language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleSettingChange("language", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Kinyarwanda">Kinyarwanda</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="Swahili">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </Button>
        </div>

        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mt-4 bg-green-50 border-green-600">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              ✅ Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}