'use server';

import { getEventById } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Calendar, Clock, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FormattedText } from '@/components/formatted-text';

export default async function EventPage({ params }: { params: { id: string } }) {
  const eventId = Number(params.id);
  if (isNaN(eventId)) {
    notFound();
  }

  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const minutes = m.toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const eventDate = parseISO(event.date);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 w-full bg-background">
      <Card className="w-full max-w-2xl bg-card text-card-foreground border-border relative overflow-hidden">
        <CardHeader className="pt-8 px-4 sm:px-6">
            {event.image_url && (
                <div className="relative w-full h-80 mb-6 rounded-md overflow-hidden">
                    <Image
                        src={event.image_url}
                        alt={`${event.title} flyer`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="event flyer"
                    />
                </div>
            )}
          <CardTitle className="text-2xl sm:text-3xl font-bold">{event.title}</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Event details for the community calendar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base sm:text-lg">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground"/>
                    <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground"/>
                    <span>{formatTime(event.start_hour)} - {formatTime(event.end_hour)}</span>
                </div>
            </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">About this event</h3>
            <FormattedText text={event.details} className="text-muted-foreground" />
          </div>
          {event.external_link && (
            <div className="pt-4">
                <Button asChild className="w-full">
                    <a href={event.external_link} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Visit Event Page
                    </a>
                </Button>
            </div>
        )}
        </CardContent>
      </Card>
      <div className="mt-8">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendar
          </Link>
        </Button>
      </div>
    </div>
  );
}
