import { useListCalendarEvents } from "@workspace/api-client-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { data: events, isLoading } = useListCalendarEvents();

  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center px-6 flex-shrink-0">
        <h1 className="text-sm font-semibold">Calendar</h1>
        <span className="ml-3 text-xs text-muted-foreground">
          {format(weekStart, "MMM d")} — {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "text-center py-3 border-r border-border last:border-r-0",
                  isToday ? "bg-primary/5" : ""
                )}
              >
                <div className="text-xs text-muted-foreground">{DAYS[day.getDay()]}</div>
                <div
                  className={cn(
                    "text-lg font-semibold mt-1 w-8 h-8 flex items-center justify-center mx-auto rounded-full",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : events?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Clock className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">No events this week</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {events?.map((event) => {
              const start = new Date(event.startAt);
              const end = new Date(event.endAt);
              const dayIndex = start.getDay();
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-xs text-muted-foreground">{DAYS[dayIndex]}</span>
                    <span className="text-lg font-bold text-foreground">{start.getDate()}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(start, "h:mm a")}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">{event.title}</h3>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {event.attendees.length} attendee{event.attendees.length > 1 ? "s" : ""}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(start, "h:mm a")} — {format(end, "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
