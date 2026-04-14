declare const process: {
  env: Record<string, string | undefined>;
};

const requireEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const ENV = Object.freeze({
  SUPABASE_URL: requireEnv('EXPO_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
});
