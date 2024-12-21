import type { Promisify, RateLimitInfo } from "hono-rate-limiter";

export type HonoTypes = {
  Variables: {
    userId: string | null;
    rateLimit: RateLimitInfo;
    rateLimitStore: {
      getKey?: (key: string) => Promisify<RateLimitInfo | undefined>;
      resetKey: (key: string) => Promisify<void>;
    };
  };
};

export type Stats = {
  totalTasksToday: number;
  totalTasksYesterday: number;
  totalTasksAll: number;

  completedTasksOfTheWeek: number[];
  uncompletedTasksOfTheWeek: number[];

  completionPercentage: number;
};
