import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import api from "../api/axios";
import useAuthStore from "../store/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", values);
      if (data?.user?.role !== "admin") {
        toast.error("Not authorized as admin");
        return;
      }
      setUser(data.user);
      setAccessToken(data.accessToken);
      toast.success("Welcome back");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-primary">VANINI Admin</h1>
        <p className="mt-1 text-sm text-neutral-600">Sign in to continue</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" name="email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <Button type="submit" className="w-full" size="lg" isLoading={submitting}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
