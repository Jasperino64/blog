"use client";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/CommentSection";
import { DeletePostButton } from "@/components/web/DeletePostButton";
import { PostPresence } from "@/components/web/PostPresence";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useEffect } from "react";

export default function PostIdRoute() {
  const params = useParams();
  const postId = params?.postId as Id<"posts">;

  const post = useQuery(api.posts.getPostById, { postId });
  const userId = useQuery(api.presence.getUserId);

  useEffect(() => {
    if (post) {
      document.title = post.title;
    }
  }, [post]);

  if (post === undefined) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-6xl font-extrabold text-red-500 p-20">
          No post found
        </h1>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 animate-in fade-in duration-500 relative">
      <Link
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
        href="/blog"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>

      {/* Image Gallery */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="mb-8 space-y-4">
          {/* Main Image */}
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-sm">
            <Image
              src={post.imageUrls[0] ?? ""}
              alt={post.title || ""}
              fill
              className="object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      )}

      <div className="space-y-4 flex flex-col">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Posted on:{" "}
              {new Date(post._creationTime).toLocaleDateString("en-US")}
            </p>
            {userId && <PostPresence roomId={post._id} userId={userId} />}
          </div>
          <DeletePostButton postId={post._id} authorId={post.authorId} />
        </div>
      </div>

      <Separator className="my-8" />

      {/* Markdown Content */}
      <article className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            img: ({ ...props }) => {
              // Replace image-{index} references with actual uploaded image URLs
              const src = typeof props.src === "string" ? props.src : "";
              const match = src.match(/^image-(\d+)$/);
              if (match) {
                const index = parseInt(match[1]);
                if (post.imageUrls && post.imageUrls[index]) {
                  return (
                    <Image
                      src={post.imageUrls[index] ?? ""}
                      alt={
                        typeof props.alt === "string"
                          ? props.alt
                          : `Image ${index + 1}`
                      }
                      width={800}
                      height={600}
                      className="object-contain rounded-lg w-full max-h-[600px] mx-auto"
                    />
                  );
                }
              }
              // For external images, use regular img tag
              // eslint-disable-next-line @next/next/no-img-element
              return (
                <img
                  {...props}
                  alt={props.alt || ""}
                  className="object-contain rounded-lg mx-auto"
                />
              );
            },
          }}
        >
          {post.body}
        </ReactMarkdown>
      </article>

      <Separator className="my-8" />

      <CommentSection postId={postId} />
    </div>
  );
}
