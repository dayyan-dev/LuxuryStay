import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getBotReply,
  getQuickPrompts,
  getWelcomeMessage,
} from './chatKnowledge';
import FormatChatMessage from './formatChatMessage';
import './chatbot.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

let msgId = 0;
const nextId = () => `m-${++msgId}-${Date.now()}`;

export default function LuxuryStayChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (messages.length === 0) {
      const welcome = getWelcomeMessage();
      setMessages([{ id: nextId(), role: 'bot', ...welcome }]);
    }
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [open, messages.length]);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, open]);

  const pushBot = (reply) => {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'bot', text: reply.text, links: reply.links || [] },
    ]);
  };

  const buildHistory = (prevMessages) =>
    prevMessages
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .slice(-8)
      .map((m) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text,
      }));

  const ask = async (raw) => {
    const text = (raw || '').trim();
    if (!text || typing) return;

    const userMsg = { id: nextId(), role: 'user', text, links: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const history = buildHistory(messages);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success && data?.text) {
        pushBot({ text: data.text, links: data.links || [] });
      } else {
        // Groq down / rate limit → local knowledge fallback
        pushBot(getBotReply(text));
      }
    } catch {
      pushBot(getBotReply(text));
    } finally {
      setTyping(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <div className="ls-chat-root" aria-live="polite">
      <AnimatePresence>
        {open && (
          <motion.div
            className="ls-chat-panel"
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            role="dialog"
            aria-label="LuxuryStay AI Concierge"
          >
            <div className="ls-chat-header">
              <div className="ls-chat-avatar">AI</div>
              <div>
                <h3>LuxuryStay Concierge</h3>
                <p>Groq AI · Online now</p>
              </div>
              <button
                type="button"
                className="ls-chat-close"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="ls-chat-body" ref={bodyRef}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`ls-chat-bubble ${m.role === 'user' ? 'user' : 'bot'}`}
                >
                  {m.role === 'bot' ? <FormatChatMessage text={m.text} /> : m.text}
                  {m.role === 'bot' && m.links?.length > 0 && (
                    <div className="ls-chat-links">
                      {m.links.map((link) => (
                        <Link
                          key={link.to + link.label}
                          to={link.to}
                          className="ls-chat-link"
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="ls-chat-typing" aria-label="Assistant is typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            <div className="ls-chat-quick">
              {getQuickPrompts().map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="ls-chat-chip"
                  onClick={() => ask(prompt)}
                  disabled={typing}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form className="ls-chat-form" onSubmit={onSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hotels, offers, booking…"
                aria-label="Message LuxuryStay AI"
                disabled={typing}
              />
              <button type="submit" disabled={typing || !input.trim()} aria-label="Send">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className="ls-chat-launcher"
        aria-label={open ? 'Close AI chat' : 'Open LuxuryStay AI Concierge'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.94 }}
      >
        {!open && <span className="pulse" aria-hidden />}
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-comments'}`} style={{ fontSize: '1.35rem' }} />
      </motion.button>
    </div>
  );
}
