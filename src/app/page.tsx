
'use client';

import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Columns3,
  PlusCircle,
  Trash2,
  Edit,
  Share2,
  Copy,
  Clock,
  Link as LinkIcon,
  MapPin,
  PartyPopper,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, getDaysInMonth, getDay, isSameDay, isSameMonth, getDate, startOfWeek, addDays, subDays, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { getEvents, saveEvent, deleteEvent, signOut, CalendarEvent, isAdminUser } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { FormattedText } from '@/components/formatted-text';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import ReactConfetti from 'react-confetti';

const EventMap = dynamic(() => import('@/components/event-map').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="w-full h-[250px] bg-muted rounded-md animate-pulse" />
});

const EventFormMap = dynamic(() => import('@/components/event-form-map').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="w-full h-[200px] bg-muted rounded-md animate-pulse" />
});


interface LaidOutEvent extends CalendarEvent {
  left: number;
  width: number;
}

interface EventsByDate {
  [key: number]: CalendarEvent[];
}

interface ViewProps {
  allEvents: CalendarEvent[];
  events: EventsByDate;
  view: 'month' | 'week';
  setView: React.Dispatch<React.SetStateAction<'month' | 'week'>>;
  setDialogEvent: (event: CalendarEvent[] | null) => void;
  displayDate: Date;
  setDisplayDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  isAdmin: boolean;
  onAddEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  isMobile: boolean | undefined;
}

