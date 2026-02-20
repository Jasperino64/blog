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
      <ProjectList />
    </>
  );
}

const ProjectList = async () => {
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
