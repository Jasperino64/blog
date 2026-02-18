import { query } from "./_generated/server";

export const getAllImages = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    const postsWithImages = posts.filter(
      (post) => post.images && post.images.length > 0,
    );

    const allImages = await Promise.all(
      postsWithImages.flatMap(async (post) => {
        if (!post.images) return [];
        return await Promise.all(
          post.images.map(async (id) => ({
            postId: post._id,
            title: post.title,
            imageUrl: await ctx.storage.getUrl(id),
          })),
        );
      }),
    );

    return allImages.flat();
  },
});