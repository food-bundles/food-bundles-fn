"use client";
import React, { useState, useEffect } from "react";
import {
  useSubmissions,
  type FarmerSubmission as SubmissionType,
} from "@/app/contexts/submission-context";
import { toast } from "sonner";
import FarmerManagement from "./FarmerManagement";

interface FarmerSubmissionProps {
  initialSubmissions?: SubmissionType[];
}

export default function FarmerSubmission({
  initialSubmissions = [],
}: FarmerSubmissionProps) {
  const [activeTab, setActiveTab] = useState<"unverified" | "verified" | "farmers">(
    "unverified"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [acceptedQuantities, setAcceptedQuantities] = useState<{
    [key: string]: string;
  }>({});
  const [acceptedPrices, setAcceptedPrices] = useState<{
    [key: string]: string;
  }>({});
  const [submissions, setSubmissions] =
    useState<SubmissionType[]>(initialSubmissions);
  const [loading, setLoading] = useState(false);

  const { getAllSubmissions, purchaseSubmission } = useSubmissions();

  // Fetch submissions on component mount
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await getAllSubmissions();
        if (response.success) {
          setSubmissions(response.data);
        } else {
          toast.error("Failed to fetch submissions");
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast.error("Error fetching submissions");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if no initial data provided
    if (initialSubmissions.length === 0) {
      fetchSubmissions();
    }
  }, [getAllSubmissions, initialSubmissions.length]);

  // Replace the existing time calculation logic with this improved version

  const transformedSubmissions = submissions.map((submission) => {
    const submissionDate = new Date(submission.submittedAt);
    const now = new Date();
    const timeDiff = now.getTime() - submissionDate.getTime();

    // Calculate different time units
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let timeAgo = "";

    if (minutes < 1) {
      timeAgo = "Just now";
    } else if (minutes < 60) {
      timeAgo = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (days < 7) {
      timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (weeks < 4) {
      timeAgo = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (months < 12) {
      timeAgo = `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      timeAgo = `${years} year${years > 1 ? "s" : ""} ago`;
    }

    const location = `${submission.province}, ${submission.district}, ${submission.sector}, ${submission.cell}, ${submission.village}`;
    const isVerified =
      submission.status === "VERIFIED" ||
      submission.status === "APPROVED" ||
      submission.status === "PAID";

    return {
      id: submission.id,
      phone: submission.farmer.phone,
      name: submission.farmer.email?.split("@")[0] || "Unknown",
      date: submissionDate.toLocaleDateString(),
      time: submissionDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      product: submission.productName,
      quantity: `${submission.submittedQty} kg`,
      wishPrice: `${submission.wishedPrice} Rwf`,
      location: location,
      isVerified: isVerified,
      timeAgo: timeAgo,
      acceptedQuantity: submission.acceptedQty
        ? `${submission.acceptedQty} kg`
        : undefined,
      acceptedPrice: submission.acceptedPrice
        ? `${submission.acceptedPrice} Rwf`
        : undefined,
      acceptedAt: submission.verifiedAt
        ? new Date(submission.verifiedAt).toLocaleDateString()
        : undefined,
      status: submission.status,
      originalSubmission: submission,
    };
  });
  const unverifiedFarmers = transformedSubmissions.filter(
    (farmer) => !farmer.isVerified
  );
  const verifiedFarmers = transformedSubmissions.filter(
    (farmer) => farmer.isVerified
  );
  const verifiedCount = verifiedFarmers.length;

  const filteredFarmers =
    activeTab === "unverified"
      ? unverifiedFarmers.filter(
          (farmer) =>
            farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.phone.includes(searchTerm)
        )
      : verifiedFarmers.filter(
          (farmer) =>
            farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farmer.phone.includes(searchTerm)
        );

  const handleCardClick = (farmerId: string) => {
    setExpandedCards((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(farmerId)) {
        newExpanded.delete(farmerId);
      } else {
        newExpanded.add(farmerId);
      }
      return newExpanded;
    });
  };

  const handleVerify = async (farmerId: string) => {
    const acceptedQty = parseFloat(acceptedQuantities[farmerId]);
    const unitPrice = parseFloat(acceptedPrices[farmerId]);

    if (!acceptedQty || !unitPrice) {
      toast.error("Please enter both quantity and price");
      return;
    }

    try {
      setLoading(true);
      const response = await purchaseSubmission(farmerId, {
        acceptedQty,
        unitPrice,
      });

      if (response.success || response.message) {
        toast.success("Farmer submission verified successfully!");

        // Refresh submissions
        const updatedResponse = await getAllSubmissions();
        if (updatedResponse.success) {
          setSubmissions(updatedResponse.data);
        }

        // Clear expanded state and input values
        setExpandedCards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(farmerId);
          return newSet;
        });
        setAcceptedQuantities((prev) => {
          const newObj = { ...prev };
          delete newObj[farmerId];
          return newObj;
        });
        setAcceptedPrices((prev) => {
          const newObj = { ...prev };
          delete newObj[farmerId];
          return newObj;
        });
      } else {
        toast.error("Failed to verify submission");
      }
    } catch (error) {
      console.error("Error verifying submission:", error);
      toast.error("Error verifying submission");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      {/* Header with count */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          You have {verifiedCount} verified Farmers
        </h2>

        {/* Search Bar */}
        <div className="relative mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="Search Farmer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 sm:gap-6 border-b border-gray-200 overflow-x-auto">
          {[
            { key: "unverified", label: "Unverified" },
            { key: "verified", label: "Verified" },
            { key: "farmers", label: "Farmers" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() =>
                setActiveTab(
                  filter.key as "unverified" | "verified" | "farmers"
                )
              }
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === filter.key
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "farmers" ? (
        <FarmerManagement />
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {filteredFarmers.map((farmer) => (
              <div
                key={farmer.id}
                className="bg-[#F0FDF4] rounded-lg p-3 sm:p-4 border border-gray-200 relative"
              >
                <div
                  className={`${!farmer.isVerified ? "cursor-pointer" : ""}`}
                  onClick={() =>
                    !farmer.isVerified && handleCardClick(farmer.id)
                  }
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                      {/* Profile Circle */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg shrink-0">
                        {farmer.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Farmer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <div className="font-semibold text-gray-900 text-base sm:text-lg wrap-break-word">
                            {farmer.phone}
                          </div>
                          <div className="text-gray-600 text-sm">
                            ({farmer.name})
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                          <span>{farmer.date}</span>
                          <span>{farmer.time}</span>
                        </div>

                        <div className="mb-2">
                          <div className="font-medium text-gray-700 text-sm wrap-break-word">
                            {farmer.product}: {farmer.quantity}
                          </div>
                          <div className="text-gray-700 text-sm">
                            wish price:{" "}
                            <span className="font-medium">
                              {farmer.wishPrice}
                            </span>
                          </div>
                        </div>

                        <div className="mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">
                            Location:
                          </span>
                          <div className="text-xs sm:text-sm text-gray-600 wrap-break-word">
                            {farmer.location}
                          </div>
                        </div>

                        {/* Accepted Details (for verified farmers) */}
                        {farmer.isVerified &&
                          farmer.acceptedQuantity &&
                          farmer.acceptedPrice && (
                            <div className="mt-3 text-sm text-gray-600">
                              You accepted Quantity:{" "}
                              <span className="font-bold text-green-600">
                                {farmer.acceptedQuantity}
                              </span>
                              <span className="mx-2">
                                with price:{" "}
                                <span className="font-bold text-green-600">
                                  {farmer.acceptedPrice}
                                </span>
                              </span>
                              {farmer.acceptedAt && (
                                <div>Accepted At: {farmer.acceptedAt}</div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Right Side - Time */}
                    <div className="text-xs sm:text-sm text-green-600 font-medium self-start">
                      {farmer.timeAgo}
                    </div>
                  </div>

                  {/* Expanded Section for Unverified Farmers */}
                  {!farmer.isVerified && expandedCards.has(farmer.id) && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600 min-w-0">
                            Quantity:
                          </span>
                          <input
                            type="number"
                            className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                            placeholder="kg"
                            value={acceptedQuantities[farmer.id] || ""}
                            onChange={(e) =>
                              setAcceptedQuantities((prev) => ({
                                ...prev,
                                [farmer.id]: e.target.value,
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">
                            Price:
                          </span>
                          <input
                            type="number"
                            className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                            placeholder="Rwf"
                            value={acceptedPrices[farmer.id] || ""}
                            onChange={(e) =>
                              setAcceptedPrices((prev) => ({
                                ...prev,
                                [farmer.id]: e.target.value,
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs sm:text-sm text-gray-600">
                            Rwf
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(farmer.id);
                          }}
                          disabled={loading}
                          className="px-3 sm:px-4 py-1.5 sm:py-1 bg-green-500 text-white text-xs sm:text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          {loading ? "Verifying..." : "Verify"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredFarmers.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No farmers found matching your search.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
