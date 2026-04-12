import "server-only";

import { createTRPCRouter } from "./init";
import { statsRouter } from "./routers/stats";

export const appRouter = createTRPCRouter({
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
