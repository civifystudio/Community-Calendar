'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Share2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const configurations = [
  {
    id: 'cfg_1',
    name: 'My Standard Setup',
    features: ['TypeScript', 'Tailwind CSS', 'Auth.js'],
    createdAt: '2023-10-26',
  },
  {
    id: 'cfg_2',
    name: 'E-commerce Starter',
    features: ['TypeScript', 'Tailwind CSS', 'Prisma', 'Medusa'],
    createdAt: '2023-10-25',
  },
  {
    id: 'cfg_3',
    name: 'Blog Template',
    features: ['TypeScript', 'Tailwind CSS', 'Sanity'],
    createdAt: '2023-10-24',
  },
];

export default function ConfigurationsPage() {
  const { toast } = useToast();

  const handleShare = (configName: string) => {
    navigator.clipboard.writeText(`Shared configuration: ${configName}`);
    toast({
      title: 'Copied to Clipboard!',
      description: `Sharing link for '${configName}' has been copied.`,
    });
  };

  return (
    <main className="flex-1 p-4 sm:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Configurations</CardTitle>
            <CardDescription>
              Save and share your custom project configurations.
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                New Configuration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Configuration</DialogTitle>
                <DialogDescription>
                  Save your current project setup as a shareable configuration.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" defaultValue="My Custom Setup" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Configuration</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configurations.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {config.features.map((feature) => (
                        <Badge key={feature} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{config.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleShare(config.name)}>
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
