import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { create } from 'zustand';

// Shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ----------------------
// Cloudinary Configuration
// ----------------------
const CLOUDINARY_CLOUD_NAME = 'dfnxjk10i';
const CLOUDINARY_API_KEY = '891193764188835';
const CLOUDINARY_API_SECRET = 's9y3AkhTAu7XR9u_c67n1KUy2_o';

// ----------------------
// ZUSTAND STORE SETUP
// ----------------------
const useStore = create((set) => ({
  isAdmin: false,
  roomId: '',
  streams: [],
  setRoomId: (id) => set({ roomId: id }),
  setIsAdmin: (flag) => set({ isAdmin: flag }),
  addStream: (newStream) =>
    set((state) => {
      if (!newStream) return {};
      const alreadyExists = state.streams.some((stream) => stream.id === newStream.id);
      if (!alreadyExists) {
        return { streams: [...state.streams, newStream] };
      }
      return {};
    }),
  reset: () =>
    set({
      isAdmin: false,
      roomId: '',
      streams: [],
    }),
}));

// -------------------------
// HOME (CREATE/JOIN MEETING)
// -------------------------
const Home = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { setRoomId, setIsAdmin } = useStore();

  const createRoom = () => {
    if (!name) {
      alert("Please enter your name");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    setRoomId(id);
    setIsAdmin(true);
  };

  const joinRoom = () => {
    if (!name || !roomCode) {
      alert("Please enter your name and room code");
      return;
    }
    setRoomId(roomCode);
    setIsAdmin(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-[350px] bg-gray-900 text-white shadow-2xl rounded-xl border border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Video Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <Input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-400 border-gray-700"
            />
            <div className="flex flex-col space-y-1.5">
              <Button 
                onClick={createRoom}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                Create New Meeting
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">OR</span>
                </div>
              </div>
              <Input
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="bg-gray-800 text-white placeholder-gray-400 border-gray-700"
              />
              <Button 
                onClick={joinRoom}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                Join Meeting
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ---------------------
// MEETING PAGE LOGIC
// ---------------------
const MeetingPage = () => {
  const { isAdmin, roomId, streams } = useStore();
  const [localStream, setLocalStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadUrl, setUploadUrl] = useState(null);
  const peerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // Helper to compute SHA-1 hash using SubtleCrypto
  const computeSHA1 = async (message) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Upload video blob to Cloudinary
  const uploadVideoToCloudinary = async (blob, mimeType) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
      const signature = await computeSHA1(paramsToSign);

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      const uploadEndpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      const dataRes = await response.json();
      if (dataRes.secure_url) {
        console.log("Upload successful:", dataRes.secure_url);
        return dataRes.secure_url;
      } else {
        console.error("Upload failed:", dataRes);
        return null;
      }
    } catch (err) {
      console.error("Error uploading video:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get local media stream (camera/mic)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!mounted) return;
        setLocalStream(stream);
        useStore.getState().addStream(stream);

        // Create Peer connection:
        const peer = isAdmin ? new Peer(roomId) : new Peer();
        peerRef.current = peer;

        peer.on('open', (id) => {
          console.log("Peer opened with id:", id);

          if (isAdmin) {
            peer.on('call', (call) => {
              call.answer(stream);
              call.on('stream', (remoteStream) => {
                useStore.getState().addStream(remoteStream);
              });
            });
          } else {
            const call = peer.call(roomId, stream);
            call.on('stream', (remoteStream) => {
              useStore.getState().addStream(remoteStream);
            });
          }
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    return () => {
      mounted = false;
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isAdmin, roomId]);

  // ---------------------
  // START RECORDING WITH VOICE MIXING
  // ---------------------
  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true
      });
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      if (displayStream.getAudioTracks().length > 0) {
        const displayAudioSource = audioContext.createMediaStreamSource(
          new MediaStream(displayStream.getAudioTracks())
        );
        displayAudioSource.connect(destination);
      }

      if (micStream.getAudioTracks().length > 0) {
        const micAudioSource = audioContext.createMediaStreamSource(
          new MediaStream(micStream.getAudioTracks())
        );
        micAudioSource.connect(destination);
      }

      await audioContext.resume();

      const combinedStream = new MediaStream();
      displayStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
      destination.stream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));

      const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
        ? 'video/webm; codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : '';
      if (!mimeType) {
        alert("No supported MIME type found for recording");
        return;
      }

      mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType });
      recordedChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunks.current, { type: mimeType });
        const uploadedVideoUrl = await uploadVideoToCloudinary(blob, mimeType);
        if (uploadedVideoUrl) {
          setUploadUrl(uploadedVideoUrl);
          alert(`Meeting recorded and uploaded successfully. Video URL: ${uploadedVideoUrl}`);
        } else {
          alert("Recording finished, but upload failed.");
        }
        recordedChunks.current = [];
      };

      mediaRecorderRef.current.onerror = (errorEvent) => {
        console.error("Recording error:", errorEvent);
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting display recording:", error);
    }
  };

  // ---------------------
  // STOP RECORDING
  // ---------------------
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ---------------------
  // END MEETING
  // ---------------------
  const endMeeting = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      stopRecording();
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    useStore.getState().reset();
  };

  return (
    <div className="p-20 bg-black text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Room id: {roomId}</h1>
        {isAdmin && (
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigator.clipboard.writeText(roomId)}
              className="border-gray-500 text-black"
            >
              Copy Link
            </Button>
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            <Button 
              variant="destructive" 
              onClick={endMeeting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              End Meeting
            </Button>
          </div>
        )}
      </div>
      {uploadUrl && (
        <div className="mb-4">
          <p className="text-green-400">
            Uploaded Video URL:{" "}
            <a href={uploadUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {uploadUrl}
            </a>
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streams.map((stream, index) => (
          <Video key={index} stream={stream} isLocal={stream === localStream} />
        ))}
      </div>
      {uploadUrl && (
        <div className="mt-8">
          <VideoToAudioPage initialVideoUrl={uploadUrl} />
        </div>
      )}
    </div>
  );
};

// --------------
// VIDEO TILE COMPONENT
// --------------
const Video = ({ stream, isLocal }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className="w-full h-auto rounded-lg bg-gray-800"
    />
  );
};

// -----------------------
// VIDEO TO AUDIO COMPONENT
// -----------------------
// This component now accepts an initialVideoUrl prop to prefill the input.
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
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Video to Audio Analysis</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Enter Cloudinary Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
          >
            {loading ? 'Extracting...' : 'Extract Audio'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="mb-4 p-4 bg-blue-900 text-blue-300 rounded-md">
          Extracting audio... This may take a few moments.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-900 text-red-300 rounded-md">
          {error}
        </div>
      )}

      {audioUrl && (
        <div className="mb-6 p-4 bg-green-900 rounded-md">
          <h3 className="font-semibold mb-2">Extracted Audio</h3>
          <audio controls src={audioUrl} className="w-full mb-4" />
          <div className="flex gap-4">
            <a
              href={audioUrl}
              download="extracted-audio.mp3"
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
            >
              Download MP3
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(audioUrl)}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Copy URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Dummy AudioToSummary component (replace with your actual implementation)
const AudioToSummary = ({ audioUrl }) => {
  return (
    <div className="mt-4 p-4 bg-gray-800 text-white rounded shadow">
      <h2 className="text-xl font-semibold">Audio Summary</h2>
      <p>Summary for audio at: {audioUrl}</p>
    </div>
  );
};

// -----------------------
// APP (ROOT COMPONENT)
// -----------------------
export default function App() {
  const { roomId } = useStore();
  return roomId ? <MeetingPage /> : <Home />;
}
