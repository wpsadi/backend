declare module "bun" {
	interface Env {
		AUTHORIZATION: string;
		DATABASE_URL: string;
		FRONTEND_URL: string;
	}
}
