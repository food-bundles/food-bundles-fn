"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { User, MapPin, Sprout, Save, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/app/contexts/auth-context";
import { farmersService } from "@/app/services/farmersService";
import { farmerDashboardService } from "@/app/services/farmerDashboardService";
import type {
  FarmSizeUnit,
  FarmingMethod,
} from "@/app/types/farmer-dashboard";
import { showToast } from "@/lib/toast";

const personalSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(9, "Enter a valid phone number"),
});

const farmingSchema = z.object({
  farmSize: z.number().positive("Must be greater than 0").nullable().optional(),
  experienceYears: z.number().int().nonnegative().nullable().optional(),
  cooperativeName: z.string().nullable().optional(),
});

interface PersonalForm {
  name: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

interface FarmingForm {
  farmSize: string;
  farmSizeUnit: FarmSizeUnit | "";
  experienceYears: string;
  cooperativeMember: boolean;
  cooperativeName: string;
  farmingMethod: FarmingMethod | "";
}

const EMPTY_PERSONAL: PersonalForm = {
  name: "",
  email: "",
  phone: "",
  province: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
};

const EMPTY_FARMING: FarmingForm = {
  farmSize: "",
  farmSizeUnit: "",
  experienceYears: "",
  cooperativeMember: false,
  cooperativeName: "",
  farmingMethod: "",
};

export default function FarmerProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [personal, setPersonal] = useState<PersonalForm>(EMPTY_PERSONAL);
  const [farming, setFarming] = useState<FarmingForm>(EMPTY_FARMING);

  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const [farmerResult, farmingProfile] = await Promise.allSettled([
          farmersService.getFarmerById(user.id),
          farmerDashboardService.getFarmingProfile(),
        ]);

        if (farmerResult.status === "fulfilled") {
          const f = farmerResult.value.data;
          setPersonal({
            name: f.name || "",
            email: f.email || "",
            phone: f.phone || "",
            province: f.province || "",
            district: f.district || "",
            sector: f.sector || "",
            cell: f.cell || "",
            village: f.village || "",
          });
        }

