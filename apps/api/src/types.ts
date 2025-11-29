import type { Hono } from "hono";
import type { BlankEnv, BlankSchema } from "hono/types";

export type APIApp = Hono<BlankEnv, {}, "/api">;
