import React from "react";
import FarmerSubmission from "./_components/FarmerSubmission";
import AggregatorTopBar from "./_components/AggregatorTopBar";

export default function AggregatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AggregatorTopBar title="Aggregator Dashboard" />
      <FarmerSubmission />
    </div>
  );
}
