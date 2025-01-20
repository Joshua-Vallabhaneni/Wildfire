// client/src/pages/DirectMessages/DirectMessages.js
import React, { useEffect, useState } from "react";

function DirectMessages() {
  // Normally we'd have userId from context or route
  const userId = "PLACEHOLDER_USER_ID";
  const [messages, setMessages] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // fetch messages for this user
    fetch(`http://localhost:8080/api/messages/${userId}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        // build contact list
        const contacts = new Set();
        data.forEach(msg => {
          contacts.add(msg.senderId === userId ? msg.receiverId : msg.senderId);
        });
        setContactList([...contacts]);
      });
  }, [userId]);

  const handleSend = async () => {
    if (!selectedContact) return;
    const body = {
      senderId: userId,
      receiverId: selectedContact,
      content: newMessage
    };
    const response = await fetch("http://localhost:8080/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const savedMsg = await response.json();
    setMessages([...messages, savedMsg]);
    setNewMessage("");
  };

  const filteredMessages = messages.filter(msg =>
    msg.senderId === selectedContact || msg.receiverId === selectedContact
  );

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      <div style={{ width: "200px", marginRight: "20px" }}>
        <h4>Contacts</h4>
        <ul>
          {contactList.map(contact => (
            <li key={contact} onClick={() => setSelectedContact(contact)} style={{ cursor: "pointer" }}>
              {contact}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flexGrow: 1 }}>
        <h4>Messages</h4>
        <div style={{ border: "1px solid black", height: "300px", overflowY: "scroll", marginBottom: "10px" }}>
          {filteredMessages.map((m, i) => (
            <div key={i} style={{ margin: "5px" }}>
              <b>{m.senderId === userId ? "Me" : m.senderId}</b>: {m.content}
            </div>
          ))}
        </div>
        <div>
          <input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ width: "80%" }}
          />
          <button onClick={handleSend} style={{ marginLeft: "5px" }}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default DirectMessages;
