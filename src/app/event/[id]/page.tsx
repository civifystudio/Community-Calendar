'use server';

import { getEventById } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { notFound } from 'next/navigation';
import Link from 'next/link';

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

  const eventColorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    teal: 'bg-teal-500',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full bg-[#111111]">
      <Card className="w-full max-w-2xl bg-[#1C1C1C] text-white border-gray-700/50 relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-2 ${eventColorClasses[event.color]}`}></div>
        <CardHeader className="pt-8">
          <CardTitle className="text-3xl font-bold">{event.title}</CardTitle>
          <CardDescription className="text-gray-400 pt-2">
            Event details for the community calendar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Separator className="bg-gray-700/50" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400"/>
                    <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400"/>
                    <span>{formatTime(event.start_hour)} - {formatTime(event.end_hour)}</span>
                </div>
            </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">About this event</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{event.details}</p>
          </div>
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
