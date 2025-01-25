// client/src/components/DirectMessageInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Search, Image as ImageIcon, Smile, ArrowLeft } from 'lucide-react';

function DirectMessageInterface({ userId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userType, setUserType] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showChat, setShowChat] = useState(false);

  const showConversationList = !isMobile || (isMobile && !showChat);
  const showChatView = !isMobile || (isMobile && showChat);

  const handleBackToList = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  const startNewConversation = (user) => {
    setSelectedConversation({
      userId: user._id,
      name: user.name,
      email: user.email,
    });
    setSearchTerm('');
    setSearchResults([]);
    if (isMobile) {
      setShowChat(true);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch user type
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`);
        const userData = await response.json();
        setUserType(userData.isVolunteer ? 'volunteer' : 'requester');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle search
  useEffect(() => {
    if (!searchTerm || !userType) return;

    const searchUsers = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/users/search?term=${encodeURIComponent(searchTerm)}&type=${
            userType === 'volunteer' ? 'requester' : 'volunteer'
          }`
        );

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, userType]);

  // Handle new conversation from match card
  useEffect(() => {
    if (location.state?.isNewChat) {
      const { recipientId, recipientName } = location.state;
      setSelectedConversation({
        userId: recipientId,
        name: recipientName,
      });
      setNewMessage("Hi! I saw your request and I'd like to help.");
      navigate(location.pathname, { replace: true, state: {} }); // Clear the state after using it
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/messages/conversations/${userId}`);
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/messages/${userId}/${selectedConversation.userId}`
        );
        const data = await response.json();
        setMessages(data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch('http://localhost:8080/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: userId,
          receiverId: selectedConversation.userId,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Conversations List */}
      {showConversationList && (
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">Messages</h2>
          </div>

          {/* Search Box */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
              />
            </div>
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => startNewConversation(user)}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations yet.</div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    if (isMobile) setShowChat(true);
                  }}
                  className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                    selectedConversation?.userId === conversation.userId ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="ml-3 flex-1 border-b border-transparent hover:border-gray-200 pb-2">
                    <div className="flex justify-between">
                      <span className="text-md font-medium text-gray-800">{conversation.name}</span>
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp && new Date(conversation.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Right Pane - Chat View */}
      {showChatView && (
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                {isMobile && (
                  <button onClick={handleBackToList} className="mr-4">
                    <ArrowLeft size={24} />
                  </button>
                )}
                <div className="flex items-center">
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-800">{selectedConversation.name}</h3>
                    <p className="text-xs text-gray-500">Active now</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500">No messages yet.</div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.senderId === userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-md ${
                          message.senderId === userId
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button>
                    <Smile size={24} className="text-gray-500" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none text-sm"
                  />
                  {!newMessage.trim() ? (
                    <button>
                      <ImageIcon size={24} className="text-gray-500" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSendMessage}
                      className="text-blue-500 font-semibold"
                    >
                      Send
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="mx-auto mb-4">
                  <Send size={48} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-light mb-2">Your Messages</h3>
                <p className="text-sm">Send private messages to connect with others.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DirectMessageInterface;