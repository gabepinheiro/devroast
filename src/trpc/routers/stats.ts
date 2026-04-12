import { getStats } from "@/db/queries";
import { createTRPCRouter, publicProcedure } from "../init";

export const statsRouter = createTRPCRouter({
  overview: publicProcedure.query(() => getStats()),
});
