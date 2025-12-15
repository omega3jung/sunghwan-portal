// app/(public)/login/layout.tsx

import { headers } from "next/headers";
import { ReactNode } from "react";

// 브라우저 미지원 안내 컴포넌트
function UnsupportedBrowser() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">지원되지 않는 브라우저</h1>
      <p className="text-gray-600 text-center max-w-md">
        Internet Explorer는 더 이상 지원되지 않습니다.
        <br />
        Chrome, Edge, Safari 또는 Firefox로 접속해 주세요.
      </p>
    </div>
  );
}

export default function PublicLayout({ children }: { children: ReactNode }) {
  const ua = headers().get("user-agent")?.toLowerCase();

  // IE/Trident 감지
  const isIE =
    ua?.includes("trident") ||
    ua?.includes("msie") ||
    ua?.includes("windows nt 6.1; wow64; trident");

  if (isIE) {
    return <UnsupportedBrowser />;
  }

  return <div className="public-wrapper">{children}</div>;
}
