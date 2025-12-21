import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import UserContext from "../Context/UserContext";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

let socket;

const Chat = () => {
    const { userData } = useContext(UserContext);
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();
    const location = useLocation();

    // Initialize Socket & Load Chats
    useEffect(() => {
        socket = io("http://localhost:5000");

        const fetchChats = async () => {
            try {
                const res = await axios.get("/chats", {
                    headers: { "x-auth-token": localStorage.getItem("auth-token") }
                });
                setChats(res.data);

                // If directed from Profile (passed via state)
                if (location.state && location.state.chatId) {
                    const targetChat = res.data.find(c => c._id === location.state.chatId);
                    if (targetChat) setActiveChat(targetChat);
                }
            } catch (err) {
                console.log(err);
            }
        };

        if (userData.user) fetchChats();

        return () => {
            socket.disconnect();
        };
    }, [userData.user, location.state]);

    // Handle Active Chat & Room Joining
    useEffect(() => {
        if (activeChat) {
            socket.emit("join_room", activeChat._id);
            setMessages(activeChat.messages || []);

            // Mark as Read
            axios.put(`/chats/read/${activeChat._id}`, {}, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") }
            }).catch(err => console.log(err));
        }
    }, [activeChat]);

    // Listen for incoming messages
    useEffect(() => {
        socket.on("receive_message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
    }, []);

    // Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const msgData = {
            roomId: activeChat._id,
            senderId: userData.user.id || userData.user._id,
            text: newMessage
        };

        // Emit to server
        socket.emit("send_message", msgData);
        setNewMessage("");
    };

    const deleteChat = async (e, chatId) => {
        e.stopPropagation(); // Prevent opening the chat when deleting
        if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) return;

        try {
            await axios.delete(`/chats/${chatId}`, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") }
            });
            // Remove from state
            setChats(prev => prev.filter(c => c._id !== chatId));
            // If active chat was deleted, clear it
            if (activeChat?._id === chatId) setActiveChat(null);
        } catch (err) {
            console.log(err);
            alert("Failed to delete chat");
        }
    };

    const getOtherParticipant = (chat) => {
        if (!chat || !userData.user) return {};
        const myId = userData.user.id || userData.user._id;
        return chat.participants.find(p => p._id !== myId) || {};
    };

    if (!userData.user) return <div>Please login to chat.</div>;

    return (
        <div className="container-fluid p-0" style={{ height: "85vh", marginTop: "10px" }}>
            <div className="row g-0" style={{ height: "100%" }}>

                {/* Sidebar */}
                <div className="col-md-4 col-lg-3 border-end bg-white" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ flexShrink: 0 }}>
                        <h4 className="mb-0 fw-bold">Chats</h4>
                        <div className="bg-light rounded-circle p-2">
                            <i className="bi bi-pencil-square"></i>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }} className="custom-scrollbar">
                        {chats.map(chat => {
                            const other = getOtherParticipant(chat);
                            return (
                                <div
                                    key={chat._id}
                                    className={`p-3 d-flex align-items-center justify-content-between ${activeChat?._id === chat._id ? "bg-light border-start border-4 border-primary" : "hover-bg-light"}`}
                                    onClick={() => setActiveChat(chat)}
                                    style={{ cursor: "pointer", transition: "all 0.1s" }}
                                >
                                    <div className="d-flex align-items-center overflow-hidden">
                                        <div
                                            className="rounded-circle bg-secondary me-3 d-flex justify-content-center align-items-center flex-shrink-0"
                                            style={{ width: "50px", height: "50px", overflow: "hidden" }}
                                        >
                                            {other.image ? (
                                                <img src={other.image} alt="usr" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <span className="text-white fs-4 fw-bold">{other.displayName?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div className="fw-bold text-dark text-truncate" style={{ fontSize: "1rem" }}>{other.displayName}</div>
                                            <div className="text-truncate text-muted" style={{ fontSize: "0.9rem" }}>
                                                {chat.lastMessage
                                                    ? (chat.lastMessage.startsWith(userData.user.id) ? "You: " : "") + chat.lastMessage
                                                    : "New connection"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        className="btn btn-link text-danger p-0 ms-2"
                                        onClick={(e) => deleteChat(e, chat._id)}
                                        title="Delete Conversation"
                                        style={{ fontSize: "1.2rem" }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="col-md-8 col-lg-9 bg-white" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    {activeChat ? (
                        <>
                            {/* Header */}
                            <div className="px-3 py-2 border-bottom d-flex align-items-center bg-white shadow-sm" style={{ flexShrink: 0, height: "60px" }}>
                                <div
                                    className="rounded-circle bg-secondary me-3 d-flex justify-content-center align-items-center"
                                    style={{ width: "40px", height: "40px", overflow: "hidden" }}
                                >
                                    {getOtherParticipant(activeChat).image ? (
                                        <img src={getOtherParticipant(activeChat).image} alt="u" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span className="text-white fw-bold">{getOtherParticipant(activeChat).displayName?.charAt(0)}</span>
                                    )}
                                </div>
                                <h5 className="mb-0 fw-bold">{getOtherParticipant(activeChat).displayName}</h5>
                                <i className="bi bi-info-circle ms-auto fs-4 text-primary"></i>
                            </div>

                            {/* Messages */}
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    backgroundColor: "#ffffff",
                                    padding: "20px"
                                }}
                            >
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender === (userData.user.id || userData.user._id);
                                    return (
                                        <div key={index} className={`d-flex mb-1 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                                            {!isMe && (
                                                <div
                                                    className="rounded-circle bg-secondary me-2 d-flex justify-content-center align-items-center align-self-end mb-2"
                                                    style={{ width: "28px", height: "28px", overflow: "hidden", visibility: index < messages.length - 1 && messages[index + 1].sender === msg.sender ? 'hidden' : 'visible' }}
                                                >
                                                    {getOtherParticipant(activeChat).image ? (
                                                        <img src={getOtherParticipant(activeChat).image} alt="u" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : (
                                                        <span className="text-white" style={{ fontSize: "0.7rem" }}>{getOtherParticipant(activeChat).displayName?.charAt(0)}</span>
                                                    )}
                                                </div>
                                            )}
                                            <div
                                                className={`py-2 px-3 ${isMe ? "bg-primary text-white" : "bg-light text-dark"}`}
                                                style={{
                                                    maxWidth: "65%",
                                                    borderRadius: "18px",
                                                    fontSize: "0.95rem",
                                                    border: isMe ? "none" : "1px solid #eee"
                                                }}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef}></div>
                            </div>

                            {/* Input Area */}
                            <div className="px-3 py-3 border-top bg-white" style={{ flexShrink: 0 }}>
                                <form onSubmit={sendMessage} className="d-flex align-items-center w-100">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control rounded-pill bg-light border-0 px-3"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            style={{ height: "45px" }}
                                            autoFocus
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-link text-primary ms-2 p-0"
                                            disabled={!newMessage.trim()}
                                        >
                                            <i className="bi bi-send-fill fs-3"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="d-flex h-100 flex-column justify-content-center align-items-center text-muted">
                            <div className="display-1 text-primary"><i className="bi bi-chat-square-text"></i></div>
                            <h2 className="mt-3">Your Messages</h2>
                            <p className="lead text-secondary">Send photos and private messages to a friend.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
