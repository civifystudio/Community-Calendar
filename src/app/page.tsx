import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Globe,
  CalendarDays,
  Columns3,
  LayoutPanelLeft,
  ChevronDown
} from 'lucide-react';

export default function CalendarPage() {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  // July 2025 starts on a Tuesday. So we have 2 empty spots for Sun and Mon.
  const calendarDays = [
    ...Array(2).fill(null),
    ...Array.from({ length: 31 }, (_, i) => i + 1),
  ];
  
  const timeSlots = [
    '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];

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
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <p className="text-sm text-gray-400">Ali Imam</p>
              </div>
              <h1 className="text-2xl font-bold">Designali</h1>
              <p className="text-gray-400">Briefing about Design</p>
              <Separator className="bg-gray-700/50" />
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>30m</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-gray-400" />
                  <span>Cal Video</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>America/Los Angeles</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
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
                    variant={day === 1 ? 'default' : 'ghost'}
                    className={`
                      h-8 w-8 p-0 rounded-md
                      ${day === 1 ? 'bg-white text-black hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700/50'}
                      ${!day ? 'invisible' : ''}
                    `}
                  >
                    {day}
                    {day === 1 && <div className="absolute bottom-1.5 w-1 h-1 bg-black rounded-full"></div>}
                  </Button>
                ))}
              </div>
            </div>

            <div className="w-[200px] pl-8 border-l border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold">Tue 01</p>
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

      <footer className="absolute bottom-4">
        <a href="#" className="text-sm text-gray-500 hover:text-white">Cal.com</a>
      </footer>
    </div>
  );
}
