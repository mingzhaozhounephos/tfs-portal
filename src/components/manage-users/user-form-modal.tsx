import { useState, useEffect } from "react";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const roles = [
  { label: "Driver", value: "driver" },
  { label: "Administrator", value: "admin" },
];

export function UserFormModal({ open, onClose, onSuccess }: UserFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0].value);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setRole(roles[0].value);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch("/api/invite-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        role,
      }),
    });

    setIsLoading(false);

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to invite user.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-1">Add New User</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add a new user to the driver training system.
        </p>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              type="email"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-black text-white"
              disabled={isLoading}
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}