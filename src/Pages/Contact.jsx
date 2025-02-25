import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Send, CheckCircle2, MessageSquare, User } from "lucide-react";
import { SparklesText } from "../components/magicui/sparkles-text";

const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ icon: Icon, type = 'text', placeholder, required }) => (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      {type === 'textarea' ? (
        <Textarea
          required={required}
          placeholder={placeholder}
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          className="pl-12 pt-3 text-lg min-h-[160px] rounded-xl bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
        />
      ) : (
        <Input
          required={required}
          type={type}
          placeholder={placeholder}
          value={type === 'email' ? formData.email : formData.name}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            [type === 'email' ? 'email' : 'name']: e.target.value
          }))}
          className="pl-12 h-14 text-lg rounded-xl bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header Section */}
        <header className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-blue-900/30 text-blue-400">
            <Mail className="w-4 h-4 mr-2" />
          
            <span className="text-sm font-medium">Contact Us</span>
          </div>
         <SparklesText className='text-white  text-5xl ml-2 md:ml-4 md:text-5xl' text=" Let's Start a Conversation" />
          
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
                  value="contact@meetsync.ai"
                />
                <ContactInfoItem
                  icon={Phone}
                  label="Phone"
                  value="+91 7856963552"
                />
              </div>
            </section>

            {/* Contact Form */}
            <section className="bg-gray-800 rounded-2xl p-6 shadow-xl">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <InputField
                      icon={User}
                      placeholder="Your name"
                      required
                    />
                    <InputField
                      icon={Mail}
                      type="email"
                      placeholder="Your email"
                      required
                    />
                    <InputField
                      icon={MessageSquare}
                      type="textarea"
                      placeholder="Your message"
                      required
                    />
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
      We'll get back to you within 24 hours.
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