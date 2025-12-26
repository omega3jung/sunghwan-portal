import { loginApi } from "./credentials";
import { AuthUser } from "@/types/next-auth.d";

// next-auth signIn will call this.
export const authorize = async (
  credentials?: { username: string; password: string; }
): Promise<AuthUser | null> => {
  if (!credentials) return null;

  try {
    const user = await loginApi(credentials);
    if (!user) { return null };

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };

  } catch (error) {
    // ❗ CredentialsProvider에서는 throw 금지
    return null;
  }
};
