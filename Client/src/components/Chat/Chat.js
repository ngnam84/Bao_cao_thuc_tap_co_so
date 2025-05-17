import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, List, Badge, Drawer } from 'antd';
import { SendOutlined, MessageOutlined } from '@ant-design/icons';
import { database } from '../../config/FirebaseConfig';
import { ref, push, onValue, set, serverTimestamp } from 'firebase/database';
import './Chat.css';

const Chat = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [visible, setVisible] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (user) {
            // Lắng nghe tin nhắn
            const messagesRef = ref(database, `trendyweare/messages/${user.id}`);
            onValue(messagesRef, (snapshot) => {
                const messagesData = snapshot.val();
                if (messagesData) {
                    const messagesList = Object.values(messagesData);
                    setMessages(messagesList);
                    scrollToBottom();
                }
            });

            // Lắng nghe tin nhắn chưa đọc
            const unreadRef = ref(database, `trendyweare/unread/user/${user.id}`);
            onValue(unreadRef, (snapshot) => {
                const count = snapshot.val() || 0;
                setUnreadCount(count);
            });
        }
    }, [user]);

    const handleSendMessage = () => {
        if (newMessage.trim() && user) {
            // Cập nhật thông tin user vào database
            const userRef = ref(database, `trendyweare/users/${user.id}`);
            set(userRef, {
                id: user.id,
                name: user.name || user.username || 'Anonymous',
                email: user.email,
                lastMessage: newMessage,
                lastMessageTime: serverTimestamp()
            });

            // Gửi tin nhắn
            const messagesRef = ref(database, `trendyweare/messages/${user.id}`);
            push(messagesRef, {
                text: newMessage,
                sender: 'user',
                timestamp: serverTimestamp(),
            });

            // Tăng số tin nhắn chưa đọc cho admin
            const adminUnreadRef = ref(database, `trendyweare/unread/admin/${user.id}`);
            set(adminUnreadRef, (unreadCount || 0) + 1);

            setNewMessage('');
        }
    };

    const showDrawer = () => {
        setVisible(true);
        // Cập nhật thông tin user khi mở chat
        if (user) {
            const userRef = ref(database, `trendyweare/users/${user.id}`);
            set(userRef, {
                id: user.id,
                name: user.name || user.username || 'Anonymous',
                email: user.email,
                lastActive: serverTimestamp()
            });
            // Reset unread count
            set(ref(database, `trendyweare/unread/user/${user.id}`), 0);
        }
    };

    const onClose = () => {
        setVisible(false);
    };

    return (
        <>
            <div className="chat-trigger" onClick={showDrawer}>
                <Badge count={unreadCount}>
                    <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<MessageOutlined />} 
                        size="large"
                    />
                </Badge>
            </div>

            <Drawer
                title="Chat với Admin"
                placement="right"
                onClose={onClose}
                visible={visible}
                width={400}
            >
                <div className="chat-drawer-content">
                    <div className="messages">
                        <List
                            itemLayout="horizontal"
                            dataSource={messages}
                            renderItem={message => (
                                <List.Item className={`message ${message.sender === 'user' ? 'sent' : 'received'}`}>
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
                </div>
            </Drawer>
        </>
    );
};

export default Chat; 