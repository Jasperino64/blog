import { Id } from "@/convex/_generated/dataModel";
import { z } from "zod";

// Schema for forms
export const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(50, "Title must be at most 50 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .optional(),
  projectId: z.custom<Id<"projects">>(),
});

export type TaskSchema = z.infer<typeof taskSchema>;
