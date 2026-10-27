import FarmerSubmission from "./_components/FarmerSubmission";

// Aggregators verify the farmer submissions assigned to them (moved here from
// the old /aggregator app; the backend only returns their own submissions)
export default function SubmissionVerificationPage() {
  return <FarmerSubmission />;
}
