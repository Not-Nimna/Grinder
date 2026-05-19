"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/app-shell";
import { getSupabaseClient } from "@/lib/supabase";

const unsavedChangesMessage = "You have unsaved application changes. Save before leaving this page?";

type ApplicationStatus = "applied" | "rejected" | "interview";

type Application = {
  id: string;
  user_id: string;
  company: string;
  role: string | null;
  status: ApplicationStatus;
  proof_url: string | null;
  applied_at: string;
};

const filters: { label: string; value: ApplicationStatus }[] = [
  { label: "Applied", value: "applied" },
  { label: "Rejected", value: "rejected" },
  { label: "Interview", value: "interview" },
];

function createBlankApplication(userId: string): Application {
  return {
    id: "new",
    user_id: userId,
    company: "",
    role: "",
    status: "applied",
    proof_url: null,
    applied_at: new Date().toISOString(),
  };
}

function getDisplayName(user: User) {
  const metadata = user.user_metadata;
  const fromMetadata = metadata?.custom_display_name || metadata?.display_name || metadata?.full_name || metadata?.name;
  return String(fromMetadata || user.email?.split("@")[0] || "Member").trim() || "Member";
}

export default function ApplicationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("applied");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then((response: { data: { user: User | null } }) => {
      setUser(response.data.user);
    });
  }, []);

  const loadApplications = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("applications")
      .select("id,user_id,company,role,status,proof_url,applied_at")
      .eq("user_id", user.id)
      .eq("status", statusFilter)
      .order("applied_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setApplications([]);
      setIsLoading(false);
      return;
    }

    const rows = (data || []) as Application[];
    setApplications(rows);
    setSelectedApplication((current) => {
      if (current?.id === "new") {
        return current;
      }

      return rows.find((row) => row.id === current?.id) || rows[0] || createBlankApplication(user.id);
    });
    setIsLoading(false);
  }, [statusFilter, user]);

  useEffect(() => {
    void Promise.resolve().then(loadApplications);
  }, [loadApplications]);

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return applications;
    }

    return applications.filter((application) => {
      return (
        application.company.toLowerCase().includes(query) ||
        (application.role || "").toLowerCase().includes(query) ||
        application.status.toLowerCase().includes(query)
      );
    });
  }, [applications, search]);
  const savedSelectedApplication = selectedApplication?.id === "new" ? null : applications.find((application) => application.id === selectedApplication?.id);
  const blankSelectedApplication = user ? createBlankApplication(user.id) : null;
  const hasUnsavedChanges = Boolean(
    selectedApplication &&
      (selectedApplication.id === "new"
        ? blankSelectedApplication &&
          (selectedApplication.company !== blankSelectedApplication.company ||
            selectedApplication.role !== blankSelectedApplication.role ||
            selectedApplication.status !== blankSelectedApplication.status ||
            selectedApplication.proof_url !== blankSelectedApplication.proof_url)
        : savedSelectedApplication &&
          (selectedApplication.company !== savedSelectedApplication.company ||
            selectedApplication.role !== savedSelectedApplication.role ||
            selectedApplication.status !== savedSelectedApplication.status ||
            selectedApplication.proof_url !== savedSelectedApplication.proof_url)),
  );

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

  function confirmDiscardChanges() {
    return !hasUnsavedChanges || window.confirm(unsavedChangesMessage);
  }

  async function ensureProfile() {
    if (!user) {
      throw new Error("Sign in before saving applications.");
    }

    const supabase = getSupabaseClient();
    const displayName = getDisplayName(user);
    const avatarUrl = user.user_metadata?.custom_avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || "";
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username: displayName,
      avatar_url: avatarUrl,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function uploadProof(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !selectedApplication) {
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
        setMessage("Sign in before uploading proof.");
        return;
      }

      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/application-proof", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Unable to upload proof.");
        return;
      }

      setSelectedApplication({ ...selectedApplication, proof_url: result.url });
      setMessage("Proof screenshot uploaded. Save the application to keep it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload proof.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function saveApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !selectedApplication) {
      return;
    }

    if (!selectedApplication.company.trim()) {
      setMessage("Add the company or job title before saving.");
      return;
    }

    if (!selectedApplication.proof_url) {
      setMessage("Upload an application screenshot before saving. This proof is required for leaderboard credit.");
      return;
    }

    if ((selectedApplication.status === "rejected" || selectedApplication.status === "interview") && !selectedApplication.proof_url) {
      setMessage("Save an applied proof screenshot before adding a rejected or interview status.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const supabase = getSupabaseClient();
      await ensureProfile();

      if (selectedApplication.id === "new") {
        const { data, error } = await supabase
          .from("applications")
          .insert({
            user_id: user.id,
            company: selectedApplication.company.trim(),
            role: selectedApplication.role?.trim() || null,
            status: selectedApplication.status,
            proof_url: selectedApplication.proof_url,
          })
          .select("id,user_id,company,role,status,proof_url,applied_at")
          .single();

        if (error) {
          setMessage(error.message);
          return;
        }

        setSelectedApplication(data as Application);
      } else {
        const { error } = await supabase
          .from("applications")
          .update({
            company: selectedApplication.company.trim(),
            role: selectedApplication.role?.trim() || null,
            status: selectedApplication.status,
            proof_url: selectedApplication.proof_url,
          })
          .eq("id", selectedApplication.id)
          .eq("user_id", user.id);

        if (error) {
          setMessage(error.message);
          return;
        }
      }

      setMessage("Application saved.");
      await loadApplications();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save application.");
    } finally {
      setIsSaving(false);
    }
  }

  function selectStatus(nextStatus: ApplicationStatus) {
    if (!selectedApplication) {
      return;
    }

    if ((nextStatus === "rejected" || nextStatus === "interview") && !selectedApplication.proof_url) {
      setMessage("Upload and save the applied screenshot before marking this as rejected or interview.");
      return;
    }

    setMessage("");
    setSelectedApplication({ ...selectedApplication, status: nextStatus });
  }

  function startNewApplication() {
    if (!user) {
      return;
    }

    if (!confirmDiscardChanges()) {
      return;
    }

    setMessage("");
    setSelectedApplication(createBlankApplication(user.id));
  }

  return (
    <AppShell title="Applications" centered>
      <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-faded-copper-800 bg-vanilla-cream-900 p-4 text-left shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">My applications</h2>
            <button className="rounded-md bg-muted-olive-300 px-3 py-2 text-sm font-semibold text-vanilla-cream-900 shadow-sm transition hover:bg-muted-olive-200" onClick={startNewApplication} type="button">
              Create new
            </button>
          </div>

          <input
            className="mt-4 h-10 w-full rounded-md border border-faded-copper-800 bg-vanilla-cream-800 px-3 text-sm text-ash-brown-100 outline-none placeholder:text-faded-copper-500 focus:border-muted-olive-300"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search applications"
            value={search}
          />

          <div className="mt-3 grid grid-cols-3 rounded-md border border-faded-copper-800 bg-vanilla-cream-800 p-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`rounded px-2 py-2 text-xs font-semibold transition ${
                  statusFilter === filter.value
                    ? "bg-muted-olive-300 text-vanilla-cream-900"
                    : "text-ash-brown hover:bg-vanilla-cream-900"
                }`}
                onClick={() => {
                  if (!confirmDiscardChanges()) {
                    return;
                  }

                  setStatusFilter(filter.value);
                }}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid max-h-[560px] gap-3 overflow-y-auto pr-1">
            {isLoading ? <p className="py-8 text-center text-sm text-ash-brown">Loading applications...</p> : null}
            {!isLoading && visibleApplications.length === 0 ? (
              <p className="py-8 text-center text-sm text-ash-brown">No applications found.</p>
            ) : null}
            {visibleApplications.map((application) => (
              <button
                key={application.id}
                className={`rounded-lg border p-4 text-left transition ${
                  selectedApplication?.id === application.id
                    ? "border-muted-olive-300 bg-tea-green-900"
                    : "border-faded-copper-800 bg-vanilla-cream-900 hover:border-muted-olive-300"
                }`}
                onClick={() => {
                  if (!confirmDiscardChanges()) {
                    return;
                  }

                  setMessage("");
                  setSelectedApplication(application);
                }}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{application.company}</h3>
                    <p className="mt-1 text-sm text-ash-brown">{application.role || "No role added"}</p>
                  </div>
                  <span className="rounded-full bg-vanilla-cream-800 px-2 py-1 text-xs font-semibold capitalize text-ash-brown">
                    {application.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-faded-copper-400">
                  {new Date(application.applied_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-h-[680px] rounded-lg border border-faded-copper-800 bg-vanilla-cream-900 p-6 text-left shadow-sm">
          {selectedApplication ? (
            <form className="flex h-full flex-col" onSubmit={saveApplication}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-olive-200">
                    {selectedApplication.id === "new" ? "New application" : "Application detail"}
                  </p>
                  <input
                    className="mt-2 w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-faded-copper-500"
                    onChange={(event) => setSelectedApplication({ ...selectedApplication, company: event.target.value })}
                    placeholder="Company or job title"
                    value={selectedApplication.company}
                  />
                  <input
                    className="mt-2 w-full bg-transparent text-base text-ash-brown outline-none placeholder:text-faded-copper-500"
                    onChange={(event) => setSelectedApplication({ ...selectedApplication, role: event.target.value })}
                    placeholder="Role, team, or notes"
                    value={selectedApplication.role || ""}
                  />
                </div>

                <div className="flex rounded-lg border border-faded-copper-800 bg-vanilla-cream-800 p-1">
                  {(["applied", "rejected", "interview"] as ApplicationStatus[]).map((option) => (
                    <button
                      key={option}
                      className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
                        selectedApplication.status === option
                          ? "bg-muted-olive-300 text-vanilla-cream-900"
                          : "text-ash-brown hover:bg-vanilla-cream-900"
                      }`}
                      onClick={() => selectStatus(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-4 rounded-lg border border-faded-copper-800 bg-vanilla-cream-800 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">Proof screenshot</h3>
                    <p className="mt-1 text-sm text-ash-brown">
                      Upload the applied screenshot first. Rejected and interview statuses need that proof saved before you can use them.
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer rounded-md bg-muted-olive-300 px-4 py-2 text-sm font-semibold text-vanilla-cream-900 shadow-sm transition hover:bg-muted-olive-200">
                    {isUploading ? "Uploading..." : "Upload proof"}
                    <input accept="image/*" className="sr-only" onChange={uploadProof} type="file" />
                  </label>
                </div>

                {selectedApplication.proof_url ? (
                  <a href={selectedApplication.proof_url} rel="noreferrer" target="_blank" className="block overflow-hidden rounded-lg border border-faded-copper-800 bg-vanilla-cream-900">
                    <Image
                      alt="Application proof screenshot"
                      className="max-h-[360px] w-full object-contain"
                      height={720}
                      src={selectedApplication.proof_url}
                      unoptimized
                      width={960}
                    />
                  </a>
                ) : (
                  <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-faded-copper-700 bg-vanilla-cream-900 px-6 text-center text-sm text-ash-brown">
                    No proof uploaded yet. Add your application screenshot to unlock rejected or interview tracking.
                  </div>
                )}
              </div>

              {message ? <p className="mt-5 text-sm font-medium text-muted-olive-200">{message}</p> : null}

              <div className="mt-auto flex justify-end pt-8">
                <button
                  className="h-11 rounded-md bg-muted-olive-300 px-5 text-sm font-semibold text-vanilla-cream-900 shadow-sm transition hover:bg-muted-olive-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving || isUploading}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save application"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <h2 className="text-2xl font-semibold">Select an application</h2>
                <p className="mt-2 text-sm text-ash-brown">Choose one from the left, or create a new application.</p>
              </div>
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}
