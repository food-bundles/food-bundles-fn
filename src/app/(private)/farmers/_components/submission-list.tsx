"use client";

import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "./product-context";
import { gridContainerVariants, gridItemVariants } from "./dashboard/motion-variants";

interface SubmissionListProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
}

/** Compact list-view of submissions: dense, single-line rows for fast scanning. */
export function SubmissionList({ products, onViewDetails }: SubmissionListProps) {
  return (
    <motion.div
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
      className="border border-gray-100 rounded-lg overflow-hidden"
    >
      {products.map((product) => (
        <motion.button
          key={product.id}
          type="button"
          variants={gridItemVariants}
          onClick={() => onViewDetails(product)}
          className="w-full flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 text-left transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                product.status === "APPROVED" || product.status === "PAID"
                  ? "bg-emerald-500"
                  : product.displayStatus === "REJECTED"
                    ? "bg-red-500"
                    : "bg-amber-500"
              }`}
            />
            <span className="font-medium text-gray-900 truncate">{product.name}</span>
            <span className="text-xs text-gray-400 truncate hidden sm:inline">{product.category.name}</span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-sm">
            <span className="text-gray-600 hidden sm:inline">{product.quantity} {product.unit}</span>
            <span className="font-semibold text-gray-900">{product.price}</span>
            <span className="text-xs text-gray-400 hidden md:inline">{product.submittedDate}</span>
            <Badge className={`${product.statusColor} border-0 text-xs`}>{product.displayStatus}</Badge>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
