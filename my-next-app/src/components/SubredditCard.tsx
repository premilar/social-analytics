import React from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

interface SubredditCardProps {
  name: string;
  description: string;
}

const SubredditCard: React.FC<SubredditCardProps> = ({ name, description }) => {
  const router = useRouter();

  const handleClick = () => {
    console.log('Navigating to subreddit:', name);
    router.push(`/${name}`); // Adjust the path as needed
  };

  return (
    <div
      className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default SubredditCard;
