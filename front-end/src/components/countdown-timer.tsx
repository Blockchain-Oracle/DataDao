import Countdown from "react-countdown";

interface CountdownTimerProps {
  deadline: number | string;
  className?: string;
}

export function CountdownTimer({ deadline, className }: CountdownTimerProps) {
  // Convert deadline to timestamp if it's not already
  const deadlineDate =
    typeof deadline === "string"
      ? new Date(deadline).getTime()
      : Number(deadline) * 1000; // Convert from seconds to milliseconds

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return <span className="text-red-500">Expired</span>;
    }

    return (
      <div className={className}>
        {days > 0 && <span>{days}d </span>}
        <span>{hours}h </span>
        <span>{minutes}m </span>
        <span>{seconds}s</span>
      </div>
    );
  };

  return <Countdown date={deadlineDate} renderer={renderer} />;
}
