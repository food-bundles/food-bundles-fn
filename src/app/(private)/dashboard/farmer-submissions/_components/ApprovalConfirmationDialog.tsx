import React, { useState } from "react";
import { CheckCircle, X, AlertTriangle } from "lucide-react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  submissionId: string;
  isProcessing?: boolean;
}
const ConfirmationDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  submissionId,
  isProcessing = false,
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="shrink-0">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Approval
            </h3>
          </div>
          {!isProcessing && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Are you sure you want to approve this submission?
          </p>
          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <span className="font-medium text-gray-700">Submission ID:</span>
            <span className="ml-2 font-mono text-gray-900">{submissionId}</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            This action cannot be undone. The farmer will be notified of the
            approval.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Yes, Approve</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Example usage component showing how to integrate
const ExampleUsage = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<null | string>(null);

  const handleApproveClick = (submissionId: string) => {
    setCurrentSubmissionId(submissionId);
    setShowDialog(true);
  };

  const handleConfirmApproval = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setShowDialog(false);
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsProcessing(false);
      setCurrentSubmissionId(null);
    }
  };

  const handleCancelApproval = () => {
    if (!isProcessing) {
      setShowDialog(false);
      setCurrentSubmissionId(null);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Farmer Submission Example
        </h2>
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Submission #SUB-001</h3>
              <p className="text-gray-600 text-sm">Farmer: John Doe</p>
              <p className="text-gray-600 text-sm">
                Product: Coffee Beans (100kg)
              </p>
            </div>
            <button
              onClick={() => handleApproveClick("SUB-001")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve</span>
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Submission #SUB-002</h3>
              <p className="text-gray-600 text-sm">Farmer: Jane Smith</p>
              <p className="text-gray-600 text-sm">Product: Rice (50kg)</p>
            </div>
            <button
              onClick={() => handleApproveClick("SUB-002")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      </div>
      {currentSubmissionId && (
        <ConfirmationDialog
          isOpen={showDialog}
          onConfirm={handleConfirmApproval}
          onCancel={handleCancelApproval}
          submissionId={currentSubmissionId}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default ExampleUsage;
