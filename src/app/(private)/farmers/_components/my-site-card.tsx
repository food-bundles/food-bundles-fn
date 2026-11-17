"use client";

import { useCallback, useEffect, useState } from "react";
import { Crosshair, Loader2, MapPin, Phone, UserRound, Warehouse } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/lib/toast";
import { farmerDashboardService, type FarmerSite } from "@/app/services/farmerDashboardService";

/**
 * Where the farmer brings their harvest and who receives it, the same as the mobile app's "My site".
 * "Use my location" saves the farm's GPS position so the nearest site and supply requests are measured from it.
 */
export function MySiteCard() {
  const [site, setSite] = useState<FarmerSite | null | undefined>(undefined);
  const [locating, setLocating] = useState(false);

  const load = useCallback(() => {
    farmerDashboardService
      .getMySite()
      .then(setSite)
      .catch(() => setSite(null));
  }, []);

  useEffect(load, [load]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      showToast("error", "This browser cannot share your location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await farmerDashboardService.saveFarmLocation(coords.latitude, coords.longitude);
          showToast("success", "Your farm location was saved.");
          load();
        } catch {
          showToast("error", "Could not save your location. Try again.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        showToast("error", "Allow location access in your browser, then try again.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-green-600" /> My aggregation site
          </CardTitle>
          <CardDescription>Where you bring your harvest, and who receives it.</CardDescription>
        </div>
        <Button variant="outline" onClick={useMyLocation} disabled={locating} className="shrink-0">
          {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crosshair className="mr-2 h-4 w-4" />}
          Use my location
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {site === undefined ? (
          <Skeleton className="h-24 rounded-lg" />
        ) : site === null ? (
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            No site yet. Use your location so we can find the nearest one, or call 8000.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-green-50 p-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">{site.name}</p>
                <p className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {[site.district, site.province].filter(Boolean).join(", ") || "Location not set"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-700">
                  {site.approximate ? "About " : ""}
                  {site.distanceKm.toFixed(1)} km away
                </p>
                {site.assignedByAdmin && (
                  <Badge className="border-0 bg-white text-[10px] text-green-800">Chosen by Food Bundles</Badge>
                )}
              </div>
            </div>
            {site.approximate && (
              <p className="text-xs text-gray-500">
                Distance is measured from your district. Use your location for an exact one.
              </p>
            )}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Aggregators</p>
              {site.aggregators.length === 0 ? (
                <p className="text-sm text-gray-500">No aggregator at this site yet. Call 8000 for help.</p>
              ) : (
                site.aggregators.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-green-700" />
                      <div>
                        <p className="font-medium text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.phone ?? "No phone number yet"}</p>
                      </div>
                    </div>
                    {a.phone && (
                      <a
                        href={`tel:${a.phone}`}
                        className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
