"use client";

import { motion } from "motion/react";
import { Eye, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "./product-context";
import { gridContainerVariants, gridItemVariants } from "./dashboard/motion-variants";

interface SubmissionCardGridProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
}

/** Card-view of submissions: richer visual browsing, one card per submission. */
export function SubmissionCardGrid({ products, onViewDetails }: SubmissionCardGridProps) {
  return (
    <motion.div
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={gridItemVariants}>
          <Card className="h-full border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col gap-2 h-full">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category.name}</p>
                </div>
                <Badge className={`${product.statusColor} border-0 text-xs shrink-0`}>{product.displayStatus}</Badge>
              </div>

              <div className="flex items-center text-xs text-gray-600 gap-1">
                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="line-clamp-1">{product.location}</span>
              </div>

              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">{product.quantity} {product.unit}</span>
                <span className="font-semibold text-gray-900">{product.price}</span>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-xs text-gray-400">{product.submittedDate}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(product)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs px-2 py-1 h-7"
                >
                  <Eye className="w-3 h-3" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
