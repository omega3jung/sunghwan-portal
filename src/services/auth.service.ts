import { loginApi } from "./credentials.service";

export const authorize = async (credentials?: {
  username: string;
  password: string;
}) => {
  if (!credentials) return null;

  const user = await loginApi(credentials);

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    roles: user.roles,
  };
};
