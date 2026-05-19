"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { getSupabaseClient } from "@/lib/supabase";

const unsavedChangesMessage = "You have unsaved changes. Save before leaving this page?";

function getInitials(name?: string) {
  if (!name) {
    return "GH";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("Guest Member");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [savedProfile, setSavedProfile] = useState({
    avatarUrl: "",
    displayName: "Guest Member",
    email: "",
  });

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(async (response: { data: { user: User | null } }) => {
      const user = response.data.user;

      if (!user) {
        return;
      }

      const metadata = user.user_metadata;
      const fallbackName = metadata?.custom_display_name || metadata?.display_name || metadata?.full_name || metadata?.name || user.email || "Member";
      const fallbackAvatar = metadata?.custom_avatar_url || metadata?.avatar_url || metadata?.picture || "";
      const { data: publicProfile } = await supabase.from("profiles").select("username,avatar_url").eq("id", user.id).maybeSingle();
      const name = publicProfile?.username || fallbackName;
      const avatar = publicProfile?.avatar_url || fallbackAvatar;

      setCurrentUser(user);
      setIsSignedIn(true);
      setEmail(user.email || "");
      setDisplayName(name);
      setAvatarUrl(avatar);
      setSavedProfile({
        avatarUrl: avatar,
        displayName: name,
        email: user.email || "",
      });
    });
  }, []);

  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const hasUnsavedChanges =
    avatarUrl !== savedProfile.avatarUrl ||
    displayName !== savedProfile.displayName ||
    email !== savedProfile.email;

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    function handleDocumentClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor || anchor.target || anchor.href === window.location.href) {
        return;
      }

      if (!window.confirm(unsavedChangesMessage)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [hasUnsavedChanges]);

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      const supabase = getSupabaseClient();
      const nextDisplayName = displayName.trim() || "Member";
      const nextAvatarUrl = avatarUrl.trim();
      const { error } = await supabase.auth.updateUser({
        email,
        data: {
          avatar_url: nextAvatarUrl,
          custom_avatar_url: nextAvatarUrl,
          custom_display_name: nextDisplayName,
          display_name: nextDisplayName,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (currentUser) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: currentUser.id,
          username: nextDisplayName,
          avatar_url: nextAvatarUrl,
        });

        if (profileError) {
          setMessage(profileError.message);
          return;
        }
      }

      setDisplayName(nextDisplayName);
      setAvatarUrl(nextAvatarUrl);
      setMessage("Profile updated.");
      setSavedProfile({
        avatarUrl: nextAvatarUrl,
        displayName: nextDisplayName,
        email,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadProfilePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setIsUploading(true);

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Sign in before uploading a profile photo.");
        return;
      }

      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/profile-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Unable to upload profile photo.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: result.url,
          custom_avatar_url: result.url,
          custom_display_name: displayName.trim(),
          display_name: displayName.trim(),
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (currentUser) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: currentUser.id,
          username: displayName.trim() || "Member",
          avatar_url: result.url,
        });

        if (profileError) {
          setMessage(profileError.message);
          return;
        }
      }

      setAvatarUrl(result.url);
      setMessage("Profile photo updated.");
      setSavedProfile((current) => ({
        ...current,
        avatarUrl: result.url,
        displayName: displayName.trim(),
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload profile photo.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function logOut() {
    if (hasUnsavedChanges && !window.confirm(unsavedChangesMessage)) {
      return;
    }

    const supabase = getSupabaseClient();
    await supabase.auth.signOut({ scope: "global" });
    setIsSignedIn(false);
    setCurrentUser(null);
    setAvatarUrl("");
    setEmail("");
    setDisplayName("Guest Member");
    setSavedProfile({
      avatarUrl: "",
      displayName: "Guest Member",
      email: "",
    });
    router.replace("/login");
    router.refresh();
  }

  return (
    <AppShell title="Profile" eyebrow="Member account" centered>
      <section className="mx-auto max-w-xl rounded-lg border border-faded-copper-800 bg-vanilla-cream-900 p-6 text-left shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div
            className="grid size-24 place-items-center overflow-hidden rounded-full bg-tea-green-700 text-3xl font-semibold text-muted-olive-100"
            style={
              avatarUrl
                ? {
                    backgroundImage: `url(${avatarUrl})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }
                : undefined
            }
          >
            {avatarUrl ? <span className="sr-only">{displayName}</span> : initials}
          </div>
          <h2 className="mt-4 text-xl font-semibold">{displayName}</h2>
          <p className="mt-1 break-all text-sm text-ash-brown">
            {isSignedIn ? email : "Sign in to load your profile."}
          </p>
          {!isSignedIn ? (
            <Link className="mt-5 inline-flex rounded-md bg-muted-olive-300 px-4 py-2 text-sm font-semibold text-vanilla-cream-900" href="/login">
              Sign in
            </Link>
          ) : null}
        </div>

        <form className="mt-8 grid gap-5" onSubmit={updateProfile}>
          <label className="grid gap-2 text-sm font-medium">
            Profile photo
            <input
              accept="image/*"
              className="rounded-md border border-faded-copper-800 bg-vanilla-cream-800 px-3 py-2 font-normal text-ash-brown-100 file:mr-4 file:rounded-md file:border-0 file:bg-muted-olive-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-vanilla-cream-900 hover:file:bg-muted-olive-200"
              disabled={!isSignedIn}
              onChange={uploadProfilePhoto}
              type="file"
            />
            <span className="text-xs font-normal text-ash-brown">
              {isUploading ? "Uploading to Cloudinary..." : "Upload a JPG, PNG, or WebP under 3 MB."}
            </span>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Display name
            <input
              className="h-11 rounded-md border border-faded-copper-800 bg-vanilla-cream-800 px-3 font-normal text-ash-brown-100 outline-none focus:border-muted-olive-300"
              disabled={!isSignedIn}
              name="displayName"
              onChange={(event) => setDisplayName(event.target.value)}
              value={displayName}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Email
            <input
              className="h-11 rounded-md border border-faded-copper-800 bg-vanilla-cream-800 px-3 font-normal text-ash-brown-100 outline-none focus:border-muted-olive-300"
              disabled={!isSignedIn}
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>

          {message ? <p className="text-sm font-medium text-muted-olive-200">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              className="h-11 rounded-md bg-muted-olive-300 px-5 text-sm font-semibold text-vanilla-cream-900 shadow-sm transition hover:bg-muted-olive-200 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isSignedIn || isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save profile"}
            </button>
            <button
              className="h-11 rounded-md border border-faded-copper-800 bg-vanilla-cream-900 px-5 text-sm font-semibold text-ash-brown transition hover:border-muted-olive-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isSignedIn}
              onClick={logOut}
              type="button"
            >
              Log out
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
