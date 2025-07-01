
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
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const MonthView = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(1);

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-[#1C1C1C] border-gray-700/50 rounded-xl overflow-hidden">
        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 flex flex-col">
            <div className='space-y-4'>
              <h1 className="text-2xl font-bold">Community Events</h1>
              <p className="text-gray-400">Upcoming events in our community.</p>
              <Separator className="bg-gray-700/50" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-sm text-gray-300 min-h-[100px]"
                >
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
                </motion.div>
              </AnimatePresence>
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
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant={day === selectedDay ? 'default' : 'ghost'}
                    onClick={() => day && setSelectedDay(day)}
                    disabled={!day}
                    className={`
                      h-14 w-14 p-0 rounded-md relative w-full
                      ${day === selectedDay ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700/50'}
                      ${!day ? 'invisible' : ''}
                    `}
                  >
                    {day}
                    {day && events[day] && (
                      <div className={`absolute bottom-2 w-1.5 h-1.5 ${day === selectedDay ? 'bg-black' : 'bg-white'} rounded-full`}></div>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const WeekView = () => {
  const [miniCalendarSelectedDay, setMiniCalendarSelectedDay] = useState<number | null>(1);
  const miniCalendarDays = [...Array(2).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  const miniCalendarDaysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const weekDays = ['TUE 01', 'WED 02', 'THU 03', 'FRI 04', 'SAT 05', 'SUN 06', 'MON 07'];
  const timeSlots = Array.from({ length: 15 }, (_, i) => `${(i + 3).toString().padStart(2, '0')}:00`);
  
  const event = {
    title: "Briefing about Design",
    time: "30m",
    type: "Cal Video"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex w-full h-full max-w-full"
    >
      <div className="flex flex-col md:flex-row w-full h-full bg-[#1C1C1C] border-gray-700/50 rounded-xl overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-[280px] p-4 flex flex-col border-b md:border-b-0 md:border-r border-gray-700/50 text-white">
          <div className='space-y-4 flex-grow'>
            <h1 className="text-xl font-bold">Designali</h1>
            <p className="text-gray-400 text-sm">{event.title}</p>
            <div className="text-sm text-gray-400 space-y-2">
              <div className="flex items-center gap-2"><Clock className="size-4" /> {event.time}</div>
              <div className="flex items-center gap-2"><CalendarDays className="size-4" /> {event.type}</div>
            </div>
             <div className="flex items-center gap-2 mt-auto pt-4">
              <span>Arvin, CA</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm">July 2025</h2>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700"><ChevronLeft className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700"><ChevronRight className="w-3 h-3" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
              {miniCalendarDaysOfWeek.map((day) => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {miniCalendarDays.map((day, index) => (
                <Button key={index} variant={day === miniCalendarSelectedDay ? 'default' : 'ghost'} onClick={() => day && setMiniCalendarSelectedDay(day)} disabled={!day}
                  className={`h-8 w-8 p-0 rounded-md relative text-xs ${!day ? 'invisible' : ''} ${day === miniCalendarSelectedDay ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                  {day}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col">
          <header className="p-4 flex justify-between items-center flex-wrap gap-y-2 border-b border-gray-700/50 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Jul 1-7, 2025</h2>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-end">
              <div className="flex items-center space-x-2">
                <Switch id="overlay-calendar" className="data-[state=checked]:bg-white" />
                <Label htmlFor="overlay-calendar" className="text-sm">Overlay my calendar</Label>
              </div>
              <div className="flex items-center gap-1 p-1 bg-black/30 rounded-md">
                  <Button className="h-7 text-xs px-2 bg-gray-700 hover:bg-gray-600">12h</Button>
                  <Button className="h-7 text-xs px-2 bg-transparent hover:bg-gray-700">24h</Button>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-7 px-4 pt-2 shrink-0">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs text-gray-400 font-semibold py-2">
                  {day.startsWith('TUE') ? <span className="bg-white text-black rounded-full px-2 py-1 font-bold">{day}</span> : day}
                </div>
              ))}
            </div>

            <div className="flex-1 flex overflow-auto">
              <div className="w-16 text-xs text-gray-500 text-right pr-2">
                {timeSlots.map(time => <div key={time} className="h-16 -mt-2 pt-2">{time}</div>)}
              </div>
              <div className="flex-1 grid grid-cols-7 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,hsl(var(--card-foreground)/0.02)_4px,hsl(var(--card-foreground)/0.02)_5px)] min-w-[500px]">
                {weekDays.map(day => (
                  <div key={day} className="border-l border-gray-700/50 relative">
                    {timeSlots.map(time => <div key={time} className="h-16 border-b border-gray-700/50"></div>)}
                    {(day === 'WED 02' || day === 'THU 03') && (
                      <div className="absolute w-full" style={{ top: 'calc(1 * 4rem)', height: 'calc(1 * 4rem)' }}>
                        <div className="bg-white/10 mx-px h-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default function CalendarPage() {
  const [view, setView] = useState<'month' | 'week'>('month');
  
  return (
    <div className={`bg-[#111111] text-white min-h-screen flex flex-col font-body ${view === 'month' ? 'p-4' : 'p-2 md:p-4'}`}>
      <header className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-md">
          <Button variant="ghost" size="icon" onClick={() => setView('month')} className={`text-white h-8 w-8 hover:bg-gray-700 ${view === 'month' ? 'bg-gray-600' : ''}`}>
            <CalendarDays className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setView('week')} className={`text-white h-8 w-8 hover:bg-gray-700 ${view === 'week' ? 'bg-gray-600' : ''}`}>
            <Columns3 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className={`w-full h-full flex-1 flex ${view === 'month' ? 'items-center justify-center' : ''}`}>
        <AnimatePresence mode="wait">
          {view === 'month' ? <MonthView key="month" /> : <WeekView key="week" />}
        </AnimatePresence>
      </main>
    </div>
  );
}
