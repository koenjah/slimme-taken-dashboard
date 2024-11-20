import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  max: number;
  variant?: "priority" | "progress";
  size?: "sm" | "lg";
  className?: string;
}

const ScoreBadge = ({ score, max, variant = "priority", size = "lg", className }: ScoreBadgeProps) => {
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
    return `rgba(${progress < 50 ? '156, 163, 175' : '107, 114, 128'}, 0.2)`;
  };

  const isProgress = variant === "progress";
  const normalizedScore = isProgress ? score : (score / max) * 10;
  const backgroundColor = isProgress ? getProgressColor(score) : `${getPriorityColor(normalizedScore)}20`;
  const textColor = isProgress ? 'text-gray-600' : getPriorityColor(normalizedScore);

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl"
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold",
        sizeClasses[size],
        className
      )}
      style={{ 
        backgroundColor,
        color: textColor,
      }}
    >
      {isProgress ? `${score}%` : score}
    </div>
  );
};

export default ScoreBadge;