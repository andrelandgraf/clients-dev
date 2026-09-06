"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";

export function ClientPicker({
  clients,
  value,
  onChange,
}: {
  clients: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const listId = useId();
  return (
    <label className="block space-y-2 text-sm font-medium">
      <span>Client</span>
      <Input
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Choose or search a client"
      />
      <datalist id={listId}>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </datalist>
    </label>
  );
}
