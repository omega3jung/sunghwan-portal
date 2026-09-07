const getFirstParam = (value: string | string[] | undefined) => {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
};

/** Builds a same-origin post-authentication target from untrusted query input. */
export const buildLoginRedirectHref = (
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
