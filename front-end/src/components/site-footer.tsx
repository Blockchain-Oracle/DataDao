import { Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          <a
            href="https://github.com/Blockchain-Oracle"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
       Blockchain Oracle:DaoData
          </a>
          . The source code is available on{" "}
          <a
            href="https://github.com/Blockchain-Oracle/DataDao"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
        <div className="flex items-center space-x-1">
          <a
            href="https://github.com/Blockchain-Oracle/DataDao"
            target="_blank"
            rel="noreferrer"
            className="rounded-full p-2 hover:bg-accent"
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
