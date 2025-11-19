'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, Trash2, Reply, MessageSquare, Calendar, User, Mail } from 'lucide-react';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  response?: string;
  createdAt: string;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [search]);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/contact-submissions?search=${search}`);
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setSubmissions([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/contact-submissions/${id}`, { method: 'DELETE' });
      fetchSubmissions();
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  };

  const handleRespond = async () => {
    if (!selectedSubmission || !response.trim()) return;
    
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/contact-submissions/${selectedSubmission.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });
      
      setResponse('');
      setSelectedSubmission(null);
      fetchSubmissions();
      alert('Response sent successfully!');
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
                <p className="text-sm text-gray-600">Manage and respond to customer inquiries</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-80 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Submissions Grid */}
        <div className="grid gap-6">
          {Array.isArray(submissions) && submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">{submission.name}</CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-600">{submission.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <Badge className={`${getStatusColor(submission.status)} font-medium px-3 py-1`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(submission.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{submission.message}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                          Submission Details
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Customer Name</label>
                            <p className="text-sm bg-gray-50 p-3 rounded-lg">{submission.name}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <p className="text-sm bg-gray-50 p-3 rounded-lg">{submission.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Message</label>
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-700 leading-relaxed">{submission.message}</p>
                          </div>
                        </div>
                        {submission.response && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Your Response</label>
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                              <p className="text-sm text-gray-700 leading-relaxed">{submission.response}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Respond
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                          <Reply className="h-5 w-5 text-green-600" />
                          Respond to {submission.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Original Message</label>
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-700 leading-relaxed">{submission.message}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Your Response</label>
                          <Textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your professional response here..."
                            className="min-h-32 resize-none border-gray-200 focus:border-green-300 focus:ring-green-200"
                          />
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                          <Button 
                            onClick={handleRespond} 
                            disabled={loading || !response.trim()}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Reply className="h-4 w-4 mr-2" />
                                Send Response
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                </Dialog>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(submission.id)}
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {submissions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-500">
                {search ? 'No submissions match your search criteria.' : 'No contact submissions have been received yet.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}