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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
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
  Loader2
} from 'lucide-react';

const Organisation = () => {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
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
    // Simple toast notification using alert for now
    // In a real app, replace with a toast component
    alert(message);
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-950 text-white">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
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

  const getRoleColor = (role) => {
    return role === 'admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white p-6 md:p-8">
      {/* Header with Organization name */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-12">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 mr-3 text-purple-500" />
          <h1 className="text-2xl mt-2 md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Organization Dashboard
          </h1>
        </div>
        
        <Button 
          onClick={() => setIsAddUserModalOpen(true)} 
          className="mt-4 md:mt-0 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-green-500/20 transition-all duration-200 text-white rounded-xl"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
        {/* Meetings Section - Left Side */}
        <Card className="bg-gray-850 border-0 shadow-xl rounded-xl overflow-hidden backdrop-blur-sm bg-opacity-95 bg-gray-800/60 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50">
            <div className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-purple-500" />
              <CardTitle className="text-xl font-bold text-white">Recent Meetings</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Your organization's most recent meetings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto">
            {meetings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {meetings.map((meeting) => (
                  <Card 
                    key={meeting._id} 
                    className="bg-gray-800/70 border border-gray-700/50 rounded-xl overflow-hidden transition-all duration-200 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold text-white line-clamp-1">
                          {meeting.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center text-gray-400 text-xs">
                        <Calendar className="h-3 w-3 mr-1 text-purple-400" />
                        {formatDate(meeting.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex items-center text-gray-300 text-sm mb-2">
                        <Link2 className="h-4 w-4 mr-2 flex-shrink-0 text-blue-400" />
                        <p className="overflow-hidden truncate text-ellipsis">
                          {meeting.videoUrl}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        onClick={() => navigate(`/share/${meeting._id}`)}
                        className="w-32 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-indigo-500/20 transition-all duration-200"
                        size="sm"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Video className="h-12 w-12 text-gray-500 mb-3" />
                <p className="text-gray-400 mb-2">No meetings available.</p>
                <Button className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-500">
                  Schedule a Meeting
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Section - Right Side */}
        <Card className="bg-gray-850 border-0 shadow-xl rounded-xl overflow-hidden backdrop-blur-sm bg-opacity-95 bg-gray-800/60 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-500" />
              <CardTitle className="text-xl font-bold text-white">Organization Members</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Manage your team members and their access
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-800/50 z-10">
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
                    {users.map((user) => (
                      <TableRow 
                        key={user._id} 
                        className="border-gray-700/50 hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell className="text-gray-200 font-medium">{user.name}</TableCell>
                        <TableCell className="text-gray-200">{user.email}</TableCell>
                        <TableCell className="text-gray-200">{user.mobile}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-blue-900/30 text-blue-400' 
                              : 'bg-green-900/30 text-green-400'
                          }`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setEditUser(user)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-blue-500/20 transition-all duration-200"
                              size="sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => setDeleteUserId(user._id)}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:shadow-red-500/20 transition-all duration-200"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="bg-gray-850 text-white border border-gray-700/50 shadow-xl rounded-xl backdrop-blur-sm bg-opacity-95 bg-gray-800/80">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteUserId(null)}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-gray-850 text-white border border-gray-700/50 shadow-xl rounded-xl backdrop-blur-sm bg-opacity-95 bg-gray-800/80">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <Edit className="h-5 w-5 text-blue-500 mr-2" />
              Update User
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Edit the user's details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-name" className="text-right text-gray-400">
                  Name
                </Label>
                <Input
                  id="update-name"
                  name="name"
                  value={editUser?.name || ''}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="col-span-3 bg-gray-700/70 text-white border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-email" className="text-right text-gray-400">
                  Email
                </Label>
                <Input
                  id="update-email"
                  name="email"
                  value={editUser?.email || ''}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="col-span-3 bg-gray-700/70 text-white border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-mobile" className="text-right text-gray-400">
                  Mobile
                </Label>
                <Input
                  id="update-mobile"
                  name="mobile"
                  value={editUser?.mobile || ''}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                  className="col-span-3 bg-gray-700/70 text-white border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-role" className="text-right text-gray-400">
                  Role
                </Label>
                <select
                  id="update-role"
                  name="role"
                  value={editUser?.role || 'user'}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="col-span-3 bg-gray-700/70 text-white border-gray-600 rounded-md py-2 focus:border-purple-500 focus:ring-purple-500/20"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
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
        <DialogContent className="bg-gray-850 text-white border border-gray-700/50 shadow-xl rounded-xl backdrop-blur-sm bg-opacity-95 bg-gray-800/80">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <UserPlus className="h-5 w-5 text-green-500 mr-2" />
              Add New User
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the details to register a new user
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-gray-400">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  className="col-span-3 bg-gray-700/70 text-white border-gray-600 focus:border-green-500 focus:ring-green-500/20"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-gray-400">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className="col-span-3 bg-gray-700/70 text-white border-gray-600 focus:border-green-500 focus:ring-green-500/20"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mobile" className="text-right text-gray-400">
                  Mobile
                </Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={newUser.mobile}
                  onChange={handleInputChange}
                  className="col-span-3 bg-gray-700/70 text-white border-gray-600 focus:border-green-500 focus:ring-green-500/20"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right text-gray-400">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="col-span-3 bg-gray-700/70 text-white border-gray-600 focus:border-green-500 focus:ring-green-500/20"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right text-gray-400">
                  Role
                </Label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className="col-span-3 bg-gray-700/70 text-white border-gray-600 rounded-md py-2 focus:border-green-500 focus:ring-green-500/20"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
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