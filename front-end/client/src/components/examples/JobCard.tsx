import JobCard from '../JobCard';

export default function JobCardExample() {
  const mockJob = {
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
  };

  return (
    <div className="p-6">
      <JobCard 
        job={mockJob} 
        isSelected={false} 
        onClick={() => console.log('Job clicked')} 
      />
    </div>
  );
}
