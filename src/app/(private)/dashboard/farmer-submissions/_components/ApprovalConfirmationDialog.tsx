import { X } from "lucide-react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  submissionId: string;
  isProcessing?: boolean;
}

export const ConfirmationDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-10 flex items-center justify-center z-50">
      <div className="bg-white  rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Are you sure you want to approve this submission?
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
          <p className="text-xs text-gray-500 mt-3">
            This action cannot be undone. The farmer will be notified of the
            approval and quantity in stock will be updated.
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
                <span>Yes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
