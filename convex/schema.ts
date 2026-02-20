import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    body: v.string(),
    authorId: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  })
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_body", { searchField: "body" }),
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.string(),
    authorName: v.string(),
    body: v.string(),
  }),
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    authorId: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  })
    .searchIndex("search_project_title", { searchField: "title" })
    .searchIndex("search_project_description", { searchField: "description" }),
  tasks: defineTable({
    order: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    authorId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in-progress"),
      v.literal("done"),
    ),
  })
    .searchIndex("search_task_title", { searchField: "title" })
    .searchIndex("search_task_description", { searchField: "description" }),
  images: defineTable({
    storageId: v.id("_storage"),
    url: v.string(),
  }),
});
