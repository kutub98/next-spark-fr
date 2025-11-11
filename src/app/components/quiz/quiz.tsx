// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";
// import { api } from "@/data/api";
// import { RootState } from "@/store/store";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// export default function QuizzesBasedOnEvent() {
//   const [allEvents, setAllEvents] = useState<any[]>([]);
//   const [allQuizzes, setAllQuizzes] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const {
//     user,
//     isAuthenticated,
//     isLoading: authLoading,
//   } = useSelector((state: RootState) => state.auth);

//   useEffect(() => {
//     const fetchEventsAndQuizzes = async () => {
//       try {
//         // 1️⃣ Fetch all events
//         const eventsRes = await fetch(`${api}/events`);
//         const eventsData = await eventsRes.json();
//         setAllEvents(eventsData.data || []);

//         // 2️⃣ Fetch quizzes for each event
//         const quizzesArray = await Promise.all(
//           (eventsData.data || []).map(async (event: any) => {
//             const quizRes = await fetch(
//               `${api}/quizzes/event/${event?._id}?populate=eventId`
//             );
//             const quizData = await quizRes.json();
//             return quizData.data || [];
//           })
//         );

//         // Flatten the quizzes arrays
//         const flattenedQuizzes = quizzesArray.flat();
//         setAllQuizzes(flattenedQuizzes);
//       } catch (error) {
//         console.error("Failed to fetch events or quizzes:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEventsAndQuizzes();
//   }, []);

//   console.log(allEvents, "All EVENT");
//   console.log(allQuizzes, "all");

//   if (loading) return <div>Loading events and quizzes...</div>;

//   return (
//     <div>
//       <h2>All Quizzes</h2>
//       {allQuizzes.length === 0 ? (
//         <p>No quizzes found</p>
//       ) : (
//         <ul>
//           {allQuizzes.map((quiz) => (
//             <li key={quiz._id}>{quiz.title}</li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { api } from "@/data/api";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

import { Clock, Calendar, Trophy, BookOpen, Users, Star } from "lucide-react"; // adjust icons import as needed
import ParticipateQuiz from "../shared/ParticipateQuiz";

export default function QuizzesBasedOnEvent({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventAndQuizzes = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch single event
        const eventRes = await fetch(`${api}/events/${eventId}`);
        const eventData = await eventRes.json();
        setEvent(eventData.data || null);

        // Fetch quizzes for this event
        const quizRes = await fetch(
          `${api}/quizzes/event/${eventId}?populate=eventId`
        );
        const quizData = await quizRes.json();
        setQuizzes(quizData.data || []);
      } catch (err: any) {
        setError("Failed to fetch event or quizzes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndQuizzes();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F06122] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#232323] mb-2">
            Loading Event...
          </h3>
          <p className="text-gray-500">
            Please wait while we fetch the details
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#232323] mb-3">
            Error Loading Event
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href={`/`}>
            <button className="w-full bg-[#232323] text-white py-2 rounded-lg hover:bg-[#F06122] transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-[#232323] mb-3">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/">
            <button className="w-full bg-[#232323] text-white py-2 rounded-lg hover:bg-[#F06122] transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#F06122] rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#232323]">
                  {event.title}
                </h1>
              </div>
              <p className="text-gray-600 mb-3">{event.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(event.startDate), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(event.startDate), "h:mm a")} -{" "}
                    {format(new Date(event.endDate), "h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.participants?.length || 0} Participants</span>
                </div>
              </div>
            </div>
            <div className="bg-[#232323] text-white px-4 py-2 rounded-lg text-sm font-medium">
              Live Event
            </div>
          </div>
        </div>

        {/* Quizzes Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#232323] mb-2">
              Available Quizzes
            </h2>
            <p className="text-gray-600">Choose a quiz to start your journey</p>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#232323] mb-2">
                No Quizzes Available
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There are no quizzes for this event yet. Check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="border border-gray-200 bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-[#232323] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#F06122] rounded flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-white font-semibold line-clamp-1">
                        {quiz.title}
                      </h3>
                    </div>
                    {quiz.instructions && (
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {quiz.instructions}
                      </p>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F06122]" />
                      <span>{quiz.duration} Minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-600" />
                      <span>{quiz.totalMarks} Total Marks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-purple-600" />
                      <span>{quiz.passingMarks} Passing Marks</span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <ParticipateQuiz
                      quizId={quiz._id}
                      quizTitle={quiz.title}
                      duration={quiz.duration}
                      totalMarks={quiz.totalMarks ?? 0}
                      passingMarks={quiz.passingMarks ?? 0}
                      eventId={eventId}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
