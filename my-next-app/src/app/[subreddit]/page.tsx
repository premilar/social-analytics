import React, { use } from 'react';
import Tabs from '../../components/Tabs';

interface SubredditDetailPageProps {
  params: Promise<{ subreddit: string }>;
}

const SubredditDetailPage = ({ params }: SubredditDetailPageProps) => {
  const resolvedParams = use(params);
  const { subreddit } = resolvedParams;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Subreddit: {subreddit}</h1>
      <Tabs subreddit={subreddit} />
    </div>
  );
};

export default SubredditDetailPage;
