/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { locationService } from "@/app/services/locationService";

interface CreateFarmerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => Promise<void>;
}

interface LocationState {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

export function CreateFarmerModal({
  open,
  onOpenChange,
  onCreate,
}: CreateFarmerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
  });

  const [locationData, setLocationData] = useState<LocationState>({
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
  });

  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [cells, setCells] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  const [loading, setLoadingState] = useState({
    provinces: false,
    districts: false,
    sectors: false,
    cells: false,
    villages: false,
  });

  useEffect(() => {
    if (open) {
      loadProvinces();
    }
  }, [open]);

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
    if (locationData.cell && locationData.sector && locationData.district && locationData.province) {
      loadVillages(locationData.province, locationData.district, locationData.sector, locationData.cell);
    } else {
      setVillages([]);
    }
  }, [locationData.cell, locationData.sector, locationData.district, locationData.province]);

  const loadProvinces = async () => {
    setLoadingState((prev) => ({ ...prev, provinces: true }));
    try {
      const locationHierarchy = await locationService.fetchLocationHierarchy([]);
      const provinceNames = Array.isArray(locationHierarchy)
        ? locationHierarchy.map((prov: any) => prov.name || prov)
        : locationHierarchy.provinces
        ? locationHierarchy.provinces.map((prov: any) => prov.name || prov)
        : [];
      setProvinces(provinceNames);
    } catch (error) {
      console.error("Failed to load provinces:", error);
      toast.error("Failed to load provinces");
    } finally {
      setLoadingState((prev) => ({ ...prev, provinces: false }));
    }
  };

  const loadDistricts = async (province: string) => {
    setLoadingState((prev) => ({ ...prev, districts: true }));
    try {
      const districts = await locationService.getDistrictsByProvince(province);
      setDistricts(districts);
    } catch (error) {
      console.error("Failed to load districts:", error);
      toast.error("Failed to load districts");
    } finally {
      setLoadingState((prev) => ({ ...prev, districts: false }));
    }
  };

  const loadSectors = async (province: string, district: string) => {
    setLoadingState((prev) => ({ ...prev, sectors: true }));
    try {
      const sectors = await locationService.getSectorsByDistrict(province, district);
      setSectors(sectors);
    } catch (error) {
      console.error("Failed to load sectors:", error);
      toast.error("Failed to load sectors");
    } finally {
      setLoadingState((prev) => ({ ...prev, sectors: false }));
    }
  };

  const loadCells = async (province: string, district: string, sector: string) => {
    setLoadingState((prev) => ({ ...prev, cells: true }));
    try {
      const cells = await locationService.getCellsBySector(province, district, sector);
      setCells(cells);
    } catch (error) {
      console.error("Failed to load cells:", error);
      toast.error("Failed to load cells");
    } finally {
      setLoadingState((prev) => ({ ...prev, cells: false }));
    }
  };

  const loadVillages = async (province: string, district: string, sector: string, cell: string) => {
    setLoadingState((prev) => ({ ...prev, villages: true }));
    try {
      const villages = await locationService.getVillagesByCell(province, district, sector, cell);
      setVillages(villages);
    } catch (error) {
      console.error("Failed to load villages:", error);
      toast.error("Failed to load villages");
    } finally {
      setLoadingState((prev) => ({ ...prev, villages: false }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: keyof LocationState, value: string) => {
    const updates: Partial<LocationState> = { [field]: value };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone) {
      toast.error("Phone number is required");
      return;
    }

    if (!locationData.village) {
      toast.error("Please select complete location details");
      return;
    }

    setIsLoading(true);
    try {
      const farmerData = {
        ...formData,
        ...locationData,
        location: `${locationData.province}, ${locationData.district}, ${locationData.sector}, ${locationData.cell}, ${locationData.village}`,
      };
      
      await onCreate(farmerData);
      toast.success("Farmer created successfully. PIN sent via SMS.");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        phone: "",
        email: "",
      });
      setLocationData({
        province: "",
        district: "",
        sector: "",
        cell: "",
        village: "",
      });
    } catch (error: any) {
      console.error("Failed to create farmer:", error);
      toast.error(error.message || "Failed to create farmer");
    } finally {
      setIsLoading(false);
    }
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
        onChange={(e) => handleLocationChange(field, e.target.value)}
        disabled={isLoading || options.length === 0}
        className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none bg-white appearance-none pr-10"
      >
        <option value="" disabled>
          Select {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={`${option}-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white text-gray-900 border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Users className="h-5 w-5 text-green-600" />
            Create New Farmer
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new farmer account. PIN will be auto-generated and sent via SMS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Enter email (optional)"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Location Details *</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900">Province</Label>
                {renderDropdown(provinces, locationData.province, "Province", "province", loading.provinces)}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900">District</Label>
                {renderDropdown(districts, locationData.district, "District", "district", loading.districts)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900">Sector</Label>
                {renderDropdown(sectors, locationData.sector, "Sector", "sector", loading.sectors)}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900">Cell</Label>
                {renderDropdown(cells, locationData.cell, "Cell", "cell", loading.cells)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900">Village</Label>
              {renderDropdown(villages, locationData.village, "Village", "village", loading.villages)}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Farmer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}