
"use client";
import { useState } from 'react';
import { 
  User, 
  MapPin,
  Camera,
  Save,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FarmerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    name: "Jean Claude Niyonshuti",
    email: "jean.niyonshuti@gmail.com",
    phone: "+250 788 123 456",
    profilePhoto: "/api/placeholder/100/100",
    farmName: "Green Valley Farm",
    farmLocation: "Musanze, Northern Province",
    registrationNumber: "FARM-2024-001234",
    bio: "Experienced organic farmer specializing in vegetables and fruits. Committed to sustainable farming practices and high-quality produce."
  });

  const handleProfileChange = (field: string, value: string | ArrayBuffer | null) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    // Here you would typically send the data to your backend
    setIsEditing(false);
    // Show success message
    console.log('Profile saved:', profile);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string | null;
      if (result) {
        handleProfileChange("profilePhoto", result);
      }
    };
    reader.readAsDataURL(file);
  }
};


  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">View and edit your personal and farm information</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your personal and farm details</CardDescription>
          </div>
          <Button 
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b">
            <div className="relative">
             
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 cursor-pointer">
                  <Button
                    size="sm"
                    className="rounded-full w-10 h-10 p-0 bg-green-600 hover:bg-green-700"
                    asChild
                  >
                    <span>
                      <Camera className="w-4 h-4" />
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{profile.name}</h3>
              <p className="text-gray-600 text-lg">{profile.farmName}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Verified Farmer
                </Badge>
                <Badge variant="outline">
                  Active
                </Badge>
              </div>
              {!isEditing && profile.bio && (
                <p className="text-gray-600 mt-3 text-sm leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="mt-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="mt-2"
                  required
                />
              </div>
              {isEditing && (
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Tell buyers about yourself and your farming experience..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Farm Details */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Farm Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="farmLocation">Farm Location *</Label>
                <Textarea
                  id="farmLocation"
                  value={profile.farmLocation}
                  onChange={(e) => handleProfileChange('farmLocation', e.target.value)}
                  disabled={!isEditing}
                  className="mt-2"
                  rows={2}
                  placeholder="Enter your complete farm address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Profile Completion Status */}
          {!isEditing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-green-800">Profile Status</h5>
                  <p className="text-sm text-green-600 mt-1">
                    Your profile is {profile.bio ? '100%' : '85%'} complete
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 rounded-full transition-all"
                      style={{ width: profile.bio ? '100%' : '85%' }}
                    />
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    {profile.bio ? '100' : '85'}%
                  </span>
                </div>
              </div>
              {!profile.bio && (
                <p className="text-xs text-green-600 mt-2">
                  Add a bio to complete your profile and attract more buyers!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}