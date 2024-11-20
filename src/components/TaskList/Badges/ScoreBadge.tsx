import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  max: number;
  variant?: "priority" | "progress";
  className?: string;
}

const ScoreBadge = ({ score, max, variant = "priority", className }: ScoreBadgeProps) => {
  const getPriorityColor = (score: number) => {
    // Reversed color scale: red (0) to green (10)
    const colors = {
      0: "#f87171", // Red
      2.5: "#fb923c", // Orange
      5: "#fde047", // Yellow
      7.5: "#86efac", // Light green
      10: "#4ade80", // Green
    };

    const colorPoints = Object.entries(colors).map(([score, color]) => ({
      score: parseFloat(score),
      color,
    }));

    const lowerColor = colorPoints.reduce((prev, curr) => {
      return curr.score <= score && curr.score > prev.score ? curr : prev;
    }, colorPoints[0]);

    return lowerColor.color;
  };

  const getProgressColor = (progress: number) => {
    return {
      background: 'rgba(21, 66, 115, 0.1)', // Subtle bluish background
      text: '#154273' // Primary blue for text
    };
  };

  const isProgress = variant === "progress";
  const normalizedScore = isProgress ? score : (score / max) * 10;
  const colors = isProgress ? getProgressColor(score) : {
    background: `${getPriorityColor(normalizedScore)}20`,
    text: getPriorityColor(normalizedScore)
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center w-13 h-13 rounded-full text-base font-bold",
        className
      )}
      style={{ 
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      {isProgress ? `${score}%` : score}
    </div>
  );
};

export default ScoreBadge;