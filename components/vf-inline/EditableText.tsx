"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

export function EditableText(props: {
  active: boolean;
  value: string;
  onCommit: (v: string) => void;
  className?: string;
  tag?: "span" | "p" | "h1" | "h2" | "h3";
  multiline?: boolean;
}) {
  const { active, value, onCommit, className, tag: Tag = "span", multiline } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    if (editing) return;
    queueMicrotask(() => setDraft(value));
  }, [value, editing]);

  useLayoutEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  function commit() {
    const next = draft.trim();
    onCommit(next);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  function onKeyDown(e: ReactKeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    } else if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit();
    }
  }

  if (!active) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (editing) {
    const common =
      "w-full min-w-0 rounded-lg border-2 border-[var(--brand)] bg-[var(--surface)] px-2 py-1 text-[var(--text)] outline-none ring-0";
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={4}
          className={`${common} ${className ?? ""}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit()}
          onKeyDown={onKeyDown}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        className={`${common} ${className ?? ""}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit()}
        onKeyDown={onKeyDown}
      />
    );
  }

  return (
    <Tag
      className={[className, "cursor-text rounded-sm ring-[var(--brand)]/30 hover:ring-2"].filter(Boolean).join(" ")}
      onDoubleClick={(e) => {
        e.preventDefault();
        setEditing(true);
      }}
      title="Düzenlemek için çift tıklayın"
    >
      {value}
    </Tag>
  );
}
