"use server";

import z from "zod";
import { postSchema } from "./schemas/blog";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth-server";
import { revalidatePath, updateTag } from "next/cache";
import { commentSchema } from "./schemas/comment";
import { Id } from "@/convex/_generated/dataModel";

export async function createBlogAction(values: z.infer<typeof postSchema>) {
  try {
    const parsed = postSchema.safeParse(values);

    if (!parsed.success) {
      throw new Error("something went wrong");
    }

    const token = await getToken();
    const coverImageUrl = await fetchMutation(
      api.posts.generateImageUploadUrl,
      {},
      { token },
    );

    const uploadResult = await fetch(coverImageUrl, {
      method: "POST",
      headers: {
        "Content-Type": parsed.data.image.type,
      },
      body: parsed.data.image,
    });

    if (!uploadResult.ok) {
      return {
        error: "Failed to upload image",
      };
    }

    const { storageId: coverStorageId } = await uploadResult.json();

    // Combine cover image ID with embedded image IDs (if any)
    // Note: embeddedImages are already uploaded via Editor
    const allImageIds = [coverStorageId, ...(parsed.data.embeddedImages || [])];

    await fetchMutation(
      api.posts.createPost,
      {
        body: parsed.data.content,
        title: parsed.data.title,
        images: allImageIds,
      },
      { token },
    );
  } catch {
    return {
      error: "Failed to create post",
    };
  }

  // revalidatePath("/blog");
  updateTag("blog");

  return redirect("/blog");
}

export async function createCommentAction(
  values: z.infer<typeof commentSchema>,
) {
  try {
    const parsed = commentSchema.safeParse(values);

    if (!parsed.success) {
      throw new Error("something went wrong");
    }

    const token = await getToken();
    await fetchMutation(
      api.comments.createComment,
      {
        postId: parsed.data.postId,
        body: parsed.data.body,
      },
      { token },
    );
  } catch {
    return {
      error: "Failed to create comment",
    };
  }

  revalidatePath("/blog");
  updateTag("blog");

  return redirect("/blog");
}

export async function deletePostAction(postId: string) {
  try {
    const token = await getToken();
    await fetchMutation(
      api.posts.deletePost,
      { postId: postId as Id<"posts"> },
      { token },
    );
  } catch {
    return {
      error: "Failed to delete post",
    };
  }

  revalidatePath("/blog");
  updateTag("blog");

  return { success: true };
}
