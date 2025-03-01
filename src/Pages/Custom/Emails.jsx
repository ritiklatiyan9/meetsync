import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";

const InviteUsers = ({ roomId, isOpen = false, onOpenChange = () => {} }) => {
  const [users, setUsers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [emailContent, setEmailContent] = useState({
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

  // Fetch all users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://meetsync-backend.vercel.app/api/v1/users/getall");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Toggle selection for a given email
  const handleEmailToggle = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  // Select or deselect all users
  const handleSelectAll = () => {
    if (selectedEmails.length === users.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(users.map((user) => user.email));
    }
  };

  // Send email invites using your backend endpoint
  const sendInvites = async () => {
    if (selectedEmails.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch("https://meetsync-backend.vercel.app/api/v1/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmails: selectedEmails,
          subject: emailContent.subject || `Meeting Invite: Join Room ${roomId}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Meeting Invite</h2>
              <p>You are invited to join our meeting room.</p>
              <p><strong>Room ID:</strong> ${roomId}</p>
              <p>
                Click the link below to join:
                <a href="https://meetsyncai.vercel.app/meeting/${roomId}" style="color: #2563eb; text-decoration: none;">
                  Join Room
                </a>
              </p>
              ${emailContent.message ? `<p>${emailContent.message}</p>` : ""}
            </div>
          `,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send invites");
      }
      toast.success("Invitations sent successfully!");
      onOpenChange(false);
      setSelectedEmails([]);
    } catch (err) {
      toast.error(err.message || "Error sending invites");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Send Meeting Invite</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select recipients and compose your invite message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder={`Meeting Invite: Join Room ${roomId}`}
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
                placeholder="Add any additional notes..."
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
                <div
                  className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
                  onClick={handleSelectAll}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmails.length === users.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <div>
                    <p className="text-gray-300">Select All</p>
                  </div>
                </div>
                {users.map((user) => (
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
                    <div>
                      <p className="text-gray-300">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={sendInvites}
              disabled={isSending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSending ? "Sending..." : "Send Invites"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster richColors />
    </>
  );
};

export default InviteUsers;
