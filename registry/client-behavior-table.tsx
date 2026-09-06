import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ClientBehaviorTable({
  rows,
  dataVersion,
}: {
  rows: {
    id: string;
    client: string;
    operation: string;
    tool: string;
    finding: string;
    status: string;
    source?: { title: string; url: string };
  }[];
  dataVersion: string;
}) {
  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client / tool</TableHead>
            <TableHead>Finding</TableHead>
            <TableHead>Evidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="align-top">
                <p className="font-medium">{row.client}</p>
                <p className="text-xs text-muted-foreground">
                  {row.operation} · {row.tool}
                </p>
              </TableCell>
              <TableCell className="whitespace-normal align-top">
                {row.finding}
              </TableCell>
              <TableCell className="whitespace-normal align-top">
                <p>{row.status}</p>
                {row.source && (
                  <a className="text-primary underline" href={row.source.url}>
                    {row.source.title}
                  </a>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!rows.length && (
        <p className="text-sm text-muted-foreground">
          No researched profiles for this selection.
        </p>
      )}
      <p className="break-all font-mono text-xs text-muted-foreground">
        Data: {dataVersion}
      </p>
    </div>
  );
}
