import { supabaseServer } from '../lib/supabaseServerClient'; // Import the server-side Supabase client
import MainPage from '../components/MainPage'; // Import the client component

const Home = async () => {
  // Fetch subreddits from Supabase
  const { data: subreddits, error } = await supabaseServer
    .from('subreddits')
    .select('*');

  if (error) {
    console.error('Error fetching subreddits:', error);
    return <div>Error loading subreddits</div>;
  }

  return <MainPage initialSubreddits={subreddits} />;
};

export default Home;
