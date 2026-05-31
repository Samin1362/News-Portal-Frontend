"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellRing,
  KeyRound,
  LogOut,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { Pill } from "@/components/ui/Pill";
import { Card, CardHead, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/lib/ui/toast";
import { authErrorMessage } from "@/lib/auth/errors";
import {
  useStoredNavExpanded,
  writeStoredNavExpanded,
} from "@/hooks/useStoredNavExpanded";
import {
  clearNotificationState,
  markAllRead,
  useNotificationPrefs,
} from "@/lib/notifications/store";
import { cn } from "@/lib/utils/cn";

const WRITER_ROLES = ["journalist", "editor", "admin"] as const;

export default function DashboardSettingsPage() {
  const { profile, role, sendPasswordReset, signOut } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const expanded = useStoredNavExpanded();
  const notifPrefs = useNotificationPrefs();

  const [sendingReset, setSendingReset] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isWriter =
    role !== null && (WRITER_ROLES as readonly string[]).includes(role);
  const email = profile?.email ?? "";

  async function handlePasswordReset() {
    if (!email || sendingReset) return;
    setSendingReset(true);
    try {
      await sendPasswordReset(email);
      toast.success(`Password reset link sent to ${email}.`);
    } catch (err) {
      toast.error(authErrorMessage(err));
    } finally {
      setSendingReset(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      toast.info("Signed out.");
      router.replace("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign out.");
      setSigningOut(false);
    }
  }

  return (
    <>
      {/* Header — same shape as the Overview greeting block. */}
      <section className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="font-hand text-[12px] uppercase tracking-wider text-muted">
            Account · Preferences
          </p>
          <h1 className="serif text-[34px] sm:text-[40px] font-extrabold tracking-tight leading-none mt-1">
            <span className="uline">Settings</span>
          </h1>
          <p className="mt-2 font-hand text-[12px] text-muted">
            Manage your account, sign-in, and how the dashboard behaves.
          </p>
        </div>
        {role ? (
          <Pill variant="default" className="capitalize">
            Role: {role}
          </Pill>
        ) : null}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Account */}
        <Card>
          <CardHead>
            <CardTitle>Account</CardTitle>
          </CardHead>

          <Row
            icon={<UserRound size={15} aria-hidden />}
            label="Display name"
            value={profile?.displayName ?? "—"}
          />
          <Row
            icon={<Mail size={15} aria-hidden />}
            label="Email"
            value={email || "—"}
          />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link href="/dashboard/profile" className="inline-flex">
              <Btn variant="default" size="sm">
                <UserRound size={13} aria-hidden /> Edit profile
              </Btn>
            </Link>
            <Btn
              variant="default"
              size="sm"
              onClick={handlePasswordReset}
              disabled={sendingReset || !email}
            >
              <KeyRound size={13} aria-hidden />
              {sendingReset ? "Sending…" : "Change password"}
            </Btn>
          </div>
          <p className="font-hand text-[11px] text-muted">
            Name, bio, and photo live on your{" "}
            <Link href="/dashboard/profile" className="text-accent hover:underline">
              profile
            </Link>
            . Changing your password sends a secure reset link to your email.
          </p>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHead>
            <CardTitle>Preferences</CardTitle>
          </CardHead>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-sans text-[13px] font-semibold text-ink">
                Sidebar default
              </p>
              <p className="font-hand text-[11px] text-muted mt-0.5">
                Open the desktop sidebar expanded or collapsed to a rail.
              </p>
            </div>
            <button
              type="button"
              onClick={() => writeStoredNavExpanded(!expanded)}
              aria-pressed={expanded}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border-[1.5px] border-ink",
                "font-hand text-[11px] uppercase tracking-wider transition-colors",
                "hover:bg-paper-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              )}
            >
              {expanded ? (
                <PanelLeftClose size={13} aria-hidden />
              ) : (
                <PanelLeftOpen size={13} aria-hidden />
              )}
              {expanded ? "Expanded" : "Collapsed"}
            </button>
          </div>

          {isWriter ? (
            <div className="flex items-start justify-between gap-3 border-t-[1.5px] border-ink/10 pt-3">
              <div className="min-w-0">
                <p className="font-sans text-[13px] font-semibold text-ink">
                  Notifications
                </p>
                <p className="font-hand text-[11px] text-muted mt-0.5">
                  {notifPrefs.lastReadAt
                    ? "Read history is being tracked."
                    : "Nothing marked read yet."}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    markAllRead();
                    toast.info("All notifications marked read.");
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md border-[1.5px] border-ink font-hand text-[11px] uppercase tracking-wider hover:bg-paper-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <BellRing size={13} aria-hidden /> Mark all read
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearNotificationState();
                    toast.info("Notification history reset.");
                  }}
                  className="font-hand text-[11px] text-accent hover:underline"
                >
                  Reset notification history
                </button>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Session — spans full width on lg. */}
        <Card className="lg:col-span-2">
          <CardHead>
            <CardTitle>Session</CardTitle>
          </CardHead>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-sans text-[13px] text-ink/85">
              Sign out of Deligo News on this device.
            </p>
            <Btn
              variant="default"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-accent border-accent hover:bg-accent/10"
            >
              <LogOut size={13} aria-hidden />
              {signingOut ? "Signing out…" : "Sign out"}
            </Btn>
          </div>
        </Card>
      </div>
    </>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 border-[1.5px] border-ink/15 rounded-sm bg-paper-2 px-3 py-2">
      <span className="text-accent shrink-0">{icon}</span>
      <span className="font-hand text-[11px] uppercase tracking-wider text-muted w-[96px] shrink-0">
        {label}
      </span>
      <span className="font-sans text-[13px] font-semibold text-ink truncate">
        {value}
      </span>
    </div>
  );
}
