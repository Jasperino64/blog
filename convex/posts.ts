import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { Doc, Id } from "./_generated/dataModel";

export const createPost = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
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
