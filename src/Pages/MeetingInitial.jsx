import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "peerjs";
import { create } from "zustand";
import {
  Video as VideoIcon,
  Copy,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff,
} from "lucide-react";

// Shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Cloudinary Config
const CLOUDINARY_CLOUD_NAME = "dfnxjk10i";
const CLOUDINARY_API_KEY = "891193764188835";
const CLOUDINARY_API_SECRET = "s9y3AkhTAu7XR9u_c67n1KUy2_o";

const user = {
  role: "admin",
};

// Zustand Store
const useStore = create((set) => ({
  isAdmin: false,
  roomId: "",
  userName: "",
  localPeerId: "",
  participants: [],
  streams: [],
  setRoomId: (id) => set({ roomId: id }),
  setIsAdmin: (flag) => set({ isAdmin: flag }),
  setUserName: (name) => set({ userName: name }),
  setLocalPeerId: (id) => set({ localPeerId: id }),
  addParticipant: (participant) =>
    set((state) => {
      if (
        !participant ||
        state.participants.some((p) => p.id === participant.id)
      )
        return {};
      return { participants: [...state.participants, participant] };
    }),
  removeParticipant: (participantId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
    })),
  addStream: (newStream) =>
    set((state) => {
      if (
        !newStream ||
        state.streams.some((stream) => stream.id === newStream.id)
      )
        return {};
      return { streams: [...state.streams, newStream] };
    }),
  reset: () =>
    set({
      isAdmin: false,
      roomId: "",
      userName: "",
      participants: [],
      localPeerId: "",
      streams: [],
    }),
}));

