export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-border/50 py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p className="font-mono">
          clients<span className="text-primary">.dev</span>
        </p>
        <p className="text-center sm:text-right">
          An open database of AI client configuration and behavior.
          Contributions welcome on{" "}
          <a
            href="https://github.com/agent-tooling/clients-dev"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
