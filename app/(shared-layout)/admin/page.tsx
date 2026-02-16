"use client";

import { updateUserSchema } from "@/app/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState, useTransition } from "react";
import z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserWithRole } from "better-auth/plugins";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const form = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user" as const,
    },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role === "admin" ? "admin" : "user",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "user",
      });
    }
  }, [editingUser, form]);

  useEffect(() => {
    if (
      !isAuthPending &&
      session?.user.role !== "admin" &&
      session?.user.role !== "owner"
    ) {
      router.push("/");
    }
  }, [isAuthPending, session, router]);

  useEffect(() => {
    async function fetchUsers() {
      const { data: users, error } = await authClient.admin.listUsers({
        query: { limit: 100 },
      });
      console.log(users, error);
      setUsers(users?.users || []);
    }
    fetchUsers();
  }, []);

  async function onSubmit(data: z.infer<typeof updateUserSchema>) {
    startTransition(async () => {
      if (!editingUser) return;
      console.log(data);
      await authClient.admin.updateUser({
        userId: editingUser.id,
        data: {
          email: data.email,
          name: data.name,
          role: data.role,
        },
        fetchOptions: {
          onSuccess: () => {
            toast.success("Account updated successfully.");
          },
          onError: () => {
            toast.error("Failed to update account.");
          },
        },
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users ? (users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button onClick={() => setEditingUser(user)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))): <TableRow><TableCell><Loader2 className="animate-spin" /></TableCell></TableRow>}
          </TableBody>
        </Table>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder={"John Doe"}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    aria-invalid={fieldState.invalid}
                    placeholder={"aaa@gmail.com"}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-row gap-2">
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </div>
              )}
            />
            <Button disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Updating user...</span>
                </>
              ) : (
                "Update User"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
