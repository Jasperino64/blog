import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { Doc, Id } from "./_generated/dataModel";

export const createPost = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    images: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      throw new ConvexError(
        "Unauthorized: You must be an admin or owner to create a post.",
      );
    }
    const newPostId = await ctx.db.insert("posts", {
      title: args.title,
      body: args.body,
      authorId: user._id,
      images: args.images,
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
        images: post.images
          ? await Promise.all(
              post.images.map(async (id) => await ctx.storage.getUrl(id)),
            )
          : [],
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
    const images = post.images
      ? await Promise.all(
          post.images.map(async (id) => await ctx.storage.getUrl(id)),
        )
      : [];

    return {
      ...post,
      images,
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

    if (!post) {
      // If the post is already deleted, and we are an admin or owner, consider it a success.
      // If we are a regular user, we can't know if we *were* the author, so we might throw or just return.
      // Let's assume idempotency: if it's gone, it's gone.
      return;
    }

    if (
      post.authorId !== user._id &&
      user.role !== "admin" &&
      user.role !== "owner"
    ) {
      throw new ConvexError(
        `You are not authorized to delete this post because you are not the author or admin, ${user.role}`,
      );
    }

    if (post.images) {
      await Promise.all(
        post.images.map(async (id) => await ctx.storage.delete(id)),
      );
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

interface searchResult {
  _id: Id<"posts">;
  title: string;
  body: string;
}

export const searchPosts = query({
  args: {
    queryString: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const { queryString, limit } = args;
    const results: Array<searchResult> = [];
    const seen = new Set();

    const pushDocs = async (docs: Array<Doc<"posts">>) => {
      for (const doc of docs) {
        if (seen.has(doc._id)) {
          continue;
        }
        seen.add(doc._id);
        results.push({ _id: doc._id, title: doc.title, body: doc.body });
        if (results.length >= limit) {
          break;
        }
      }
    };

    const titleMatches = await ctx.db
      .query("posts")
      .withSearchIndex("search_title", (q) => q.search("title", queryString))
      .take(limit);
    await pushDocs(titleMatches);

    if (results.length >= limit) {
      return results;
    }

    const bodyMatches = await ctx.db
      .query("posts")
      .withSearchIndex("search_body", (q) => q.search("body", queryString))
      .take(limit);
    await pushDocs(bodyMatches);

    return results;
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
