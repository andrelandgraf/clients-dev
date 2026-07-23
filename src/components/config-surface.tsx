import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { StatusPill } from "@/components/status-pill";
import { SCOPE_LABEL, SURFACE_ICON } from "@/lib/clients/display";
import { SURFACE_META, type SurfaceConfig, type SurfaceId } from "@/lib/clients/schema";

function ChipRow({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {values.map((value) => (
        <Badge key={value} variant="secondary" className="font-mono text-xs">
          {value}
        </Badge>
      ))}
    </div>
  );
}

export function ConfigSurface({
  surface,
  config,
  anchorId,
}: {
  surface: SurfaceId;
  config: SurfaceConfig;
  anchorId?: string;
}) {
  const Icon = SURFACE_ICON[surface];
  const meta = SURFACE_META[surface];

  return (
    <section
      id={anchorId ?? surface}
      className="scroll-mt-24 rounded-xl border border-border/60 bg-card/40 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-base font-semibold tracking-tight">
                {meta.label}
              </h3>
              <StatusPill status={config.status} />
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {config.summary ?? meta.blurb}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {config.verified ? (
            <span
              className="text-xs text-muted-foreground"
              title="Date this surface was last verified against official docs"
            >
              Verified {config.verified}
            </span>
          ) : null}
          {config.docs ? (
            <a
              href={config.docs}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Docs
              <ArrowUpRight className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>

      {(config.transports.length > 0 ||
        config.auth.length > 0 ||
        config.invocation.length > 0 ||
        config.events.length > 0) && (
        <div className="mt-4 flex flex-col gap-2">
          <ChipRow label="Transports" values={config.transports} />
          <ChipRow label="Auth" values={config.auth} />
          <ChipRow label="Invoke" values={config.invocation} />
          <ChipRow label="Events" values={config.events} />
        </div>
      )}

      {config.files.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Config files
          </h4>
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead className="w-24">Scope</TableHead>
                  <TableHead className="w-24">Format</TableHead>
                  <TableHead className="w-32">Key</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.files.map((file) => (
                  <TableRow key={`${file.path}-${file.scope}`}>
                    <TableCell className="align-top">
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-xs break-all">
                          {file.path}
                        </code>
                        <CopyButton value={file.path} />
                      </div>
                      {file.note ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {file.note}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant="outline" className="text-xs">
                        {SCOPE_LABEL[file.scope] ?? file.scope}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top font-mono text-xs">
                      {file.format}
                    </TableCell>
                    <TableCell className="align-top font-mono text-xs">
                      {file.key ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {config.fields.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Fields
          </h4>
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Field</TableHead>
                  <TableHead className="w-56">Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.fields.map((field) => (
                  <TableRow key={field.name}>
                    <TableCell className="align-top">
                      <code className="font-mono text-xs">{field.name}</code>
                      {field.required ? (
                        <span className="ml-1.5 text-xs text-primary">*</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top font-mono text-xs text-muted-foreground break-all">
                      {field.type}
                    </TableCell>
                    <TableCell className="align-top text-sm text-muted-foreground">
                      {field.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {config.capabilities.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Capabilities
          </h4>
          <div className="flex flex-wrap gap-2">
            {config.capabilities.map((cap) => (
              <div
                key={cap.name}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5"
                title={cap.note ?? undefined}
              >
                <span className="text-sm font-medium">{cap.name}</span>
                <StatusPill status={cap.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {config.examples.length > 0 && (
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Examples
          </h4>
          {config.examples.map((example, index) => (
            <CodeBlock
              key={index}
              code={example.code}
              language={example.language}
              title={example.title}
            />
          ))}
        </div>
      )}

      {config.notes.length > 0 && (
        <ul className="mt-5 space-y-1.5 border-t border-border/60 pt-4">
          {config.notes.map((note, index) => (
            <li
              key={index}
              className="flex gap-2 text-sm text-muted-foreground"
            >
              <span className="text-primary">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
