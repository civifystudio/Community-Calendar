'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Rocket, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  projectName: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
  packageManager: z.enum(['npm', 'yarn', 'pnpm'], {
    required_error: 'You need to select a package manager.',
  }),
  features: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one feature.',
  }),
});

const features = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'tailwind', label: 'Tailwind CSS' },
  { id: 'eslint', label: 'ESLint' },
  { id: 'appRouter', label: 'App Router' },
];

export default function ScaffoldingPage() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      packageManager: 'npm',
      features: ['typescript', 'tailwind', 'appRouter'],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setSubmitted(true);
  }

  return (
    <main className="flex-1 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Create a New Project</CardTitle>
          <CardDescription>
            Fill out the form below to scaffold a new Next.js project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700 dark:text-green-400">Project Scaffolding Initiated!</AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-500">
                Your project '{form.getValues('projectName')}' is being created. You would typically see a command to run here.
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="my-awesome-app" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packageManager"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Package Manager</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="npm" />
                            </FormControl>
                            <FormLabel className="font-normal">npm</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yarn" />
                            </FormControl>
                            <FormLabel className="font-normal">yarn</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="pnpm" />
                            </FormControl>
                            <FormLabel className="font-normal">pnpm</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="features"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Features</FormLabel>
                        <FormDescription>
                          Select the features to include in your project.
                        </FormDescription>
                      </div>
                      {features.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="features"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">
                  <Rocket className="mr-2" />
                  Scaffold Project
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
