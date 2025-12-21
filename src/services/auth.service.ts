import { loginApi } from "./credentials.service";

// next-auth signIn will call this.
export const authorize = async (credentials?: {
  username: string;
  password: string;
}) => {
  if (!credentials) return null;

  try {
    const user = await loginApi(credentials);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      access_token: user.access_token,
    };
  } catch (error) {
    // ❗ CredentialsProvider에서는 throw 금지
    return null;
  }
};
