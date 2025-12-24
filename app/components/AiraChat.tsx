'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aira';
  timestamp: Date;
  suggestions?: string[];
}

interface AiraChatProps {
  employeeId?: string;
  employeeName?: string;
  onClose?: () => void;
}

export default function AiraChat({ employeeId, employeeName, onClose }: AiraChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Aira, your HR assistant. How can I help you today?",
      sender: 'aira',
      timestamp: new Date(),
      suggestions: ['Attendance help', 'Leave management', 'Payroll questions', 'Help'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history
    if (employeeId) {
      loadChatHistory();
    }
  }, [employeeId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    if (!employeeId) return;
    
    try {
      const response = await axios.get(`/api/ai/chat?employee_id=${employeeId}&limit=20`);
      const history = response.data.history || [];
      
      if (history.length > 0) {
        const historyMessages: Message[] = [];
        history.forEach((item: any, index: number) => {
          historyMessages.push(
            {
              id: `user-${item._id}`,
              text: item.message,
              sender: 'user',
              timestamp: new Date(item.created_at),
            },
            {
              id: `aira-${item._id}`,
              text: item.response,
              sender: 'aira',
              timestamp: new Date(item.created_at),
            }
          );
        });
        setMessages([messages[0], ...historyMessages.reverse()]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: messageText,
        employeeId,
        employeeName,
      });

      const airaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message,
        sender: 'aira',
        timestamp: new Date(),
        suggestions: response.data.suggestions,
      };

      setMessages((prev) => [...prev, airaMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.',
        sender: 'aira',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-primary)',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--primary-color)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Aira AI Assistant</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Your HR Assistant</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: message.sender === 'user' 
                ? 'var(--primary-color)' 
                : 'var(--bg-tertiary)',
              color: message.sender === 'user' 
                ? 'white' 
                : 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}>
              {message.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}>
              Aira is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages[messages.length - 1]?.suggestions && messages[messages.length - 1]?.sender === 'aira' && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="btn btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderColor: 'var(--secondary-color)',
                color: 'var(--secondary-color)',
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '12px',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Aira anything about HR..."
          className="input"
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{
            padding: '10px 20px',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