const EventForm = ({ event, date, onSave, onCancel, isAdmin, onDelete }: { event: Partial<CalendarEvent> | null, date: Date, onSave: (formData: FormData) => Promise<CalendarEvent | null>, onCancel: () => void, isAdmin: boolean, onDelete: (id: number) => void }) => {
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [newlyCreatedEvent, setNewlyCreatedEvent] = useState<CalendarEvent | null>(null);

    const [currentEventData, setCurrentEventData] = useState<Partial<CalendarEvent>>({
        title: '',
        details: '',
        external_link: '',
        location_name: '',
        latitude: undefined,
        longitude: undefined,
        image_url: null,
        ...event,
        date: event?.date ? format(parseISO(event.date), 'yyyy-MM-dd') : format(date, 'yyyy-MM-dd'),
        start_hour: event?.start_hour || 9,
        end_hour: event?.end_hour || 10,
    });
    
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentEventData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const timeAsDecimal = (timeString: string): number => {
            const [hours, minutes] = timeString.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return 0;
            return hours + minutes / 60;
        }
        setCurrentEventData(prev => ({ ...prev, [name]: timeAsDecimal(value) }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setCurrentEventData(prev => ({ ...prev, image_url: URL.createObjectURL(file) }));
        }
    };
    
    const handleSubmit = async () => {
        setIsSaving(true);
        const formData = new FormData();
        Object.entries(currentEventData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        if (imageFile) {
            formData.set('image_url', imageFile);
        } else if (event?.image_url) {
            formData.set('existing_image_url', event.image_url);
        }

        if (event?.id) {
          formData.set('id', String(event.id));
        }

        const result = await onSave(formData);
        setIsSaving(false);
        if (result) {
            setNewlyCreatedEvent(result);
            setStep(3); // Move to success step
        }
    };

    const decimalToTimeString = (decimalHour: number | undefined): string => {
        if (decimalHour === undefined || isNaN(decimalHour)) return "09:00";
        const hours = Math.floor(decimalHour);
        const minutes = Math.round((decimalHour - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    const { toast } = useToast();
    const copyLink = (link?: string | null) => {
        if (!link) return;
        const fullUrl = window.location.origin + link;
        navigator.clipboard.writeText(fullUrl);
        toast({
          title: "Link Copied!",
          description: "The event link has been copied to your clipboard.",
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <DialogHeader>
                            <DialogTitle>{event?.id ? 'Step 1: Edit Event Details' : 'Step 1: Add Event Details'}</DialogTitle>
                            <DialogDescription>Fill in the main details for your event.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" value={currentEventData.title} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="details">Details</Label>
                                <Textarea id="details" name="details" value={currentEventData.details} onChange={handleInputChange} required rows={4} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_hour">Start Time</Label>
                                    <Input id="start_hour" name="start_hour" type="time" value={decimalToTimeString(currentEventData.start_hour)} onChange={handleTimeChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_hour">End Time</Label>
                                    <Input id="end_hour" name="end_hour" type="time" value={decimalToTimeString(currentEventData.end_hour)} onChange={handleTimeChange} required />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="external_link">External Link</Label>
                                <Input id="external_link" name="external_link" value={currentEventData.external_link || ''} onChange={handleInputChange} placeholder="https://example.com/tickets" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image_url">Event Flyer</Label>
                                <Input id="image_url" name="image_url" type="file" accept="image/*" onChange={handleImageChange} />
                                {currentEventData.image_url && (
                                    <div className="mt-2">
                                        <Image src={currentEventData.image_url} alt="Flyer preview" width={100} height={100} className="rounded-md object-cover" />
                                    </div>
                                )}
                            </div>
                             <div className="space-y-2">
                                <Label>Date</Label>
                                <Calendar
                                    mode="single"
                                    selected={currentEventData.date ? parseISO(currentEventData.date) : new Date()}
                                    onSelect={(d) => d && setCurrentEventData(prev => ({...prev, date: format(d, 'yyyy-MM-dd')}))}
                                    className="rounded-md border"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                            <Button type="button" onClick={() => setStep(2)}>Next</Button>
                        </DialogFooter>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <DialogHeader>
                            <DialogTitle>Step 2: Add Location</DialogTitle>
                            <DialogDescription>Add a location and click the map to set coordinates.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="location_name">Location Name</Label>
                                <Input id="location_name" name="location_name" value={currentEventData.location_name || ''} onChange={handleInputChange} placeholder="e.g., Central Park" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input id="latitude" name="latitude" type="number" step="any" value={currentEventData.latitude || ''} onChange={handleInputChange} placeholder="e.g., 40.785091" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input id="longitude" name="longitude" type="number" step="any" value={currentEventData.longitude || ''} onChange={handleInputChange} placeholder="e.g., -73.968285" />
                                </div>
                            </div>
                            <EventFormMap 
                                position={currentEventData.latitude && currentEventData.longitude ? [currentEventData.latitude, currentEventData.longitude] : [35.207, -118.828]} 
                                onLocationSelect={({lat, lng}) => {
                                    setCurrentEventData(prev => ({...prev, latitude: lat, longitude: lng}))
                                }} 
                            />
                        </div>
                        <DialogFooter className="flex justify-between w-full">
                           <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
                           <Button type="button" onClick={handleSubmit} disabled={isSaving}>
                               {isSaving ? 'Saving...' : 'Save Event'}
                           </Button>
                        </DialogFooter>
                    </div>
                );
            case 3:
                return (
                    <div className="flex flex-col items-center justify-center text-center space-y-6 h-full">
                        <ReactConfetti recycle={false} numberOfPieces={200} />
                        <PartyPopper className="h-16 w-16 text-primary" />
                        <DialogHeader>
                            <DialogTitle>Success!</DialogTitle>
                            <DialogDescription>Your event has been saved successfully.</DialogDescription>
                        </DialogHeader>
                        {newlyCreatedEvent?.link && (
                            <div className="flex gap-2">
                                <Button asChild variant="outline">
                                    <Link href={newlyCreatedEvent.link}>View Event Page</Link>
                                </Button>
                                <Button onClick={() => copyLink(newlyCreatedEvent.link)}>
                                    <Copy className="mr-2 h-4 w-4" /> Copy Link
                                </Button>
                            </div>
                        )}
                        <DialogFooter className="w-full">
                            <Button type="button" onClick={onCancel} className="w-full">Done</Button>
                        </DialogFooter>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden p-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col flex-grow overflow-y-auto pr-4 -mr-4"
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
            {isAdmin && event?.id && step !== 3 && (
                 <div className="mt-auto pt-6 border-t">
                    <Button type="button" variant="destructive" onClick={() => onDelete(event.id!)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete This Event
                    </Button>
                </div>
            )}
        </div>
    );
};


const MonthView = ({ allEvents, events, view, setView, setDialogEvent, displayDate, setDisplayDate, selectedDate, setSelectedDate, isAdmin, onAddEvent, onEditEvent, isMobile }: ViewProps) => {
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const firstDayOfMonth = getDay(new Date(displayDate.getFullYear(), displayDate.getMonth(), 1));
  const daysInMonth = getDaysInMonth(displayDate);
  const calendarDays = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  
  const selectedDayEvents = selectedDate ? allEvents.filter(event => isSameDay(parseISO(event.date), selectedDate)) : [];

  const handlePrevMonth = () => setDisplayDate(subMonths(displayDate, 1));
  const handleNextMonth = () => setDisplayDate(addMonths(displayDate, 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl"
    >
      <Card className="bg-transparent shadow-none border-none rounded-xl overflow-hidden">
        <CardContent className="p-2 sm:p-4 md:p-6 flex flex-col gap-4">
          {/* HEADER */}
          <div className="flex justify-between items-center flex-wrap gap-y-2">
              <div className="flex items-baseline gap-x-2">
                <h1 className="text-4xl sm:text-5xl font-bold">{selectedDate ? format(selectedDate, 'EEEE') : 'Select a day'}</h1>
                <h2 className="text-2xl sm:text-3xl font-semibold text-muted-foreground">{selectedDate ? format(selectedDate, 'd') : ''}</h2>
              </div>
              <div className="flex items-center gap-x-4">
                  <div className="flex items-center">
                      <h2 className="font-semibold text-xl text-muted-foreground">{format(displayDate, 'MMMM yyyy')}</h2>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-accent" onClick={handlePrevMonth}>
                          <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-accent" onClick={handleNextMonth}>
                          <ChevronRight className="w-4 h-4" />
                      </Button>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-secondary rounded-md">
                      <Button variant="ghost" size="icon" onClick={() => setView('month')} className={`h-8 w-8 hover:bg-accent ${view === 'month' ? 'bg-background' : ''}`}>
                          <CalendarDays className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setView('week')} className={`h-8 w-8 hover:bg-accent ${view === 'week' ? 'bg-background' : ''}`}>
                          <Columns3 className="h-4 w-4" />
                      </Button>
                  </div>
              </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Left Panel */}
            <div className="w-full md:w-1/3 flex flex-col">
              <div className='space-y-4 flex-grow'>
                 <div className="flex justify-end items-center h-9">
                      {isAdmin && <Button size="sm" onClick={onAddEvent}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>}
                 </div>
                 <Separator />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDate?.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 text-muted-foreground min-h-[100px]"
                  >
                    {selectedDayEvents && selectedDayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDayEvents.map((event, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <p className="text-2xl font-semibold text-foreground">{event.title}</p>
                              <FormattedText text={event.details} className="text-xl" />
                            </div>
                             {isAdmin && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditEvent(event)}><Edit className="h-4 w-4"/></Button>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <p>{selectedDate ? 'No events scheduled for this day.' : 'Select a day to see events.'}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="text-left text-sm text-muted-foreground mt-4">Arvin, CA</div>
            </div>

            {/* Right Panel */}
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs text-muted-foreground mb-2">
                {daysOfWeek.map((day) => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {calendarDays.map((day, index) => {
                  const dayDate = day ? new Date(displayDate.getFullYear(), displayDate.getMonth(), day) : null;
                  const isSelected = dayDate && selectedDate && isSameDay(selectedDate, dayDate);
                  const isToday = dayDate && isSameDay(new Date(), dayDate);

                  return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative aspect-square"
                  >
                    <Button
                      variant={isSelected ? 'default' : isToday ? 'secondary' : 'ghost'}
                      onClick={() => {
                          if (dayDate) {
                              setSelectedDate(dayDate);
                              const dayEvents = allEvents.filter(event => isSameDay(parseISO(event.date), dayDate));
                              if (isMobile && dayEvents.length > 0) {
                                  setDialogEvent(dayEvents);
                              }
                          }
                      }}
                      disabled={!day}
                      className={`
                        w-full h-full p-0 rounded-md relative
                        ${isToday && !isSelected ? 'bg-secondary' : ''}
                        ${!day ? 'invisible' : ''}
                      `}
                    >
                      {day}
                      {day && events[day] && events[day].length > 0 && (
                         <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 ${isSelected ? 'bg-primary-foreground' : 'bg-foreground'} rounded-full`}></div>
                      )}
                    </Button>
                  </motion.div>
                )})}
              </div>
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


function WeekView({ allEvents, events, view, setView, setDialogEvent, displayDate, setDisplayDate, selectedDate, setSelectedDate, isAdmin, onAddEvent, onEditEvent, isMobile }: ViewProps) {
  const miniCalendarDaysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const firstDayOfMonth = getDay(new Date(displayDate.getFullYear(), displayDate.getMonth(), 1));
  const daysInMonth = getDaysInMonth(displayDate);
  const miniCalendarDays = [...Array(firstDayOfMonth).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({length: 7}, (_, i) => addDays(weekStart, i));

  const weekEvents = allEvents.filter(event => {
    const eventDate = parseISO(event.date);
    return weekDays.some(weekDay => isSameDay(eventDate, weekDay));
  });

  let minHour = 8;
  let maxHour = 18;

  if (weekEvents.length > 0) {
    minHour = Math.min(...weekEvents.map(e => e.start_hour));
    maxHour = Math.max(...weekEvents.map(e => e.end_hour));
  }
  
  const gridStartHour = Math.max(0, Math.floor(minHour) - 1);
  const gridEndHour = Math.min(24, Math.ceil(maxHour) + 1);
  const totalHoursInGrid = Math.max(1, gridEndHour - gridStartHour);
  
  const timeSlots = Array.from({ length: totalHoursInGrid }, (_, i) => `${(i + gridStartHour).toString().padStart(2, '0')}:00`);
  
  const selectedDayEvents = selectedDate ? allEvents.filter(event => isSameDay(parseISO(event.date), selectedDate)) : [];

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
      <div className="flex w-full bg-card overflow-hidden">
        {/* Left Panel */}
        <div className="hidden p-4 md:flex flex-col md:w-[280px] lg:w-[320px] border-r border-border">
          <div className='flex flex-col space-y-4 flex-grow'>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Community Events</h1>
                {isAdmin && <Button size="sm" onClick={onAddEvent}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>}
            </div>
            <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDate?.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 text-sm text-muted-foreground min-h-[60px]"
                  >
                    {selectedDayEvents && selectedDayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDayEvents.map((event, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-foreground">{event.title}</p>
                              <p className="text-xs">{event.details}</p>
                            </div>
                             {isAdmin && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditEvent(event)}><Edit className="h-4 w-4"/></Button>}
                          </div>
                        ))}
                      </div>
                    ) : (
                       <p>No events for this day.</p>
                    )}
                  </motion.div>
                </AnimatePresence>
            </div>
          </div>
          <div className="text-left text-sm text-muted-foreground mt-4">Arvin, CA</div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm">{format(displayDate, 'MMMM yyyy')}</h2>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-accent" onClick={handlePrevMonth}><ChevronLeft className="w-3 h-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-accent" onClick={handleNextMonth}><ChevronRight className="w-3 h-3" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
              {miniCalendarDaysOfWeek.map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {miniCalendarDays.map((day, index) => {
                 const dayDate = day ? new Date(displayDate.getFullYear(), displayDate.getMonth(), day) : null;
                 const isSelected = dayDate && selectedDate && isSameDay(selectedDate, dayDate);
                 return (
                 <motion.div 
                    key={index} 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button variant={isSelected ? 'default' : 'ghost'} onClick={() => dayDate && setSelectedDate(dayDate)} disabled={!day}
                      className={`h-8 w-8 p-0 rounded-md relative text-xs w-full ${!day ? 'invisible' : ''}`}>
                      {day}
                    </Button>
                    {day && events[day] && events[day].length > 0 && (
                      <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 ${isSelected ? 'bg-primary-foreground' : 'bg-foreground'} rounded-full`}></div>
                    )}
                 </motion.div>
              )})}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <header className="p-2 md:p-4 flex justify-between items-center flex-wrap gap-y-2 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{selectedDate && format(weekDays[0], 'MMM d')} - {selectedDate && format(weekDays[6], 'MMM d, yyyy')}</h2>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-accent" onClick={handlePrevWeek}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-accent" onClick={handleNextWeek}><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setView('month')} className={`h-8 w-8 hover:bg-accent ${view === 'month' ? 'bg-background' : ''}`}>
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setView('week')} className={`h-8 w-8 hover:bg-accent ${view === 'week' ? 'bg-background' : ''}`}>
                <Columns3 className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 flex flex-col overflow-auto">
            <div className="flex flex-col flex-grow">
                <div className="flex">
                  <div className="w-16 shrink-0 hidden md:block"></div>
                  {weekDays.map(day => (
                    <div key={day.toString()} className="flex-1 text-center text-xs text-muted-foreground font-semibold py-2">
                      {isSameDay(day, new Date()) ? <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 font-bold">{format(day, 'EEE dd')}</span> : format(day, 'EEE dd')}
                    </div>
                  ))}
                </div>

                <div className="flex-1 flex overflow-hidden">
                  <div className="w-16 text-xs text-muted-foreground text-right pr-2 flex-col hidden md:flex">
                    {timeSlots.map(time => <div key={time} className="flex-1 -mt-2 pt-2">{time}</div>)}
                  </div>
                  <div className="flex-1 grid grid-cols-7">
                    {weekDays.map((day) => {
                       const dayEvents = allEvents.filter(event => isSameDay(parseISO(event.date), day));
                       const laidOutEvents = getEventLayouts(dayEvents);
                       return (
                          <div key={day.toString()} className="flex-1 border-l border-border relative flex flex-col">
                            {timeSlots.map((_, index) => <div key={index} className="flex-1 border-b border-border"></div>)}
                            <AnimatePresence>
                            {laidOutEvents
                              .filter(event => event.end_hour > gridStartHour && event.start_hour < gridEndHour)
                              .map((event) => {
                               const eventStart = Math.max(event.start_hour, gridStartHour);
                               const eventEnd = Math.min(event.end_hour, gridEndHour);

                               const top = ((eventStart - gridStartHour) / totalHoursInGrid) * 100;
                               const height = ((eventEnd - eventStart) / totalHoursInGrid) * 100;
                               
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
                                        if (isMobile) {
                                            setDialogEvent([event]);
                                        }
                                   }}
                                  >
                                   <div className="h-full p-2 rounded-lg text-foreground text-xs flex flex-col border bg-secondary hover:bg-accent transition-colors">
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
      </div>
    </motion.div>
  );
};


export default function CalendarPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const isMobile = useIsMobile();
  
  const [view, setView] = useState<'month' | 'week'>('month');
  const [dialogEvent, setDialogEvent] = useState<CalendarEvent[] | null>(null);
  const [displayDate, setDisplayDate] = useState<Date>();
  const [selectedDate, setSelectedDate] = useState<Date>();
  
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
    const now = new Date();
    setDisplayDate(now);
    setSelectedDate(now);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSelectedDate(currentDate => {
        if (currentDate && !isSameDay(now, currentDate)) {
          setDisplayDate(now);
          return now;
        }
        return currentDate;
      });
    }, 60000); 

    return () => clearInterval(timer);
  }, []); 

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      const adminStatus = await isAdminUser();
      setIsAdmin(adminStatus);
    };

    checkUserStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        const adminStatus = await isAdminUser();
        setIsAdmin(adminStatus);
        fetchAndSetEvents(); 
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, fetchAndSetEvents]);

  useEffect(() => {
    if (view === 'week' && selectedDate && displayDate && !isSameMonth(selectedDate, displayDate)) {
      setDisplayDate(selectedDate);
    }
  }, [selectedDate, view, displayDate]);

  useEffect(() => {
    fetchAndSetEvents();
  }, [fetchAndSetEvents]);
  
  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully." });
  };
  
  const handleAddEventClick = () => {
    setEditingEvent({});
    setIsFormOpen(true);
  };

  const handleEditEventClick = (event: CalendarEvent) => {
      if (selectedDate) {
        setEditingEvent(event);
        setSelectedDate(parseISO(event.date));
        setIsFormOpen(true);
      }
  };
  
  const handleSaveEvent = async (formData: FormData): Promise<CalendarEvent | null> => {
      try {
        const result = await saveEvent(formData);
        toast({ title: "Event saved successfully!" });
        await fetchAndSetEvents();
        return result;
      } catch(e) {
        const error = e as Error;
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return null;
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

  const closeForm = () => {
      setIsFormOpen(false);
      setEditingEvent(null);
  }

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const minutes = m.toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const copyLink = (link: string) => {
    const fullUrl = window.location.origin + link;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Link Copied!",
      description: "The event link has been copied to your clipboard.",
    });
  };

  if (!displayDate || !selectedDate || isMobile === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 w-full">
      </div>
    );
  }

  const eventsForDisplayMonth = allEvents.reduce((acc, event) => {
      const eventDate = parseISO(event.date);
      if (isSameMonth(eventDate, displayDate)) {
          const day = getDate(eventDate);
          if (!acc[day]) acc[day] = [];
          acc[day].push(event);
      }
      return acc;
  }, {} as EventsByDate);

  const viewProps = { allEvents, events: eventsForDisplayMonth, view, setView, setDialogEvent, displayDate, setDisplayDate, selectedDate, setSelectedDate, isAdmin, onAddEvent: handleAddEventClick, onEditEvent: handleEditEventClick, isMobile };

  const EventDetailsContent = ({ events, onClose }: { events: CalendarEvent[], onClose: () => void }) => (
    <>
      <SheetHeader>
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
        <SheetTitle>Events for {format(parseISO(events[0].date), 'MMMM d')}</SheetTitle>
      </SheetHeader>
      <div className="py-4 space-y-4 overflow-y-auto pr-4 -mr-4">
        {events.map((event, index) => (
          <div key={index} className="space-y-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
             {event.image_url && (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image src={event.image_url} alt={event.title} layout="fill" objectFit="cover" />
              </div>
            )}
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-sm"><strong>Time:</strong> {formatTime(event.start_hour)} - {formatTime(event.end_hour)}</p>
            <FormattedText text={event.details} className="text-sm text-muted-foreground mt-1" />
            {event.location_name && event.latitude && event.longitude && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">{event.location_name}</p>
                </div>
                <div className="rounded-md overflow-hidden border">
                    <EventMap position={[event.latitude, event.longitude]} locationName={event.location_name} />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
                {isAdmin && <Button size="sm" variant="outline" onClick={() => { onClose(); handleEditEventClick(event); }}><Edit className="mr-2 h-4 w-4"/> Edit</Button>}
                {event.link && (
                  <Button asChild size="sm" variant="outline">
                      <Link href={event.link}>
                          <Share2 className="mr-2 h-4 w-4"/>
                          View Page
                      </Link>
                  </Button>
                )}
                {event.external_link && (
                  <Button asChild size="sm" variant="outline">
                    <a href={event.external_link} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Event Link
                    </a>
                  </Button>
                )}
                {event.link && (
                  <Button size="sm" variant="secondary" onClick={() => copyLink(event.link!)}>
                      <Copy className="mr-2 h-4 w-4"/>
                      Copy Link
                  </Button>
                )}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className={cn(
        "flex flex-col w-full",
        view === 'month' && "min-h-screen items-center justify-center p-2 sm:p-4 md:p-6",
        view === 'week' && (isMobile ? "h-screen" : "h-screen p-4")
      )}>
      <AnimatePresence mode="wait">
          {view === 'month' ? (
            <MonthView key="month" {...viewProps} />
          ) : (
            <WeekView key="week" {...viewProps} />
          )}
      </AnimatePresence>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] h-full p-0 flex flex-col">
            {editingEvent && selectedDate && (
                <EventForm 
                  event={editingEvent} 
                  date={selectedDate} 
                  onSave={handleSaveEvent} 
                  onCancel={closeForm}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteEvent}
                />
            )}
        </DialogContent>
      </Dialog>
      
      {!isMobile && (
        <Dialog open={!!dialogEvent} onOpenChange={(open) => !open && setDialogEvent(null)}>
            <DialogContent>
                {dialogEvent && dialogEvent.length > 0 && (
                    <EventDetailsContent events={dialogEvent} onClose={() => setDialogEvent(null)} />
                )}
            </DialogContent>
        </Dialog>
      )}

      {isMobile && (
        <Sheet open={!!dialogEvent} onOpenChange={(open) => !open && setDialogEvent(null)}>
            <SheetContent side="bottom" className="rounded-t-xl max-h-[80vh]">
                {dialogEvent && dialogEvent.length > 0 && (
                     <EventDetailsContent events={dialogEvent} onClose={() => setDialogEvent(null)} />
                )}
            </SheetContent>
        </Sheet>
      )}

      {!isMobile && view === 'month' && (
        <div className="mt-8 text-center hidden md:block">
          {isAdmin ? (
            <Button variant="link" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground hover:no-underline">Admin Logout</Button>
          ) : (
            <Button asChild variant="link" size="sm" className="text-muted-foreground hover:text-foreground hover:no-underline">
              <Link href="/login" className="hover:no-underline">Admin Login</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
