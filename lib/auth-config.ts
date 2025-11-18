// lib/auth-config.ts
export const isProviderIdConfigured =
  process.env.PROVIDER_ID_URL &&
  process.env.PROVIDER_ID_CLIENT_ID &&
  process.env.PROVIDER_ID_CLIENT_SECRET;

export const authConfig = {
  providers: {
    providerId: isProviderIdConfigured,
    credentials: true,
  },
};
