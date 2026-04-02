"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Request failed");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <PageWrapper>
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <div className="rounded-xl border border-neutral-100 bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-primary">Forgot password</h1>
          <p className="mt-1 text-sm text-neutral-600">We&apos;ll email you a reset link.</p>

          {submitted ? (
            <p className="mt-8 rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
              Check your email for the reset link
            </p>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                register={register}
                error={errors.email}
              />

              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                Send reset link
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
