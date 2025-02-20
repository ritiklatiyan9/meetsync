import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Send, CheckCircle2, MessageSquare, User } from "lucide-react";

function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header Section with Dark Theme */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-blue-900/30 text-blue-400">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Contact Us</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Let's Start a Conversation
          </h1>
          <p className="text-lg text-gray-300">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Form Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Side - Contact Information */}
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-3xl p-8 text-white">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/5 p-3 rounded-full">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Email</p>
                    <p className="font-medium">contact@meetsync.ai</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/5 p-3 rounded-full">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Phone</p>
                    <p className="font-medium">+91 7856963552</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-gray-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        required
                        placeholder="Your name"
                        className="pl-12 h-14 text-lg rounded-xl bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        required
                        type="email"
                        placeholder="Your email"
                        className="pl-12 h-14 text-lg rounded-xl bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <Textarea
                        required
                        placeholder="Your message"
                        className="pl-12 pt-3 text-lg min-h-[160px] rounded-xl bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </div>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-300 mb-8">
                    We'll get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="px-6 py-3 rounded-xl bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    Send Another Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;