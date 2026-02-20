import { createTaskAction } from "@/app/actions";
import { taskSchema, TaskSchema } from "@/app/schemas/task";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteProjectButton } from "@/components/web/DeleteProjectButton";
import { TasksSection } from "@/components/web/TasksSection";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { Preloaded } from "convex/react";
import { Query } from "convex/server";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface PostIdRouteProps {
  params: Promise<{
    projectId: Id<"projects">;
  }>;
}

export async function generateMetadata({
  params,
}: PostIdRouteProps): Promise<Metadata> {
  "use cache";
  const { projectId } = await params;

  const project = await fetchQuery(api.projects.getProjectById, {
    projectId: projectId,
  });

  if (!project) {
    return {
      title: "Project not found",
    };
  }

  return {
    title: project.title,
    description: project.description,
    authors: [{ name: "Jasper Chen" }],
  };
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {
  const { projectId } = await params;
  const token = await getToken();

  const [project, preloadedTasks, userId] = await Promise.all([
    await fetchQuery(api.projects.getProjectById, { projectId: projectId }),
    await preloadQuery(api.tasks.getTasksByProjectId, { projectId: projectId }),
    await fetchQuery(api.presence.getUserId, {}, { token }),
  ]);

  if (!userId) {
    return redirect("/auth/login");
  }

  if (!project) {
    return (
      <div>
        <h1 className="text-6xl font-extrabold text-red-500 p-20">
          No project found
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in druation-500 relative">
      <Link
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
        href="/projects"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      <div className="space-y-4 flex flex-col">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {project.title}
        </h1>

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Posted on:{" "}
              {new Date(project._creationTime).toLocaleDateString("en-US")}
            </p>
          </div>
          <DeleteProjectButton
            projectId={project._id}
            authorId={project.authorId}
          />
        </div>
      </div>

      <Separator className="my-8" />

      <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {project.description}
      </p>

      <Separator className="my-8" />

      <ProjectTasks projectId={projectId} preloadedTasks={preloadedTasks} />
    </div>
  );
}

const ProjectTasks = ({
  projectId,
  preloadedTasks,
}: {
  projectId: Id<"projects">;
  preloadedTasks: Preloaded<Query<"tasks.getTasksByProjectId">>;
}) => {
  return (
    <Suspense fallback={<div>Loading tasks...</div>}>
      <TasksSection preloadedTasks={preloadedTasks} />
    </Suspense>
  );
};
