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
    <nav className="w-full py-5 flex items-center justify-between">
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/">
          <h1 className="text-3xl font-bold">
            Next<span className="text-primary">Pro</span>
          </h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          <Link className={buttonVariants({ variant: "ghost" })} href="/">
            Home
          </Link>
          <Link className={buttonVariants({ variant: "ghost" })} href="/blog">
            Blog
          </Link>
          <Link
            className={buttonVariants({ variant: "ghost" })}
            href="/images/gallery"
          >
            Gallery
          </Link>
          {(session?.user.role === "admin" ||
            session?.user.role === "owner") && (
            <>
              <Link
                className={buttonVariants({ variant: "ghost" })}
                href="/create"
              >
                Create
              </Link>
              <Link
                className={buttonVariants({ variant: "ghost" })}
                href="/admin"
              >
                Admin
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="ml-2 md:mr-2">
          <SearchInput />
        </div>

        {/* Desktop Auth & Theme */}
        <div className="hidden md:flex items-center gap-2">
          {isLoading ? null : isAuthenticated ? (
            <Button
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
            </Button>
          ) : (
            <>
              <Link className={buttonVariants()} href="/auth/sign-up">
                Sign Up
              </Link>
              <Link className={buttonVariants()} href="/auth/login">
                Login
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
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
                  className={`${buttonVariants()} w-full justify-center`}
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
                  <DropdownMenuItem asChild className="w-full justify-center">
                    <Link className={buttonVariants()} href="/auth/sign-up">
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="w-full justify-center cursor-pointer"
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
    </nav>
  );
}
