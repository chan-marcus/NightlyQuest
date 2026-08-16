import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9bf47a34/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to check all data in database
app.get("/make-server-9bf47a34/debug/all", async (c) => {
  try {
    const { createClient } = await import("jsr:@supabase/supabase-js@2.49.8");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );

    const { data, error } = await supabase
      .from("kv_store_9bf47a34")
      .select("*");

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Analytics endpoint - signups are now stored in external backend
app.get("/make-server-9bf47a34/analytics/signups", async (c) => {
  // Signups are now handled by external backend at https://hodngazgjsokcyrtbxkm.supabase.co/functions/v1/signup
  // This endpoint returns empty data for backward compatibility
  return c.json({ success: true, signups: [] });
});

Deno.serve(app.fetch);