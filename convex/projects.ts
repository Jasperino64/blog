import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { ConvexError } from "convex/values";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    const newProjectId = await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      authorId: user._id,
      imageStorageId: args.imageStorageId,
    });
    return newProjectId;
  },
});

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return await Promise.all(
      projects.map(async (project) => ({
        ...project,
        imageUrl: project.imageStorageId
          ? await ctx.storage.getUrl(project.imageStorageId)
          : undefined,
      })),
    );
  },
});

export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }
    const imageUrl = project?.imageStorageId
      ? await ctx.storage.getUrl(project.imageStorageId)
      : null;

    return {
      ...project,
      imageUrl,
    };
  },
});

export const deleteProject = mutation({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        const project = await ctx.db.get(args.projectId);
        if (!user) {
            throw new ConvexError("Unauthorized");
        }

        if (!project) {
            // If the project is already deleted, and we are an admin or owner, consider it a success.
            // If we are a regular user, we can't know if we *were* the author, so we might throw or just return.
            // Let's assume idempotency: if it's gone, it's gone.
            return;
        }

        if (
            project.authorId !== user._id &&
            user.role !== "admin" &&
            user.role !== "owner"
        ) {
            throw new ConvexError(
                `You are not authorized to delete this project because you are not the author or admin, ${user.role}`,
            );
        }

        if (project.imageStorageId) {
            await ctx.storage.delete(project.imageStorageId);
        }
        await ctx.db.delete(args.projectId);
    },
});


