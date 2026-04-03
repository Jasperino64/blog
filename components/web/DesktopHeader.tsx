"use client";
import { Button, buttonVariants } from "../ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function DesktopHeader() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="flex items-center gap-2">
      {isLoading ? null : isAuthenticated ? (
        <Button
           variant="outline"
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
          <Link className={buttonVariants({ variant: "outline" })} href="/auth/login">
            Login
          </Link>
        </>
      )}
      <ThemeToggle />
    </div>
  );
}
