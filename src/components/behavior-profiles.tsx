import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CLAIM_LABELS,
  claimText,
  isStale,
  type Behavior,
  type Evidence,
} from "../../packages/clients/src/behavior";

export function BehaviorProfiles({
  profiles,
  evidence,
}: {
  profiles: Behavior[];
  evidence: Evidence[];
}) {
  if (!profiles.length)
    return (
      <p className="rounded-lg border border-dashed p-6 text-muted-foreground">
        Behavior has not been researched for this client. Unknown does not mean
        unsupported.
      </p>
    );
  return (
    <div className="space-y-6">
      {profiles.map((profile) => (
        <Card key={profile.id} id={profile.id}>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{profile.variant}</CardTitle>
              <Badge variant="secondary">{profile.operation}</Badge>
              <Badge variant="outline">{profile.availability}</Badge>
            </div>
            <CardDescription>Tool: {profile.tool}</CardDescription>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {profile.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Behavior</TableHead>
                  <TableHead>Finding</TableHead>
                  <TableHead>Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.claims.map((claim) => (
                  <TableRow key={claim.key}>
                    <TableCell className="align-top font-medium">
                      {CLAIM_LABELS[claim.key]}
                    </TableCell>
                    <TableCell className="min-w-48 whitespace-normal align-top">
                      <p>{claimText(claim)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {claim.note}
                      </p>
                    </TableCell>
                    <TableCell className="min-w-40 whitespace-normal align-top">
                      <Badge variant="outline">{claim.status}</Badge>
                      {isStale(claim.verified) && (
                        <Badge variant="secondary">Needs review</Badge>
                      )}
                      {claim.verified && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Checked {claim.verified}
                        </p>
                      )}
                      {claim.evidence.map((id) => {
                        const source = evidence.find((e) => e.id === id);
                        return source ? (
                          <a
                            key={id}
                            href={source.url}
                            className="mt-1 block text-xs text-primary underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {source.title}
                          </a>
                        ) : null;
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {profile.identification.map((rule) => (
              <p key={rule.id} className="mt-4 text-sm text-muted-foreground">
                <strong className="text-foreground">Identification:</strong>{" "}
                {rule.key}: <code>{rule.pattern}</code>. {rule.ambiguity}
              </p>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
