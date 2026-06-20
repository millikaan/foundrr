/**
 * RegisterServerForm — a small inline disclosure to register a server launch
 * recipe ({ name, cwd, command }). Validates that all three fields are
 * non-empty; on a submit attempt, empty fields get an inline "required" hint and
 * a red border (aria-invalid). Errors are surfaced inline; nothing is swallowed.
 */
import { useState } from "react";
import type { RegisteredServer } from "@mission-control/shared";
import { registerServer, ApiError } from "../lib/api";

interface RegisterServerFormProps {
  /** Called after a successful registration so the panel can refetch. */
  onRegistered: (server: RegisteredServer) => void;
}

interface FormFields {
  name: string;
  cwd: string;
  command: string;
}

const EMPTY: FormFields = { name: "", cwd: "", command: "" };

function fieldErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return `Register failed (${err.status})`;
  if (err instanceof Error) return err.message;
  return "Register failed";
}

interface TextFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  mono?: boolean;
  /** Mark the field invalid (empty after a submit attempt). */
  invalid?: boolean;
  onChange: (value: string) => void;
}

function TextField({ id, label, placeholder, value, mono, invalid, onChange }: TextFieldProps) {
  const hintId = `${id}-hint`;
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="caption">{label}</span>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? hintId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${mono ? "mono " : ""}rounded-md px-2 py-1.5 text-xs outline-none transition-colors focus-visible:[outline:2px_solid_var(--color-cool)] focus-visible:[outline-offset:1px]`}
        style={{
          backgroundColor: "var(--color-inset)",
          color: "var(--color-text)",
          border: `1px solid ${invalid ? "var(--color-alert)" : "var(--color-line)"}`,
        }}
      />
      {invalid ? (
        <span id={hintId} className="mono text-[0.5625rem]" role="alert" style={{ color: "var(--color-alert)" }}>
          required
        </span>
      ) : null}
    </label>
  );
}

export function RegisterServerForm({ onRegistered }: RegisterServerFormProps) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<FormFields>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  // Becomes true on the first submit attempt — gates the inline "required" hints
  // so an untouched form isn't pre-painted red.
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: keyof FormFields, value: string): void => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const trimmed: FormFields = {
    name: fields.name.trim(),
    cwd: fields.cwd.trim(),
    command: fields.command.trim(),
  };
  const isValid = Boolean(trimmed.name && trimmed.cwd && trimmed.command);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setAttempted(true);
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const server = await registerServer(trimmed);
      onRegistered(server);
      setFields(EMPTY);
      setAttempted(false);
      setOpen(false);
    } catch (err: unknown) {
      setError(fieldErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const close = (): void => {
    setOpen(false);
    setError(null);
    setAttempted(false);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="pill pill-cool">
        + REGISTER SERVER
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="panel flex w-full flex-col gap-3 p-3" noValidate>
      <TextField
        id="reg-name"
        label="name"
        placeholder="web"
        value={fields.name}
        invalid={attempted && !trimmed.name}
        onChange={(v) => setField("name", v)}
      />
      <TextField
        id="reg-cwd"
        label="cwd"
        placeholder="/Users/you/project"
        value={fields.cwd}
        mono
        invalid={attempted && !trimmed.cwd}
        onChange={(v) => setField("cwd", v)}
      />
      <TextField
        id="reg-command"
        label="command"
        placeholder="npm run dev"
        value={fields.command}
        mono
        invalid={attempted && !trimmed.command}
        onChange={(v) => setField("command", v)}
      />

      {error ? (
        <p className="mono text-[0.625rem] leading-tight" role="alert" style={{ color: "var(--color-alert)" }}>
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={close} className="pill">
          CANCEL
        </button>
        {/* SAVE stays clickable so an attempt surfaces the per-field hints; the
            handler blocks an invalid submit. */}
        <button
          type="submit"
          disabled={submitting}
          title={!isValid ? "Fill in name, cwd, and command" : undefined}
          className="pill pill-primary"
        >
          {submitting ? "SAVING…" : "SAVE"}
        </button>
      </div>
    </form>
  );
}
