import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { connection } from "next/server";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function Projects() {
  return (
    <>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Projects
      </h1>
      <div className="flex justify-end">
        <Link
          href="/projects/create"
          className={buttonVariants({ className: "" })}
        >
          Create Project
        </Link>
      </div>

      <Suspense fallback={<SkeletonLoadingUi />}>
        <ProjectList />
      </Suspense>
    </>
  );
}

const ProjectList = async () => {
  await connection();
  const data = await fetchQuery(api.projects.getProjects);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((project) => (
          <TableRow key={project._id}>
            <TableHead>
              <Link href={`/projects/${project._id}`}>{project.title}</Link>
            </TableHead>
            <TableHead>{project.description}</TableHead>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

function SkeletonLoadingUi() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2 flex flex-col">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
