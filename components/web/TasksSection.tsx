"use client";
import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { Separator } from "../ui/separator";
import { taskSchema } from "@/app/schemas/task";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export function TasksSection(props: {
  preloadedTasks: Preloaded<typeof api.tasks.getTasksByProjectId>;
}) {
  const params = useParams();
  const data = usePreloadedQuery(props.preloadedTasks);
  const [isPending, startTransition] = useTransition();
  const createTask = useMutation(api.tasks.createTask);

  async function onSubmit(data: z.infer<typeof taskSchema>) {
    startTransition(async () => {
      try {
        await createTask(data);
        form.reset();
        toast.success("Task created successfully");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Failed to create task: ${error.message}`);
        }
      }
    });
  }
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      projectId: params.projectId as Id<"projects">,
      title: "",
      description: "",
    },
  });

  if (data == undefined) {
    return <p>Loading...</p>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 border-b">
        <MessageSquare className="size-5" />
        <h2 className="text-2xl font-bold">{data.length} Tasks</h2>
      </CardHeader>
      <CardContent className="space-y-8">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <>

                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  aria-invalid={fieldState.invalid}
                  placeholder="Title"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
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
              "Add Task"
            )}
          </Button>
        </form>
        {data.length > 0 && <Separator className="my-8" />}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table >
      </CardContent>
    </Card>
  );
}
