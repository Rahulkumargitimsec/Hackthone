import React, { useState } from "react";

export default function ReportModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (t: string, d: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Please enter a title");
    onSubmit(title, desc);
    setTitle("");
    setDesc("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-lg p-6 border border-[hsl(var(--border))]">
        <h3 className="text-lg font-semibold text-primary">Report incident</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-2 border rounded-md bg-transparent"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            className="w-full px-3 py-2 border rounded-md bg-transparent"
          />
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
