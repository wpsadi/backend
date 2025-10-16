import type { Context, Env } from "hono";

export type AppContext = Context<{ Bindings: Env }>;
