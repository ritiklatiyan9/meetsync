import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Video, 
  Calendar, 
  Link2, 
  Share2, 
  Edit, 
  Trash2, 
  Plus, 
  AlertCircle,
  Building2,
  Loader2,
  Search,
  Clock,
  Check,
  Eye
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const Organisation = () => {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    mobile: '',
    name: '',
    password: '',
    role: 'user',
  });
  const [editUser, setEditUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteMeetingId, setDeleteMeetingId] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingsRes, usersRes] = await Promise.all([
          fetch('https://meetsync-backend.vercel.app/api/v1/meeting'),
          fetch('https://meetsync-backend.vercel.app/api/v1/users/getall'),
        ]);
  
        if (!meetingsRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch data');
        }
  
        const meetingsData = await meetingsRes.json();
        const usersData = await usersRes.json();
  
        // Sort meetings by latest createdAt timestamp
        const sortedMeetings = meetingsData.data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
  
        setMeetings(sortedMeetings);
        setUsers(usersData.data);
        setFilteredUsers(usersData.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  useEffect(() => {
    setFilteredUsers(
      users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm)
      )
    );
  }, [searchTerm, users]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('https://meetsync-backend.vercel.app/api/v1/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

      const data = await response.json();
      setUsers([...users, data.data]);
      setNewUser({ email: '', mobile: '', name: '', password: '', role: 'user' });
      setIsAddUserModalOpen(false);
      showToast('User registered successfully!', 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message, type) => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast(message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`https://meetsync-backend.vercel.app/api/v1/users/deleteuserbyid/${deleteUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter((user) => user._id !== deleteUserId));
      setDeleteUserId(null);
      showToast('User deleted successfully!', 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`https://meetsync-backend.vercel.app/api/v1/meeting/${deleteMeetingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete meeting');
      }

      setMeetings(meetings.filter((meeting) => meeting._id !== deleteMeetingId));
      setDeleteMeetingId(null);
      showToast('Meeting deleted successfully!', 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`https://meetsync-backend.vercel.app/api/v1/users/updateuser/${editUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(users.map((user) => (user._id === updatedUser.data._id ? updatedUser.data : user)));
      setEditUser(null);
      showToast('User updated successfully!', 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'bg-indigo-900 text-indigo-200' : 'bg-teal-900 text-teal-200';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-950 text-white">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-lg font-medium">Loading data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-950 text-red-400">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-bold">Error</p>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-8">
      <Toaster richColors position="top-right" />
      {/* Header with Organization name */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-12">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 mr-3 text-blue-500" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Organization Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage your meetings and team members</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsAddUserModalOpen(true)} 
          className="mt-4 md:mt-0 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white rounded-md shadow-lg transition-all"
        >
          <UserPlus className="h-4 w-4 mr-2 text-white" />
          Add Team Member
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
        {/* Meetings Section - Left Side */}
        <Card className="bg-gray-900 border border-gray-800 shadow-lg rounded-lg overflow-hidden flex flex-col">
          <CardHeader className="bg-gray-850 border-b border-gray-800 px-6 py-5">
            <div className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-blue-400" />
              <CardTitle className="text-xl font-bold text-white">Recent Meetings</CardTitle>
            </div>
            <CardDescription className="text-gray-400 mt-1">
              Your organization's most recent meetings and recordings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto">
            {meetings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {meetings.map((meeting) => (
                  <Card 
                    key={meeting._id} 
                    className="bg-gray-850 border border-gray-700 rounded-lg overflow-hidden transition-all hover:border-blue-500 hover:shadow-md hover:shadow-blue-900/20"
                  >
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold text-white line-clamp-1">
                          {meeting.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center text-gray-400 text-xs">
                        <Calendar className="h-3 w-3 mr-1 text-blue-400" />
                        {formatDate(meeting.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center text-gray-300 text-sm mb-2">
                        <Link2 className="h-4 w-4 mr-2 flex-shrink-0 text-purple-400" />
                        <p className="overflow-hidden truncate text-ellipsis">
                          {meeting.videoUrl}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 pb-4 flex justify-between">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => navigate(`/share/${meeting._id}`)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-950/20 transition-all rounded-md"
                          size="sm"
                        >
                          <Share2 className="h-4 w-4 mr-2 text-white" />
                          Share
                        </Button>
                      
                        <Button 
                          onClick={() => setDeleteMeetingId(meeting._id)}
                          className="bg-gray-800 hover:bg-gray-700 text-white shadow-sm transition-all rounded-md"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Video className="h-12 w-12 text-blue-500 mb-3 opacity-40" />
                <p className="text-gray-400 mb-2">No meetings available.</p>
                <Button className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-md shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule a Meeting
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Section - Right Side */}
        <Card className="bg-gray-900 border border-gray-800 shadow-lg rounded-lg overflow-hidden flex flex-col">
          <CardHeader className="bg-gray-850 border-b border-gray-800 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-teal-400" />
                <CardTitle className="text-xl font-bold text-white">Team Members</CardTitle>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-700 pl-10 pr-4 py-2 text-sm text-white w-48 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <CardDescription className="text-gray-400 mt-1">
              Manage your team members and their access
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-850 z-10 border-b border-gray-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-gray-300 font-medium">Name</TableHead>
                      <TableHead className="text-gray-300 font-medium">Email</TableHead>
                      <TableHead className="text-gray-300 font-medium">Mobile</TableHead>
                      <TableHead className="text-gray-300 font-medium">Role</TableHead>
                      <TableHead className="text-gray-300 font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Table>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow 
                          key={user._id} 
                          className="border-gray-800 hover:bg-gray-800 transition-colors"
                        >
                          <TableCell className="text-gray-200 font-medium">{user.name}</TableCell>
                          <TableCell className="text-gray-200">{user.email}</TableCell>
                          <TableCell className="text-gray-200">{user.mobile}</TableCell>
                          <TableCell>
                            <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => setEditUser(user)}
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-sm transition-all rounded-md"
                                size="sm"
                              >
                                <Edit className="h-4 w-4 mr-1 text-white" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => setDeleteUserId(user._id)}
                                className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-sm transition-all rounded-md"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 mr-1 text-red-400" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                          No Members found matching your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 shadow-xl rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Are you sure you want to delete this member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex space-x-2">
            <Button
              onClick={() => setDeleteUserId(null)}
              className="bg-gray-800 hover:bg-gray-700 text-white rounded-md flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-md flex-1 shadow-md shadow-red-900/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2 text-white" />
                  Delete Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Meeting Confirmation Modal */}
      <Dialog open={!!deleteMeetingId} onOpenChange={() => setDeleteMeetingId(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 shadow-xl rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Meeting Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Are you sure you want to delete this meeting? All associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex space-x-2">
            <Button
              onClick={() => setDeleteMeetingId(null)}
              className="bg-gray-800 hover:bg-gray-700 text-white rounded-md flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteMeeting}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-md flex-1 shadow-md shadow-red-900/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting Meeting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2 text-white" />
                  Delete Meeting
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 shadow-xl rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <Edit className="h-5 w-5 text-blue-500 mr-2" />
              Update User
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Edit the user's details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="mt-4">
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="update-name" className="text-gray-400">
                  Name
                </Label>
                <Input
                  id="update-name"
                  name="name"
                  value={editUser?.name || ''}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-email" className="text-gray-400">
                  Email
                </Label>
                <Input
                  id="update-email"
                  name="email"
                  value={editUser?.email || ''}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-mobile" className="text-gray-400">
                  Mobile
                </Label>
                <Input
                  id="update-mobile"
                  name="mobile"
                  value={editUser?.mobile || ''}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                  className="bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-role" className="text-gray-400">
                  Role
                </Label>
                <select
                  id="update-role"
                  name="role"
                  value={editUser?.role || 'user'}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="bg-gray-800 text-white border-gray-700 rounded-md py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-md w-full shadow-md shadow-blue-900/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2 text-white" />
                    Update User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 shadow-xl rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <UserPlus className="h-5 w-5 text-teal-500 mr-2" />
              Add New Team Member
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Fill in the details to register a new team member
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-400">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-400">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobile" className="text-gray-400">
                  Mobile
                </Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={newUser.mobile}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-400">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-gray-400">
                  Role
                </Label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white border-gray-700 rounded-md py-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 px-3"
                >
                  <option value="user">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white rounded-md w-full shadow-md shadow-blue-900/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2 text-white" />
                    Register User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organisation;