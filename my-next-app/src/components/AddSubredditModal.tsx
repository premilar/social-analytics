import React, { useState } from 'react';

interface AddSubredditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubreddit: (subreddit: string) => void;
}

const AddSubredditModal: React.FC<AddSubredditModalProps> = ({ isOpen, onClose, onAddSubreddit }) => {
  const [subredditUrl, setSubredditUrl] = useState('');

  const handleAdd = () => {
    const subredditName = extractSubredditName(subredditUrl) || subredditUrl.trim();
    if (subredditName) {
      onAddSubreddit(subredditName);
      setSubredditUrl('');
      onClose();
    } else {
      alert('Please enter a valid subreddit name or URL.');
    }
  };

  const extractSubredditName = (url: string) => {
    const match = url.match(/reddit\.com\/r\/([^/]+)/);
    return match ? match[1] : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add New Subreddit</h2>
        <input
          type="text"
          value={subredditUrl}
          onChange={(e) => setSubredditUrl(e.target.value)}
          placeholder="Enter subreddit URL"
          className="border p-2 w-full mb-4"
        />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Add
        </button>
        <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddSubredditModal;