        if (farmingProfile.status === "fulfilled") {
          const details = farmingProfile.value.FarmerProfile;
          setFarming({
            farmSize: details.farmSize?.toString() || "",
            farmSizeUnit: details.farmSizeUnit || "",
            experienceYears: details.experienceYears?.toString() || "",
            cooperativeMember: details.cooperativeMember,
            cooperativeName: details.cooperativeName || "",
            farmingMethod: details.farmingMethod || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        showToast("error", "Failed to load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    const personalResult = personalSchema.safeParse(personal);
    const farmingResult = farmingSchema.safeParse({
      farmSize: farming.farmSize ? Number(farming.farmSize) : null,
      experienceYears: farming.experienceYears ? Number(farming.experienceYears) : null,
      cooperativeName: farming.cooperativeName || null,
    });

    const newErrors: Record<string, string> = {};
    if (!personalResult.success) {
      for (const issue of personalResult.error.issues) {
        newErrors[issue.path.join(".")] = issue.message;
      }
    }
    if (!farmingResult.success) {
      for (const issue of farmingResult.error.issues) {
        newErrors[issue.path.join(".")] = issue.message;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (!user?.id) return;

    setSaving(true);
    try {
      await Promise.all([
        farmersService.updateFarmer(user.id, {
          name: personal.name,
          email: personal.email,
          phone: personal.phone,
          province: personal.province,
          district: personal.district,
          sector: personal.sector,
          cell: personal.cell,
          village: personal.village,
        }),
        farmerDashboardService.updateFarmingProfile({
          farmSize: farming.farmSize ? Number(farming.farmSize) : undefined,
          farmSizeUnit: farming.farmSizeUnit || undefined,
          experienceYears: farming.experienceYears ? Number(farming.experienceYears) : undefined,
          cooperativeMember: farming.cooperativeMember,
          cooperativeName: farming.cooperativeName || undefined,
          farmingMethod: farming.farmingMethod || undefined,
        }),
      ]);

      showToast("success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      showToast("error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const profileComplete =
    !!personal.name && !!personal.email && !!personal.phone && !!farming.farmSize;

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
            onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
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
                  value={personal.name}
                  onChange={(e) => setPersonal((p) => ({ ...p, name: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="e.g. Jean Claude Uwimana"
                  className="mt-2"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={personal.phone}
                  onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="e.g. 07XX XXX XXX"
                  className="mt-2"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={personal.email}
                  onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="you@example.com"
                  className="mt-2"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Registered Location
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  { field: "province", placeholder: "e.g. Kigali City" },
                  { field: "district", placeholder: "e.g. Gasabo" },
                  { field: "sector", placeholder: "e.g. Kimironko" },
                  { field: "cell", placeholder: "e.g. Kibagabaga" },
                  { field: "village", placeholder: "e.g. Ingabo" },
                ] as const
              ).map(({ field, placeholder }) => (
                <div key={field}>
                  <Label htmlFor={field} className="capitalize">{field}</Label>
                  <Input
                    id={field}
                    value={personal[field]}
                    onChange={(e) => setPersonal((p) => ({ ...p, [field]: e.target.value }))}
                    disabled={!isEditing}
                    placeholder={placeholder}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Farming Profile */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Farming Profile
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="farmSize">Farm Size</Label>
                <Input
                  id="farmSize"
                  type="number"
                  min="0"
                  value={farming.farmSize}
                  onChange={(e) => setFarming((f) => ({ ...f, farmSize: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="e.g. 2.5"
                  className="mt-2"
                />
                {errors.farmSize && <p className="text-red-500 text-sm mt-1">{errors.farmSize}</p>}
              </div>
              <div>
                <Label htmlFor="farmSizeUnit">Farm Size Unit</Label>
                <select
                  id="farmSizeUnit"
                  value={farming.farmSizeUnit}
                  onChange={(e) => setFarming((f) => ({ ...f, farmSizeUnit: e.target.value as FarmSizeUnit }))}
                  disabled={!isEditing}
                  className="mt-2 w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select unit</option>
                  <option value="HECTARES">Hectares</option>
                  <option value="ACRES">Acres</option>
                </select>
              </div>
              <div>
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={farming.experienceYears}
                  onChange={(e) => setFarming((f) => ({ ...f, experienceYears: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="e.g. 5"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="farmingMethod">Farming Method</Label>
                <select
                  id="farmingMethod"
                  value={farming.farmingMethod}
                  onChange={(e) => setFarming((f) => ({ ...f, farmingMethod: e.target.value as FarmingMethod }))}
                  disabled={!isEditing}
                  className="mt-2 w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select method</option>
                  <option value="ORGANIC">Organic</option>
                  <option value="CONVENTIONAL">Conventional</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-center justify-between border rounded-lg px-4 py-3">
                <div>
                  <Label htmlFor="cooperativeMember">Cooperative Member</Label>
                  <p className="text-xs text-gray-500">Are you part of a farming cooperative?</p>
                </div>
                <Switch
                  id="cooperativeMember"
                  checked={farming.cooperativeMember}
                  onCheckedChange={(checked) => setFarming((f) => ({ ...f, cooperativeMember: checked }))}
                  disabled={!isEditing}
                />
              </div>
              {farming.cooperativeMember && (
                <div className="md:col-span-2">
                  <Label htmlFor="cooperativeName">Cooperative Name</Label>
                  <Input
                    id="cooperativeName"
                    value={farming.cooperativeName}
                    onChange={(e) => setFarming((f) => ({ ...f, cooperativeName: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g. Twiyubake Cooperative"
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Profile Completion Status */}
          {!isEditing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-green-800">Profile Status</h5>
                  <p className="text-sm text-green-600 mt-1">
                    Your profile is {profileComplete ? "complete" : "incomplete"}
                  </p>
                </div>
              </div>
              {!profileComplete && (
                <p className="text-xs text-green-600 mt-2">
                  Add your farm size to complete your farming profile.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
