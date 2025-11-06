/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Skeleton } from "@/components/ui/skeleton";
// import { RankBadge } from "./RankBadge";
// import { motion, AnimatePresence } from "framer-motion";
// import { api } from "@/data/api";

// interface Leader {
//   _id: string;
//   user: { fullNameEnglish: string; contact?: string };
//   obtainedMarks: number;
//   rank: number;
//   percentile: number;
// }

// export default function LeaderboardTable({ quizId }: { quizId: string }) {
//   const [leaders, setLeaders] = useState<Leader[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchLeaderboard() {
//       try {
//         const res = await fetch(`/${api}/participations/quiz/${quizId}/leaderboard`);
//         const data = await res.json();
//         setLeaders(data.data || []);
//       } catch (error) {
//         console.error("Failed to fetch leaderboard:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchLeaderboard();
//   }, [quizId]);

//   if (loading)
//     return (
//       <Card className="max-w-4xl mx-auto mt-10 p-4">
//         <CardHeader>
//           <CardTitle className="text-xl font-bold">Leaderboard</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-3">
//             {[1, 2, 3, 4, 5].map((i) => (
//               <Skeleton key={i} className="h-10 w-full" />
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     );

//   return (
//     <Card className="max-w-5xl mx-auto mt-10 shadow-xl border border-slate-200">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold text-center">
//           🏆 Quiz Leaderboard
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="overflow-x-auto rounded-md">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-16">Rank</TableHead>
//                 <TableHead>Participant</TableHead>
//                 <TableHead className="text-right">Score</TableHead>
//                 <TableHead className="text-right">Percentile</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               <AnimatePresence>
//                 {leaders.map((leader) => (
//                   <motion.tr
//                     key={leader._id}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.2 }}
//                     className="hover:bg-slate-50"
//                   >
//                     <TableCell>
//                       <RankBadge rank={leader.rank} />
//                     </TableCell>
//                     <TableCell className="font-medium">
//                       {leader.user?.fullNameEnglish}
//                     </TableCell>
//                     <TableCell className="text-right font-semibold">
//                       {leader.obtainedMarks}
//                     </TableCell>
//                     <TableCell className="text-right text-slate-600">
//                       {leader.percentile}%
//                     </TableCell>
//                   </motion.tr>
//                 ))}
//               </AnimatePresence>
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }








"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  quizId: string;
  quizTitle?: string;
}

const LeaderboardTable = ({ quizId, quizTitle }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(
          `/api/participations/quiz/${quizId}/leaderboard`
        );
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [quizId]);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );

  if (leaderboard.length === 0)
    return (
      <p className="text-center text-gray-500 py-6">No participants yet.</p>
    );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">Rank</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((p, index) => {
            const rank = index + 1;
            const user = p.user || {};
            const isTop3 = rank <= 3;

            return (
              <TableRow
                key={p._id}
                className={cn(
                  isTop3 ? "bg-gradient-to-r from-indigo-50 to-purple-50" : ""
                )}
              >
                <TableCell className="text-center font-semibold">
                  {isTop3 ? (
                    <div className="flex justify-center items-center">
                      <Trophy
                        className={cn(
                          "h-5 w-5",
                          rank === 1
                            ? "text-yellow-500"
                            : rank === 2
                            ? "text-gray-400"
                            : "text-amber-700"
                        )}
                      />
                      <span className="ml-2">{rank}</span>
                    </div>
                  ) : (
                    rank
                  )}
                </TableCell>

                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar || ""} />
                    <AvatarFallback>
                      {user.fullNameEnglish?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.fullNameEnglish || user.fullNameBangla || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.contact || ""}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="font-semibold text-indigo-600">
                  {p.obtainedMarks} / {p.totalMarks}
                </TableCell>

                <TableCell>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      p.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    )}
                  >
                    {p.status}
                  </span>
                </TableCell>

                <TableCell>
                  {p.timeSpent ? `${Math.round(p.timeSpent / 60)} min` : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;

