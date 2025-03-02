import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Video, FileText, Mail, Send, Pencil, MessageCircle, Rotate3d } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "sonner";

const Shareable = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  // State management
  const [users, setUsers] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailContent, setEmailContent] = useState({
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [taskAssignments, setTaskAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, meetingRes] = await Promise.all([
          fetch("https://meetsync-backend.vercel.app/api/v1/users/getall"),
          fetch(
            `https://meetsync-backend.vercel.app/api/v1/meeting/${meetingId}`
          ),
        ]);

        if (!usersRes.ok || !meetingRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const usersData = await usersRes.json();
        const meetingData = await meetingRes.json();

        setUsers(usersData.data);
        setMeeting(meetingData.data);
        if (meetingData.data?.summary) {
          setEditedSummary(meetingData.data.summary);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingId]);

  // Fetch task assignments
  useEffect(() => {
    const fetchTaskAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const res = await fetch(
          `https://meetsync-backend.vercel.app/api/v1/meeting/assign/${meetingId}/`
        );
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTaskAssignments(data.data);
      } catch (err) {
        toast.error(err.message || "Task fetch failed");
      } finally {
        setLoadingAssignments(false);
      }
    };

    if (meeting && users.length) fetchTaskAssignments();
  }, [meeting, users, meetingId]);

  // Date formatting helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Email selection handlers
  const handleEmailToggle = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    setSelectedEmails((prev) =>
      prev.length === users.length ? [] : users.map((user) => user.email)
    );
  };

  // Personalized email sending
  const sendEmail = async () => {
    if (!selectedEmails.length || !meeting) return;

    setIsSending(true);
    try {
      await Promise.all(
        selectedEmails.map(async (email) => {
          const user = users.find((u) => u.email === email);
          const userTasks = taskAssignments.filter((t) => t.email === email);

          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">${meeting.title}</h2>
              <p><strong>Date:</strong> ${formatDate(meeting.createdAt)}</p>
              <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
              <h3 style="color: #2563eb; margin-bottom: 12px;">Chat with Meeting AI</h3>
              <p style="color: #374151; margin-bottom: 15px;">
                Access our AI chatbot for follow-up questions about this meeting:
              </p>
              <a href="https://meetsyncai.vercel.app/chat/${meetingId}" 
                 style="display: inline-block; padding: 10px 20px; 
                        background-color: #2563eb; color: white; 
                        text-decoration: none; border-radius: 5px;
                        font-weight: 500;">
                Open Meeting Chat
              </a>
            </div>
              ${
                meeting.videoUrl
                  ? `<p><strong>Recording:</strong> 
                      <a href="${meeting.videoUrl}" style="color: #2563eb;">
                        ${meeting.videoUrl.split("/").pop()}
                      </a>
                    </p>`
                  : ""
              }
              <div style="margin-top: 20px;">
                
                <h3 style="color: #374151;">Meeting Summary</h3>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
                  ${parseSummary(meeting.summary).main}
                </div>
              </div>
              ${
                userTasks.length > 0
                  ? `<div style="margin-top: 20px;">
                      <h3 style="color: #374151;">Your Tasks</h3>
                      <ul style="list-style: disc; padding-left: 20px;">
                        ${userTasks
                          .map(
                            (task) => `
                            <li style="margin-bottom: 8px;">
                              ${task.assignedTask}
                              ${
                                task.confidence
                                  ? `<span style="color: #16a34a; font-size: 0.9em; margin-left: 8px;">(${task.confidence})</span>`
                                  : ""
                              }
                            </li>`
                          )
                          .join("")}
                      </ul>
                    </div>`
                  : ""
              }
              ${
                emailContent.message
                  ? `<div style="margin-top: 20px;">
                      <h3 style="color: #374151;">Additional Notes</h3>
                      <p>${emailContent.message}</p>
                    </div>`
                  : ""
              }
            </div>
          `;

          const response = await fetch(
            "https://meetsync-backend.vercel.app/api/v1/email/send",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                toEmails: [email],
                subject:
                  emailContent.subject || `Meeting Summary: ${meeting.title}`,
                htmlContent,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to send to ${email}`);
          }
        })
      );

      toast.success("Emails sent successfully");
      setTimeout(() => navigate("/org"), 2000);
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(err.message || "Email sending failed");
    } finally {
      setIsSending(false);
    }
  };

  // Summary parsing logic
  const parseSummary = (summary) => {
    if (!summary) return { main: "", decisions: [], actions: [] };
    const cleanSummary = summary.replace(/\*\*/g, "").replace(/\*/g, "");

    const decisionsMatch = cleanSummary.match(
      /Key Decisions:(.*?)Action Items:/s
    );
    const actionsMatch = cleanSummary.match(
      /Action Items:(.*?)Main Discussion Points:/s
    );
    const mainMatch = cleanSummary.match(/Main Discussion Points:(.*)/s);

    return {
      decisions: decisionsMatch
        ? decisionsMatch[1]
            .trim()
            .split("\n")
            .filter((i) => i && i !== "None")
        : [],
      actions: actionsMatch
        ? actionsMatch[1]
            .trim()
            .split("\n")
            .filter((i) => i)
        : [],
      main: mainMatch ? mainMatch[1].trim() : cleanSummary,
    };
  };

  // Summary editing functionality
  const openEditDialog = () => {
    setEditedSummary(meeting?.summary || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveSummary = async () => {
    if (!editedSummary) {
      toast.error("Summary cannot be empty");
      return;
    }

    setIsSavingSummary(true);
    try {
      const response = await fetch(
        `https://meetsync-backend.vercel.app/api/v1/meeting/${meetingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: editedSummary }),
        }
      );

      if (!response.ok) throw new Error("Update failed");
      
      const updatedMeeting = await response.json();
      setMeeting(updatedMeeting.data);
      setIsEditDialogOpen(false);
      toast.success("Summary updated");
    } catch (err) {
      toast.error(err.message || "Update error");
    } finally {
      setIsSavingSummary(false);
    }
  };

  // Error display
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="text-red-500 text-lg p-4 bg-red-100 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <Toaster richColors />
      
      <div className="max-w-6xl mx-auto mt-12">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Meeting Details</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate(`/chat/${meetingId}`)}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              disabled={selectedEmails.length === 0}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Summary ({selectedEmails.length})
            </Button>
          </div>
        </div>

        {/* Email Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Send Summary</DialogTitle>
              <DialogDescription className="text-gray-400">
                Select recipients and customize message
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder={`Meeting Summary: ${meeting?.title || ""}`}
                  value={emailContent.subject}
                  onChange={(e) =>
                    setEmailContent({ ...emailContent, subject: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Additional Message</Label>
                <Textarea
                  id="message"
                  placeholder="Add custom message..."
                  value={emailContent.message}
                  onChange={(e) =>
                    setEmailContent({ ...emailContent, message: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white min-h-24"
                />
              </div>
              <div className="space-y-2">
                <Label>Recipients</Label>
                <div className="max-h-48 overflow-y-auto border border-gray-700 rounded-lg p-2">
                  {users
                    .sort((a, b) => {
                      const aHasTasks = taskAssignments.some(
                        (t) => t.email === a.email
                      );
                      const bHasTasks = taskAssignments.some(
                        (t) => t.email === b.email
                      );
                      return bHasTasks - aHasTasks;
                    })
                    .map((user) => {
                      const hasTasks = taskAssignments.some(
                        (t) => t.email === user.email
                      );
                      return (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
                          onClick={() => handleEmailToggle(user.email)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmails.includes(user.email)}
                            onChange={() => handleEmailToggle(user.email)}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-gray-300">{user.name}</p>
                              {hasTasks && (
                                <span className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded-full">
                                  Has Tasks
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={sendEmail}
                  disabled={isSending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isSending ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Emails
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Summary Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Summary</DialogTitle>
              <DialogDescription className="text-gray-400">
                Modify meeting summary using markdown
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="bg-gray-800 text-white h-96 font-mono text-sm"
            />
            <DialogFooter>
              <Button
                onClick={handleSaveSummary}
                disabled={isSavingSummary}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSavingSummary ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meeting Info Card */}
          <Card className="bg-gray-900 text-white shadow-lg border-0 lg:col-span-1">
            <CardHeader className="border-b border-gray-800 pb-4">
              <CardTitle className="text-2xl font-semibold">
                {loading ? (
                  <Skeleton className="h-8 w-[200px]" />
                ) : (
                  meeting?.title
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Created</p>
                  <p className="text-gray-100">
                    {loading ? (
                      <Skeleton className="h-4 w-[160px]" />
                    ) : (
                      formatDate(meeting?.createdAt)
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Recording</p>
                  {loading ? (
                    <Skeleton className="h-4 w-[120px]" />
                  ) : (
                    <a
                      href={meeting?.videoUrl}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {meeting?.videoUrl
                        ? meeting.videoUrl.split("/").pop()
                        : "Not available"}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="bg-gray-900 text-white shadow-lg border-0 lg:col-span-2">
            <CardHeader className="border-b border-gray-800 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" /> Summary
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openEditDialog}
                  className="text-gray-400 hover:bg-gray-400     hover:text-gray-900"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  Main Discussion
                </h3>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <p className="text-gray-300 leading-relaxed">
                    {parseSummary(meeting?.summary).main}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-200 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    Key Decisions
                  </h3>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : parseSummary(meeting?.summary).decisions.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      {parseSummary(meeting?.summary).decisions.map(
                        (decision, idx) => (
                          <li key={idx}>{decision}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">No decisions recorded</p>
                  )}
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-200 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Action Items
                  </h3>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : parseSummary(meeting?.summary).actions.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      {parseSummary(meeting?.summary).actions.map(
                        (action, idx) => (
                          <li key={idx}>{action}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">No action items</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Assignments Table */}
        <Card className="bg-gray-900 text-white mt-8">
          <CardHeader className="border-b border-gray-800">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Task Assignments</CardTitle>
              
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingAssignments ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-800 hover:bg-gray-700">
                    <TableHead className="text-gray-300">Assignee</TableHead>
                    <TableHead className="text-gray-300">Task</TableHead>
                    <TableHead className="text-gray-300">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskAssignments.map((assignment, idx) => (
                    <TableRow key={idx} className="border-b border-gray-800 hover:bg-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {assignment.email ? (
                            <>
                              <span className="text-blue-400">✓</span>
                              <div>
                                <p className="text-gray-100">{assignment.name}</p>
                                <p className="text-xs text-gray-400">{assignment.email}</p>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-orange-400">
                              <span>⚠️</span>
                              {assignment.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {assignment.assignedTask}
                      </TableCell>
                      <TableCell>
                        <span className="text-green-400">
                          {assignment.confidence || 'High'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card className="bg-gray-900 text-white mt-8">
          <CardHeader className="border-b border-gray-800">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Participants</CardTitle>
              <Button
                variant="ghost"
                onClick={handleSelectAll}
                className="text-gray-400 hover:text-gray-800 hover:bg-gray-400"
              >
                {selectedEmails.length === users.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-800 hover:bg-gray-800">
                  <TableHead className="w-8">
                    <input
                      type="checkbox"
                      checked={selectedEmails.length === users.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-700  border-gray-600 rounded"
                    />
                  </TableHead>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user._id}
                    className="hover:bg-gray-800 border-b border-gray-800"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(user.email)}
                        onChange={() => handleEmailToggle(user.email)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-100">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "admin"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shareable;