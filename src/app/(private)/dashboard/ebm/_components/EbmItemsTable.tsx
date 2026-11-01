"use client";

const TAX_COLORS: Record<string, string> = {
  A: "bg-blue-100 text-blue-700 border-blue-200",
  B: "bg-green-100 text-green-700 border-green-200",
  "A-EX": "bg-purple-100 text-purple-700 border-purple-200",
};

const TYPE_COLORS: Record<string, string> = {
  FINISHED_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  RAW_MATERIAL: "bg-orange-100 text-orange-700 border-orange-200",
  SERVICE: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

interface EbmItemsTableProps {
  items: any[];
  isLoading: boolean;
  source: "api" | "db";
}

export function EbmItemsTable({ items, isLoading, source }: EbmItemsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-12 flex items-center justify-center">
        <div className="text-sm text-gray-500 animate-pulse">Loading items...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white rounded-lg border p-12 flex items-center justify-center">
        <div className="text-sm text-gray-400">No items found</div>
      </div>
    );
  }

  // Normalise both snake_case (API) and camelCase (DB) into one shape
  const normalise = (item: any) => ({
    itemCode:               item.item_code        ?? item.itemCode,
    itemClassificationCode: item.item_classification_code ?? item.itemClassificationCode,
    itemName:               item.item_name        ?? item.itemName,
    itemType:               item.item_type        ?? item.itemType,
    taxType:                item.tax_type         ?? item.taxType,
    packagingUnit:          item.packaging_unit   ?? item.packagingUnit,
    quantityUnit:           item.quantity_unit    ?? item.quantityUnit,
    defaultPrice:           item.default_price    ?? item.defaultPrice,
    originCountry:          item.origin_country   ?? item.originCountry ?? "RW",
    use:                    item.use              ?? true,
    registeredBranchId:     item.registered_branch_id ?? item.registeredBranchId ?? "—",
    // DB-only
    registeredAt:           item.registeredAt ?? null,
    product:                item.product ?? null,
  });

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Item Code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Tax</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Pkg</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Qty Unit</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">Price (RWF)</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Origin</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Branch</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Active</th>
              {source === "db" && (
                <>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">Registered</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((raw, i) => {
              const item = normalise(raw);
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{item.itemCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate" title={item.itemName}>
                    {item.itemName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] rounded-full border px-2 py-0.5 whitespace-nowrap ${TYPE_COLORS[item.itemType] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {(item.itemType ?? "").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] rounded-full border px-2 py-0.5 ${TAX_COLORS[item.taxType] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {item.taxType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.packagingUnit}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.quantityUnit}</td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-gray-900 whitespace-nowrap">
                    {Number(item.defaultPrice).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.originCountry}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.registeredBranchId}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] rounded-full border px-2 py-0.5 ${item.use ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                      {item.use ? "Yes" : "No"}
                    </span>
                  </td>
                  {source === "db" && (
                    <>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {item.product ? (
                          <div>
                            <div className="font-medium truncate max-w-[120px]">{item.product.productName}</div>
                            <div className="text-gray-400">{item.product.sku}</div>
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {item.registeredAt
                          ? new Date(item.registeredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
        {items.length} item{items.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
