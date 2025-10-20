"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  Event,
} from "@/redux/features/eventSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppDispatch, RootState } from "@/store/store";
import {
  Loader2,
  Plus,
  Calendar,
  Users,
  FileText,
  ArrowRight,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";

const AdminQuizManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading: eventsLoading } = useSelector(
    (state: RootState) => state.events
  );

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsCreating(true);
      await dispatch(createEvent(newEvent)).unwrap();
      toast.success("Event created successfully");
      setNewEvent({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });
      setCreateDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create event";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditDialogOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (
      !editingEvent?.title ||
      !editingEvent?.startDate ||
      !editingEvent?.endDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsUpdating(true);
      await dispatch(
        updateEvent({ id: editingEvent._id, data: editingEvent })
      ).unwrap();
      toast.success("Event updated successfully");
      setEditDialogOpen(false);
      setEditingEvent(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update event";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteEvent(eventToDelete._id)).unwrap();
      toast.success("Event deleted successfully");
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete event";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

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
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quiz Management</h1>
          <p className="text-gray-600">Manage events, quizzes, and questions</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

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
          <p className="text-gray-500 mb-4">
            Create your first event to get started.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const status = getEventStatus(event);
            return (
              <Card
                key={event._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {event.description || "No description"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(status)}
                      {!event.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event);
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <div>
                        <div>
                          Start:{" "}
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          End: {new Date(event.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>{event.quizzes?.length || 0} quizzes</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>
                            {event.participants?.length || 0} participants
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href={`/admin/quiz-management/${event._id}`}>
                        <Button variant="outline" className="w-full">
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Manage Event
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update the event details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editEventTitle">Event Title *</Label>
              <Input
                id="editEventTitle"
                value={editingEvent?.title || ""}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent!, title: e.target.value })
                }
                placeholder="Enter event title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEventDescription">Description</Label>
              <Textarea
                id="editEventDescription"
                value={editingEvent?.description || ""}
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent!,
                    description: e.target.value,
                  })
                }
                placeholder="Event description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editStartDate">Start Date *</Label>
                <Input
                  id="editStartDate"
                  type="datetime-local"
                  value={
                    editingEvent?.startDate
                      ? new Date(editingEvent.startDate)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent!,
                      startDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEndDate">End Date *</Label>
                <Input
                  id="editEndDate"
                  type="datetime-local"
                  value={
                    editingEvent?.endDate
                      ? new Date(editingEvent.endDate)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent!,
                      endDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editEventActive"
                checked={editingEvent?.isActive !== false}
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent!,
                    isActive: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="editEventActive" className="text-sm">
                Active Event
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEvent} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{eventToDelete?.title}
              &quot;? This action cannot be undone and will also delete all
              associated quizzes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuizManagement;
