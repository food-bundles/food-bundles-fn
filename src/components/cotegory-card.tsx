"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface CategoryCardProps {
  name: string;
  image: string;
  productCount?: number;
  onClick: () => void;
}

export function CategoryCard({
  name,
  image,
  productCount,
  onClick,
}: CategoryCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 bg-gray-200 w-full rounded-[5px] py-0 px-5"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Category Image */}
        <div className="relative w-full h-40 overflow-hidden bg-gray-100">
          <Image
            src={image || "/products/fresh-organic-roma-tomatoes.png"}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-semibold mb-1">{name}</h3>
            {productCount && (
              <p className="text-sm text-gray-200">{productCount} products</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
