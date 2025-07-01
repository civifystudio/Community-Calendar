
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Columns3,
  Clock,
  PlusCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, getDaysInMonth, getDay, isSameDay, isSameMonth, getDate, startOfWeek, addDays, subDays, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { getEvents, addEvent, updateEvent, deleteEvent, signOut, CalendarEvent } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LaidOutEvent extends CalendarEvent {
  left: number;
  width: number;
}

interface EventsByDate {
  [key: number]: CalendarEvent[];
}

interface EventsByDateAndMonth {
  [key: string]: EventsByDate; // Key is YYYY-MM
}

interface ViewProps {
  events: EventsByDate;
  view: 'month' | 'week';
  setView: React.Dispatch<React.SetStateAction<'month' | 'week'>>;
  setDialogEvent: (event: CalendarEvent[] | null) => void;
  displayDate: Date;
  setDisplayDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  isAdmin: boolean;
  onAddEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
}

const EventForm = ({ event, date, onSave, onCancel }: { event: Partial<CalendarEvent> | null, date: Date, onSave: (event: CalendarEvent | Omit<CalendarEvent, "id">) => void, onCancel: () => void }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [details, setDetails] = useState(event?.details || '');
    const [startHour, setStartHour] = useState(event?.start_hour || 9);
    const [endHour, setEndHour] = useState(event?.end_hour || 10);
    const [color, setColor] = useState<'green' | 'blue' | 'purple' | 'yellow'>(event?.color || 'blue');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const eventData = {
        ...event,
        date: format(date, 'yyyy-MM-dd'),
        title,
        details,
        start_hour: Number(startHour),
        end_hour: Number(endHour),
        color,
      };
      // Type guard to differentiate between add and update
      if ('id' in eventData && eventData.id) {
        onSave(eventData as CalendarEvent);
      } else {
        const { id, ...newEventData } = eventData;
        onSave(newEventData);
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>{event?.id ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <DialogDescription>Fill in the details for your event on {format(date, 'MMMM d, yyyy')}.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-black/30 border-gray-600"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea id="details" value={details} onChange={e => setDetails(e.target.value)} required className="bg-black/30 border-gray-600"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="startHour">Start Time (24h)</Label>
                <Input id="startHour" type="number" min="0" max="23" value={startHour} onChange={e => setStartHour(Number(e.target.value))} required className="bg-black/30 border-gray-600"/>
             </div>
             <div className="space-y-2">
                <Label htmlFor="endHour">End Time (24h)</Label>
                <Input id="endHour" type="number" min="0" max="24" value={endHour} onChange={e => setEndHour(Number(e.target.value))} required className="bg-black/30 border-gray-600"/>
             </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select value={color} onValueChange={(value: 'green' | 'blue' | 'purple' | 'yellow') => setColor(value)}>
                <SelectTrigger id="color" className="bg-black/30 border-gray-600">
                    <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                </SelectContent>
            </Select>
           </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          </DialogClose>
          <Button type="submit">Save Event</Button>
        </DialogFooter>
      </form>
    );
  };


const MonthView = ({ events, view, setView, setDialogEvent, displayDate, setDisplayDate, selectedDate, setSelectedDate, isAdmin, onAddEvent, onEditEvent }: ViewProps) => {
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const firstDayOfMonth = getDay(new Date(displayDate.getFullYear(), displayDate.getMonth(), 1));
  const daysInMonth = getDaysInMonth(displayDate);
  const calendarDays = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  
  const selectedDayEvents = selectedDate && isSameMonth(selectedDate, displayDate) ? events[getDate(selectedDate)] : [];

  const handlePrevMonth = () => setDisplayDate(subMonths(displayDate, 1));
  const handleNextMonth = () => setDisplayDate(addMonths(displayDate, 1));

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
            <div className='space-y-4 flex-grow'>
               <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{selectedDate ? format(selectedDate, 'EEEE, d') : 'Select a day'}</h1>
                    {isAdmin && <Button size="sm" onClick={onAddEvent}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>}
               </div>
               <Separator className="bg-gray-700/50" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDate?.toString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-sm text-gray-300 min-h-[100px]"
                >
                  {selectedDayEvents && selectedDayEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayEvents.map((event, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-gray-400 text-xs">{event.details}</p>
                          </div>
                           {isAdmin && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditEvent(event)}><Edit className="h-4 w-4"/></Button>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400">{selectedDate ? 'No events scheduled for this day.' : 'Select a day to see events.'}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="text-left text-sm text-gray-500 mt-4">Arvin, CA</div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-700" onClick={handlePrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="font-semibold px-2">{format(displayDate, 'MMMM yyyy')}</h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-700" onClick={handleNextMonth}>
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
              {daysOfWeek.map((day) => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((day, index) => {
                const dayDate = day ? new Date(displayDate.getFullYear(), displayDate.getMonth(), day) : null;
                const isSelected = dayDate && isSameDay(selectedDate, dayDate);
                const isToday = dayDate && isSameDay(new Date(), dayDate);

                return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Button
                    variant={isSelected ? 'default' : isToday ? 'secondary' : 'ghost'}
                    onClick={() => {
                      if (dayDate) {
                        setSelectedDate(dayDate);
                      }
                    }}
                    disabled={!day}
                    className={`
                      h-14 w-14 p-0 rounded-md relative w-full
                      ${isSelected ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700/50'}
                      ${isToday && !isSelected ? 'bg-gray-800' : ''}
                      ${!day ? 'invisible' : ''}
                    `}
                  >
                    {day}
                    {day && events[day] && events[day].length > 0 && (
                      <div className={`absolute bottom-2 w-1.5 h-1.5 ${isSelected ? 'bg-black' : 'bg-white'} rounded-full`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dayDate) setSelectedDate(dayDate);
                          setDialogEvent(events[day] || null)
                        }}
                      ></div>
                    )}
                  </Button>
                </motion.div>
              )})}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const getEventLayouts = (dayEvents: CalendarEvent[]): LaidOutEvent[] => {
  if (!dayEvents || dayEvents.length === 0) return [];

  const sortedEvents = [...dayEvents].sort((a, b) => a.start_hour - b.start_hour || b.end_hour - a.end_hour);

  const groups: CalendarEvent[][] = [];
  const visited = new Set<CalendarEvent>();

  for (const event of sortedEvents) {
      if (visited.has(event)) continue;
      const group: CalendarEvent[] = [];
      const queue = [event];
      visited.add(event);
      while(queue.length > 0) {
          const current = queue.shift()!;
          group.push(current);
          for (const other of sortedEvents) {
              if (visited.has(other)) continue;
              if (current.start_hour < other.end_hour && current.end_hour > other.start_hour) {
                  visited.add(other);
                  queue.push(other);
              }
          }
      }
      groups.push(group);
  }

  const layouts: LaidOutEvent[] = [];
  for (const group of groups) {
      const columns: CalendarEvent[][] = [];
      group.sort((a,b) => a.start_hour - b.start_hour);
      for(const event of group) {
          let placed = false;
          for(const col of columns) {
              if (col[col.length-1].end_hour <= event.start_hour) {
                  col.push(event);
                  placed = true;
                  break;
              }
          }
          if (!placed) {
              columns.push([event]);
          }
      }

      for (let i = 0; i < columns.length; i++) {
          for (const event of columns[i]) {
              layouts.push({
                  ...event,
                  width: (100 / columns.length),
                  left: i * (100 / columns.length)
              });
          }
      }
  }

  return layouts;
};


function WeekView({ events, view, setView, setDialogEvent, displayDate, setDisplayDate, selectedDate, setSelectedDate, isAdmin, onAddEvent, onEditEvent }: ViewProps) {
  const miniCalendarDaysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const firstDayOfMonth = getDay(new Date(displayDate.getFullYear(), displayDate.getMonth(), 1));
  const daysInMonth = getDaysInMonth(displayDate);
  const miniCalendarDays = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({length: 7}, (_, i) => addDays(weekStart, i));

  const timeSlots = Array.from({ length: 15 }, (_, i) => `${(i + 3).toString().padStart(2, '0')}:00`);
  
  const selectedDayEvents = isSameMonth(selectedDate, displayDate) ? events[getDate(selectedDate)] : [];

  const gridStartHour = 3;
  const totalHoursInGrid = 15;

  const eventColorClasses = {
    green: 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30 transition-colors',
    blue: 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30 transition-colors',
    purple: 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30 transition-colors',
    yellow: 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 transition-colors',
  };

  const handlePrevWeek = () => setSelectedDate(subDays(selectedDate, 7));
  const handleNextWeek = () => setSelectedDate(addDays(selectedDate, 7));
  const handlePrevMonth = () => setDisplayDate(subMonths(displayDate, 1));
  const handleNextMonth = () => setDisplayDate(addMonths(displayDate, 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full flex-1 flex"
    >
      <div className="flex flex-col md:flex-row w-full bg-[#1C1C1C] border-gray-700/50 rounded-xl overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-[280px] p-4 flex flex-col border-b md:border-b-0 md:border-r border-gray-700/50 text-white">
          <div className='flex flex-col space-y-4 flex-grow'>
            <div>
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Community Events</h1>
                {isAdmin && <Button size="sm" onClick={onAddEvent}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>}
              </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDate?.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 text-sm text-gray-300 min-h-[60px]"
                  >
                    {selectedDayEvents && selectedDayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDayEvents.map((event, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{event.title}</p>
                              <p className="text-gray-400 text-xs">{event.details}</p>
                            </div>
                             {isAdmin && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditEvent(event)}><Edit className="h-4 w-4"/></Button>}
                          </div>
                        ))}
                      </div>
                    ) : (
                       <p className="text-gray-400">No events for this day.</p>
                    )}
                  </motion.div>
                </AnimatePresence>
            </div>
          </div>
          <div className="text-left text-sm text-gray-500 mt-4">Arvin, CA</div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm">{format(displayDate, 'MMMM yyyy')}</h2>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700" onClick={handlePrevMonth}><ChevronLeft className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700" onClick={handleNextMonth}><ChevronRight className="w-3 h-3" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
              {miniCalendarDaysOfWeek.map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {miniCalendarDays.map((day, index) => {
                 const dayDate = day ? new Date(displayDate.getFullYear(), displayDate.getMonth(), day) : null;
                 const isSelected = dayDate && isSameDay(selectedDate, dayDate);
                 return (
                 <motion.div 
                    key={index} 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button variant={isSelected ? 'default' : 'ghost'} onClick={() => dayDate && setSelectedDate(dayDate)} disabled={!day}
                      className={`h-8 w-8 p-0 rounded-md relative text-xs w-full ${!day ? 'invisible' : ''} ${isSelected ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                      {day}
                    </Button>
                    {day && events[day] && events[day].length > 0 && (
                      <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 ${isSelected ? 'bg-black' : 'bg-white'} rounded-full`}></div>
                    )}
                 </motion.div>
              )})}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <header className="p-4 flex justify-between items-center flex-wrap gap-y-2 border-b border-gray-700/50 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}</h2>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700" onClick={handlePrevWeek}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:bg-gray-700" onClick={handleNextWeek}><ChevronRight className="w-4 h-4" /></Button>
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
                <div key={day.toString()} className="text-center text-xs text-gray-400 font-semibold py-2">
                  {isSameDay(day, new Date()) ? <span className="bg-white text-black rounded-full px-2 py-1 font-bold">{format(day, 'EEE dd')}</span> : format(day, 'EEE dd')}
                </div>
              ))}
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-16 text-xs text-gray-500 text-right pr-2 flex flex-col">
                {timeSlots.map(time => <div key={time} className="flex-1 -mt-2 pt-2">{time}</div>)}
              </div>
              <div className="flex-1 flex">
                {weekDays.map((day) => {
                   const dayEvents = (events[day.getDate()]) || [];
                   const filteredEvents = dayEvents.filter(event => event.start_hour >= gridStartHour);
                   const laidOutEvents = getEventLayouts(filteredEvents);
                   return (
                      <div key={day.toString()} className="flex-1 border-l border-gray-700/50 relative flex flex-col">
                        {timeSlots.map((_, index) => <div key={index} className="flex-1 border-b border-gray-700/50"></div>)}
                        <AnimatePresence>
                        {laidOutEvents.map((event) => {
                           const top = ((event.start_hour - gridStartHour) / totalHoursInGrid) * 100;
                           const height = ((event.end_hour - event.start_hour) / totalHoursInGrid) * 100;
                           
                           return (
                             <motion.div
                               key={`${event.title}-${event.start_hour}`}
                               layout
                               initial={{ opacity: 0, scale: 0.9 }}
                               animate={{ opacity: 1, scale: 1 }}
                               exit={{ opacity: 0, scale: 0.9 }}
                               whileHover={{ scale: 1.05, zIndex: 10, shadow: 'lg' }}
                               transition={{ duration: 0.2 }}
                               className="absolute cursor-pointer p-0.5"
                               style={{ 
                                 top: `${top}%`, 
                                 height: `${height}%`,
                                 left: `${event.left}%`,
                                 width: `calc(${event.width}% - 2px)`,
                                 marginLeft: '1px',
                                }}
                                onClick={() => {
                                  setSelectedDate(day);
                                  setDialogEvent(events[day.getDate()])
                                }}
                              >
                               <div className={`h-full p-2 rounded-lg text-white text-xs flex flex-col border ${eventColorClasses[event.color as keyof typeof eventColorClasses]}`}>
                                 <span className="font-bold truncate">{event.title}</span>
                                 <span className='truncate'>{event.details}</span>
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
  const { toast } = useToast();
  const supabase = createClient();
  
  const [view, setView] = useState<'month' | 'week'>('month');
  const [dialogEvent, setDialogEvent] = useState<CalendarEvent[] | null>(null);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);

  const fetchAndSetEvents = useCallback(async () => {
    const eventsFromDb = await getEvents();
    setAllEvents(eventsFromDb);
  }, []);

  useEffect(() => {
    fetchAndSetEvents();
  }, [fetchAndSetEvents]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      // This is a temp solution for checking admin on client.
      // Real check is done on server.
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      setIsAdmin(session?.user?.email === adminEmail);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        setIsAdmin(session?.user?.email === adminEmail);
        fetchAndSetEvents(); // Refetch events on auth change
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, fetchAndSetEvents]);

  useEffect(() => {
    if (view === 'week' && !isSameMonth(selectedDate, displayDate)) {
      setDisplayDate(selectedDate);
    }
  }, [selectedDate, view, displayDate]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully." });
  };
  
  const handleAddEventClick = () => {
    setEditingEvent({});
    setIsFormOpen(true);
  };

  const handleEditEventClick = (event: CalendarEvent) => {
      setEditingEvent(event);
      setSelectedDate(parseISO(event.date));
      setIsFormOpen(true);
  };
  
  const handleSaveEvent = async (eventData: CalendarEvent | Omit<CalendarEvent, 'id'>) => {
      try {
        if ('id' in eventData) {
            await updateEvent(eventData);
            toast({ title: "Event updated successfully!" });
        } else {
            await addEvent(eventData);
            toast({ title: "Event added successfully!" });
        }
        await fetchAndSetEvents();
        setIsFormOpen(false);
        setEditingEvent(null);
      } catch(e) {
        const error = e as Error;
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
  };

  const handleDeleteEvent = async (id?: number) => {
    if (id && window.confirm("Are you sure you want to delete this event?")) {
        try {
            await deleteEvent(id);
            toast({ title: "Event deleted" });
            await fetchAndSetEvents();
            setIsFormOpen(false);
            setEditingEvent(null);
        } catch(e) {
            const error = e as Error;
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    }
  };

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const minutes = m.toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const eventsForDisplayMonth = allEvents.reduce((acc, event) => {
      const eventDate = parseISO(event.date);
      if (isSameMonth(eventDate, displayDate)) {
          const day = getDate(eventDate);
          if (!acc[day]) acc[day] = [];
          acc[day].push(event);
      }
      return acc;
  }, {} as EventsByDate);

  const viewProps = { events: eventsForDisplayMonth, view, setView, setDialogEvent, displayDate, setDisplayDate, selectedDate, setSelectedDate, isAdmin, onAddEvent: handleAddEventClick, onEditEvent: handleEditEventClick };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full">
      <AnimatePresence mode="wait">
          {view === 'month' ? (
            <MonthView key="month" {...viewProps} />
          ) : (
            <WeekView key="week" {...viewProps} />
          )}
      </AnimatePresence>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[#1C1C1C] text-white border-gray-700/50">
            {editingEvent && (
                <EventForm event={editingEvent} date={selectedDate} onSave={handleSaveEvent} onCancel={() => setIsFormOpen(false)} />
            )}
             {editingEvent?.id && (
                <Button variant="destructive" className="mt-4" onClick={() => handleDeleteEvent(editingEvent.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Event
                </Button>
            )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!dialogEvent} onOpenChange={(open) => !open && setDialogEvent(null)}>
        <DialogContent className="bg-[#1C1C1C] text-white border-gray-700/50">
          {dialogEvent && dialogEvent.length > 0 && (
            <>
              <DialogHeader>
                <DialogTitle>Events for {format(parseISO(dialogEvent[0].date), 'MMMM d')}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  All scheduled events are listed below.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                {dialogEvent.map((event, index) => (
                  <div key={index} className="space-y-1 border-b border-gray-700/50 pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-sm"><strong>Time:</strong> {formatTime(event.start_hour)} - {formatTime(event.end_hour)}</p>
                    <p className="text-sm text-gray-400 mt-1">{event.details}</p>
                     {isAdmin && <Button size="sm" variant="outline" className="mt-2" onClick={() => { setDialogEvent(null); handleEditEventClick(event); }}><Edit className="mr-2 h-4 w-4"/> Edit</Button>}
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <div className="mt-8">
        {isAdmin ? (
          <Button variant="link" size="sm" onClick={handleSignOut} className="text-gray-400 hover:text-white">Admin Logout</Button>
        ) : (
          <Button asChild variant="link" size="sm" className="text-gray-400 hover:text-white">
            <Link href="/login">Admin Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
