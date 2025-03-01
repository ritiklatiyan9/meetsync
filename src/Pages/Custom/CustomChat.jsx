import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, User, Bot, Clock, ArrowDown, Fan, WandSparkles, Sparkles, CheckCheck  } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MeetingChat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isFetchingMeeting, setIsFetchingMeeting] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      setIsFetchingMeeting(true);
      try {
        const response = await fetch(`https://meetsync-backend.vercel.app/api/v1/meeting/${id}`);
        if (!response.ok) throw new Error("Failed to fetch meeting");
        const data = await response.json();
        setMeetingTitle(data.data.title);
      } catch (error) {
        console.error("Error fetching meeting:", error);
      } finally {
        setIsFetchingMeeting(false);
      }
    };
    
    fetchMeeting();
  }, [id]);

  // Handle scroll and show scroll button if needed
  useEffect(() => {
    const handleScroll = (e) => {
      if (!scrollAreaRef.current) return;
      
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (!scrollContainer) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp && messages.length > 3);
    };

    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [messages]);

  // Auto-scroll to latest message when messages update
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (!isFetchingMeeting) {
      inputRef.current?.focus();
    }
  }, [isFetchingMeeting]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(`https://meetsync-backend.vercel.app/api/v1/meeting/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) throw new Error("Failed to get answer");
      
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.data.answer }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process your question. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
      setTimeout(scrollToBottom, 100); // Ensure scroll happens after render
    }
  };

  const formatMessageContent = (content) => {
    if (!content) return <p>No content</p>;
    
    return content.split('\n').map((line, i) => (
      <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
    ));
  };
  
  // Get time since message was sent
  const getMessageTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex items-center justify-center">
       
        <Card className="w-full sm:mt-6 md:mt-10 max-w-5xl bg-gray-900 border-gray-700 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm p-3 sm:p-6">
            {isFetchingMeeting ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4 bg-gray-800" />
                <Skeleton className="h-4 w-1/2 bg-gray-800" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white truncate">
                    {meetingTitle}
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-400 text-sm sm:text-base">
                  Ask questions about this meeting to get detailed insights
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="p-0 relative ">
            <ScrollArea ref={scrollAreaRef} className="h-[350px] sm:h-[400px] md:h-[500px] lg:h-[500px] ">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-center max-w-md">
                    No messages yet. Ask a question about the meeting to get started.
                  </p>
                </div>
              ) : (
                <div className="p-3 sm:p-4 space-y-6">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-${msg.role === "user" ? "right" : "left"} duration-300`}>
                      <div className="flex items-start max-w-[90%] sm:max-w-[85%] gap-2">
                        {msg.role !== "user" && (
                          <div className="flex-shrink-0 mt-1">
                            <Avatar className=" h-8 w-8 bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center">
                              <Fan className="h-4 w-4" />
                            </Avatar>
                          </div>
                        )}
                        <div className={`p-3 rounded-lg shadow-md transition-all relative ${
                          msg.role === "user" 
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none" 
                            : "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 rounded-tl-none"
                        }`}>
                          <div className="text-sm sm:text-base">
                            {formatMessageContent(msg.content)}
                          </div>
                          <div className="text-xs opacity-70 mt-1 flex items-center justify-end gap-1">
                            <CheckCheck className="h-3 w-3" />
                            {getMessageTime()}
                          </div>
                        </div>
                        {msg.role === "user" && (
                          <div className="flex-shrink-0 mt-1">
                            <Avatar className="h-8 w-8 bg-gradient-to-br from-emerald-800 to-teal-600 text-white flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </Avatar>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} className="h-px" />
                </div>
              )}
            </ScrollArea>
            
            {showScrollButton && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={scrollToBottom} 
                      className="absolute bottom-4 right-4 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all animate-bounce-subtle"
                    >
                      <ArrowDown className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scroll to latest message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
               <CardFooter className="p-3 sm:p-4 border-t border-gray-800 bg-gray-900/80">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input 
                ref={inputRef}
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask about the meeting..." 
                disabled={isLoading || isFetchingMeeting}
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus-visible:ring-blue-500 focus-visible:ring-offset-0 h-10 sm:h-12"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim() || isFetchingMeeting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-10 sm:h-12 px-3 sm:px-4 disabled:opacity-50 disabled:from-blue-900 disabled:to-blue-900 disabled:text-gray-300"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                <span className="ml-2 hidden sm:inline">Send</span>
              </Button>
            </form>
          </CardFooter>
          </CardContent>

       
        </Card>
      </div>
    </div>
  );
};

export default MeetingChat;