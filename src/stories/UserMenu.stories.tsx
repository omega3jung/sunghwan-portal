import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

import { UserMenu } from "@/components/menu/UserMenu";
import type { ImpersonationInfo, SessionUser } from "@/domain/auth";
import type { AppUser } from "@/domain/user";
import { companyQueryKeys } from "@/feature/organization/company/queryKeys";
import { userProfileQueryKeys } from "@/feature/user/profile";
import { useAuthSessionStore, useImpersonationStore } from "@/lib/client/auth";
import {
  adminAuth,
  adminProfile,
  clientProfiles,
  internalAuths,
  internalProfiles,
  userAuth,
  userProfile,
} from "@/mocks/domain/user";

const meta = {
  title: "Menu/UserMenu",
  component: UserMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Application identity menu shown with canonical LOCAL demo users and prefilled query state, without network requests.",
      },
    },
  },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const demoCandidates = {
  auths: {
    client: [],
    internal: internalAuths,
  },
  profiles: {
    client: clientProfiles,
    internal: internalProfiles,
  },
};

type UserMenuStateProps = {
  authUser: typeof adminAuth;
  profile: AppUser;
  impersonation?: {
    original: typeof adminAuth;
    profile: AppUser;
  };
};

function UserMenuState({
  authUser,
  profile,
  impersonation,
}: UserMenuStateProps) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(companyQueryKeys.list({}), []);
    client.setQueryData(userProfileQueryKeys.detail(profile.username), profile);
    return client;
  });

  const sessionUser = toSessionUser(authUser);
  const impersonationInfo: ImpersonationInfo | undefined = impersonation
    ? {
        activatedAt: Date.now(),
        impersonatedUser: { username: profile.username },
        originalUser: {
          id: impersonation.original.id,
          username: impersonation.original.username,
        },
      }
    : undefined;
  const session: Session = {
    expires: "2099-12-31T23:59:59.999Z",
    impersonation: impersonationInfo,
    user: impersonation
      ? toSessionUser(impersonation.original)
      : sessionUser,
  };

  useEffect(() => {
    useAuthSessionStore.setState({
      isClient: profile.userScope === "CLIENT",
      isDemoUser: true,
      user: profile,
    });
    useImpersonationStore.setState({
      currentUser: profile,
      impersonatedUser: impersonation ? profile : null,
      originalUser: impersonation ? adminProfile : profile,
    });
  }, [impersonation, profile]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        <UserMenu demoCandidates={demoCandidates} />
      </SessionProvider>
    </QueryClientProvider>
  );
}

function toSessionUser({ accessToken: _accessToken, ...user }: typeof adminAuth) {
  return user satisfies SessionUser;
}

export const RegularUser: Story = {
  render: () => <UserMenuState authUser={userAuth} profile={userProfile} />,
};

export const Admin: Story = {
  render: () => <UserMenuState authUser={adminAuth} profile={adminProfile} />,
};

export const Impersonating: Story = {
  render: () => (
    <UserMenuState
      authUser={userAuth}
      impersonation={{ original: adminAuth, profile: userProfile }}
      profile={userProfile}
    />
  ),
};
