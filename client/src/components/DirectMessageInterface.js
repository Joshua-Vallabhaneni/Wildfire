import { Send, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import './DirectMessageInterface.css';

function DirectMessageInterface({ userId, initialRecipient }) {
  const messagesEndRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('DirectMessageInterface props:', {
      userId,
      initialRecipient
    });
  }, [userId, initialRecipient]);

  useEffect(() => {
    if (initialRecipient?.id && initialRecipient?.name) {
      console.log('Setting up new conversation with:', initialRecipient);
      const newConv = {
        userId: initialRecipient.id,
        name: initialRecipient.name,
        lastMessage: 'New conversation',
        timestamp: new Date().toISOString()
      };

      setSelectedConversation(newConv);
      setNewMessage("Hi! I saw your request and I'd like to help.");
      
      setConversations(prev => {
        const exists = prev.some(conv => conv.userId === initialRecipient.id);
        if (!exists) {
          return [newConv, ...prev];
        }
        return prev;
      });
    }
  }, [initialRecipient]);

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
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`http://localhost:8080/api/messages/conversations/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch conversations');
        
        const data = await response.json();
        setConversations(prevConvs => {
          // Filter out self-conversations
          const filteredData = data.filter(conv => conv.userId !== userId);
          
          // Merge existing conversations with new ones
          const newConvs = filteredData.filter(newConv => 
            !prevConvs.some(prevConv => prevConv.userId === newConv.userId)
          );
          
          const updatedConvs = [...prevConvs];
          filteredData.forEach(newConv => {
            const existingIndex = updatedConvs.findIndex(conv => conv.userId === newConv.userId);
            if (existingIndex >= 0) {
              updatedConvs[existingIndex] = {
                ...updatedConvs[existingIndex],
                lastMessage: newConv.lastMessage,
                timestamp: newConv.timestamp
              };
            }
          });
          
          return [...newConvs, ...updatedConvs].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
        });
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const intervalId = setInterval(fetchConversations, 3000);
    fetchConversations();

    return () => clearInterval(intervalId);
  }, [userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation?.userId || !userId) return;

      try {
        const response = await fetch(
          `http://localhost:8080/api/messages/${userId}/${selectedConversation.userId}`
        );
        if (!response.ok) throw new Error('Failed to fetch messages');
        
        const data = await response.json();
        setMessages(data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const intervalId = setInterval(fetchMessages, 3000);
    fetchMessages();

    return () => clearInterval(intervalId);
  }, [selectedConversation, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation?.userId) return;
    
    // Prevent sending message to self
    if (selectedConversation.userId === userId) {
      console.error('Cannot send message to self');
      return;
    }

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

      if (!response.ok) throw new Error('Failed to send message');

      const message = await response.json();
      
      // Only update if not sending to self
      if (message.receiverId !== userId) {
        setMessages(prev => [...prev, message]);
        
        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.userId === selectedConversation.userId) {
              return {
                ...conv,
                lastMessage: newMessage,
                timestamp: new Date().toISOString()
              };
            }
            return conv;
          });
          
          return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });
      }
      
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dmi-container">
      <div className="dmi-sidebar">
        <div className="dmi-search-box">
          <div className="dmi-search-relative">
            <input
              type="text"
              placeholder={`Search ${userType === 'volunteer' ? 'requesters' : 'volunteers'}`}
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
                  {conv.name?.charAt(0) || '?'}
                </div>
                <div className="dmi-conversation-info">
                  <div className="dmi-conversation-name">{conv.name || 'Unknown'}</div>
                  <div className="dmi-conversation-last-message">
                    {conv.lastMessage || 'Start a conversation'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="dmi-no-conversations">No conversations found</div>
          )}
        </div>
      </div>

      <div className="dmi-messages-container">
        {selectedConversation ? (
          <>
            <div className="dmi-chat-header">
              <div className="dmi-chat-header-avatar">
                {selectedConversation.name?.charAt(0) || '?'}
              </div>
              <h2 className="dmi-chat-header-title">
                {selectedConversation.name || 'Unknown'}
              </h2>
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
                        message.senderId === userId ? 'sender-bubble' : 'receiver-bubble'
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default DirectMessageInterface;
