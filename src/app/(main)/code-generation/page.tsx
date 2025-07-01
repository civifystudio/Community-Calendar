import ClientPage from './client-page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CodeGenerationPage() {
  return (
    <main className="flex-1 p-4 sm:p-6">
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">AI Code Generation</CardTitle>
          <CardDescription>
            Use AI to generate boilerplate code for your Next.js application.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <ClientPage />
        </CardContent>
      </Card>
    </main>
  );
}
