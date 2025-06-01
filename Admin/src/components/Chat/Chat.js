import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, List, Avatar, Badge, notification } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { database } from '../../config/FirebaseConfig';
import { ref, push, onValue, set, serverTimestamp } from 'firebase/database';
import './Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeUser, setActiveUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Lắng nghe danh sách users
        const usersRef = ref(database, 'trendyweare/users');
        onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val();
            if (usersData) {
                const usersList = Object.entries(usersData).map(([id, data]) => ({
                    id,
                    ...data
                }));
                setUsers(usersList);
            }
        });

        // Lắng nghe tin nhắn chưa đọc
        const unreadRef = ref(database, 'trendyweare/unread');
        onValue(unreadRef, (snapshot) => {
            const unreadData = snapshot.val() || {};
            setUnreadCounts(unreadData);
        });
    }, []);

    useEffect(() => {
        if (activeUser) {
            // Lắng nghe tin nhắn của user đang active
            const messagesRef = ref(database, `trendyweare/messages/${activeUser.id}`);
            onValue(messagesRef, (snapshot) => {
                const messagesData = snapshot.val();
                if (messagesData) {
                    const messagesList = Object.values(messagesData);
                    setMessages(messagesList);
                    scrollToBottom();
                } else {
                    setMessages([]);
                }
            });

            // Reset unread count khi admin xem tin nhắn
            set(ref(database, `trendyweare/unread/admin/${activeUser.id}`), 0);
        }
    }, [activeUser]);

    const handleSendMessage = () => {
        if (newMessage.trim() && activeUser) {
            const messagesRef = ref(database, `trendyweare/messages/${activeUser.id}`);
            push(messagesRef, {
                text: newMessage,
                sender: 'admin',
                timestamp: serverTimestamp(),
            });

            // Tăng số tin nhắn chưa đọc cho user
            const userUnreadRef = ref(database, `trendyweare/unread/user/${activeUser.id}`);
            const currentUnread = unreadCounts?.user?.[activeUser.id] || 0;
            set(userUnreadRef, currentUnread + 1);

            setNewMessage('');
        }
    };

    const handleUserClick = (user) => {
        setActiveUser(user);
    };

    return (
        <div className="chat-container">
            <div className="users-list">
                <List
                    itemLayout="horizontal"
                    dataSource={users}
                    renderItem={user => (
                        <List.Item 
                            onClick={() => handleUserClick(user)}
                            className={activeUser?.id === user.id ? 'active-user' : ''}
                        >
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {user.name || 'Anonymous'}
                                        {unreadCounts?.admin?.[user.id] > 0 && (
                                            <Badge 
                                                count={unreadCounts.admin[user.id]}
                                                style={{ marginLeft: 10 }}
                                            />
                                        )}
                                    </div>
                                }
                                description={user.email}
                            />
                        </List.Item>
                    )}
                />
            </div>
            <div className="chat-box">
                {activeUser ? (
                    <>
                        <div className="messages">
                            <List
                                itemLayout="horizontal"
                                dataSource={messages}
                                renderItem={message => (
                                    <List.Item className={`message ${message.sender === 'admin' ? 'sent' : 'received'}`}>
                                        <div className="message-content">
                                            {message.text}
                                        </div>
                                    </List.Item>
                                )}
                            />
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="message-input">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onPressEnter={handleSendMessage}
                                placeholder="Nhập tin nhắn..."
                            />
                            <Button 
                                type="primary" 
                                icon={<SendOutlined />} 
                                onClick={handleSendMessage}
                            >
                                Gửi
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        Chọn một người dùng để bắt đầu chat
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat; 