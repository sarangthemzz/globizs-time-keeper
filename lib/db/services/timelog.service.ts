import {
  createManyTimeLogsSchema,
  createTimeLogSchema,
  timeLogIdSchema,
  timeLogUserIdSchema,
  updateTimeLogSchema,
  type CreateManyTimeLogsInput,
  type CreateTimeLogInput,
  type UpdateTimeLogInput,
} from "../schemas/timelog";
import { timeLogRepository } from "../repositories/timelog.repository";
import { prisma } from "../prisma";
import { syncTimeLogsToGoogleSheet } from "@/lib/google-sheets";

function toDateOnly(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function toDateOnlyFromString(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

type NominatimReverseResponse = {
  display_name?: string;
  name?: string;
  address?: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    town?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

function getNominatimUserAgent() {
  return process.env.NOMINATIM_USER_AGENT ?? "Globizs/1.0 (local-development)";
}

async function reverseGeocodeLocation(latitude: number, longitude: number) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.search = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1",
  }).toString();

  const response = await fetch(url, {
    headers: {
      "User-Agent": getNominatimUserAgent(),
      "Accept-Language": "en",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim reverse geocoding failed with status ${response.status}`);
  }

  const data = await response.json() as NominatimReverseResponse;
  const address = data.address;
  const placeName =
    data.display_name ??
    [
      data.name,
      address?.road,
      address?.neighbourhood,
      address?.suburb,
      address?.village,
      address?.town,
      address?.city,
      address?.state,
      address?.country,
    ].filter(Boolean).join(", ");

  return placeName || "Unknown place";
}

function shortenPlaceName(placeName: string) {
  return placeName
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");
}

export async function createTimeLog(input: CreateTimeLogInput) {
  const data = createTimeLogSchema.parse(input);

  return timeLogRepository.create({
    userId: data.userId,
    logDate: toDateOnly(data.logDate),
    startTime: data.startTime,
    endTime: data.endTime,
    work: data.work,
    isActive: data.isActive ?? 1,
  });
}

export async function createManyTimeLogs(input: CreateManyTimeLogsInput) {
  const { userId, logDate, entries, location } = createManyTimeLogsSchema.parse(input);
  const normalizedLogDate = toDateOnly(logDate);
  const timeLogs = entries.map((entry) => ({
    userId,
    logDate: normalizedLogDate,
    startTime: entry.startTime.trim(),
    endTime: entry.endTime.trim(),
    work: entry.work.trim(),
    isActive: 1,
  }));

  const [deleted, created] = await prisma.$transaction([
    timeLogRepository.deleteManyByUserAndDate(userId, normalizedLogDate),
    timeLogRepository.createMany(timeLogs),
  ]);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });

    await syncTimeLogsToGoogleSheet(
      timeLogs.map((timeLog) => ({
        username: user?.fullName ?? `User ${userId}`,
        date: normalizedLogDate.toISOString().slice(0, 10),
        startTime: timeLog.startTime,
        endTime: timeLog.endTime,
        work: timeLog.work,
      }))
    );
  } catch (error) {
    console.error("[GOOGLE SHEET SYNC ERROR]", error);
  }

  let shortPlaceName = "";

  if (location) {
    try {
      const placeName = await reverseGeocodeLocation(location.latitude, location.longitude);
      shortPlaceName = shortenPlaceName(placeName);
      console.log("[LOCATION PLACE]", {
        userId,
        placeName: shortPlaceName,
        fullPlaceName: placeName,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch (error) {
      console.error("[LOCATION PLACE ERROR]", error);
    }

    await prisma.userLocation.create({
      data: {
        userId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        placeName: shortPlaceName,
        recordedAt: location.capturedAt ? new Date(location.capturedAt) : new Date(),
      },
    });

    console.log("[LOCATION TRACKING]", {
      userId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      recordedAt: location.capturedAt,
      savedWith: "timelog-submit",
    });
  }

  return {
    deletedCount: deleted.count,
    createdCount: created.count,
  };
}

export async function getUserTimeLogs(userId: number) {
  return timeLogRepository.findByUserId(timeLogUserIdSchema.parse(userId));
}

export async function getTimeLogsByDate(date: string | Date) {
  const logDate = typeof date === "string" ? toDateOnlyFromString(date) : toDateOnly(date);
  return timeLogRepository.findByDate(logDate);
}

export async function updateTimeLog(id: number, input: UpdateTimeLogInput) {
  const parsedId = timeLogIdSchema.parse(id);
  const data = updateTimeLogSchema.parse(input);
  const existing = await timeLogRepository.findById(parsedId);

  if (!existing) {
    throw new Error("Time log not found");
  }

  return timeLogRepository.update(parsedId, {
    ...(data.userId ? { userId: data.userId } : {}),
    ...(data.logDate ? { logDate: toDateOnly(data.logDate) } : {}),
    ...(data.startTime ? { startTime: data.startTime } : {}),
    ...(data.endTime ? { endTime: data.endTime } : {}),
    ...(typeof data.work === "string" ? { work: data.work } : {}),
    ...(typeof data.isActive === "number" ? { isActive: data.isActive } : {}),
  });
}

export async function deactivateTimeLog(id: number) {
  return timeLogRepository.deactivate(timeLogIdSchema.parse(id));
}

export async function deleteTimeLog(id: number) {
  return timeLogRepository.delete(timeLogIdSchema.parse(id));
}
