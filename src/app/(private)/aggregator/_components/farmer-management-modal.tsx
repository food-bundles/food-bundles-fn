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
import { Badge } from "@/components/ui/badge";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import type { Farmer } from "@/app/contexts/FarmersContext";

interface FarmerManagementModalProps {
  farmer: Farmer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onEdit: (farmerId: string, data: any) => Promise<void>;
}

export function FarmerManagementModal({
  farmer,
  open,
  onOpenChange,
  onUpdate,
  onEdit,
}: FarmerManagementModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionPage, setSubmissionPage] = useState(1);
  const submissionsPerPage = 5;

  // Edit form state
  const [editData, setEditData] = useState({
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (farmer) {
      setEditData({
        province: farmer.province,
        district: farmer.district,
        sector: farmer.sector,
        cell: farmer.cell,
        village: farmer.village,
        phone: farmer.phone || "",
        email: farmer.email || "",
      });
    }
  }, [farmer]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (farmer) {
      setEditData({
        province: farmer.province,
        district: farmer.district,
        sector: farmer.sector,
        cell: farmer.cell,
        village: farmer.village,
        phone: farmer.phone || "",
        email: farmer.email || "",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!farmer) return;
    
    setIsLoading(true);
    try {
      await onEdit(farmer.id, editData);
      toast.success("Farmer updated successfully");
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to update farmer:", error);
      toast.error(error.message || "Failed to update farmer");
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination for submissions
  const submissions = farmer?.submissions || [];
  const totalSubmissions = submissions.length;
  const totalPages = Math.ceil(totalSubmissions / submissionsPerPage);
  const startIndex = (submissionPage - 1) * submissionsPerPage;
  const paginatedSubmissions = submissions.slice(startIndex, startIndex + submissionsPerPage);

  if (!farmer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] bg-white text-gray-900 border-gray-200 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-gray-900">
            Farmer Management
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            View and manage farmer details and submissions
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
          {isEditing ? (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province" className="text-gray-900">Province</Label>
                  <Input
                    id="province"
                    value={editData.province}
                    onChange={(e) => setEditData(prev => ({ ...prev, province: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-gray-900">District</Label>
                  <Input
                    id="district"
                    value={editData.district}
                    onChange={(e) => setEditData(prev => ({ ...prev, district: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-gray-900">Sector</Label>
                  <Input
                    id="sector"
                    value={editData.sector}
                    onChange={(e) => setEditData(prev => ({ ...prev, sector: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cell" className="text-gray-900">Cell</Label>
                  <Input
                    id="cell"
                    value={editData.cell}
                    onChange={(e) => setEditData(prev => ({ ...prev, cell: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="village" className="text-gray-900">Village</Label>
                <Input
                  id="village"
                  value={editData.village}
                  onChange={(e) => setEditData(prev => ({ ...prev, village: e.target.value }))}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900">Phone</Label>
                <Input
                  id="phone"
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

          ) : (
            <div className="py-4 space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Province:</div>
                  <div className="text-sm col-span-2 text-gray-900 font-medium">{farmer.province}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">District:</div>
                  <div className="text-sm col-span-2 text-gray-900">{farmer.district}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Sector:</div>
                  <div className="text-sm col-span-2 text-gray-900">{farmer.sector}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Cell:</div>
                  <div className="text-sm col-span-2 text-gray-900">{farmer.cell}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Village:</div>
                  <div className="text-sm col-span-2 text-gray-900">{farmer.village}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Phone:</div>
                  <div className="text-sm col-span-2 text-gray-900">{farmer.phone || "Not provided"}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Email:</div>
                  <div className="text-sm col-span-2 text-gray-900">{farmer.email || "Not provided"}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Status:</div>
                  <div className="text-sm col-span-2">
                    <Badge className={
                      farmer.status === "active" ? "bg-green-100 text-green-800" :
                      farmer.status === "inactive" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {farmer.status ? farmer.status.charAt(0).toUpperCase() + farmer.status.slice(1) : "Active"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Total Submissions:</div>
                  <div className="text-sm col-span-2 text-gray-900">{totalSubmissions} submissions</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Joined:</div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {new Date(farmer.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* Submissions Section */}
              {totalSubmissions > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">Recent Submissions</h4>
                    <span className="text-xs text-gray-500">
                      {startIndex + 1}-{Math.min(startIndex + submissionsPerPage, totalSubmissions)} of {totalSubmissions}
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {paginatedSubmissions.map((submission: any) => (
                      <div key={submission.id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{submission.productName}</p>
                            <p className="text-xs text-gray-600">Quantity: {submission.submittedQty} kg</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(submission.submittedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSubmissionPage(prev => Math.max(1, prev - 1))}
                        disabled={submissionPage === 1}
                        className="text-xs"
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-gray-500">
                        Page {submissionPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSubmissionPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={submissionPage === totalPages}
                        className="text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center gap-1 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}