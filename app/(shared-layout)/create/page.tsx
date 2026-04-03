"use client";

import { createBlogAction } from "@/app/actions";
import { postSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, Upload, Image as ImageIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export default function CreateRoute() {
  const [isPending, startTransition] = useTransition();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      title: "",
      images: [],
    },
  });

  const markdownContent = form.watch("content");

  useEffect(() => {
    document.title = "Create Post";
  }, []);

  function onSubmit(values: z.infer<typeof postSchema>) {
    startTransition(async () => {
      const result = await createBlogAction(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        form.reset();
        setImagePreviews([]);
        toast.success("Post created successfully");
      }
    });
  }

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const currentImages = form.getValues("images") || [];

    // Limit to 5 images total
    const newImages = [...currentImages, ...fileArray].slice(0, 5);
    form.setValue("images", newImages);

    // Create preview URLs
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("images", newImages);

    // Revoke old URL and create new preview array
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const insertImageReference = (index: number) => {
    const currentContent = form.getValues("content");
    const imageMarkdown = `![Image ${index + 1}](image-${index})`;

    // Insert at the end or at cursor position (appending for simplicity)
    const newContent = currentContent
      ? `${currentContent}\n\n${imageMarkdown}\n\n`
      : `${imageMarkdown}\n\n`;

    form.setValue("content", newContent);
    toast.success(`Image ${index + 1} reference inserted`);
  };

  useEffect(() => {
    // Cleanup preview URLs on unmount
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <div className="py-8 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Editor Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Create Blog Article</CardTitle>
            <CardDescription>
              Write your post using markdown syntax
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="gap-y-4">
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Title</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your post title"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="content"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Content (Markdown)</FieldLabel>
                      <Textarea
                        aria-invalid={fieldState.invalid}
                        placeholder="# Your markdown content here&#10;&#10;**Bold text**, *italic text*&#10;&#10;- List item 1&#10;- List item 2"
                        className="min-h-[400px] font-mono"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports markdown syntax: headings, bold, italic,
                        lists, links, code blocks, etc.
                      </p>
                    </Field>
                  )}
                />

                <Controller
                  name="images"
                  control={form.control}
                  render={({ fieldState }) => (
                    <Field>
                      <FieldLabel>Images (1-5 images)</FieldLabel>
                      <p className="text-xs text-muted-foreground mb-2">
                        Upload images and click the <ImageIcon className="inline size-3" /> button to insert them into your content
                      </p>
                      <div className="space-y-2">
                        <label
                          htmlFor="image-upload"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="size-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Click to upload images ({imagePreviews.length}/5)
                            </span>
                          </div>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleImageChange(e.target.files)}
                            disabled={imagePreviews.length >= 5}
                          />
                        </label>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {imagePreviews.map((preview, index) => (
                              <div
                                key={index}
                                className="relative group aspect-square"
                              >
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => insertImageReference(index)}
                                    className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                                    title="Insert into markdown"
                                  >
                                    <ImageIcon className="size-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                    title="Remove image"
                                  >
                                    <X className="size-4" />
                                  </button>
                                </div>
                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                                  #{index + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Button disabled={isPending} className="w-full">
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Post</span>
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="h-fit sticky top-4">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>See how your post will look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Title Preview */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {form.watch("title") || "Your title here"}
                </h1>
              </div>

              {/* Image Preview */}
              {imagePreviews.length > 0 && (
                <div className="space-y-2">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={imagePreviews[0]}
                      alt="Main preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {imagePreviews.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.slice(1).map((preview, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded overflow-hidden"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Markdown Content Preview */}
              <div className="prose prose-sm max-w-none min-h-[400px] p-4 border rounded-lg">
                {markdownContent ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      img: ({ ...props }) => {
                        // Replace image-{index} references with actual preview URLs
                        const src = typeof props.src === "string" ? props.src : "";
                        const match = src.match(/^image-(\d+)$/);
                        if (match) {
                          const index = parseInt(match[1]);
                          if (imagePreviews[index]) {
                            return (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                {...props}
                                src={imagePreviews[index]}
                                alt={props.alt || `Image ${index + 1}`}
                                className="rounded-lg mx-auto"
                              />
                            );
                          }
                        }
                        // eslint-disable-next-line @next/next/no-img-element
                        return <img {...props} alt={props.alt || ""} className="rounded-lg mx-auto" />;
                      },
                    }}
                  >
                    {markdownContent}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">
                    Your markdown content will appear here...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
