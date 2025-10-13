/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  MapPin,
  Phone,
  Building2,
  X,
  UserRoundCheck,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ICreateFarmerData,
  ICreateRestaurantData,
  UserRole,
} from "@/lib/types";
import { authService } from "@/app/services/authService";
import { locationService } from "@/app/services/locationService";

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  password?: string;
  tin?: string;
}

interface LocationState {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  textAddress: string;
}

// Component to handle search params
function SignupSearchParamsHandler({
  setSelectedRole,
}: {
  setSelectedRole: (role: UserRole) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams?.get("role");
    if (role === "restaurant") {
      setSelectedRole(UserRole.RESTAURANT);
    } else if (role === "farmer") {
      setSelectedRole(UserRole.FARMER);
    }
  }, [searchParams, setSelectedRole]);

  return null;
}

// Location Modal Component
function LocationModal({
  isOpen,
  onClose,
  onSelectLocation,
  disabled,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationState) => void;
  disabled: boolean;
}) {
  const [locationData, setLocationData] = useState<LocationState>({
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    textAddress: "",
  });

  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [cells, setCells] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    sectors: false,
    cells: false,
    villages: false,
  });

  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadProvinces();
    }
  }, [isOpen]);

  useEffect(() => {
    if (locationData.province) {
      loadDistricts(locationData.province);
    } else {
      setDistricts([]);
      setSectors([]);
      setCells([]);
      setVillages([]);
    }
  }, [locationData.province]);

  useEffect(() => {
    if (locationData.district && locationData.province) {
      loadSectors(locationData.province, locationData.district);
    } else {
      setSectors([]);
      setCells([]);
      setVillages([]);
    }
  }, [locationData.district, locationData.province]);

  useEffect(() => {
    if (locationData.sector && locationData.district && locationData.province) {
      loadCells(locationData.province, locationData.district, locationData.sector);
    } else {
      setCells([]);
      setVillages([]);
    }
  }, [locationData.sector, locationData.district, locationData.province]);

  useEffect(() => {
    if (
      locationData.cell &&
      locationData.sector &&
      locationData.district &&
      locationData.province
    ) {
      loadVillages(
        locationData.province,
        locationData.district,
        locationData.sector,
        locationData.cell
      );
    } else {
      setVillages([]);
    }
  }, [locationData.cell, locationData.sector, locationData.district, locationData.province]);

  const loadProvinces = async () => {
    setLoading((prev) => ({ ...prev, provinces: true }));
    setLocationError("");
    try {
      const locationHierarchy = await locationService.fetchLocationHierarchy([]);
      const provinceNames = Array.isArray(locationHierarchy)
        ? locationHierarchy.map((prov: any) => prov.name || prov)
        : locationHierarchy.provinces
        ? locationHierarchy.provinces.map((prov: any) => prov.name || prov)
        : [];

      if (provinceNames.length === 0) {
        setLocationError("Unable to load provinces. Please try again later.");
      }
      setProvinces(provinceNames);
    } catch (error) {
      console.error("Failed to load provinces:", error);
      setLocationError("Failed to load provinces. Please check your connection.");
      setProvinces([]);
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }));
    }
  };

  const loadDistricts = async (province: string) => {
    setLoading((prev) => ({ ...prev, districts: true }));
    setLocationError("");
    try {
      const districts = await locationService.getDistrictsByProvince(province);
      setDistricts(districts);
      if (districts.length === 0) {
        setLocationError("No districts found for this province.");
      }
    } catch (error) {
      console.error("Failed to load districts:", error);
      setLocationError("Failed to load districts.");
      setDistricts([]);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const loadSectors = async (province: string, district: string) => {
    setLoading((prev) => ({ ...prev, sectors: true }));
    setLocationError("");
    try {
      const sectors = await locationService.getSectorsByDistrict(province, district);
      setSectors(sectors);
      if (sectors.length === 0) {
        setLocationError("No sectors found for this district.");
      }
    } catch (error) {
      console.error("Failed to load sectors:", error);
      setLocationError("Failed to load sectors.");
      setSectors([]);
    } finally {
      setLoading((prev) => ({ ...prev, sectors: false }));
    }
  };

  const loadCells = async (province: string, district: string, sector: string) => {
    setLoading((prev) => ({ ...prev, cells: true }));
    setLocationError("");
    try {
      const cells = await locationService.getCellsBySector(province, district, sector);
      setCells(cells);
      if (cells.length === 0) {
        setLocationError("No cells found for this sector.");
      }
    } catch (error) {
      console.error("Failed to load cells:", error);
      setLocationError("Failed to load cells.");
      setCells([]);
    } finally {
      setLoading((prev) => ({ ...prev, cells: false }));
    }
  };

  const loadVillages = async (
    province: string,
    district: string,
    sector: string,
    cell: string
  ) => {
    setLoading((prev) => ({ ...prev, villages: true }));
    setLocationError("");
    try {
      const villages = await locationService.getVillagesByCell(
        province,
        district,
        sector,
        cell
      );
      setVillages(villages);
      if (villages.length === 0) {
        setLocationError("No villages found for this cell.");
      }
    } catch (error) {
      console.error("Failed to load villages:", error);
      setLocationError("Failed to load villages.");
      setVillages([]);
    } finally {
      setLoading((prev) => ({ ...prev, villages: false }));
    }
  };

  const handleSelect = (field: keyof LocationState, value: string) => {
    const updates: Partial<LocationState> = { [field]: value };

    // Reset subsequent fields
    if (field === "province") {
      updates.district = "";
      updates.sector = "";
      updates.cell = "";
      updates.village = "";
    } else if (field === "district") {
      updates.sector = "";
      updates.cell = "";
      updates.village = "";
    } else if (field === "sector") {
      updates.cell = "";
      updates.village = "";
    } else if (field === "cell") {
      updates.village = "";
    }

    setLocationData((prev) => ({ ...prev, ...updates }));
  };

  const handleConfirm = () => {
    if (locationData.village) {
      const textAddress = `${locationData.province}, ${locationData.district}, ${locationData.sector}, ${locationData.cell}, ${locationData.village}`;
      onSelectLocation({
        ...locationData,
        textAddress,
      });
      onClose();
      // Reset for next time
      setLocationData({
        province: "",
        district: "",
        sector: "",
        cell: "",
        village: "",
        textAddress: "",
      });
    }
  };

  const handleReset = () => {
    setLocationData({
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      textAddress: "",
    });
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
  };

  const renderDropdown = (
    options: string[],
    value: string,
    placeholder: string,
    field: keyof LocationState,
    isLoading: boolean
  ) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => handleSelect(field, e.target.value)}
        disabled={disabled || isLoading || options.length === 0}
        className="w-full px-4 py-3 border border-gray-300 text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none bg-white appearance-none pr-10"
      >
        <option value="" disabled>
          {`Select ${placeholder}`}
        </option>
        {options.map((option, index) => (
          <option key={`${option}-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Select Your Location</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {locationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {locationError}
            </div>
          )}

          <div className="space-y-4">
            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province
              </label>
              {renderDropdown(
                provinces,
                locationData.province,
                "Province",
                "province",
                loading.provinces
              )}
            </div>

            {/* District */}
            {locationData.province && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                {renderDropdown(
                  districts,
                  locationData.district,
                  "District",
                  "district",
                  loading.districts
                )}
              </div>
            )}

            {/* Sector */}
            {locationData.district && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                {renderDropdown(
                  sectors,
                  locationData.sector,
                  "Sector",
                  "sector",
                  loading.sectors
                )}
              </div>
            )}

            {/* Cell */}
            {locationData.sector && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cell
                </label>
                {renderDropdown(cells, locationData.cell, "Cell", "cell", loading.cells)}
              </div>
            )}

            {/* Village */}
            {locationData.cell && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Village
                </label>
                {renderDropdown(
                  villages,
                  locationData.village,
                  "Village",
                  "village",
                  loading.villages
                )}
              </div>
            )}

            {/* Progress indicator */}
            <div className="pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${
                        Object.values(locationData).filter(
                          (v) => v && v !== locationData.textAddress
                        ).length * 20
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  {
                    Object.values(locationData).filter(
                      (v) => v && v !== locationData.textAddress
                    ).length
                  }
                  /5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {locationData.province && (
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              disabled={disabled}
            >
              Reset
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!locationData.village || disabled}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

// Main signup form component
function SignupForm() {
  const [selectedRole, setSelectedRole] = useState(UserRole.RESTAURANT);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [backendMessage, setBackendMessage] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [locationData, setLocationData] = useState<LocationState>({
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    textAddress: "",
  });

  const router = useRouter();

  useEffect(() => {
    checkBackendAvailability();
  }, []);

  useEffect(() => {
    setLocationData({
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      textAddress: "",
    });
  }, [selectedRole]);

  async function checkBackendAvailability() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`, {
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setIsBackendAvailable(true);
      } else {
        setIsBackendAvailable(false);
        setBackendMessage("Service temporarily unavailable. Please try again later.");
      }
    } catch (error) {
      setIsBackendAvailable(false);
      setBackendMessage("Service temporarily unavailable. Please try again later.");
    }
  }

  function validateEmail(email: string): string | null {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 254) return "Email address is too long";
    return null;
  }

  function validatePhone(phone: string): string | null {
    if (!phone.trim()) return "Phone number is required";
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      return "Please enter a valid phone number (10-15 digits)";
    }
    return null;
  }

  function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    if (!/(?=.*[@$!%*?&])/.test(password))
      return "Password must contain at least one special character (@$!%*?&)";
    return null;
  }

  function validateRestaurantName(name: string): string | null {
    if (!name.trim()) return "Restaurant name is required";
    if (name.trim().length < 2) return "Restaurant name must be at least 2 characters";
    if (name.trim().length > 100)
      return "Restaurant name is too long (max 100 characters)";
    if (!/^[a-zA-Z0-9\s\-'&.]+$/.test(name.trim())) {
      return "Restaurant name contains invalid characters";
    }
    return null;
  }

  function validateLocation(locationState: LocationState): string | null {
    if (selectedRole === UserRole.FARMER) {
      if (!locationState.province) return "Please select a province";
      if (!locationState.district) return "Please select a district";
      if (!locationState.sector) return "Please select a sector";
      if (!locationState.cell) return "Please select a cell";
      if (!locationState.village) return "Please select a village";
      return null;
    }

    const location = locationState.textAddress;
    if (!location.trim()) return "Location is required";
    if (location.trim().length < 3) return "Please provide a more specific location";
    if (location.trim().length > 255) return "Location is too long";
    return null;
  }

  function validateForm(formData: FormData): ValidationErrors {
    const errors: ValidationErrors = {};

    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (selectedRole === UserRole.RESTAURANT) {
      const nameError = validateRestaurantName(name);
      if (nameError) errors.name = nameError;
    }

    if (selectedRole === UserRole.RESTAURANT || (email && email.trim())) {
      const emailError = validateEmail(email);
      if (emailError) errors.email = emailError;
    }

    if (selectedRole === UserRole.RESTAURANT) {
      const tin = formData.get("tin") as string;
      if (!tin || !/^[0-9]{9}$/.test(tin) || /^0+$/.test(tin)) {
        errors.tin = "TIN must be a valid 9-digit number (not all zeros)";
      }
    }


    const phoneError = validatePhone(phone);
    if (phoneError) errors.phone = phoneError;

    const locationError = validateLocation(locationData);
    if (locationError) errors.location = locationError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    return errors;
  }

  const handleLocationChange = (newLocationData: LocationState) => {
    setLocationData(newLocationData);
    if (validationErrors.location) {
      setValidationErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  const handleInputChange = (field: keyof ValidationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    setValidationErrors({});

    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const name = formData.get("name") as string;
    const locationToSave = locationData.textAddress.trim();

    try {
      if (selectedRole === UserRole.FARMER) {
        const farmerData: ICreateFarmerData = {
          email: email || undefined,
          password,
          tin: formData.get("tin") as string,
          location: locationToSave,
          phone,
        };
        await authService.registerFarmer(farmerData);
      } else if (selectedRole === UserRole.RESTAURANT) {
        const restaurantData: ICreateRestaurantData = {
          name,
          email,
          password,
          tin: (formData.get("tin") as string) || "",
          location: locationToSave,
          phone,
        };
        await authService.registerRestaurant(restaurantData);
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.response?.data?.message || error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-center w-full max-w-3xl">
      <Suspense fallback={null}>
        <SignupSearchParamsHandler setSelectedRole={setSelectedRole} />
      </Suspense>

      {/* Left side: role selection */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-white">
        <h2 className="text-[16px] font-medium text-black mb-4">
          Choose Your Role
        </h2>

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => setSelectedRole(UserRole.RESTAURANT)}
            className={`w-full h-12 border transition-all relative rounded px-2 text-[14px] cursor-pointer ${
              selectedRole === UserRole.RESTAURANT
                ? "border-green-500 bg-white"
                : "border-gray-200 hover:border-green-500"
            }`}
            disabled={!isBackendAvailable}
          >
            <h3 className="text-left text-gray-900">I'm a Restaurant</h3>
            {selectedRole === UserRole.RESTAURANT && (
              <UserRoundCheck className="absolute top-3 right-3 h-5 w-5 text-green-600" />
            )}
          </button>

          <button
            onClick={() => setSelectedRole(UserRole.FARMER)}
            className={`w-full h-12 border transition-all relative shadow-none rounded px-2 text-[14px] cursor-pointer ${
              selectedRole === UserRole.FARMER
                ? "border-green-500 bg-white"
                : "border-gray-200 hover:border-green-200"
            }`}
            disabled={!isBackendAvailable}
          >
            <h3 className="text-left text-gray-900">I'm a Farmer</h3>
            {selectedRole === UserRole.FARMER && (
              <UserRoundCheck className="absolute top-3 right-3 h-5 w-5 text-green-600" />
            )}
          </button>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden md:block w-[.5px] bg-gray-300 h-100" />

      {/* Right side: form */}
      <div className="w-full md:w-1/2 p-6 md:p-8">
        {!isBackendAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm mb-4">
            {backendMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
            {success}
          </div>
        )}

        <div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">
            Create {selectedRole === UserRole.FARMER ? "Farmer" : "Restaurant"}{" "}
            Account
          </h2>
          <p className="text-gray-900 text-[14px] mb-6">
            Thank you for choosing Food Bundles.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedRole === UserRole.RESTAURANT && (
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Restaurant Name"
                  className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                    validationErrors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={!isBackendAvailable || isLoading}
                  onChange={() => handleInputChange("name")}
                />
                {validationErrors.name && (
                  <p className="text-red-600 text-xs mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type="email"
                name="email"
                placeholder={
                  selectedRole === UserRole.FARMER ? "Email" : "Email Address"
                }
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
                onChange={() => handleInputChange("email")}
              />
              {validationErrors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {selectedRole === UserRole.RESTAURANT && (
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                <Input
                  type="text"
                  name="tin"
                  placeholder="TIN Number"
                  className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                    validationErrors.tin
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={!isBackendAvailable || isLoading}
                  onChange={() => handleInputChange("tin")}
                />
                {validationErrors.tin && (
                  <p className="text-red-600 text-xs mt-1">
                    {validationErrors.tin}
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.phone
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
                onChange={() => handleInputChange("phone")}
              />
              {validationErrors.phone && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Location field with modal for farmers */}
            {selectedRole === UserRole.FARMER ? (
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                  <Input
                    type="text"
                    value={locationData.textAddress}
                    readOnly
                    onClick={() => setIsLocationModalOpen(true)}
                    placeholder="Click to select location"
                    className={`pl-10 h-10 border-gray-300 text-gray-900 cursor-pointer rounded-none ${
                      validationErrors.location
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={!isBackendAvailable || isLoading}
                  />
                  {validationErrors.location && (
                    <p className="text-red-600 text-xs mt-1">
                      {validationErrors.location}
                    </p>
                  )}
                </div>

                {/* Location Modal */}
                <LocationModal
                  isOpen={isLocationModalOpen}
                  onClose={() => setIsLocationModalOpen(false)}
                  onSelectLocation={handleLocationChange}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                <Input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={locationData.textAddress}
                  onChange={(e) =>
                    handleLocationChange({
                      ...locationData,
                      textAddress: e.target.value,
                    })
                  }
                  className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                    validationErrors.location
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  disabled={!isBackendAvailable || isLoading}
                />
                {validationErrors.location && (
                  <p className="text-red-600 text-xs mt-1">
                    {validationErrors.location}
                  </p>
                )}
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className={`pl-10 h-10 border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 rounded-none ${
                  validationErrors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                disabled={!isBackendAvailable || isLoading}
                onChange={() => handleInputChange("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-900 hover:text-gray-800 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {validationErrors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium cursor-pointer"
              disabled={isLoading || !isBackendAvailable}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[13px] text-gray-900">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-4 px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center w-full max-w-3xl">
            <div className="w-1/2 p-8 flex flex-col justify-center bg-white">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="w-[.5px] bg-gray-300 h-100" />
            <div className="w-1/2 p-8">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}