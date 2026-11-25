import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { MessageCircle } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/917976705440?text=Hello%20Madan%20Mehandi%20Udhyog,%20I%20would%20like%20to%20chat%20about%20your%20Sojat%20henna%20and%20herbal%20products."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-30 p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        title="Chat with Us on WhatsApp (+91 79767 05440)"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          Chat with Us
        </span>
      </a>
    </div>
  );
}
