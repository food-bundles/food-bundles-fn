"use client";

import { useEffect } from 'react';
import { useAuth } from '@/app/contexts/auth-context';

declare global {
  interface Window {
    chatbase: any;
  }
}

export default function Chatbot() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize Chatbase script
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args: any[]) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(args);
      };
      
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") {
            return target.q;
          }
          return (...args: any[]) => target(prop, ...args);
        }
      });
    }

    const loadScript = () => {
      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "oVtdXXauW9F6SW6q1JSir";
      script.setAttribute("domain", "www.chatbase.co");
      script.setAttribute("data-chatbot-id", "oVtdXXauW9F6SW6q1JSir");
      document.body.appendChild(script);

      // Identify user if logged in
      if (user) {
        setTimeout(() => identifyUser(), 1000);
      }
    };

    if (document.readyState === "complete") {
      loadScript();
    } else {
      window.addEventListener("load", loadScript);
    }

    const identifyUser = async () => {
      if (user && window.chatbase) {
        try {
          const response = await fetch('/api/chatbot/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id }),
          });
          
          if (response.ok) {
            const { token } = await response.json();
            window.chatbase('identify', { token });
          }
        } catch (error) {
          console.error('Failed to identify user with chatbot:', error);
        }
      }
    };
  }, [user]);

  return (
    <style jsx global>{`
      #chatbase-bubble-button {
        display: none !important;
      }
      
      #chatbase-bubble .chatbase-close-button {
        display: block !important;
      }
    `}</style>
  );
}