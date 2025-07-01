
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Columns3,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  title: string;
  details: string;
  startHour: number;
  endHour: number;
  color: string;
}

interface Events {
  [key: number]: Event[];
}

interface ViewProps {
  events: Events;
  view: 'month' | 'week';
  setView: React.Dispatch<React.SetStateAction<'month' | 'week'>>;
  setDialogEvent: (event: Event[] | null) => void;
}

const MonthView = ({ events, view, setView, setDialogEvent }: ViewProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(1);

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const calendarDays = [
    ...Array(2).fill(null),
    ...Array.from({ length: 31 }, (_, i) => i + 1),
  ];
  
  const selectedEvents = selectedDay ? events[selectedDay] : null;

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
                  {selectedEvents && selectedEvents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEvents.map((event, index) => (
                        <div key={index}>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-gray-400 text-xs">{event.details}</p>
                        </div>
                      ))}
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
               <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-700">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="font-semibold px-2">July 2025</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-700">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1 p-1 bg-black/30 rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setView('month')} className={`text-white h-8 w-8 hover:bg-gray-700 ${view === 'month' ? 'bg-gray-600' : ''}`}>
                  <CalendarDays className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setView('week')} className={`text-white h-8 w-8 hover:bg-gray-700 ${view === 'week' ? 'bg-gray-600' : ''}`}>
                  <Columns3 className="h-4 w-4" />
                </Button>
              </div>
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
                    onClick={() => {
                      if (day) {
                        setSelectedDay(day);
                        if (events[day]) {
                          setDialogEvent(events[day]);
                        }
                      }
                    }}
                    disabled={!day}
                    className={`
                      h-14 w-14 p-0 rounded-md relative w-full
                      ${day === selectedDay ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700/50'}
                      ${!day ? 'invisible' : ''}
                    `}
                  >
                    {day}
                    {day && events[day] && events[day].length > 0 && (
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

const WeekView = ({ events, view, setView, setDialogEvent }: ViewProps) => {
  const [miniCalendarSelectedDay, setMiniCalendarSelectedDay] = useState<number | null>(1);
  const miniCalendarDays = [...Array(2).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  const miniCalendarDaysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const weekDays = ['TUE 01', 'WED 02', 'THU 03', 'FRI 04', 'SAT 05', 'SUN 06', 'MON 07'];
  const timeSlots = Array.from({ length: 15 }, (_, i) => `${(i + 3).toString().padStart(2, '0')}:00`);
  
  const selectedEvents = miniCalendarSelectedDay ? events[miniCalendarSelectedDay] : null;
  const gridStartHour = 3;
  const totalHoursInGrid = 15;

  const eventColorClasses = {
    green: 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30 transition-colors',
    blue: 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30 transition-colors',
    purple: 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30 transition-colors',
    yellow: 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 transition-colors',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex w-full max-w-full h-full"
    >
      <div className="flex flex-col md:flex-row w-full bg-[#1C1C1C] border-gray-700/50 rounded-xl overflow-hidden h-full">
        {/* Left Panel */}
        <div className="w-full md:w-[280px] p-4 flex flex-col border-b md:border-b-0 md:border-r border-gray-700/50 text-white">
          <div className='space-y-4 flex-grow'>
            <h1 className="text-xl font-bold">Community Events</h1>
              <AnimatePresence mode="wait">
                <motion.div
                  key={miniCalendarSelectedDay}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 text-sm text-gray-300 min-h-[60px]"
                >
                  {selectedEvents && selectedEvents.length > 0 ? (
                    <div className="space-y-2">
                    {selectedEvents.map((event, index) => (
                    <div key={index}>
                        <div className="flex items-center gap-2 font-semibold text-sm"><Clock className="size-4 shrink-0" /> {event.title}</div>
                        <div className="flex items-center gap-2 pl-6 text-xs text-gray-400"><CalendarDays className="size-4 shrink-0" /> {event.details}</div>
                    </div>
                    ))}
                    </div>
                  ) : (
                     <p className="text-gray-400">No event selected.</p>
                  )}
                </motion.div>
              </AnimatePresence>
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
              {miniCalendarDaysOfWeek.map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {miniCalendarDays.map((day, index) => (
                 <motion.div 
                    key={index} 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button variant={day === miniCalendarSelectedDay ? 'default' : 'ghost'} onClick={() => day && setMiniCalendarSelectedDay(day)} disabled={!day}
                      className={`h-8 w-8 p-0 rounded-md relative text-xs w-full ${!day ? 'invisible' : ''} ${day === miniCalendarSelectedDay ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                      {day}
                    </Button>
                    {day && events[day] && events[day].length > 0 && (
                      <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 ${day === miniCalendarSelectedDay ? 'bg-black' : 'bg-white'} rounded-full`}></div>
                    )}
                 </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <header className="p-4 flex justify-between items-center flex-wrap gap-y-2 border-b border-gray-700/50 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Jul 1-7, 2025</h2>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center gap-1 p-1 bg-black/30 rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setView('month')} className={`text-white h-8 w-8 hover:bg-gray-700 ${view === 'month' ? 'bg-gray-600' : ''}`}>
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setView('week')} className={`text-white h-8 w-8 hover:bg-gray-700 ${view === 'week' ? 'bg-gray-600' : ''}`}>
                <Columns3 className="h-4 w-4" />
              </Button>
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

            <div className="flex-1 flex overflow-hidden">
              <div className="w-16 text-xs text-gray-500 text-right pr-2 flex flex-col">
                {timeSlots.map(time => <div key={time} className="flex-1 -mt-2 pt-2">{time}</div>)}
              </div>
              <div className="flex-1 grid grid-cols-7">
                {weekDays.map((day, dayIndex) => {
                   const currentDayNumber = dayIndex + 1;
                   const dayEvents = (events[currentDayNumber] || []).filter(event => event.startHour >= gridStartHour);
                   return (
                      <div key={day} className="border-l border-gray-700/50 relative flex flex-col">
                        {timeSlots.map(time => <div key={time} className="flex-1 border-b border-gray-700/50"></div>)}
                        <AnimatePresence>
                        {dayEvents.map((event, eventIndex) => {
                           const top = ((event.startHour - gridStartHour) / totalHoursInGrid) * 100;
                           const height = ((event.endHour - event.startHour) / totalHoursInGrid) * 100;
                           
                           return (
                             <motion.div
                               key={eventIndex}
                               layout
                               initial={{ opacity: 0, scale: 0.9 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.9 }}
                               whileHover={{ scale: 1.05, zIndex: 10, shadow: 'lg' }}
                               transition={{ duration: 0.2 }}
                               className="absolute w-full px-1 cursor-pointer"
                               style={{ top: `${top}%`, height: `${height}%` }}
                               onClick={() => setDialogEvent(events[currentDayNumber])}
                              >
                               <div className={`h-full p-2 rounded-lg text-white text-xs flex flex-col border ${eventColorClasses[event.color as keyof typeof eventColorClasses]}`}>
                                 <span className="font-bold">{event.title}</span>
                                 <span>{event.details}</span>
                               </div>
                             </motion.div>
                           )
                        })}
                        </AnimatePresence>
                      </div>
                   )
                })}
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
  const [dialogEvent, setDialogEvent] = useState<Event[] | null>(null);
  
  const events: Events = {
    1: [
      {
        title: "Farmer's Market",
        details: "8am - 12pm",
        startHour: 8,
        endHour: 12,
        color: "green",
      },
      {
        title: "Community Garden Meetup",
        details: "10am - 11am",
        startHour: 10,
        endHour: 11,
        color: "blue",
      }
    ],
    4: [{
      title: "Yoga in the Park",
      details: "6pm - 7pm",
      startHour: 18,
      endHour: 19,
      color: "purple",
    }],
    5: [{
      title: "Park Cleanup Day",
      details: "9am - 11am",
      startHour: 9,
      endHour: 11,
      color: "blue",
    }],
    7: [{
      title: "Library Book Club",
      details: "6pm - 7:30pm",
      startHour: 18,
      endHour: 19.5,
      color: "yellow",
    }],
  };

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-[#111111] text-white min-h-screen flex flex-col font-body ${view === 'month' ? 'p-4' : 'p-2 md:p-4'}`}>
      <main className={`w-full flex-1 flex flex-col ${view === 'month' ? 'items-center justify-center' : ''}`}>
        <AnimatePresence mode="wait">
          {view === 'month' ? (
            <MonthView key="month" events={events} view={view} setView={setView} setDialogEvent={setDialogEvent} />
          ) : (
            <WeekView key="week" events={events} view={view} setView={setView} setDialogEvent={setDialogEvent} />
          )}
        </AnimatePresence>
      </main>
      <Dialog open={!!dialogEvent} onOpenChange={(open) => !open && setDialogEvent(null)}>
        <DialogContent className="bg-orange-900 text-orange-50 border-orange-800">
          {dialogEvent && dialogEvent.length > 0 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-orange-100">Events for the day</DialogTitle>
                <DialogDescription className="text-orange-300">
                  All scheduled events are listed below.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                {dialogEvent.map((event, index) => (
                  <div key={index} className="space-y-1 border-b border-orange-800 pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-lg text-orange-100">{event.title}</h3>
                    <p className="text-sm text-orange-200">{event.details}</p>
                    <p className="text-sm"><strong>Time:</strong> {formatTime(event.startHour)} - {formatTime(event.endHour)}</p>
                    <p className="text-sm text-orange-300 mt-1">A detailed description of the event would go here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
