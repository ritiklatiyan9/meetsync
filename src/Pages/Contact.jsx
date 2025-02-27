import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Send, CheckCircle2, MessageSquare, User, ExternalLink } from "lucide-react";
import { SparklesText } from "../components/magicui/sparkles-text";
import { ShineBorder } from "../components/magicui/shine-border";
const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Debug logging to check state updates
  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create WhatsApp message text with form data
      const messageText = `Name: ${formData.name}%0AEmail: ${formData.email}%0AMessage: ${formData.message}`;
      
      // Open WhatsApp in a new window
      window.open(`https://wa.me/919760302690?text=${messageText}`, '_blank');
      
      setIsSubmitted(true);
      // Reset form after successful submission
      setFormData({ name: '', email: '', message: '' });
    } finally {
      setIsLoading(false);
    }
  };

  // Create separate handler functions for each input
  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      name: e.target.value
    });
  };

  const handleEmailChange = (e) => {
    setFormData({
      ...formData,
      email: e.target.value
    });
  };

  const handleMessageChange = (e) => {
    setFormData({
      ...formData,
      message: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header Section */}
       
      
        <header className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-blue-900/30 text-blue-400">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Contact Us</span>
          </div>
          <SparklesText className='text-white text-5xl ml-2 md:ml-4 md:text-5xl' text=" Let's Start a Conversation" />
          
          <p className="text-gray-300 text-lg">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </header>
       

        {/* Contact Content */}
        <main className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
            {/* Contact Information */}
            <section className="bg-gradient-to-br from-blue-900 to-purple-900/20 rounded-2xl p-6 text-white">
           
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <ContactInfoItem
                  icon={Mail}
                  label="Email"
                  value="contactmeetsyncai@gmail.com"
                />
                <ContactInfoItem
                  icon={Phone}
                  label="Phone"
                  value="+91 9760302690"
                />
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-gray-300 text-sm mb-3">
                  After submitting the form, you'll be redirected to WhatsApp to send your message directly.
                </p>
                <a 
                  href="https://wa.me/919760302690" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  <span>Contact on WhatsApp</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </section>

            {/* Contact Form */}
            
            <section className="bg-gray-800 rounded-2xl p-6 shadow-xl">
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Name Input */}
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleNameChange}
                        required
                        className="pl-12 h-14 text-lg rounded-xl bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Email Input */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Your email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        required
                        className="pl-12 h-14 text-lg rounded-xl bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Message Textarea */}
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-8 w-5 h-5 text-gray-400" />
                      <Textarea
                        placeholder="Your message"
                        value={formData.message}
                        onChange={handleMessageChange}
                        required
                        className="pl-12 pt-3 text-lg min-h-[160px] rounded-xl bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <SubmitButton isLoading={isLoading} />
                </form>
              ) : (
                <SuccessState onReset={() => setIsSubmitted(false)} />
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

const ContactInfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="bg-white/5 p-2 rounded-full">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-gray-300">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

const SubmitButton = ({ isLoading }) => (
  <Button
    type="submit"
    className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-transform duration-200 hover:scale-[1.02]"
    disabled={isLoading}
  >
    {isLoading ? (
      <div className="flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Sending...
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2">
        <Send className="w-5 h-5" />
        Send Message
      </div>
    )}
  </Button>
);

const SuccessState = ({ onReset }) => (
  <div className="text-center py-8">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-900/30 mb-4">
      <CheckCircle2 className="w-7 h-7 text-green-400" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">
      Message Sent!
    </h3>
    <p className="text-gray-300 mb-6">
      You've been redirected to WhatsApp to complete your message.
      <br />If the WhatsApp page didn't open, check your popup settings.
    </p>
    <Button
      onClick={onReset}
      variant="outline"
      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
    >
      Send Another Message
    </Button>
  </div>
);

export default ContactPage;