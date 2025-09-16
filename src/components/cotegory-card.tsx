"use client";

interface CategoryListProps {
  categories: Array<{
    name: string;
    image: string;
    productCount?: number;
  }>;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export function CategoryList({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryListProps) {
  return (
    <div className="w-[280px] min-w-[280px] bg-white border-r border-gray-200 h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
      </div>

      {/* Category List */}
      <div className="p-4 overflow-y-auto h-full">
        <ul className="space-y-2">
          {categories.map((category, index) => (
            <li key={index}>
              <button
                onClick={() => onCategorySelect(category.name)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                  selectedCategory === category.name
                    ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="font-medium">
                  {category.name.replace(/_/g, " ")}
                </span>
                {category.productCount !== undefined &&
                  category.productCount >= 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full min-w-[24px] text-center ${
                        selectedCategory === category.name
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      }`}
                    >
                      {category.productCount}
                    </span>
                  )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
