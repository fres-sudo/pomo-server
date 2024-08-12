export const config = {
  ...process.env,
  isProduction: process.env.NODE_ENV === "production",
};
