import { LoginScreen } from "./LoginScreen";
import { buildLoginRedirectHref } from "./redirect";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <LoginScreen redirectHref={buildLoginRedirectHref(resolvedSearchParams)} />
  );
}
