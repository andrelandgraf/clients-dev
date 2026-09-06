import { getCatalog } from "@/lib/clients/catalog";
export const metadata = { title: "Evidence & methodology" };
export default function MethodologyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-7 sm:px-6">
      <h1 className="text-3xl font-bold">Evidence & methodology</h1>
      <p>
        We document a client variant performing an operation through a specific
        tool. A search backend, page fetcher and browser may have different
        behavior. A provider identity does not necessarily identify the client
        using it.
      </p>
      <h2 className="text-xl font-semibold">What the labels mean</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Documented:</strong> an official document or source
          establishes the claim.
        </li>
        <li>
          <strong>Observed:</strong> a real run establishes behavior under the
          recorded conditions, with a sanitized trace and reproduction steps.
        </li>
        <li>
          <strong>Unknown:</strong> not established by the reviewed evidence. It
          does not mean unsupported.
        </li>
        <li>
          <strong>Unsupported:</strong> evidence establishes lack of support.
        </li>
        <li>
          <strong>Disputed:</strong> sources disagree; consult the evidence and
          conditions.
        </li>
        <li>
          <strong>Needs review:</strong> verification is more than 90 days old.
          Age alone does not prove a claim wrong.
        </li>
      </ul>
      <h2 className="text-xl font-semibold">What a request can tell you</h2>
      <p>
        Accept expresses response preferences. HTML converted to Markdown after
        retrieval does not prove Markdown was requested. Cached search may never
        contact the destination website. User-Agent and custom headers are
        self-reported and can be overridden; they are not authentication. MCP
        identity belongs to the relevant protocol exchange and is not ordinarily
        visible to website requests.
      </p>
      <h2 className="text-xl font-semibold">Reproducing behavior</h2>
      <p>
        Record client and tool versions, mode, permissions, and local or cloud
        environment. Exercise search, explicit fetch, and browsing separately.
        Use controlled HTML, Markdown, JSON, redirect and JavaScript pages.
        Repeat observations, preserve divergent conditions, and retain only
        allowlisted metadata. Do not collect cookies, credentials, IP addresses
        or private query text.
      </p>
      <h2 className="text-xl font-semibold">Coverage and updates</h2>
      <p>
        Configuration coverage indicates how many of the six config surfaces
        have records. It does not imply complete behavior research. New claims
        require evidence; older configuration entries may have less precise
        sourcing. Weekly checks flag inaccessible sources. Source changes still
        need editorial review.
      </p>
      <p>
        Schema version: {getCatalog().schemaVersion}. Data versions are content
        hashes; unchanged builds keep the same version and timestamp. Code is
        MIT; catalog data is CC0.
      </p>
      <p>
        <a
          className="text-primary underline"
          href="https://github.com/agent-tooling/clients-dev/blob/main/CONTRIBUTING.md"
        >
          Contribute evidence or a correction
        </a>
      </p>
    </article>
  );
}
