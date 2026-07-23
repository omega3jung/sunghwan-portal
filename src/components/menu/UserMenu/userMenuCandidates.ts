import type { AuthUser } from "@/domain/auth";
import type { AppUser } from "@/domain/user";

export type DemoCandidateGroups<T> = {
  internal: T[];
  client: T[];
};

export type UserMenuDemoCandidates = {
  auths: DemoCandidateGroups<AuthUser>;
  profiles: DemoCandidateGroups<AppUser>;
};

export function getDemoUserSwitchCandidates(
  candidates: DemoCandidateGroups<AppUser>,
  currentUserId: string | null | undefined,
): DemoCandidateGroups<AppUser> {
  const isCandidate = (profile: AppUser) => profile.id !== currentUserId;

  return {
    internal: candidates.internal.filter(isCandidate),
    client: candidates.client.filter(isCandidate),
  };
}

export function getDemoImpersonationCandidates(
  candidates: DemoCandidateGroups<AuthUser>,
  excludedUsernames: Array<string | null | undefined>,
): DemoCandidateGroups<AuthUser> {
  const excludedUsernameSet = new Set(
    excludedUsernames
      .filter((username): username is string => Boolean(username))
      .map(normalizeUsername),
  );
  const isCandidate = (user: AuthUser) =>
    !excludedUsernameSet.has(normalizeUsername(user.username));

  return {
    internal: candidates.internal.filter(isCandidate),
    client: candidates.client.filter(isCandidate),
  };
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}
