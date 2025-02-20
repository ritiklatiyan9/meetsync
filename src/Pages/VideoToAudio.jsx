import React, { useState } from 'react';

const VideoToAudioPage = ({ initialVideoUrl = '' }) => {
    const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
    const [audioUrl, setAudioUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
  
    const extractAudioFromVideo = async (videoUrl) => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:5000/api/extract-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: videoUrl }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to extract audio');
        }
  
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        setAudioUrl(audioUrl);
      } catch (err) {
        setError(err.message || 'Error extracting audio');
      } finally {
        setLoading(false);
      }
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!videoUrl) {
        setError('Please provide a valid video URL');
        return;
      }
      extractAudioFromVideo(videoUrl);
    };
  
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Video to Audio Analysis</h1>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Enter Cloudinary Video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
            >
              {loading ? 'Extracting...' : 'Extract Audio'}
            </button>
          </div>
        </form>
  
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
            Extracting audio... This may take a few moments.
          </div>
        )}
  
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
  
        {audioUrl && (
          <div className="mb-6 p-4 bg-green-50 rounded-md">
            <h3 className="font-semibold mb-2">Extracted Audio</h3>
            <audio controls src={audioUrl} className="w-full mb-4" />
            <div className="flex gap-4">
              <a
                href={audioUrl}
                download="extracted-audio.mp3"
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300"
              >
                Download MP3
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(audioUrl)}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Copy URL
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

export default VideoToAudioPage;