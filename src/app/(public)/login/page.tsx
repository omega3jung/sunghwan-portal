import { LoginPageClient } from "./LoginPageClient";

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
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "r") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) {
          params.append(key, item);
        }
      }
      continue;
    }

    if (value != null) {
      params.set(key, value);
    }
  }

  const isSafePath = redirectParam.startsWith("/");
  const target = isSafePath && redirectParam ? redirectParam : "/";
  const queryString = params.toString();

  return queryString ? `${target}?${queryString}` : target;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <LoginPageClient redirectHref={buildRedirectHref(resolvedSearchParams)} />
  );
}
