"use client";
import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { commentSchema } from "@/app/schemas/comment";
import { FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { z } from "zod";
import { toast } from "sonner";
import { useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

export function CommentSection(props: {
  preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
}) {
  const params = useParams();
  const data = usePreloadedQuery(props.preloadedComments);
  const [isPending, startTransition] = useTransition();
  const createComment = useMutation(api.comments.createComment);

  async function onSubmit(data: z.infer<typeof commentSchema>) {
    startTransition(async () => {
      try {
        await createComment(data);
        form.reset();
        toast.success("Comment created successfully");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to create comment: ${error.message}`);
        }
      }
    });
  }
  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      postId: params.postId as Id<"posts">,
      body: "",
    },
  });

  if (data == undefined) {
    return <p>Loading...</p>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 border-b">
        <MessageSquare className="size-5" />
        <h2 className="text-2xl font-bold">{data.length} Comments</h2>
      </CardHeader>
      <CardContent className="space-y-8">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            name="body"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <FieldLabel htmlFor="comment">Comment</FieldLabel>
                <Textarea
                  id="comment"
                  aria-invalid={fieldState.invalid}
                  placeholder="Share your thoughts..."
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </>
            )}
          />
          <Button disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              "Comment"
            )}
          </Button>
        </form>
        {data.length > 0 && <Separator className="my-8" />}
        <section className="space-y-6">
          {data?.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar>
                <AvatarImage
                  src={`https://avatar.vercel.sh/${comment.authorName}`}
                />
                <AvatarFallback>
                  {comment.authorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{comment.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment._creationTime).toLocaleDateString(
                      "en-US",
                    )}
                  </p>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </section>
      </CardContent>
    </Card>
  );
}
