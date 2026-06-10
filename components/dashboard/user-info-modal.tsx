"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id?: string;
    name?: string | null;
    phone?: string | null;
  };
}

export default function UserInfoModal({ isOpen, onClose, user }: UserInfoModalProps) {
  const details = [
    { label: "Name", value: user.name || "Not available" },
    { label: "Phone", value: user.phone || "Not available" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-neutral-800 bg-neutral-950 text-slate-100">
        <DialogHeader>
          <DialogTitle>User Information</DialogTitle>
          <DialogDescription>
            Account details for the signed-in user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {detail.label}
              </p>
              <p className="mt-1 break-words text-sm font-medium text-slate-100">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
