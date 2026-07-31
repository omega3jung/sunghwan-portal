import { LoginScreen } from "./LoginScreen";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getFirstParam = (value: string | string[] | undefined) => {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
};

const buildRedirectHref = (
  searchParams: Record<string, string | string[] | undefined> = {},
) => {
  const redirectParam = getFirstParam(searchParams.r);
  const baseUrl = new URL("https://portal.local");
  let targetUrl = new URL("/", baseUrl);

  if (redirectParam.startsWith("/")) {
    try {
      const candidateUrl = new URL(redirectParam, baseUrl);
      if (candidateUrl.origin === baseUrl.origin) {
        targetUrl = candidateUrl;
      }
    } catch {
      targetUrl = new URL("/", baseUrl);
    }
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "r") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) {
          targetUrl.searchParams.append(key, item);
        }
      }
      continue;
    }

    if (value != null) {
      targetUrl.searchParams.set(key, value);
    }
  }

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return <LoginScreen redirectHref={buildRedirectHref(resolvedSearchParams)} />;
}
