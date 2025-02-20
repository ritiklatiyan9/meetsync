import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

const AudioToSummary = ({ audioUrl }) => { 
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const GEMINI_API_KEY = 'AIzaSyD4TakmtotvvcIvOp_mdAXam2srVdoSAjk';

  useEffect(() => {
    if (audioUrl) {
      handleAudioProcessing();
    }
  }, [audioUrl]);

  const handleAudioProcessing = async () => {
    setLoading(true);
    setError('');
    try {
      // Verify audio URL
      if (!audioUrl.startsWith('http')) {
        throw new Error('Invalid audio URL');
      }

      // Fetch audio content
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('Failed to fetch audio');
      
      const blob = await response.blob();
      
      // Convert to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result && reader.result.toString().split(',')[1];
            if (!base64Audio) throw new Error('Failed to read audio file');

            // Send to Gemini
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    parts: [
                      {
                        fileData: {
                          mimeType: "audio/webm",
                          data: base64Audio
                        }
                      },
                      {
                        text: "Transcribe this meeting audio and create a detailed summary with key action items. Format:\nTranscript: [full transcription]\nSummary: [bullet points]"
                      }
                    ]
                  }]
                })
              }
            );

            if (!geminiResponse.ok) {
              const errorData = await geminiResponse.json();
              throw new Error(
                (errorData.error && errorData.error.message) || 'API request failed'
              );
            }

            const data = await geminiResponse.json();
            const responseText = data.candidates[0].content.parts[0].text;
            
            // Improved parsing
            const transcriptMatch = responseText.match(/Transcript:\s*([\s\S]*?)(\nSummary:|$)/i);
            const summaryMatch = responseText.match(/Summary:\s*([\s\S]*)/i);

            setTranscript(transcriptMatch ? transcriptMatch[1].trim() : '');
            setSummary(summaryMatch ? summaryMatch[1].trim() : '');
            
            if (!transcriptMatch && !summaryMatch) {
              setError('Unexpected response format from AI');
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Unknown error');
          } finally {
            setLoading(false);
            resolve();
          }
        };
        reader.readAsDataURL(blob);
      });
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Meeting Analysis</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
          Analyzing audio... This may take up to 30 seconds
        </div>
      )}

      {transcript && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-2">Full Transcript</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{transcript}</p>
        </div>
      )}

      {summary && (
        <div className="p-4 bg-green-50 rounded-md">
          <h3 className="font-semibold mb-2">Key Insights</h3>
          <div 
            className="text-gray-800 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: summary
                .split('\n')
                .map(line => 
                  line.startsWith('-') || line.startsWith('•') 
                    ? `<div class="ml-4">${line}</div>` 
                    : line
                )
                .join('<br>')
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AudioToSummary;
