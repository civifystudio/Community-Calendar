import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const plugins = [
  {
    name: 'Authentication (Auth.js)',
    description: 'Add robust authentication to your Next.js app with support for various providers.',
  },
  {
    name: 'Database ORM (Prisma)',
    description: 'Integrate a next-generation ORM for TypeScript and Node.js.',
  },
  {
    name: 'UI Storybook',
    description: 'Develop and test UI components in an isolated environment.',
  },
  {
    name: 'State Management (Zustand)',
    description: 'A small, fast and scalable bearbones state-management solution.',
  },
  {
    name: 'E-commerce (Medusa)',
    description: 'An open-source headless commerce engine that enables developers to build custom e-commerce solutions.',
  },
  {
    name: 'Content Management (Sanity)',
    description: 'A structured content platform that can be customized to fit any project.',
  },
];

export default function PluginsPage() {
  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Modular Plugins</h1>
        <p className="text-muted-foreground">
          Extend the functionality of your NextBase project with these modular plugins.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plugins.map((plugin) => (
          <Card key={plugin.name} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline">{plugin.name}</CardTitle>
              <CardDescription>{plugin.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button className="w-full">
                <Download className="mr-2" />
                Install Plugin
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
