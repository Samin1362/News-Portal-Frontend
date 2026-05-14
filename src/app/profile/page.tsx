"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Btn } from "@/components/ui/Btn";
import { Input } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Pill } from "@/components/ui/Pill";
import { useRequireAuth } from "@/lib/auth/useRequireRole";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import { updateMe, type UpdateMeBody } from "@/lib/api/users.api";
import { authErrorMessage } from "@/lib/auth/errors";

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "At least 2 characters.")
    .max(60, "Max 60 characters."),
  bio: z.string().trim().max(500, "Max 500 characters.").optional(),
  photoURL: z
    .union([
      z.string().url("Must be a valid URL."),
      z.string().length(0),
    ])
    .optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const auth = useRequireAuth();
  const { profile, getIdToken, refreshProfile } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: profile?.displayName ?? "",
      bio: profile?.bio ?? "",
      photoURL: profile?.photoURL ?? "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        bio: profile.bio,
        photoURL: profile.photoURL ?? "",
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in.");
      const body: UpdateMeBody = {
        displayName: values.displayName,
        bio: values.bio ?? "",
        photoURL: values.photoURL ? values.photoURL : null,
      };
      return updateMe(body, token);
    },
    onSuccess: async () => {
      await refreshProfile();
      toast.success("Profile updated.");
    },
    onError: (err) => toast.error(authErrorMessage(err)),
  });

  if (auth.loading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-hand text-[12px] text-muted">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-baseline justify-between gap-4">
        <SectionTitle>My profile</SectionTitle>
        <Pill variant="solid">{profile.role}</Pill>
      </div>

      <div className="mt-4 border-[1.5px] border-ink rounded-sm bg-paper p-5">
        <div className="font-hand text-[11px] text-muted">Account</div>
        <div className="mt-1 font-sans text-[14px]">{profile.email}</div>
        <div className="mt-1 font-hand text-[11px] text-muted">
          Joined {new Date(profile.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      <form
        className="mt-5 border-[1.5px] border-ink rounded-sm bg-paper p-5 space-y-4"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        noValidate
      >
        <h3 className="serif text-[16px] font-bold tracking-tight">
          Edit details
        </h3>

        <label className="block">
          <span className="font-sans text-[12px] font-semibold text-ink">
            Display name
          </span>
          <Input
            type="text"
            errorText={errors.displayName?.message}
            {...register("displayName")}
          />
        </label>

        <label className="block">
          <span className="font-sans text-[12px] font-semibold text-ink">
            Bio
          </span>
          <textarea
            rows={4}
            placeholder="A short bio shown on your author page (optional)."
            className="mt-1 w-full border-[1.5px] border-ink rounded-sm bg-paper px-3 py-2 font-sans text-[14px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
            {...register("bio")}
          />
          {errors.bio?.message ? (
            <p className="mt-1 font-hand text-[11px] text-accent">
              {errors.bio.message}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="font-sans text-[12px] font-semibold text-ink">
            Avatar URL
          </span>
          <Input
            type="url"
            placeholder="https://…"
            errorText={errors.photoURL?.message}
            {...register("photoURL")}
          />
        </label>

        <div className="flex items-center gap-2 pt-2">
          <Btn
            type="submit"
            variant="primary"
            disabled={!isDirty || mutation.isPending}
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Btn>
          <Btn
            type="button"
            variant="ghost"
            onClick={() =>
              reset({
                displayName: profile.displayName,
                bio: profile.bio,
                photoURL: profile.photoURL ?? "",
              })
            }
          >
            Reset
          </Btn>
        </div>
      </form>
    </div>
  );
}
