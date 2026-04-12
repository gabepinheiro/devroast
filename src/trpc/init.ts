import "server-only";

import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { db } from "@/db";

export const createTRPCContext = cache(async () => {
  return { db };
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
