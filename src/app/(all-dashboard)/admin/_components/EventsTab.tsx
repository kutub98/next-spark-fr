import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Event } from "@/redux/features/eventSlice";
import { Quiz } from "@/redux/features/quizSlice";

interface EventsTabProps {
  events: Event[];
  quizzes: Quiz[];
  eventsLoading: boolean;
  newEvent: Partial<Event>;
  setNewEvent: React.Dispatch<React.SetStateAction<Partial<Event>>>;
  handleCreateEvent: () => void;
  setEditItem: React.Dispatch<
    React.SetStateAction<{ type: string; data: Record<string, unknown> } | null>
  >;
  setDeleteDialog: React.Dispatch<
    React.SetStateAction<{ type: string; id: string } | null>
  >;
}

const EventsTab: React.FC<EventsTabProps> = ({
  events,
  quizzes,
  eventsLoading,
  newEvent,
  setNewEvent,
  handleCreateEvent,
  setEditItem,
  setDeleteDialog,
}) => {
  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "completed";
    return "ongoing";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "ongoing":
        return <Badge variant="default">Ongoing</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Events Management</CardTitle>
          <CardDescription>Create and manage quiz events</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new quiz event.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="eventTitle">Event Title *</Label>
                <Input
                  id="eventTitle"
                  value={newEvent.title || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="eventDescription">Description</Label>
                <Textarea
                  id="eventDescription"
                  value={newEvent.description || ""}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Event description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={newEvent.startDate || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={newEvent.endDate || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="eventActive"
                  checked={newEvent.isActive !== false}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="eventActive" className="text-sm">
                  Active Event
                </Label>
              </div>
              <Button onClick={handleCreateEvent} disabled={eventsLoading}>
                {eventsLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {eventsLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-500">
              Create your first event to get started.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Quizzes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const status = getEventStatus(event);
                  const eventQuizzes = quizzes.filter(
                    (q) => q.eventId === event._id
                  );

                  return (
                    <TableRow key={event._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{event.title}</span>
                          {!event.isActive && (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                      <TableCell>
                        {new Date(event.startDate).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(event.endDate).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{eventQuizzes.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditItem({ type: "event", data: event })
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteDialog({ type: "event", id: event._id })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsTab;
