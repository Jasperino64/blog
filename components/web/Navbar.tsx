"use client";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SearchInput from "./SearchInput";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { data: session } = authClient.useSession();

  return (
    <nav className="w-full py-5 flex flex-col md:w-64 md:h-screen md:sticky md:top-0 md:justify-start md:border-r md:pr-6 md:py-8 shrink-0 z-50 bg-background overflow-y-auto">
      {/* Mobile Top Row / Desktop Logo */}
      <div className="flex items-center justify-between w-full md:flex-col md:items-start md:gap-8">
        <Link href="/">
          <h1 className="text-3xl font-bold">
            Next<span className="text-primary">Pro</span>
          </h1>
        </Link>

        {/* Mobile Actions section */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-28 sm:w-auto">
            <SearchInput />
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild className="w-full justify-center">
                <Link href="/">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="w-full justify-center">
                <Link href="/blog">Blog</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="w-full justify-center">
                <Link href="/projects">Projects</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="w-full justify-center">
                <Link href="/projects/create">Create Project</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="w-full justify-center">
                <Link href="/images/gallery">Gallery</Link>
              </DropdownMenuItem>
              {(session?.user.role === "admin" ||
                session?.user.role === "owner") && (
                <>
                  <DropdownMenuItem asChild className="w-full justify-center">
                    <Link href="/create">Create</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="w-full justify-center">
                    <Link href="/admin">Admin</Link>
                  </DropdownMenuItem>
                </>
              )}
              {isLoading ? null : isAuthenticated ? (
                <DropdownMenuItem
                  className={`${buttonVariants()} w-full justify-center mt-2`}
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          toast.success("Logged out successfully");
                          router.push("/");
                        },
                        onError: (error) => {
                          toast.error(error.error.message);
                        },
                      },
                    })
                  }
                >
                  Logout
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem asChild className="w-full justify-center mt-2">
                    <Link className={buttonVariants()} href="/auth/sign-up">
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="w-full justify-center cursor-pointer mt-2"
                  >
                    <Link className={buttonVariants()} href="/auth/login">
                      Login
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="hidden md:flex flex-col gap-6 w-full mt-8 flex-1 pb-6">
        <div className="w-full">
          <SearchInput />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Link className={`${buttonVariants({ variant: "ghost" })} w-full justify-start`} href="/">
            Home
          </Link>
          <Link className={`${buttonVariants({ variant: "ghost" })} w-full justify-start`} href="/blog">
            Blog
          </Link>
          <Link className={`${buttonVariants({ variant: "ghost" })} w-full justify-start`} href="/projects">
            Projects
          </Link>
          <Link className={`${buttonVariants({ variant: "ghost" })} w-full justify-start`} href="/images/gallery">
            Gallery
          </Link>
          {(session?.user.role === "admin" ||
            session?.user.role === "owner") && (
            <>
              <Link className={`${buttonVariants({ variant: "ghost" })} w-full justify-start`} href="/create">
                Create
              </Link>
              <Link className={`${buttonVariants({ variant: "ghost" })} w-full justify-start`} href="/admin">
                Admin
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
