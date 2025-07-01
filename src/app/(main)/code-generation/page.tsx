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
            This feature is currently disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p>AI code generation has been turned off for this project.</p>
        </CardContent>
      </Card>
    </main>
  );
}
