// app/(protected)/layout.tsx

import { Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { ENVIRONMENT } from '@/lib/publicRuntimeConfig';
import { PUBLIC_ROUTES } from '@/lib/routes';
import { setFetcherToken } from '@/services/fetcher';

export default function ProtectedLayout({ children }: { children: ReactNode }) {

  const { i18n } = useTranslation('common');
  const session = useCurrentSession();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const hookData = {
    userId: session.data?.user?.id,
    access_token: session.data?.user?.access_token
  };

  const isPublic = PUBLIC_ROUTES.some(
    (path, i) => (!!i && pathname?.startsWith(path)) || path === pathname
  );

  useEffect(() => {
    i18n.changeLanguage(sessionStorage.getItem('NEXT_LOCALE') ?? 'en');
  }, [i18n]);

  // auto assign a customer and service for new tabs
  useEffect(() => {
    if (!session.data) {
      return;
    }

  }, [session, isPublic]);

  // set tab session
  useEffect(() => {
    const {
      index,
      locationValue,
      locationName,
      serviceValue,
      serviceName,
      keep,
      ...query
    } = router.query as Record<string, string>;

    if (!router.isReady) {
      return;
    }

    if (index === undefined) {
      session.initialize();

      return;
    }

    session.updateSession({
      index: +index,
      ...(!!locationValue && {
        location: {
          value: locationValue,
          label: locationName
        }
      }),
      ...(!!serviceValue && {
        service: {
          value: serviceValue,
          label: serviceName
        }
      })
    });

    if (keep) {
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true
      });

      return;
    }

    router.replace({ pathname: '/home' }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  useEffect(() => {
    if (!mounted && session.status !== 'loading') {
      setMounted(true);
    }

    if (!isPublic && session.status === 'unauthenticated') {
      setHasToken(false);
      signOut({
        callbackUrl: `${ENVIRONMENT.BASE_PATH}/login`
      });
    }

    if (
      session.status === 'authenticated' &&
      !!session.data?.user?.access_token
    ) {
      setFetcherToken(session.data.user.access_token);
      // prevent race condition with all the other requests
      setTimeout(() => setHasToken(true), 500);
    }
  }, [mounted, session, isPublic, hasToken]);

  if (
    (session.status === 'loading' && !mounted) ||
    (session.status === 'authenticated' && !hasToken && !isPublic) ||
    (session.status === 'unauthenticated' && !isPublic)
  ) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin">
          <title>loading spinner</title>
        </Loader2>
      </div>
    );
  }

  return (children);
}