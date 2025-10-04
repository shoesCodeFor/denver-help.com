import { useEffect, useRef } from "react";
import JobCard from "./JobCard";
import type { Job } from "@shared/schema";

interface JobListProps {
  jobs: Job[];
  selectedJobId: string | null;
  onJobSelect: (jobId: string) => void;
}

export default function JobList({ jobs, selectedJobId, onJobSelect }: JobListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCardRef.current && selectedJobId) {
      selectedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedJobId]);

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No jobs found</p>
          <p className="text-sm mt-2">Try searching for a different city or increasing the radius</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={listRef} className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground mb-4">
        {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
      </div>
      {jobs.map((job) => (
        <div
          key={job.id}
          ref={selectedJobId === job.id ? selectedCardRef : null}
        >
          <JobCard
            job={job}
            isSelected={selectedJobId === job.id}
            onClick={() => onJobSelect(job.id)}
          />
        </div>
      ))}
    </div>
  );
}
