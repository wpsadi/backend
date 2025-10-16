import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { submissionsTable } from "../db/schema/submissions";
import type { AppContext } from "../types/types";

const bodySchema = z.object(
	{
		firstName: z
			.string({
				error: "First name must be a string",
			})
			.min(1, "First name is required")
			.max(50, "First name must be under 50 characters"),
		lastName: z
			.string({
				error: "Last name must be a string",
			})
			.min(1, "Last name is required")
			.max(50, "Last name must be under 50 characters"),
		email: z.email("Invalid email address"),
		phoneNumber: z
			.string({
				error: "Phone number must be a string",
			})
			.min(10, "Phone number must be at least 10 digits")
			.max(15, "Phone number must be 15 digits or less")
			.regex(/^[0-9+\-\s()]*$/, "Phone number contains invalid characters"),
		course: z
			.string({
				error: "Course must be a string",
			})
			.min(1, "Course is required")
			.max(100),
		batch: z
			.string({
				error: "Batch must be a string",
			})
			.min(1, "Batch is required")
			.max(20),
		github: z
			.url("Invalid GitHub URL")
			.refine(
				(url) => url.includes("github.com"),
				"Must be a valid GitHub profile link",
			),
		linkedin: z
			.url("Invalid LinkedIn URL")
			.refine(
				(url) => url.includes("linkedin.com"),
				"Must be a valid LinkedIn profile link",
			),
		club: z.enum(["sdc", "gdg"], {
			error: "Club must be either 'sdc' or 'gdg'",
		}),
		reason: z
			.string({
				error: "Reason must be a string",
			})
			.min(
				10,
				"Please provide at least 10 characters explaining why you want to join",
			)
			.max(500, "Your answer must be under 500 characters"),
	},
	{
		error: (newErr) => {
			console.error("Body validation failed:", newErr);
			return "Body validation failed";
		},
	},
);

export const submitSDCForm = async (c: AppContext) => {
	const authHeader = c.req.header("Authorization");
	if (authHeader !== Bun.env.AUTHORIZATION) {
		return c.json({ success: false, message: "Unauthorized" }, 401);
	}

	const unsafeBody = await c.req.parseBody();
	const bodyParsed = bodySchema.safeParse(unsafeBody);

	if (!bodyParsed.success) {
		return c.json(
			{
				success: false,
				message: "Validation errors",
				errors: bodyParsed.error.issues.map((e) => e.message),
			},
			400,
		);
	}
	const body = bodyParsed.data;

	try {
		// check email uniqueness
		const existingCount = await db
			.select({ count: count() })
			.from(submissionsTable)
			.where(eq(submissionsTable.email, body.email));

		if (!existingCount || existingCount[0]?.count === 0) {
			await db.insert(submissionsTable).values(body);
			return c.json(
				{ success: true, message: "Form submitted successfully" },
				201,
			);
		} else {
			return c.json({ success: false, message: "Email already exists" }, 400);
		}
	} catch (err) {
		console.error("Error submitting form:", err);
		return c.json({ success: false, message: "Server error" }, 500);
	}
};
