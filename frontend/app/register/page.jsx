"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Registration failed");
        return;
      }

      if (data?.user) setUser(data.user);
      if (data?.accessToken) setAccessToken(data.accessToken);

      router.push("/");
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <PageWrapper>
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <div className="rounded-xl border border-neutral-100 bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-primary">Create account</h1>
          <p className="mt-1 text-sm text-neutral-600">Join VANINI in a few seconds.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input label="Name" name="name" autoComplete="name" register={register} error={errors.name} />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              register={register}
              error={errors.email}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              register={register}
              error={errors.password}
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              register={register}
              error={errors.confirmPassword}
            />

            <Button type="submit" className="w-full bg-black" size="lg" isLoading={isSubmitting}>
              Register
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
