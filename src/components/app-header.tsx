import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-center">
        <nav className="flex items-center gap-6 md:gap-10">
            <Link
              href="/"
              className="flex items-center text-sm font-bold transition-colors hover:text-foreground"
            >
              Calendars
            </Link>
            <Link
              href="/organizations"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Organizations Sites
            </Link>
        </nav>
      </div>
    </header>
  );
}
