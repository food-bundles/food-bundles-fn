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

  type: (
    value: string,
    onChange: (value: string) => void,
    options: { label: string; value: string }[]
  ): FilterConfig => ({
    type: "select",
    key: "type",
    label: "Type",
    options,
    value,
    onChange,
  }),

  date: (
    value: Date | undefined,
    onChange: (value: Date | undefined) => void,
    label?: string
  ): FilterConfig => ({
    type: "date",
    key: "date",
    label: label || "Date",
    value,
    onChange,
  }),

  dateRange: (
    value: { from?: Date; to?: Date } | undefined,
    onChange: (value: { from?: Date; to?: Date }) => void,
    label?: string
  ): FilterConfig => ({
    type: "dateRange",
    key: "dateRange",
    label: label || "Date Range",
    value,
    onChange,
  }),
};