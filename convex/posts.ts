import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

export const createPost = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    const newPostId = await ctx.db.insert("posts", {
      title: args.title,
      body: args.body,
      authorId: user._id,
      imageUrl: args.image,
    });
    return newPostId;
  },
});

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").collect();
  },
});

export const deletePost = mutation({
  args: {
    postId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
  },
});
