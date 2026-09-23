import React, { useEffect, useState } from "react";
import { supabaseSelect } from "../../lib/supabaseClient";
import { useGame } from "@/src/context/GameContext";

interface LeaderboardRow {
  user_name: string;
  user_city: string;
  personality: string | null;
  total_score: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  city: string;
  archetype: string;
  score: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state } = useGame();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    supabaseSelect<LeaderboardRow>("game_results", {
      columns: "user_name,user_city,personality,total_score",
      orderBy: "total_score",
      ascending: false,
      limit: 10,
    })
      .then((rows) => {
        setEntries(
          rows.map((row, i) => ({
            rank: i + 1,
            name: row.user_name,
            city: row.user_city,
            archetype: row.personality ?? "—",
            score: row.total_score,
          })),
        );
      })
      .catch((err) => console.error("Failed to load leaderboard:", err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;
  // ...rest of JSX unchanged, map over `entries` and show a loading state while `loading` is true
};
