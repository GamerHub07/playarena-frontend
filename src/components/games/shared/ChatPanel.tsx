'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X, ChevronDown } from 'lucide-react';

interface ChatMessage {
    id: string;
    sessionId: string;
    username: string;
    message: string;
    timestamp: number;
}

interface ChatPanelProps {
    roomCode: string;
    sessionId: string;
    username: string;
    emit: (event: string, data: unknown) => void;
    on: (event: string, callback: (data: unknown) => void) => () => void;
    isMinimized?: boolean;
    onToggleMinimize?: () => void;
}

export default function ChatPanel({
    roomCode,
    sessionId,
    username,
    emit,
    on,
    isMinimized = false,
    onToggleMinimize,
}: ChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (!isMinimized) {
            scrollToBottom();
            setUnreadCount(0);
        }
    }, [messages, isMinimized, scrollToBottom]);

    // Listen for chat messages
    useEffect(() => {
        const unsubChat = on('chat:message', (data: unknown) => {
            const msg = data as ChatMessage;
            setMessages(prev => [...prev, msg]);

            // Increment unread if minimized and not from self
            if (isMinimized && msg.sessionId !== sessionId) {
                setUnreadCount(prev => prev + 1);
            }
        });

        const unsubHistory = on('chat:history', (data: unknown) => {
            const history = data as ChatMessage[];
            setMessages(history);
        });

        // Request chat history on mount
        emit('chat:join', { roomCode });

        return () => {
            unsubChat();
            unsubHistory();
        };
    }, [on, emit, roomCode, isMinimized, sessionId]);

    const handleSend = () => {
        const trimmed = newMessage.trim();
        if (!trimmed) return;

        emit('chat:send', {
            roomCode,
            message: trimmed,
        });

        setNewMessage('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Minimized button view
    if (isMinimized) {
        return (
            <button
                onClick={onToggleMinimize}
                className="relative flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Chat</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col h-80">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Chat</span>
                    <span className="text-xs text-gray-500">({messages.length})</span>
                </div>
                {onToggleMinimize && (
                    <button
                        onClick={onToggleMinimize}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                        No messages yet. Say hello! 👋
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sessionId === sessionId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`flex items-center gap-2 mb-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <span className={`text-xs font-medium ${isMe ? 'text-blue-400' : 'text-gray-400'}`}>
                                        {isMe ? 'You' : msg.username}
                                    </span>
                                    <span className="text-[10px] text-gray-600">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                                <div
                                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm break-words ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-white/10 text-gray-200 rounded-bl-sm'
                                        }`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-white/5">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                        maxLength={200}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
