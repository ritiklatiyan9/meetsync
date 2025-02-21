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
  userName: '',
  localPeerId: '',
  participants: [],
  streams: [],
  setRoomId: (id) => set({ roomId: id }),
  setIsAdmin: (flag) => set({ isAdmin: flag }),
  setUserName: (name) => set({ userName: name }),
  setLocalPeerId: (id) => set({ localPeerId: id }),
  addParticipant: (participant) =>
    set((state) => {
      if (!participant) return {};
      const exists = state.participants.some(p => p.id === participant.id);
      return exists ? {} : { participants: [...state.participants, participant] };
    }),
  removeParticipant: (participantId) =>
    set((state) => ({
      participants: state.participants.filter(p => p.id !== participantId)
    })),
  addStream: (newStream) =>
    set((state) => {
      if (!newStream) return {};
      const exists = state.streams.some(stream => stream.id === newStream.id);
      return exists ? {} : { streams: [...state.streams, newStream] };
    }),
  reset: () => set({
    isAdmin: false,
    roomId: '',
    userName: '',
    participants: [],
    localPeerId: '',
    streams: []
  }),
}));

// -------------------------
// HOME COMPONENT
// -------------------------
const Home = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { setRoomId, setIsAdmin, setUserName } = useStore();

  const createRoom = () => {
    if (!name) {
      alert("Please enter your name");
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    setRoomId(id);
    setIsAdmin(true);
    setUserName(name);
  };

  const joinRoom = () => {
    if (!name || !roomCode) {
      alert("Please enter your name and room code");
      return;
    }
    setRoomId(roomCode);
    setIsAdmin(false);
    setUserName(name);
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
// MEETING PAGE COMPONENT
// ---------------------
const MeetingPage = () => {
  const { isAdmin, roomId, userName, participants, localPeerId, 
          addParticipant, removeParticipant, reset, setLocalPeerId,
          streams, addStream } = useStore();
  const [localStream, setLocalStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadUrl, setUploadUrl] = useState(null);
  const peerRef = useRef(null);
  const connectionsRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // Cloudinary Upload Functions
  const computeSHA1 = async (message) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const uploadVideoToCloudinary = async (blob) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
      const signature = await computeSHA1(paramsToSign);

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: 'POST', body: formData }
      );
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  // Recording Functions
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

      const combinedStream = new MediaStream();
      displayStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      destination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

      const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
        ? 'video/webm; codecs=vp9' 
        : 'video/webm';

      mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType });
      recordedChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunks.current, { type: mimeType });
        const url = await uploadVideoToCloudinary(blob);
        setUploadUrl(url);
        recordedChunks.current = [];
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // PeerJS Connection Management
  useEffect(() => {
    let mounted = true;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (!mounted) return;
        setLocalStream(stream);
        addStream(stream);

        const peer = isAdmin ? new Peer(roomId) : new Peer();
        peerRef.current = peer;
        setLocalPeerId(peer.id);

        addParticipant({
          id: peer.id,
          name: userName,
          stream: stream,
          isAdmin: isAdmin
        });

        peer.on('open', (id) => {
          if (isAdmin) {
            peer.on('call', call => {
              call.answer(stream);
              call.on('stream', remoteStream => {
                addParticipant({
                  id: call.peer,
                  name: call.metadata.userName,
                  stream: remoteStream,
                  isAdmin: false
                });
                addStream(remoteStream);
              });
              connectionsRef.current.push(call);
            });
          } else {
            const call = peer.call(roomId, stream, {
              metadata: { userName: userName }
            });
            call.on('stream', remoteStream => {
              addParticipant({
                id: call.peer,
                name: 'Host',
                stream: remoteStream,
                isAdmin: true
              });
              addStream(remoteStream);
            });
            connectionsRef.current.push(call);
          }
        });

        peer.on('connection', conn => {
          conn.on('data', data => {
            if (data.type === 'remove-user' && data.userId === peer.id) {
              endMeeting();
            }
          });
        });

        peer.on('error', error => {
          console.error('PeerJS error:', error);
        });

      })
      .catch(error => console.error("Media error:", error));

    return () => {
      mounted = false;
      if (peerRef.current) peerRef.current.destroy();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      connectionsRef.current.forEach(conn => conn.close());
    };
  }, []);

  const removeUser = (participantId) => {
    if (!isAdmin) return;
    
    const conn = peerRef.current.connect(participantId);
    conn.send({ type: 'remove-user', userId: participantId });
    
    connectionsRef.current = connectionsRef.current.filter(c => c.peer !== participantId);
    removeParticipant(participantId);
  };

  const endMeeting = () => {
    if (isAdmin) {
      participants.forEach(p => {
        if (p.id !== localPeerId) {
          const conn = peerRef.current.connect(p.id);
          conn.send({ type: 'remove-user', userId: p.id });
        }
      });
    }
    
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (peerRef.current) peerRef.current.destroy();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    connectionsRef.current.forEach(conn => conn.close());
    reset();
  };

  return (
    <div className="p-4  md:p-10 lg:p-20 bg-black text-white min-h-screen">
    <div className="flex md:mt-0 mt-20 flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
      <div>
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold">Room ID: {roomId}</h1>
        <p className="text-gray-400 text-sm md:text-base">Your Name: {userName}</p>
      </div>
      <div className="space-x-2 flex flex-wrap">
        {isAdmin && (
          <>
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          </>
        )}
        <Button 
          variant="destructive" 
          onClick={endMeeting}
          className="bg-red-600 hover:bg-red-700"
        >
          End Meeting
        </Button>
      </div>
    </div>
  
    {uploadUrl && (
      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
        <p className="text-green-400">
          Recording URL:{" "}
          <a href={uploadUrl} target="_blank" rel="noopener noreferrer" className="underline">
            {uploadUrl}
          </a>
        </p>
      </div>
    )}
  
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {participants.map((participant) => (
        <div key={participant.id} className="relative">
          <Video 
            stream={participant.stream} 
            isLocal={participant.id === localPeerId}
          />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded">
            {participant.id === localPeerId ? 'You' : participant.name}
            {participant.isAdmin && ' (Host)'}
          </div>
          {isAdmin && participant.id !== localPeerId && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => removeUser(participant.id)}
            >
              Remove
            </Button>
          )}
        </div>
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

// -----------------------
// VIDEO COMPONENT
// -----------------------
const Video = ({ stream, isLocal }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
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

      if (!response.ok) throw new Error('Extraction failed');
      
      const blob = await response.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Audio Extraction</h1>
      <div className="flex gap-4 mb-4">
        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter video URL"
          className="bg-gray-700 text-white"
        />
        <Button 
          onClick={() => extractAudioFromVideo(videoUrl)}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Extract Audio'}
        </Button>
      </div>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {audioUrl && (
        <div className="space-y-4">
          <audio controls src={audioUrl} className="w-full" />
          <Button 
            onClick={() => window.open(audioUrl)}
            className="bg-green-600 hover:bg-green-700"
          >
            Download Audio
          </Button>
        </div>
      )}
    </div>
  );
};

// -----------------------
// APP COMPONENT
// -----------------------
export default function App() {
  const { roomId } = useStore();
  return roomId ? <MeetingPage /> : <Home />;
} 