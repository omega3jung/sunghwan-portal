"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { PortalPreference, Preference } from "@/domain/config";
import { createDefaultPreference } from "@/domain/user/preference";
import { usePreferenceStore } from "@/lib/preferenceStore";

import { preferenceKeys } from "../preferenceKeys";
import { userPreferenceRepo } from "../repo";

const portalPreferenceSyncInFlight = new Map<
  string,
  Promise<Preference<PortalPreference> | null | undefined>
>();

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

    if (preference) return preference;

    return userPreferenceRepo.create<PortalPreference>({
      isRemote,
      data: {
        preferenceKey,
        preferenceMeta: defaultPreference,
      },
    });
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
        const preference = await getOrCreatePortalPreference({
          syncKey,
          isRemote,
          preferenceKey,
          defaultPreference: createDefaultPreference(),
        });

        if (!active) return;
        if (!preference) return;

        setPreference(preference.preferenceMeta);
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
