"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { PortalPreference, Preference } from "@/domain/user/preference";
import { createDefaultPreference } from "@/lib/preferenceDefault";
import { usePreferenceStore } from "@/lib/preferenceStore";

import { preferenceKeys } from "../preferenceKeys";
import { userPreferenceRepo } from "../repo";

const portalPreferenceSyncInFlight = new Map<
  string,
  Promise<PortalPreference | null | undefined>
>();

const isPortalPreferenceEnvelope = (
  value: unknown,
): value is Preference<PortalPreference> => {
  return (
    typeof value === "object" &&
    value !== null &&
    "preferenceMeta" in value &&
    typeof (value as { preferenceMeta?: unknown }).preferenceMeta === "object" &&
    (value as { preferenceMeta?: unknown }).preferenceMeta !== null
  );
};

const resolvePortalPreferenceMeta = (
  value: Preference<PortalPreference> | PortalPreference | null | undefined,
): PortalPreference | null => {
  if (!value) return null;

  return isPortalPreferenceEnvelope(value)
    ? value.preferenceMeta
    : (value as PortalPreference);
};

const getPortalPreferenceSyncKey = ({
  userId,
  dataScope,
  preferenceKey,
}: {
  userId: string;
  dataScope: string;
  preferenceKey: string;
}) => `${dataScope}:${userId}:${preferenceKey}`;

const getOrCreatePortalPreference = ({
  syncKey,
  isRemote,
  preferenceKey,
  defaultPreference,
}: {
  syncKey: string;
  isRemote: boolean;
  preferenceKey: string;
  defaultPreference: PortalPreference;
}) => {
  const inFlight = portalPreferenceSyncInFlight.get(syncKey);

  if (inFlight) return inFlight;

  const task = (async () => {
    const preference = await userPreferenceRepo.get<PortalPreference>({
      isRemote,
      preferenceKey,
    });

    const existingPreferenceMeta = resolvePortalPreferenceMeta(preference);
    if (existingPreferenceMeta) return existingPreferenceMeta;

    const createdPreference = await userPreferenceRepo.create<PortalPreference>({
      isRemote,
      data: {
        preferenceKey,
        preferenceMeta: defaultPreference,
      },
    });

    return resolvePortalPreferenceMeta(createdPreference) ?? defaultPreference;
  })().finally(() => {
    portalPreferenceSyncInFlight.delete(syncKey);
  });

  portalPreferenceSyncInFlight.set(syncKey, task);

  return task;
};

// set session when sign in.// set preference when sign in.
export function usePreferenceRemoteSync() {
  const session = useSession();

  const setPreference = usePreferenceStore((state) => state.setPreference);

  const status = session.status;
  const userId = session.data?.user?.id;
  const dataScope = session.data?.user?.dataScope;

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!userId || !dataScope) return;

    let active = true;

    const preferenceKey = preferenceKeys.home.preference;
    const isRemote = dataScope === "REMOTE";

    const syncKey = getPortalPreferenceSyncKey({
      userId,
      dataScope,
      preferenceKey,
    });

    const syncPreference = async () => {
      try {
        const preferenceMeta = await getOrCreatePortalPreference({
          syncKey,
          isRemote,
          preferenceKey,
          defaultPreference: createDefaultPreference(),
        });

        if (!active) return;
        if (!preferenceMeta) return;

        setPreference(preferenceMeta);
      } catch (error) {
        console.error(
          "[PreferenceRemoteSync] Failed to sync preference",
          error,
        );
      }
    };

    syncPreference();

    return () => {
      active = false;
    };
  }, [status, userId, dataScope, setPreference]);
}
