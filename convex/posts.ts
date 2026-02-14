import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { Id } from "./_generated/dataModel";

export const createPost = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    imageStorageId: v.id("_storage"),
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
      imageStorageId: args.imageStorageId,
    });
    return newPostId;
  },
});

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();
    return await Promise.all(
      posts.map(async (post) => ({
        ...post,
        imageUrl: post.imageStorageId
          ? await ctx.storage.getUrl(post.imageStorageId)
          : undefined,
      })),
    );
  },
});

export const getPostById = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      return null;
    }
    const imageUrl = post?.imageStorageId
      ? await ctx.storage.getUrl(post.imageStorageId)
      : null;

    return {
      ...post,
      imageUrl,
    };
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    if (post?.authorId !== user._id) {
      throw new ConvexError("Unauthorized");
    }
    await ctx.db.delete(args.postId);
  },
});

export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    return await ctx.storage.generateUploadUrl();
  },
});
