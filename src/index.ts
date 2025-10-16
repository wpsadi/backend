import { fromHono } from "chanfana";
import { type Env, Hono } from "hono";
import { cors } from "hono/cors";
import { submitSDCForm } from "./endpoints/sdc-contact-form";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();
// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/docs",
});

openapi.use(
	"*",
	cors({
		origin: ["http://localhost:3000",Bun.env.FRONTEND_URL],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		// allowHeaders: ["Content-Type", "Authorization"],
	}),
);

// Register OpenAPI endpoints

// You may also register routes for non OpenAPI directly on Hono
app.get("/", (c) => c.text("Hello"));
app.post("/join-sdc", submitSDCForm);

// Export the Hono app
export default app;
