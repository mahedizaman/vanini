"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import PageWrapper from "@/components/layout/PageWrapper";
import RequireAuth from "@/components/auth/RequireAuth";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";
import api from "@/utils/axios";
import { cn } from "@/utils/helpers";

const nameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const addressFormSchema = z.object({
  fullName: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  street: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  district: z.string().min(1, "Required"),
  postalCode: z.string().min(1, "Required"),
  isDefault: z.boolean().optional(),
});

function ProfileInner() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => (await api.get("/users/me")).data,
  });

  const nameForm = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (!user?._id) return;
    nameForm.reset({ name: user.name || "" });
  }, [user?._id, user?.name, nameForm.reset]);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const addressForm = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      street: "",
      city: "",
      district: "",
      postalCode: "",
      isDefault: false,
    },
  });

  const updateName = useMutation({
    mutationFn: async (payload) => (await api.put("/users/update", payload)).data,
    onSuccess: (data) => {
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      toast.success("Name updated");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Update failed"),
  });

  const changePassword = useMutation({
    mutationFn: async (payload) =>
      (await api.put("/users/change-password", {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      })).data,
    onSuccess: (data) => {
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      passwordForm.reset();
      toast.success("Password changed");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not change password"),
  });

  const updateAddresses = useMutation({
    mutationFn: async (address) => (await api.put("/users/update", { address })).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      toast.success("Addresses saved");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Could not save addresses"),
  });

  const addresses = Array.isArray(user?.address) ? user.address : [];

  const onSaveName = nameForm.handleSubmit((values) => updateName.mutate({ name: values.name }));

  const onChangePassword = passwordForm.handleSubmit((values) =>
    changePassword.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  );

  const openAddModal = () => {
    addressForm.reset({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      district: "",
      postalCode: "",
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const onAddAddress = addressForm.handleSubmit((values) => {
    const { isDefault, ...rest } = values;
    let next = [...addresses, { ...rest, isDefault: false }];
    if (next.length === 1) {
      next[0].isDefault = true;
    } else if (isDefault) {
      next = next.map((a, i) => ({ ...a, isDefault: i === next.length - 1 }));
    }
    updateAddresses.mutate(next, {
      onSuccess: () => {
        setAddressModalOpen(false);
        addressForm.reset();
      },
    });
  });

  const setDefault = (index) => {
    const next = addresses.map((a, i) => ({ ...a, isDefault: i === index }));
    updateAddresses.mutate(next);
  };

  const removeAddress = (index) => {
    if (!window.confirm("Remove this address?")) return;
    let next = addresses.filter((_, i) => i !== index);
    if (next.length && !next.some((a) => a.isDefault)) {
      next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
    }
    updateAddresses.mutate(next);
  };

  if (isLoading || !user) {
    return (
      <p className="text-sm text-neutral-600" aria-live="polite">
        Loading profile…
      </p>
    );
  }

  return (
    <>
      <div className="mb-8 flex gap-2 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition",
            tab === "profile"
              ? "rounded-md bg-black text-white ring-2 ring-white"
              : "rounded-md bg-black text-white/80 hover:bg-neutral-900 hover:text-white"
          )}
        >
          Profile Info
        </button>
        <button
          type="button"
          onClick={() => setTab("addresses")}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition",
            tab === "addresses"
              ? "rounded-md bg-black text-white ring-2 ring-white"
              : "rounded-md bg-black text-white/80 hover:bg-neutral-900 hover:text-white"
          )}
        >
          My Addresses
        </button>
      </div>

      {tab === "profile" ? (
        <div className="space-y-10">
          <section className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-primary">Account</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Email:{" "}
              <span className="font-medium text-neutral-800" title={user.email}>
                {user.email}
              </span>{" "}
              <span className="text-xs text-neutral-500">(read-only)</span>
            </p>

            <form className="mt-6 max-w-md space-y-4" onSubmit={onSaveName}>
              <Input label="Name" name="name" register={nameForm.register} error={nameForm.formState.errors.name} />
              <Button type="submit" isLoading={updateName.isPending}>
                Save name
              </Button>
            </form>
          </section>

          <section className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-primary">Change password</h2>
            <form className="mt-6 max-w-md space-y-4" onSubmit={onChangePassword}>
              <Input
                label="Current password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                register={passwordForm.register}
                error={passwordForm.formState.errors.currentPassword}
              />
              <Input
                label="New password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                register={passwordForm.register}
                error={passwordForm.formState.errors.newPassword}
              />
              <Input
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                register={passwordForm.register}
                error={passwordForm.formState.errors.confirmPassword}
              />
              <Button type="submit" className={"bg-black"} isLoading={changePassword.isPending}>
                Update password
              </Button>
            </form>
          </section>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-primary">Saved addresses</h2>
            <Button type="button" className={"bg-black"} onClick={openAddModal}>
              Add Address
            </Button>
          </div>

          <ul className="mt-6 grid gap-4">
            {addresses.length === 0 ? (
              <li className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-10 text-center text-sm text-neutral-600">
                No addresses yet. Add one to use at checkout.
              </li>
            ) : (
              addresses.map((addr, i) => (
                <li key={i} className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-primary">{addr.fullName}</span>
                        {addr.isDefault ? (
                          <span className="inline-flex rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-neutral-700">{addr.phone}</p>
                      <p className="mt-1 text-sm text-neutral-700">
                        {[addr.street, addr.city, addr.district, addr.postalCode].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!addr.isDefault ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => setDefault(i)}>
                          Set as Default
                        </Button>
                      ) : null}
                      <Button type="button" variant="outline" size="sm" onClick={() => removeAddress(i)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <Modal isOpen={addressModalOpen} onClose={() => setAddressModalOpen(false)} title="Add address">
        <form className="space-y-4" onSubmit={onAddAddress}>
          <Input label="Full name" name="fullName" register={addressForm.register} error={addressForm.formState.errors.fullName} />
          <Input label="Phone" name="phone" type="tel" register={addressForm.register} error={addressForm.formState.errors.phone} />
          <Input label="Street" name="street" register={addressForm.register} error={addressForm.formState.errors.street} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City" name="city" register={addressForm.register} error={addressForm.formState.errors.city} />
            <Input label="District" name="district" register={addressForm.register} error={addressForm.formState.errors.district} />
          </div>
          <Input label="Postal code" name="postalCode" register={addressForm.register} error={addressForm.formState.errors.postalCode} />
          {addresses.length > 0 ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800">
              <input type="checkbox" {...addressForm.register("isDefault")} className="rounded border-neutral-300" />
              Set as default address
            </label>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" className={"bg-black"} variant="outline" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className={"bg-black"} isLoading={updateAddresses.isPending}>
              Save address
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <PageWrapper>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="font-display text-3xl font-semibold text-primary">Profile</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage your account and delivery addresses.</p>
          <div className="mt-8">
            <ProfileInner />
          </div>
        </div>
      </PageWrapper>
    </RequireAuth>
  );
}
