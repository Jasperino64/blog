import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./betterAuth/auth";
import { ConvexError } from "convex/values";

export const getTasksByProjectId = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
    const sortedData = data.sort((a, b) => a.order - b.order);
    return sortedData;
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
    await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      authorId: user._id,
      projectId: args.projectId,
      order: tasks.length + 1,
      status: "pending",
    });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    projectId: v.id("projects"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError("Task not found");
    }
    if (task.authorId !== user._id) {
      throw new ConvexError("Unauthorized");
    }
    if (task.projectId !== args.projectId) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.taskId, {
      title: args.title,
      description: args.description,
      order: args.order,
    });
  },
});
