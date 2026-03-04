"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, Mail, Edit, Trash2 } from "lucide-react";
import { newsletterService, NewsletterSubscriber, NewsletterCampaign } from "@/app/services/newsletterService";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import CreateCampaignModal from "./_components/CreateCampaignModal";
import EditCampaignModal from "./_components/EditCampaignModal";
import { Badge } from "@/components/ui/badge";

export default function NewsletterPage() {
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns">("subscribers");
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<NewsletterCampaign | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (activeTab === "subscribers") {
      fetchSubscribers();
    } else {
      fetchCampaigns();
    }
  }, [activeTab, pagination.page]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await newsletterService.getAllSubscribers(pagination.page, pagination.limit);
      setSubscribers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await newsletterService.getAllCampaigns(pagination.page, pagination.limit);
      setCampaigns(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSendWeeklyUpdate = async () => {
    try {
      const response = await newsletterService.sendWeeklyUpdate();
      toast.success(response.message);
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send weekly update");
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      await newsletterService.sendCampaign(campaignId);
      toast.success("Campaign sent successfully");
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send campaign");
    }
  };

  const handleEditCampaign = (campaign: NewsletterCampaign) => {
    setSelectedCampaign(campaign);
    setShowEditModal(true);
  };

  const handleUnsubscribe = async () => {
    if (!selectedSubscriber) return;
    try {
      if (selectedSubscriber.isActive) {
        await newsletterService.unsubscribe(selectedSubscriber.email);
        toast.success("Subscriber unsubscribed successfully");
      } else {
        await newsletterService.subscribe({
          email: selectedSubscriber.email,
          name: selectedSubscriber.name || undefined,
          phone: selectedSubscriber.phone || undefined,
        });
        toast.success("Subscriber resubscribed successfully");
      }
      setShowUnsubscribeModal(false);
      setSelectedSubscriber(null);
      fetchSubscribers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update subscription");
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await newsletterService.deleteCampaign(campaignId);
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete campaign");
    }
  };

  const subscriberColumns: ColumnDef<NewsletterSubscriber>[] = [
    {
      id: "nbr",
      header: "Nbr",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.index + 1 + (pagination.page - 1) * pagination.limit}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name || "-",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={row.original.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Subscribed",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedSubscriber(row.original);
            setShowUnsubscribeModal(true);
          }}
          className={row.original.isActive ? "border-red-500 text-red-600 hover:bg-red-50" : "border-green-500 text-green-600 hover:bg-green-50"}
        >
          {row.original.isActive ? "Unsubscribe" : "Subscribe"}
        </Button>
      ),
    },
  ];

  const campaignColumns: ColumnDef<NewsletterCampaign>[] = [
    {
      id: "nbr",
      header: "Nbr",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.index + 1 + (pagination.page - 1) * pagination.limit}</span>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusColors = {
          DRAFT: "bg-gray-100 text-gray-800",
          SENDING: "bg-blue-100 text-blue-800",
          SENT: "bg-green-100 text-green-800",
          FAILED: "bg-red-100 text-red-800",
        };
        return (
          <Badge className={statusColors[row.original.status]}>
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "recipientCount",
      header: "Recipients",
    },
    {
      accessorKey: "sentAt",
      header: "Sent At",
      cell: ({ row }) =>
        row.original.sentAt
          ? new Date(row.original.sentAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.status === "DRAFT" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditCampaign(row.original)}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => handleSendCampaign(row.original.id)}
                className="bg-green-700 hover:bg-green-600 text-white"
              >
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteCampaign(row.original.id)}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </>
          ) : (
            <span className="text-xs text-gray-500">-</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
          <p className="text-sm text-gray-600">Manage subscribers and campaigns</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "campaigns" && (
            <>
              <Button onClick={() => setShowCreateModal(true)} className="bg-green-700 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
              <Button onClick={handleSendWeeklyUpdate} className="bg-green-700 hover:bg-green-600">
                <Mail className="w-4 h-4 mr-2" />
                Send Weekly Update
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-gray-100">
        <CardHeader className="pb-3 bg-white">
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "subscribers"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-700 hover:text-gray-900"
              }`}
            >
              Subscribers ({pagination.total})
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "campaigns"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-700 hover:text-gray-900"
              }`}
            >
              Campaigns
            </button>
          </div>
        </CardHeader>
        <CardContent className="bg-white">
          {activeTab === "subscribers" && (
            <DataTable
              columns={subscriberColumns}
              data={subscribers}
              showPagination={true}
              pagination={pagination}
              onPaginationChange={(page, limit) => {
                setPagination((prev) => ({ ...prev, page, limit }));
              }}
              isLoading={loading}
            />
          )}
          {activeTab === "campaigns" && (
            <DataTable
              columns={campaignColumns}
              data={campaigns}
              showPagination={true}
              pagination={pagination}
              onPaginationChange={(page, limit) => {
                setPagination((prev) => ({ ...prev, page, limit }));
              }}
              isLoading={loading}
            />
          )}
        </CardContent>
      </Card>

      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCampaigns}
      />
      <EditCampaignModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCampaign(null);
        }}
        onSuccess={fetchCampaigns}
        campaign={selectedCampaign}
      />

      {/* Unsubscribe/Subscribe Confirmation Modal */}
      {showUnsubscribeModal && selectedSubscriber && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedSubscriber.isActive ? "Confirm Unsubscribe" : "Confirm Subscribe"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {selectedSubscriber.isActive
                ? `Are you sure you want to unsubscribe ${selectedSubscriber.email} from the newsletter?`
                : `Are you sure you want to resubscribe ${selectedSubscriber.email} to the newsletter?`}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUnsubscribeModal(false);
                  setSelectedSubscriber(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnsubscribe}
                className={selectedSubscriber.isActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-700 hover:bg-green-600 text-white"}
              >
                {selectedSubscriber.isActive ? "Unsubscribe" : "Subscribe"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
