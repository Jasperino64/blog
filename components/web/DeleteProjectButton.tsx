"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Id } from "@/convex/_generated/dataModel";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProjectAction } from "@/app/actions";

interface DeleteProjectButtonProps {
  projectId: Id<"projects">;
  className?: string;
  authorId: string; 
}

export function DeleteProjectButton({
  projectId,
  className,
  authorId,
}: DeleteProjectButtonProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const deleteProject = async () => await deleteProjectAction(projectId);
  const [isDeleting, setIsDeleting] = useState(false);

  if (
    !user ||
    (user.id !== authorId && user.role !== "admin" && user.role !== "owner")
  ) {
    return null;
  }
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProject();
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete project",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="destructive" size="icon" className={className}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
