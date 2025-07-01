import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const guidanceItems = [
  {
    value: 'item-1',
    title: 'Project Structure',
    content:
      'A well-organized project structure is key. Group files by feature or route in the `app` directory. Keep reusable components in a dedicated `components` directory. Utility functions and hooks should reside in `lib` and `hooks` respectively. This modularity makes your codebase easier to navigate and maintain.',
  },
  {
    value: 'item-2',
    title: 'Performance Optimization',
    content:
      'Leverage Next.js features for optimal performance. Use Server Components by default to reduce client-side JavaScript. Utilize `next/image` for automatic image optimization. Implement code splitting with dynamic imports (`next/dynamic`) for components that are not needed on initial page load.',
  },
  {
    value: 'item-3',
    title: 'Data Fetching',
    content:
      'Choose the right data fetching strategy. For static content, use `generateStaticParams` for SSG. For dynamic content, fetch data directly in Server Components. For client-side data fetching, use libraries like SWR or React Query, or a simple `useEffect` for basic cases.',
  },
  {
    value: 'item-4',
    title: 'State Management',
    content:
      'For simple state, React\'s built-in `useState` and `useReducer` are often sufficient. For state that needs to be shared across many components, consider `useContext`. For more complex, global state, libraries like Zustand or Redux Toolkit offer powerful solutions with minimal boilerplate.',
  },
  {
    value: 'item-5',
    title: 'Styling',
    content:
      'Tailwind CSS is a great choice for utility-first styling. For component-based styling, CSS Modules provide local scope by default. Combining these with a theming solution like CSS variables (as used in this app) offers a flexible and maintainable styling architecture.',
  },
];

export default function GuidancePage() {
  return (
    <main className="flex-1 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Next.js Best Practices</CardTitle>
          <CardDescription>
            A curated list of tips and best practices for building robust Next.js applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {guidanceItems.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger className="text-lg font-semibold">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </main>
  );
}
