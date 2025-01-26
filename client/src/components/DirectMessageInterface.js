import { Send, Search } from 'lucide-react';
import './DirectMessageInterface.css';
import { useState, useEffect, useRef, useCallback } from 'react';

function DirectMessageInterface({ userId, initialRecipient }) {
  const messagesEndRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (initialRecipient) {
      setSelectedConversation({
        userId: initialRecipient.id,
        name: initialRecipient.name,
      });
    }
  }, [initialRecipient]);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/messages/conversations/${userId}`
      );
      const data = await response.json();

      setConversations((prev) => {
        const apiConvs = data.map((conv) => ({
          userId: conv.partnerId,
          name: conv.partnerName || 'Unknown', // Fallback name
          lastMessage: conv.lastMessage,
          timestamp: new Date(conv.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));

        const localConvs = prev.filter(
          (pConv) => !apiConvs.find((aConv) => aConv.userId === pConv.userId)
        );

        return [
          ...localConvs,
          ...apiConvs,
        ]
          .filter(
            (v, i, a) => a.findIndex((t) => t.userId === v.userId) === i
          )
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations, userId]);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        if (!userId || !selectedConversation.userId) {
          console.error(
            'Missing userId or selectedConversation.userId for fetching messages'
          );
          return;
        }

        const response = await fetch(
          `http://localhost:8080/api/messages/${selectedConversation.userId}/${userId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

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
    if (!newMessage.trim() || !selectedConversation) {
      console.error('Cannot send message: Message or recipient is missing');
      return;
    }

    const tempConv = {
      userId: selectedConversation.userId,
      name: selectedConversation.name,
      lastMessage: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setConversations((prev) => {
      const existing = prev.find((c) => c.userId === tempConv.userId);
      return existing
        ? prev.map((c) => (c.userId === tempConv.userId ? tempConv : c))
        : [tempConv, ...prev];
    });

    try {
      const response = await fetch('http://localhost:8080/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId: selectedConversation.userId,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        setConversations(conversationsRef.current); // Revert optimistic update
        throw new Error('Failed to send message');
      }

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name && conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dmi-container">
      {/* Sidebar */}
      <div className="dmi-sidebar">
        <div className="dmi-search-box">
          <div className="dmi-search-relative">
            <input
              type="text"
              placeholder="Search requesters"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dmi-search-input"
            />
            <Search className="dmi-search-icon" size={20} />
          </div>
        </div>

        <div className="dmi-conversations-list">
          {isLoading ? (
            <div className="dmi-loading">Loading conversations...</div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.userId}
                className={`dmi-conversation-item ${
                  selectedConversation?.userId === conv.userId ? 'selected' : ''
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="dmi-conversation-avatar">
                  {conv.name ? conv.name.charAt(0) : ''}
                </div>
                <div className="dmi-conversation-info">
                  <div className="dmi-conversation-name">{conv.name}</div>
                  <div className="dmi-conversation-last-message">
                    {conv.lastMessage || 'New conversation'}
                  </div>
                </div>
                <div className="dmi-conversation-time">{conv.timestamp}</div>
              </div>
            ))
          ) : (
            <div className="dmi-no-conversations">No requesters found</div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="dmi-messages-container">
        {selectedConversation ? (
          <>
            <div className="dmi-chat-header">
              <div className="dmi-chat-header-avatar">
                {selectedConversation?.name
                  ? selectedConversation.name.charAt(0)
                  : ''}
              </div>
              <div className="dmi-chat-header-info">
                <h2 className="dmi-chat-header-title">
                  {selectedConversation.name}
                </h2>
              </div>
            </div>

            <div className="dmi-messages-area">
              <div className="dmi-messages-space">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`dmi-message-row ${
                      message.senderId === userId ? 'sender' : 'receiver'
                    }`}
                  >
                    <div
                      className={`dmi-message-bubble ${
                        message.senderId === userId
                          ? 'sender-bubble'
                          : 'receiver-bubble'
                      }`}
                    >
                      {message.content}
                      <div className="dmi-message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="dmi-message-input-container">
              <div className="dmi-message-input-wrapper">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleSendMessage()
                  }
                  placeholder="Type a message..."
                  className="dmi-message-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="dmi-send-button"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="dmi-no-conversation-selected">
            Select a conversation to start chatting!
          </div>
        )}
      </div>
    </div>
  );
}

export default DirectMessageInterface;
