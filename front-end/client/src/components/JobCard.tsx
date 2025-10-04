import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { Job } from "@shared/schema";

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onClick: () => void;
}

export default function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const handleClick = () => {
    console.log('Job card clicked:', job.id, job.title);
    onClick();
  };

  return (
    <Card
      data-testid={`card-job-${job.id}`}
      onClick={handleClick}
      aria-selected={isSelected}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`p-4 cursor-pointer transition-all hover-elevate active-elevate-2 ${
        isSelected ? "border-l-4 border-l-primary" : ""
      }`}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg text-foreground">
          {job.title}
        </h3>
        <p className="text-sm text-muted-foreground">{job.company}</p>
        
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{job.location} ({job.distance.toFixed(1)} mi)</span>
          </div>
          
          {job.salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>{job.salary}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{job.postedDate}</span>
          </div>
        </div>
        
        <p className="text-sm text-foreground mt-2 line-clamp-2">
          {job.description}
        </p>
      </div>
    </Card>
  );
}
