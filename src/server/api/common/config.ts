export const config = {
  ...Bun.env,
  isProduction: process.env.NODE_ENV === "production",
};
