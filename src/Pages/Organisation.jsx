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
  Eye,
  Menu,
  X
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
  const [activeTab, setActiveTab] = useState('meetings'); // For mobile tabs: 'meetings' or 'users'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-gray-950  text-white pb-6">
      <Toaster richColors position="top-right" />
      
      {/* Mobile Navigation Header */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 sticky top-0 z-30 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-blue-500" />
            <h1 className="text-xl font-bold text-white">MeetSync</h1>
          </div>
          <Button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="ghost" 
            className="p-1 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-4 py-2 bg-gray-850 rounded-lg border border-gray-800 shadow-lg">
            <div className="flex flex-col space-y-1">
              <Button 
                onClick={() => {
                  setActiveTab('meetings');
                  setMobileMenuOpen(false);
                }}
                className={`justify-start rounded-none px-4 py-2 ${
                  activeTab === 'meetings' ? 'bg-blue-900/30 text-blue-400' : 'bg-transparent text-gray-400'
                }`}
              >
                <Video className="h-4 w-4 mr-2" />
                Meetings
              </Button>
              <Button 
                onClick={() => {
                  setActiveTab('users');
                  setMobileMenuOpen(false);
                }}
                className={`justify-start rounded-none px-4 py-2 ${
                  activeTab === 'users' ? 'bg-teal-900/30 text-teal-400' : 'bg-transparent text-gray-400'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                Team Members
              </Button>
              <Button 
                onClick={() => {
                  setIsAddUserModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="justify-start rounded-none px-4 py-2 text-white bg-gradient-to-r from-teal-600 to-blue-600 mt-2"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          </div>
        )}
        
        {/* Mobile Tab Selector */}
        <div className="flex mt-4 border border-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex-1 py-2 px-3 text-sm font-medium flex justify-center items-center ${
              activeTab === 'meetings' 
              ? 'bg-blue-900/50 text-blue-400 border-b-2 border-blue-500' 
              : 'bg-gray-850 text-gray-400'
            }`}
          >
            <Video className="h-4 w-4 mr-2" />
            Meetings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 px-3 text-sm font-medium flex justify-center items-center ${
              activeTab === 'users' 
              ? 'bg-teal-900/50 text-teal-400 border-b-2 border-teal-500' 
              : 'bg-gray-850 text-gray-400'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Team
          </button>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:flex flex-col  md:flex-row justify-between items-start md:items-center p-6 md:p-8 mb-8 ">
        <div className="flex items-center mt-14">
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

      {/* Main Content - Desktop View */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-180px)] px-6 md:px-8">
        {/* Meetings Section - Desktop Left Side */}
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

        {/* Users Section - Desktop Right Side */}
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

      {/* Mobile View Content */}
      <div className="md:hidden p-4 mt-2">
        {/* Meetings Tab - Mobile */}
        {activeTab === 'meetings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Video className="h-5 w-5 mr-2 text-blue-400" />
                Recent Meetings
              </h2>
            </div>
            
            {meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <Card 
                    key={meeting._id} 
                    className="bg-gray-850 border border-gray-700 rounded-lg overflow-hidden"
                  >
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-base font-semibold text-white line-clamp-1">
                        {meeting.title}
                      </CardTitle>
                      <CardDescription className="flex items-center text-gray-400 text-xs">
                        <Calendar className="h-3 w-3 mr-1 text-blue-400" />
                        {formatDate(meeting.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-1 px-4">
                      <div className="flex items-center text-gray-300 text-xs">
                        <Link2 className="h-3 w-3 mr-1 flex-shrink-0 text-purple-400" />
                        <p className="overflow-hidden truncate text-ellipsis">
                          {meeting.videoUrl}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1 pb-3 px-4 flex justify-between">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => navigate(`/share/${meeting._id}`)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md text-xs py-1 h-8"
                          size="sm"
                        >
                          <Share2 className="h-3 w-3 mr-1 text-white" />
                          Share
                        </Button>
                      
                        <Button 
                          onClick={() => setDeleteMeetingId(meeting._id)}
                          className="bg-gray-800 text-white rounded-md text-xs py-1 h-8"
                          size="sm"
                        >
                          <Trash2 className="h-3 w-3 mr-1 text-red-400" />
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Video className="h-12 w-12 text-blue-500 mb-3 opacity-40" />
                <p className="text-gray-400 mb-2">No meetings available.</p>
                <Button className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule a Meeting
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Users Tab - Mobile */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-teal-400" />
                Team Members
              </h2>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-700 pl-8 pr-4 py-1 text-sm text-white w-32 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 h-8"
                />
              </div>
            </div>
            
            {filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <Card 
                    key={user._id} 
                    className="bg-gray-850 border border-gray-700 rounded-lg overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white">{user.name}</h3>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                            <p className="text-gray-400 text-sm">{user.mobile}</p>
                          </div>
                          <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            onClick={() => setEditUser(user)}
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-md flex-1 text-xs h-8"
                            size="sm"
                          >
                            <Edit className="h-3 w-3 mr-1 text-white" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => setDeleteUserId(user._id)}
                            className="bg-gray-800 text-white rounded-md flex-1 text-xs h-8"
                            size="sm"
                          >
                            <Trash2 className="h-3 w-3 mr-1 text-red-400" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-teal-500 mb-3 opacity-40" />
                <p className="text-gray-400">No members found matching your search</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 shadow-xl rounded-lg max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Are you sure you want to delete this member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button 
              onClick={() => setDeleteUserId(null)} 
              className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-red-700 hover:bg-red-600 text-white flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Meeting Confirmation Modal */}
      <Dialog open={!!deleteMeetingId} onOpenChange={() => setDeleteMeetingId(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 shadow-xl rounded-lg max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Meeting Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Are you sure you want to delete this meeting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button 
              onClick={() => setDeleteMeetingId(null)} 
              className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteMeeting} 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-red-700 hover:bg-red-600 text-white flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Meeting
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 shadow-xl rounded-lg max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <UserPlus className="h-5 w-5 text-teal-500 mr-2" />
              Add New Team Member
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Fill in the details below to add a new team member to your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={newUser.name}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-white">Mobile Number</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  placeholder="+1234567890"
                  value={newUser.mobile}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white shadow-md flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 shadow-xl rounded-lg max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <Edit className="h-5 w-5 text-blue-500 mr-2" />
              Edit Team Member
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Update the details for this team member.
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-white">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-white">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mobile" className="text-white">Mobile Number</Label>
                  <Input
                    id="edit-mobile"
                    value={editUser.mobile}
                    onChange={(e) => setEditUser({ ...editUser, mobile: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="text-white">Role</Label>
                  <select
                    id="edit-role"
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full h-10 px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Update Member
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organisation;
