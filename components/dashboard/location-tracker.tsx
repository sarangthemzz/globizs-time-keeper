"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LOCATION_TIMEOUT_MS = 30000;
const MIN_UPDATE_INTERVAL_MS = 15000;
const MIN_DISTANCE_METERS = 15;

export type TrackedLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  capturedAt: string;
};

type SavedPosition = {
  latitude: number;
  longitude: number;
  savedAt: number;
};

interface LocationTrackerProps {
  onLocationChange: (location: TrackedLocation) => void;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(from: SavedPosition, to: GeolocationCoordinates) {
  const earthRadiusMeters = 6371000;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

export default function LocationTracker({ onLocationChange }: LocationTrackerProps) {
  const { status } = useSession();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [shouldTrackLocation, setShouldTrackLocation] = useState(false);
  const lastSavedPositionRef = useRef<SavedPosition | null>(null);
  const allowLocationButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !("geolocation" in navigator)) {
      return;
    }

    let isMounted = true;

    const checkLocationPermission = async () => {
      if (!("permissions" in navigator)) {
        setShowPermissionModal(true);
        return;
      }

      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });
        if (!isMounted) return;

        if (permission.state === "granted") {
          setShouldTrackLocation(true);
          return;
        }

        if (permission.state === "prompt") {
          setShowPermissionModal(true);
        }
      } catch (error) {
        console.error("Unable to check location permission:", error);
        if (isMounted) {
          setShowPermissionModal(true);
        }
      }
    };

    void checkLocationPermission();

    return () => {
      isMounted = false;
    };
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || !shouldTrackLocation || !("geolocation" in navigator)) {
      return;
    }

    let isMounted = true;

    const saveLocation = async (position: GeolocationPosition) => {
      const lastSavedPosition = lastSavedPositionRef.current;
      const now = Date.now();

      if (
        lastSavedPosition &&
        now - lastSavedPosition.savedAt < MIN_UPDATE_INTERVAL_MS &&
        getDistanceMeters(lastSavedPosition, position.coords) < MIN_DISTANCE_METERS
      ) {
        return;
      }

      try {
        const response = await fetch("/api/location/debug", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("Failed to log location on server", response.status, errorData);
          return;
        }

        if (!isMounted) {
          return;
        }

        console.log("Location captured", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        onLocationChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
        });

        lastSavedPositionRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          savedAt: now,
        };
      } catch (error) {
        console.error("Failed to capture location", error);
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        void saveLocation(position);
      },
      (error) => {
        console.warn("Location tracking warning:", error.message);

        if (error.code === error.PERMISSION_DENIED) {
          setShouldTrackLocation(false);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: LOCATION_TIMEOUT_MS,
      }
    );

    return () => {
      isMounted = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [onLocationChange, shouldTrackLocation, status]);

  useEffect(() => {
    if (!showPermissionModal) {
      return;
    }

    window.requestAnimationFrame(() => {
      allowLocationButtonRef.current?.focus();
    });
  }, [showPermissionModal]);

  return (
    <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
      <DialogContent className="max-w-sm border-neutral-700 bg-neutral-900 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-normal text-white">
            Allow location access
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-6 text-slate-400">
            Please allow location access so Globizs can monitor site visits while you use the dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="border-neutral-700 bg-neutral-950 text-slate-100 hover:bg-neutral-800 hover:text-white"
            onClick={() => {
              setShowPermissionModal(false);
            }}
          >
            Not now
          </Button>
          <Button
            ref={allowLocationButtonRef}
            type="button"
            className="bg-green-700 text-white hover:bg-green-800"
            onClick={() => {
              setShowPermissionModal(false);
              setShouldTrackLocation(true);
            }}
          >
            Allow location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
