import { FilterConfig } from "@/components/filters";

export const createCommonFilters = {
  search: (
    value: string,
    onChange: (value: string) => void,
    placeholder?: string
  ): FilterConfig => ({
    type: "search",
    key: "search",
    label: "Search",
    placeholder: placeholder || "Search...",
    value,
    onChange,
  }),

  status: (
    value: string,
    onChange: (value: string) => void,
    options: { label: string; value: string }[]
  ): FilterConfig => ({
    type: "select",
    key: "status",
    label: "Status",
    options,
    value,
    onChange,
  }),
};