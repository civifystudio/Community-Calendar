'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Columns3,
  LayoutPanelLeft,
} from 'lucide-react';

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(1);

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  // July 2025 starts on a Tuesday. So we have 2 empty spots for Sun and Mon.
  const calendarDays = [
    ...Array(2).fill(null),
    ...Array.from({ length: 31 }, (_, i) => i + 1),
  ];
  
  const events: { [key: number]: { title: string; details: string } } = {
    1: {
      title: "Farmer's Market",
      details: "Every Saturday, 8am - 12pm",
    },
    7: {
      title: "Library Book Club",
      details: "First Tuesday of the month, 6pm",
    },
    19: {
      title: "Park Cleanup Day",
      details: "July 19th, 9am",
    },
  };

  const selectedEvent = selectedDay ? events[selectedDay] : null;

  return (
    <div className="bg-[#111111] text-white min-h-screen flex flex-col items-center justify-center p-4 font-body">
      <header className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-md">
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 h-8 w-8">
            <CalendarDays className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 h-8 w-8">
            <Columns3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 h-8 w-8">
            <LayoutPanelLeft className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto">
        <Card className="bg-[#1C1C1C] border-gray-700/50 rounded-xl">
          <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex flex-col">
              <div className='space-y-4'>
                <h1 className="text-2xl font-bold">Community Events</h1>
                <p className="text-gray-400">Upcoming events in our community.</p>
                <Separator className="bg-gray-700/50" />
                <div className="space-y-4 text-sm text-gray-300 min-h-[100px]">
                  {selectedEvent ? (
                    <div>
                      <p className="font-semibold">{selectedEvent.title}</p>
                      <p className="text-gray-400 text-xs">{selectedEvent.details}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400">No event scheduled for this day.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-4">
                <span>Arvin, CA</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-700">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="font-semibold">July 2025</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-700">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-4 text-center text-xs text-gray-400 mb-2">
                {days.map((day) => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-4">
                {calendarDays.map((day, index) => (
                  <Button
                    key={index}
                    variant={day === selectedDay ? 'default' : 'ghost'}
                    onClick={() => day && setSelectedDay(day)}
                    disabled={!day}
                    className={`
                      h-14 w-14 p-0 rounded-md relative
                      ${day === selectedDay ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700/50'}
                      ${!day ? 'invisible' : ''}
                    `}
                  >
                    {day}
                    {day && events[day] && (
                      <div className={`absolute bottom-2 w-1.5 h-1.5 ${day === selectedDay ? 'bg-black' : 'bg-white'} rounded-full`}></div>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
