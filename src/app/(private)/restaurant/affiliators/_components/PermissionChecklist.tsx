"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { AffiliatorPermissionOption } from "@/app/services/affiliatorManageService";

/** The things an owner can allow an affiliator to do, as checkboxes */
export function PermissionChecklist({
    options,
    value,
    onChange,
    disabled,
}: {
    options: AffiliatorPermissionOption[];
    value: string[];
    onChange: (next: string[]) => void;
    disabled?: boolean;
}) {
    const toggle = (key: string, on: boolean) =>
        onChange(on ? [...value.filter((k) => k !== key), key] : value.filter((k) => k !== key));

    return (
        <div className="space-y-2">
            {options.map((p) => (
                <label key={p.key} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted/50">
                    <Checkbox
                        checked={value.includes(p.key)}
                        onCheckedChange={(on) => toggle(p.key, on === true)}
                        disabled={disabled}
                    />
                    <span>{p.label}</span>
                </label>
            ))}
            <div className="flex gap-3 text-xs">
                <button type="button" className="text-green-700 hover:underline" onClick={() => onChange(options.map((p) => p.key))} disabled={disabled}>
                    Allow all
                </button>
                <button type="button" className="text-muted-foreground hover:underline" onClick={() => onChange([])} disabled={disabled}>
                    Clear
                </button>
            </div>
        </div>
    );
}
