import Link from 'next/link';
import {
  BookOpenCheck,
  CodeXml,
  Layers3,
  Library,
  Plug,
  Settings2,
  ArrowRight
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Layers3,
    title: 'Project Scaffolding',
    description: 'Quickly scaffold new Next.js projects with a simple interface.',
    href: '/scaffolding',
  },
  {
    icon: Library,
    title: 'Component Library',
    description: 'Browse pre-built, customizable components and templates.',
    href: '/components',
  },
  {
    icon: CodeXml,
    title: 'AI Code Generation',
    description: 'Generate boilerplate for API routes and data fetching.',
    href: '/code-generation',
  },
  {
    icon: BookOpenCheck,
    title: 'Best Practices',
    description: 'Guidance on project structure and performance optimization.',
    href: '/guidance',
  },
  {
    icon: Plug,
    title: 'Modular Plugins',
    description: 'Keep your base install minimal and add functionality as needed.',
    href: '/plugins',
  },
  {
    icon: Settings2,
    title: 'Configuration Sharing',
    description: 'Save and share your custom project configurations.',
    href: '/configurations',
  },
];

export default function DashboardPage() {
  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome to NextBase</h1>
        <p className="text-muted-foreground">Your all-in-one toolkit for Next.js development.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-4">
                <feature.icon className="size-8 text-primary" />
                <CardTitle className="font-headline">{feature.title}</CardTitle>
              </div>
              <CardDescription className="pt-2">{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href={feature.href}>
                  Explore Feature
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
