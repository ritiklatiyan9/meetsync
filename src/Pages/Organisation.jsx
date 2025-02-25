import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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
  const [editUser, setEditUser] = useState(null); // State for editing user
  const [deleteUserId, setDeleteUserId] = useState(null); // State for delete confirmation

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingsRes, usersRes] = await Promise.all([
          fetch('http://https://meetsync-backend.vercel.app/api/v1/meeting'),
          fetch('http://https://meetsync-backend.vercel.app/api/v1/users/getall'),
        ]);
        if (!meetingsRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch data');
        }
        const meetingsData = await meetingsRes.json();
        const usersData = await usersRes.json();
        setMeetings(meetingsData.data);
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
    try {
      const response = await fetch('http://https://meetsync-backend.vercel.app/api/v1/users/register', {
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
      alert('User registered successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
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
    try {
      const response = await fetch(`http://https://meetsync-backend.vercel.app/api/v1/users/deleteuser/${deleteUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter((user) => user._id !== deleteUserId));
      setDeleteUserId(null);
      alert('User deleted successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://https://meetsync-backend.vercel.app/api/v1/users/updateuser/${editUser._id}`, {
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
      alert('User updated successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-20">
      {/* Meetings Section */}
      <Card className="bg-gray-800 border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-200">Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting._id} className="mb-4 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-100">{meeting.title}</h3>
                <p className="text-sm text-gray-400">{formatDate(meeting.createdAt)}</p>
                <p className="text-gray-300">{meeting.summary}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No meetings available.</p>
          )}
        </CardContent>
      </Card>

      {/* Users Section */}
      <Card className="mt-8 bg-gray-800 border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-200">Organization Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Mobile</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="text-gray-200">{user.name}</TableCell>
                  <TableCell className="text-gray-200">{user.email}</TableCell>
                  <TableCell className="text-gray-200">{user.mobile}</TableCell>
                  <TableCell className="text-gray-200">{user.role}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => setEditUser(user)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Update
                    </Button>
                    <Button
                      onClick={() => setDeleteUserId(user._id)}
                      className="ml-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-200">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this user?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteUserId(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-200">Update User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the details to update the user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-gray-400">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={editUser?.name || ''}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="col-span-3 bg-gray-700 text-white border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-gray-400">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={editUser?.email || ''}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="col-span-3 bg-gray-700 text-white border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mobile" className="text-right text-gray-400">
                  Mobile
                </Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={editUser?.mobile || ''}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, mobile: e.target.value }))
                  }
                  className="col-span-3 bg-gray-700 text-white border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right text-gray-400">
                  Role
                </Label>
                <select
                  id="role"
                  name="role"
                  value={editUser?.role || 'user'}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="col-span-3 bg-gray-700 text-white border-gray-600"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organisation;