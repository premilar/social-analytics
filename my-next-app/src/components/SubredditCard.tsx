import React from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface SubredditCardProps {
  name: string;
  description?: string;
}

const SubredditCard: React.FC<SubredditCardProps> = ({ name, description }) => {
  const router = useRouter();

  const handleClick = () => {
    console.log('Navigating to subreddit:', name);
    router.push(`/${name}`); // Adjust the path as needed
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
      onClick={handleClick}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-indigo-800 to-blue-800 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-[url('/path-to-your-pattern.svg')] opacity-10"></div>

      {/* Content */}
      <CardHeader className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white tracking-wide">
            <span className="text-purple-300">r/</span>
            {name}
          </CardTitle>
          <ChevronRight className="text-gray-300 group-hover:text-white transition-colors duration-300 h-6 w-6" />
        </div>
        <CardDescription className="text-gray-200 mt-4 leading-relaxed">
          {description || 'No description available.'}
        </CardDescription>
      </CardHeader>

      {/* Border Glow Effect */}
      <div className="absolute inset-0 border border-transparent group-hover:border-purple-500 rounded-lg transition-colors duration-300 pointer-events-none"></div>
    </Card>
  );
};

export default SubredditCard;
