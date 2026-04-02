"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email(),
});

export default function UiTestPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 400));
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-primary">UI Test</h1>
      <p className="mt-2 text-sm text-neutral-800">Button + Input preview.</p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          register={register}
          error={errors.email}
        />

        <div className="flex gap-3">
          <Button type="submit" isLoading={isSubmitting}>
            Submit
          </Button>
          <Button variant="outline" type="button">
            Outline
          </Button>
          <Button variant="ghost" type="button">
            Ghost
          </Button>
        </div>
      </form>
    </div>
  );
}

