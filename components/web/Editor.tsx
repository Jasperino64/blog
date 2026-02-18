"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useConvex, useMutation } from "convex/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import { Suspense, useState } from "react";
import { Skeleton } from "../ui/skeleton";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (storageId: string) => void;
}

export default function Editor({
  content,
  onChange,
  onImageUpload,
}: EditorProps) {
  const generateUploadUrl = useMutation(api.posts.generateImageUploadUrl);
  const convex = useConvex();
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Heading,
      Image.configure({
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
          
        },
      }),
      TextAlign.configure({
        types: ["paragraph", "heading"],
        alignments: ["left", "center", "right", "justify"],
      }),
    ],
    immediatelyRender: false,
    editable: true,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none p-4 focus:outline-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();

      // 2. Upload file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // 3. Get public URL using our helper query
      const url = await convex.query(api.posts.getImageUrl, { storageId });

      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
        onImageUpload?.(storageId);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Suspense fallback={<EditorSkeleton />}>
      <div className="w-full border rounded-md">
        <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-muted" : ""}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-muted" : ""}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleStrike().run();
            }}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-muted" : ""}
          >
            <Strikethrough className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setParagraph().run();
            }}
            className={editor.isActive("paragraph") ? "muted" : ""}
          >
            <Pilcrow className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            className={
              editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
            }
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            className={
              editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
            }
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            className={
              editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""
            }
          >
            <Heading3 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
            className={editor.isActive("bulletList") ? "bg-muted" : ""}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={editor.isActive("orderedList") ? "bg-muted" : ""}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
            }}
            className={editor.isActive("blockquote") ? "bg-muted" : ""}
          >
            <Quote className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <ImageIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Insert Image</h4>
                <p className="text-sm text-muted-foreground">
                  Upload an image from your computer.
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-xs text-muted-foreground">Uploading...</p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
          >
            <Redo className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("left").run();
            }}
            className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("center").run();
            }}
            className={
              editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""
            }
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("right").run();
            }}
            className={
              editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""
            }
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("justify").run();
            }}
            className={
              editor.isActive({ textAlign: "justify" }) ? "bg-muted" : ""
            }
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>

        <EditorContent editor={editor} />
      </div>
    </Suspense>
  );
}

const EditorSkeleton = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-10 h-10" />
      </div>
      <Skeleton className="w-full h-96" />
    </div>
  );
};
