import { useState } from 'react';
import JobList from '../JobList';

export default function JobListExample() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const mockJobs = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      salary: '$120k - $180k',
      postedDate: '2 days ago',
      latitude: 37.7749,
      longitude: -122.4194,
      distance: 5.2,
      description: 'We are looking for an experienced software engineer to join our team...'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Startup Inc',
      location: 'Oakland, CA',
      salary: '$100k - $150k',
      postedDate: '1 week ago',
      latitude: 37.8044,
      longitude: -122.2712,
      distance: 12.5,
      description: 'Join our product team to drive innovation and growth...'
    }
  ];

  return (
    <div className="p-6">
      <JobList 
        jobs={mockJobs} 
        selectedJobId={selectedJobId} 
        onJobSelect={setSelectedJobId} 
      />
    </div>
  );
}
