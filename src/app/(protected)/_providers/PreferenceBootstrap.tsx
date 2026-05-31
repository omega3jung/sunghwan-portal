"use client";

import {
  usePreferenceCleanup,
  usePreferenceHydration,
  usePreferencePresentationSync,
  usePreferenceRemoteSync,
} from "@/feature/user/preference/bootstrap";

export function PreferenceBootstrap() {
  usePreferenceHydration();
  usePreferenceRemoteSync();
  usePreferencePresentationSync();
  usePreferenceCleanup();

  return null;
}
