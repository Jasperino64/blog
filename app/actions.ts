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
import { projectSchema } from "./schemas/project";
import { taskSchema } from "./schemas/task";

export async function createBlogAction(values: z.infer<typeof postSchema>) {
  try {
    const parsed = postSchema.safeParse(values);

    if (!parsed.success) {
      console.error("Validation error:", parsed.error);
      return {
        error: `Validation failed: ${parsed.error.errors.map(e => e.message).join(", ")}`,
      };
    }

    const token = await getToken();

    // Upload all images
    const imageStorageIds = [];
    for (const image of parsed.data.images) {
      const imageUrl = await fetchMutation(
        api.posts.generateImageUploadUrl,
        {},
        { token },
      );

      const uploadResult = await fetch(imageUrl, {
        method: "POST",
        headers: {
          "Content-Type": image.type,
        },
        body: image,
      });

      if (!uploadResult.ok) {
        return {
          error: "Failed to upload image",
        };
      }

      const { storageId } = await uploadResult.json();
      imageStorageIds.push(storageId);
    }

    await fetchMutation(
      api.posts.createPost,
      {
        body: parsed.data.content,
        title: parsed.data.title,
        imageStorageIds,
      },
      { token },
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      error: `Failed to create post: ${error instanceof Error ? error.message : "Unknown error"}`,
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

export async function createProjectAction(
  values: z.infer<typeof projectSchema>,
) {
  try {
    const parsed = projectSchema.safeParse(values);

    if (!parsed.success) {
      throw new Error("something went wrong");
    }

    let imageStorageId;
    if (parsed.data.image) {
      const token = await getToken();
      const imageUploadUrl = await fetchMutation(
        api.images.generateImageUploadUrl,
        {},
        { token },
      );

      const uploadResult = await fetch(imageUploadUrl, {
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

      const { storageId } = await uploadResult.json();

      imageStorageId = storageId;
    }

    if (imageStorageId) {
      await fetchMutation(api.images.createImage, {
        storageId: imageStorageId,
      });
    }

    const token = await getToken();
    await fetchMutation(
      api.projects.createProject,
      {
        title: parsed.data.title,
        description: parsed.data.description,
        imageStorageId,
      },
      { token },
    );
  } catch {
    return {
      error: "Failed to create project",
    };
  }

  revalidatePath("/projects");
  updateTag("projects");

  return redirect("/projects");
}

export async function createTaskAction(values: z.infer<typeof taskSchema>) {
  try {
    const parsed = taskSchema.safeParse(values);

    if (!parsed.success) {
      throw new Error("something went wrong");
    }

    const token = await getToken();
    await fetchMutation(
      api.tasks.createTask,
      {
        title: parsed.data.title,
        description: parsed.data.description,
        projectId: parsed.data.projectId as Id<"projects">,
      },
      { token },
    );
  } catch {
    return {
      error: "Failed to create task",
    };
  }

  revalidatePath("/projects");
  updateTag("projects");

  return redirect("/projects");
}

export async function deleteProjectAction(projectId: string) {
  try {
    const token = await getToken();
    await fetchMutation(
      api.projects.deleteProject,
      { projectId: projectId as Id<"projects"> },
      { token },
    );
  } catch {
    return {
      error: "Failed to delete project",
    };
  }

  revalidatePath("/projects");
  updateTag("projects");

  return { success: true };
}

export async function deleteTaskAction(taskId: string) {
  try {
    const token = await getToken();
    await fetchMutation(
      api.tasks.deleteTask,
      { taskId: taskId as Id<"tasks"> },
      { token },
    );
  } catch {
    return {
      error: "Failed to delete task",
    };
  }

  revalidatePath("/projects");
  updateTag("projects");

  return { success: true };
}
