import { ImageResponse } from "next/og";
import { getClients } from "@/lib/clients/catalog";
import { isComplete } from "@/lib/clients/facts";

export const alt = "clients.dev — how AI coding clients are configured";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: 48, fontWeight: 700 }}>
        {value}
      </div>
      <div style={{ display: "flex", color: "#a1a1aa" }}>{label}</div>
    </div>
  );
}

export default function OpengraphImage() {
  const clients = getClients();
  const completeCount = clients.filter(isComplete).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>
            clients.dev
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              marginTop: 28,
              color: "#a1a1aa",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            How AI coding agents are configured — the exact file paths and
            typed fields every client reads.
          </div>
        </div>
        <div style={{ display: "flex", gap: 56, fontSize: 28 }}>
          <Stat
            value={String(completeCount)}
            label="clients fully documented"
          />
          <Stat
            value="6"
            label="surfaces: mcp · skills · rules · hooks · commands · settings"
          />
          <Stat value={String(clients.length)} label="clients tracked" />
        </div>
      </div>
    ),
    { ...size },
  );
}
