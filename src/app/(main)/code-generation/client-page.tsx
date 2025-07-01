'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Sparkles, Bot, Clipboard, Check } from 'lucide-react';
import { handleApiRouteGeneration, handleDataFetchingGeneration } from './actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Sparkles className="mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2" />
          {children}
        </>
      )}
    </Button>
  );
}

function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy}>
      {copied ? <Check className="text-green-500" /> : <Clipboard />}
      <span className="sr-only">Copy code</span>
    </Button>
  );
}


function CodeGeneratorForm({
  action,
  placeholder,
  buttonText,
}: {
  action: (state: any, payload: FormData) => Promise<{ code: string; error?: string }>;
  placeholder: string;
  buttonText: string;
}) {
  const [state, formAction] = useFormState(action, { code: '' });

  return (
    <form action={formAction} className="space-y-4">
      <Textarea
        name="prompt"
        placeholder={placeholder}
        rows={4}
        required
      />
      <SubmitButton>{buttonText}</SubmitButton>

      {state.error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      
      {state.code && (
        <div className="space-y-2 pt-4">
          <h3 className="font-semibold flex items-center gap-2"><Bot/> Generated Code</h3>
          <div className="relative rounded-md bg-secondary text-secondary-foreground">
            <div className="absolute top-2 right-2">
              <CopyButton textToCopy={state.code} />
            </div>
            <pre className="p-4 overflow-x-auto font-code text-sm">
              <code>{state.code}</code>
            </pre>
          </div>
        </div>
      )}
    </form>
  );
}

export default function ClientPage() {
  return (
    <Tabs defaultValue="api-route">
      <TabsList>
        <TabsTrigger value="api-route">API Route</TabsTrigger>
        <TabsTrigger value="data-fetching">Data Fetching</TabsTrigger>
      </TabsList>
      <TabsContent value="api-route">
        <CodeGeneratorForm
          action={handleApiRouteGeneration}
          placeholder="e.g., 'Create a GET route that returns a list of products from a dummy array.'"
          buttonText="Generate API Route"
        />
      </TabsContent>
      <TabsContent value="data-fetching">
        <CodeGeneratorForm
          action={handleDataFetchingGeneration}
          placeholder="e.g., 'Fetch user data from https://api.example.com/users and display it.'"
          buttonText="Generate Data Fetching Code"
        />
      </TabsContent>
    </Tabs>
  );
}
