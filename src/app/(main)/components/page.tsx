import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const components = [
  {
    name: 'Button',
    description: 'Displays a button or a link.',
    preview: (
      <div className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    ),
    code: `import { Button } from "@/components/ui/button"

<Button>Click me</Button>`,
  },
  {
    name: 'Card',
    description: 'Displays a card with header, content, and footer.',
    preview: (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card content goes here.</p>
        </CardContent>
      </Card>
    ),
    code: `import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  <CardContent><p>Content</p></CardContent>
</Card>`,
  },
  {
    name: 'Input',
    description: 'Displays a form input field.',
    preview: <Input placeholder="Enter your email" />,
    code: `import { Input } from "@/components/ui/input"

<Input type="email" placeholder="Email" />`,
  },
  {
    name: 'Checkbox',
    description: 'A control that allows the user to select one or more options.',
    preview: (
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <label htmlFor="terms">Accept terms and conditions</label>
      </div>
    ),
    code: `import { Checkbox } from "@/components/ui/checkbox"

<Checkbox id="terms" />`,
  },
  {
    name: 'Alert',
    description: 'Displays a callout for user attention.',
    preview: (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the CLI.
        </AlertDescription>
      </Alert>
    ),
    code: `import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can use this alert.</AlertDescription>
</Alert>`,
  },
];

export default function ComponentsPage() {
  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Component Library</h1>
        <p className="text-muted-foreground">
          A collection of pre-built, customizable components for your Next.js projects.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {components.map((component) => (
          <Card key={component.name}>
            <CardHeader>
              <CardTitle className="font-headline">{component.name}</CardTitle>
              <CardDescription>{component.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-md border p-6 bg-muted/20">
                {component.preview}
              </div>
              <pre className="mt-2 w-full overflow-x-auto rounded-md bg-secondary p-4">
                <code className="text-secondary-foreground font-code text-sm">
                  {component.code}
                </code>
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
