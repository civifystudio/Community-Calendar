import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">Calendars</span>
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/organizations"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Organizations Sites
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
