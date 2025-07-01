'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
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
  
  const timeSlots = [
    '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
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

  const getFormattedDate = (day: number | null) => {
    if (!day) return '';
    const date = new Date(2025, 6, day); // July is month 6
    return date.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' }).replace(',', '');
  };

  return (
    <div className="bg-[#111111] text-white min-h-screen flex flex-col items-center justify-center p-4 font-body">
      <header className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <div className="flex items-center gap-2">
          <Switch id="overlay-calendar" />
          <label htmlFor="overlay-calendar" className="text-sm">Overlay my calendar</label>
        </div>
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
        <Card className="bg-[#1C1C1C] border-gray-700/50 rounded-xl p-6">
          <CardContent className="p-0 flex gap-8">
            <div className="w-1/3 space-y-4">
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
              <Separator className="bg-gray-700/50" />
              <div className="flex items-center gap-2">
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
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 mb-2">
                {days.map((day) => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <Button
                    key={index}
                    variant={day === selectedDay ? 'default' : 'ghost'}
                    onClick={() => day && setSelectedDay(day)}
                    disabled={!day}
                    className={`
                      h-8 w-8 p-0 rounded-md relative
                      ${day === selectedDay ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700/50'}
                      ${!day ? 'invisible' : ''}
                    `}
                  >
                    {day}
                    {day && events[day] && (
                      <div className={`absolute bottom-1.5 w-1 h-1 ${day === selectedDay ? 'bg-black' : 'bg-white'} rounded-full`}></div>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="w-[200px] pl-8 border-l border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold">{getFormattedDate(selectedDay)}</p>
                <div className="flex items-center bg-[#111111] rounded-md p-0.5 text-xs">
                  <Button variant="ghost" size="sm" className="h-6 px-2 bg-gray-700/50 text-white hover:bg-gray-600">12h</Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-gray-400 hover:text-white">24h</Button>
                </div>
              </div>
              <div className="space-y-2 h-[240px] overflow-y-auto pr-2">
                {timeSlots.map((time) => (
                   <Button key={time} variant="outline" className="w-full justify-center border-gray-700/50 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white">
                     {time}
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