// Home Component
const Home = () => {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const { setRoomId, setIsAdmin, setUserName } = useStore();

  const createRoom = () => {
    if (!name) return alert("Please enter your name");
    const id = Math.random().toString(36).substr(2, 9);
    setRoomId(id);
    setIsAdmin(true);
    setUserName(name);
  };

  const joinRoom = () => {
    if (!name || !roomCode) return alert("Please enter name and room code");
    setRoomId(roomCode);
    setIsAdmin(false);
    setUserName(name);
  };

  let user = { role: null }; // Default value
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Error parsing user data:", error);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
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
                disabled={user.role !== "admin"} // Disable if role is not 'admin'
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

// Meeting Component
const MeetingPage = () => {
  const {
    isAdmin,
    roomId,
    userName,
    participants,
    localPeerId,
    addParticipant,
    removeParticipant,
    reset,
    setLocalPeerId,
    streams,
    addStream,
  } = useStore();
  const [localStream, setLocalStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [uploadUrl, setUploadUrl] = useState(null);
  const peerRef = useRef(null);
  const connectionsRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  // Cloudinary Functions
  const computeSHA1 = async (message) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const uploadVideoToCloudinary = async (blob) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
      const signature = await computeSHA1(paramsToSign);

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("api_key", CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: "POST", body: formData }
      );

      return await response.json();
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const startAutoProcessing = useCallback(async (videoUrl) => {
    setShowProcessingModal(true);
    let transcriptText = "";
    let summaryText = "";
    let meetingTitle = "";

    try {
      // Step 1: Transcribe with AssemblyAI
      setProcessingStep("Starting transcription...");
      setProcessingProgress(10);

      const transcriptResponse = await fetch(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            Authorization: "a4bcecf25bbd4dd5949fe2721ec15d8a",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio_url: videoUrl,
            speaker_labels: true,
            language_code: "en_us",
          }),
        }
      );

      if (!transcriptResponse.ok)
        throw new Error("Transcription failed to start");

      const { id } = await transcriptResponse.json();
      let transcriptResult;
      let attempts = 0;
      const maxAttempts = 30;

      // Poll for transcription completion
      while (attempts < maxAttempts) {
        setProcessingStep(`Transcribing (${attempts}/${maxAttempts})...`);
        setProcessingProgress(10 + Math.floor((attempts / maxAttempts) * 50));

        const pollResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${id}`,
          {
            headers: { Authorization: "a4bcecf25bbd4dd5949fe2721ec15d8a" },
          }
        );

        transcriptResult = await pollResponse.json();

        if (transcriptResult.status === "completed") break;
        if (transcriptResult.status === "error")
          throw new Error(transcriptResult.error);

        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }

      if (attempts === maxAttempts) throw new Error("Transcription timed out");

      // Format transcript for better readability
      transcriptText = transcriptResult.utterances
        ? transcriptResult.utterances
            .map(
              (utterance) => `Speaker ${utterance.speaker}: ${utterance.text}`
            )
            .join("\n\n")
        : transcriptResult.text;

      // Step 2: Generate Summary with Gemini
      setProcessingStep("Generating summary...");
      setProcessingProgress(70);

      const summaryResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCEn0b9Ilfz8fouSI6iHYuunBJTEEiWGec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a detailed meeting summary from this transcript. First, create a brief, descriptive title for this meeting. Then provide a comprehensive summary highlighting key decisions, action items, and main discussion points. Format your response as follows:
                TITLE: [Meeting Title]
                
                SUMMARY:
                [Your detailed summary]
                
                Transcript:
                ${transcriptText}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!summaryResponse.ok) throw new Error("Summary generation failed");

      const summaryData = await summaryResponse.json();
      const fullResponse = summaryData.candidates[0].content.parts[0].text;

      // Extract title and summary
      const titleMatch = fullResponse.match(/TITLE:\s*(.*?)(?:\n|\r|$)/);
      meetingTitle = titleMatch
        ? titleMatch[1].trim()
        : `Meeting ${new Date().toLocaleDateString()}`;

      const summaryStartIndex = fullResponse.indexOf("SUMMARY:");
      if (summaryStartIndex !== -1) {
        summaryText = fullResponse.substring(summaryStartIndex + 8).trim();
      } else {
        summaryText = fullResponse;
      }

      // Step 3: Save to database
      setProcessingStep("Saving meeting data...");
      setProcessingProgress(90);

      const saveMeetingResponse = await fetch(
        "https://meetsync-backend.vercel.app/api/v1/meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: meetingTitle,
            videoUrl: videoUrl,
            transcribe: transcriptText,
            summary: summaryText,
          }),
        }
      );

      if (!saveMeetingResponse.ok) {
        const errorData = await saveMeetingResponse.json();
        throw new Error(
          `Failed to save meeting: ${errorData.message || "Unknown error"}`
        );
      }

      const savedData = await saveMeetingResponse.json();
      console.log("Meeting saved successfully:", savedData);

      setProcessingStep("Processing complete!");
      setProcessingProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Set upload URL for reference
      setUploadUrl(videoUrl);
    } catch (error) {
      console.error("Processing error:", error);
      setProcessingStep(`Error: ${error.message}`);
      setProcessingProgress(0);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } finally {
      setShowProcessingModal(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      });
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...micStream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
        ? "video/webm; codecs=vp9"
        : "video/webm";

      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType,
      });
      recordedChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(recordedChunks.current, { type: mimeType });
        const cloudinaryResponse = await uploadVideoToCloudinary(blob);
        if (cloudinaryResponse?.secure_url) {
          await startAutoProcessing(cloudinaryResponse.secure_url);
        }
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // PeerJS Connections
  useEffect(() => {
    let mounted = true;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
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
          isAdmin: isAdmin,
        });

        // Handle incoming calls
        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            addParticipant({
              id: call.peer,
              name: call.metadata.userName,
              stream: remoteStream,
              isAdmin: call.metadata.isAdmin,
            });
            addStream(remoteStream);
          });
          connectionsRef.current.push(call);
        });

        peer.on("open", (id) => {
          if (isAdmin) {
            // Admin connection handling
            peer.on("connection", (conn) => {
              conn.on("data", (data) => {
                const currentState = useStore.getState();
                if (data.type === "new-user") {
                  // Notify all participants about new user
                  currentState.participants.forEach((p) => {
                    if (p.id !== data.userId && p.id !== peer.id) {
                      const dataConn = peer.connect(p.id);
                      dataConn.on("open", () => {
                        dataConn.send({
                          type: "new-participant",
                          participant: {
                            id: data.userId,
                            name: data.userName,
                            isAdmin: false,
                          },
                        });
                      });
                    }
                  });
                }
              });
            });
          } else {
            // User joins: connect to admin
            const call = peer.call(roomId, stream, {
              metadata: {
                userName: userName,
                isAdmin: false,
              },
            });

            call.on("stream", (remoteStream) => {
              addParticipant({
                id: call.peer,
                name: "Host",
                stream: remoteStream,
                isAdmin: true,
              });
              addStream(remoteStream);
            });

            // Get existing participants
            const dataConn = peer.connect(roomId);
            dataConn.on("open", () => {
              dataConn.send({ type: "get-participants" });
            });

            dataConn.on("data", (data) => {
              if (data.type === "existing-participants") {
                data.participants.forEach((participant) => {
                  if (participant.id === peer.id) return;
                  const call = peer.call(participant.id, stream, {
                    metadata: {
                      userName: useStore.getState().userName,
                      isAdmin: false,
                    },
                  });

                  call.on("stream", (remoteStream) => {
                    addParticipant({
                      id: participant.id,
                      name: participant.name,
                      stream: remoteStream,
                      isAdmin: participant.isAdmin,
                    });
                    addStream(remoteStream);
                  });

                  connectionsRef.current.push(call);
                });
              }
            });

            connectionsRef.current.push(call);
          }
        });

        // Data channel handler (Updated state access)
        peer.on("connection", (conn) => {
          conn.on("data", (data) => {
            const currentState = useStore.getState();
            if (data.type === "get-participants" && currentState.isAdmin) {
              const existingParticipants = currentState.participants
                .filter((p) => p.id !== conn.peer)
                .map((p) => ({
                  id: p.id,
                  name: p.name,
                  isAdmin: p.isAdmin,
                }));

              conn.send({
                type: "existing-participants",
                participants: existingParticipants,
              });
            } else if (data.type === "new-participant") {
              const { userName } = useStore.getState();
              const call = peer.call(data.participant.id, stream, {
                metadata: {
                  userName: userName,
                  isAdmin: false,
                },
              });

              call.on("stream", (remoteStream) => {
                addParticipant({
                  id: data.participant.id,
                  name: data.participant.name,
                  stream: remoteStream,
                  isAdmin: data.participant.isAdmin,
                });
                addStream(remoteStream);
              });

              connectionsRef.current.push(call);
            } else if (data.type === "remove-user") {
              if (data.userId === peer.id) endMeeting();
            }
          });
        });

        peer.on("error", (error) => {
          console.error("PeerJS error:", error);
        });
      })
      .catch((error) => console.error("Media error:", error));

    return () => {
      mounted = false;
      if (peerRef.current) peerRef.current.destroy();
      if (localStream) localStream.getTracks().forEach((track) => track.stop());
      connectionsRef.current.forEach((conn) => conn.close());
    };
  }, []);

  const removeUser = (participantId) => {
    if (!isAdmin) return;

    const conn = peerRef.current.connect(participantId);
    conn.send({ type: "remove-user", userId: participantId });

    connectionsRef.current = connectionsRef.current.filter(
      (c) => c.peer !== participantId
    );
    removeParticipant(participantId);
  };

  const endMeeting = () => {
    if (isAdmin) {
      participants.forEach((p) => {
        if (p.id !== localPeerId) {
          const conn = peerRef.current.connect(p.id);
          conn.send({ type: "remove-user", userId: p.id });
        }
      });
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    if (peerRef.current) peerRef.current.destroy();
    if (localStream) localStream.getTracks().forEach((track) => track.stop());
    connectionsRef.current.forEach((conn) => conn.close());
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      {showProcessingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold text-white text-center">
              Generating Meeting Minutes
            </h3>

            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              <p className="text-gray-300 text-sm text-center">
                {processingStep} ({Math.round(processingProgress)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-gray-800/50 rounded-xl p-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-white">
                Room: {roomId}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => navigator.clipboard.writeText(roomId)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              {participants.length} participants
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
             <Button
             variant={isRecording ? "destructive" : "default"}
             size="sm"
             className={`transition-all duration-300 ${
               isRecording
                 ? "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                 : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
             }`}
             onClick={isRecording ? stopRecording : startRecording}
           >
             <VideoIcon className="h-4 w-4 mr-2" />
             {isRecording ? "Stop Recording" : "Start Recording"}
           </Button>
           
            )}
          </div>
        </div>
      </div>

      {/* Recording URL */}
      {uploadUrl && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
            <span>
              <h2 className="text-white m-2 ">Your Meeting has Been Saved In Your Organisation Database</h2>
            </span>
          </div>
          <div className="bg-gray-800/50 mt-2 rounded-xl p-4 border border-green-500/20">
            <p className="text-green-400 flex items-center">
              <span className="font-semibold mr-2">Recording saved:</span>

              <a
                href={uploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-300 truncate"
              >
                {uploadUrl}
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {participants.map((participant) => (
            <div key={participant.id} className="relative group">
              <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                <Video
                  stream={participant.stream}
                  isLocal={participant.id === localPeerId}
                  isVideoOff={participant.id === localPeerId && isVideoOff}
                />

                {participant.id === localPeerId && isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-2xl text-gray-400">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">
                      {participant.id === localPeerId
                        ? "You"
                        : participant.name}
                      {participant.isAdmin && " (Host)"}
                    </span>
                    {participant.id === localPeerId && isMuted && (
                      <MicOff className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  {isAdmin && participant.id !== localPeerId && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeUser(participant.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 ">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-center items-center space-x-4">
            <Button
              variant="ghost"
              size="lg"
              className={`rounded-full p-4 transition-colors ${
                isMuted
                  ? "bg-red-500/20 text-red-500"
                  : "text-white hover:bg-purple-600"
              }`}
              onClick={toggleMute}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className={`rounded-full p-4 transition-colors ${
                isVideoOff
                  ? "bg-red-500/20 text-red-500"
                  : "text-white hover:bg-purple-600"
              }`}
              onClick={toggleVideo}
            >
              {isVideoOff ? (
                <CameraOff className="h-6 w-6" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              className="rounded-full p-4 bg-red-500 hover:bg-red-600"
              onClick={endMeeting}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transcription */}
      {uploadUrl && (
        <div className="max-w-7xl mx-auto mt-8">
          <VideoToTextPage initialVideoUrl={uploadUrl} />
        </div>
      )}
    </div>
  );
};

// Video Component
const Video = ({ stream, isLocal, isVideoOff }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className={`w-full h-full object-cover ${
        isVideoOff ? "invisible" : "visible"
      }`}
    />
  );
};

// Transcription Component
const VideoToTextPage = ({ initialVideoUrl = "" }) => {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");

  const convertVideoToText = async (videoUrl) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          Authorization: "a4bcecf25bbd4dd5949fe2721ec15d8a",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_url: videoUrl,
          speaker_labels: true,
          language_code: "en_us",
        }),
      });

      if (!response.ok) throw new Error("Transcription failed to start");

      const { id } = await response.json();

      let transcriptResult;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        const pollResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${id}`,
          {
            headers: { Authorization: "a4bcecf25bbd4dd5949fe2721ec15d8a" },
          }
        );

        transcriptResult = await pollResponse.json();

        if (transcriptResult.status === "completed") break;
        if (transcriptResult.status === "error") {
          throw new Error(transcriptResult.error);
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }

      if (attempts === maxAttempts) throw new Error("Transcription timed out");

      const formattedTranscript =
        transcriptResult.utterances
          ?.map(
            (utterance) => `Speaker ${utterance.speaker}: ${utterance.text}`
          )
          ?.join("\n\n") || transcriptResult.text;

      setTranscript(formattedTranscript);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCEn0b9Ilfz8fouSI6iHYuunBJTEEiWGec`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a Detailed summary of the following meeting transcript, highlighting key decisions, action items, and main discussion points:\n\n${transcript}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) throw new Error("Summary generation failed");

      const data = await response.json();
      const summaryText = data.candidates[0].content.parts[0].text;
      setSummary(summaryText);
    } catch (err) {
      setError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      {/* <CardHeader>
        <CardTitle className="text-white">Video to Text Conversion</CardTitle>
      </CardHeader> */}
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* <div className="flex gap-4">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter Cloudinary video URL"
              className="bg-gray-700 text-white border-gray-600"
            />
            <Button
              onClick={() => convertVideoToText(videoUrl)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Converting..." : "Convert to Text"}
            </Button>
          </div> */}

          {error && (
            <div className="text-red-500 bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* {transcript && (
            <div className="space-y-4">
              <div className="bg-gray-900 text-gray-200 p-4 rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto">
                {transcript}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={generateSummary}
                  disabled={summaryLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {summaryLoading ? "Generating..." : "Generate Summary"}
                </Button>

                <Button
                  onClick={() => {
                    const blob = new Blob([transcript], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "transcript.txt";
                    a.click();
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Download Transcript
                </Button>
              </div>

              {summary && (
                <div className="space-y-4">
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      AI Summary
                    </h3>
                    <div className="text-gray-300 whitespace-pre-wrap">
                      {summary}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      const blob = new Blob([summary], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "summary.txt";
                      a.click();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Download Summary
                  </Button>
                </div>
              )}
            </div>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
};

// Main App
export default function App() {
  const { roomId } = useStore();
  return roomId ? <MeetingPage /> : <Home />;
}
