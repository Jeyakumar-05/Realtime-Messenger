import { create } from 'zustand'
import toast from "react-hot-toast"
import axiosInstance from "../lib/axios"
import { useAuthStore } from './useAuthStore'

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    updateUserUnreadCount: (userId, increment = true) => {
        const { users } = get();
        set({
            users: users.map(user => {
                if (user._id === userId) {
                    const newCount = increment 
                        ? (user.unreadCount || 0) + 1 
                        : Math.max(0, (user.unreadCount || 0) - 1);
                    return { ...user, unreadCount: newCount };
                }
                return user;
            })
        });
    },

    resetUserUnreadCount: (userId) => {
        const { users } = get();
        set({
            users: users.map(user => 
                user._id === userId ? { ...user, unreadCount: 0 } : user
            )
        });
    },

    getMessages: async (userID) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userID}`);
            set({ messages: res.data });
            // Update unread count locally after marking messages as read
            get().resetUserUnreadCount(userID);
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    markMessageAsRead: async (messageId) => {
        try {
            await axiosInstance.put(`/messages/read/${messageId}`);
        } catch (error) {
            // Silently fail - not critical
            console.error("Error marking message as read:", error);
        }
    },

    subscribeToNewMessage: () => {
        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", async (newMessage) => {
            const { messages, selectedUser } = get();
            const { authUser } = useAuthStore.getState();
            const senderId = String(newMessage.senderId);
            const receiverId = String(newMessage.recieverId);
            const authUserId = String(authUser._id);
            
            // Check if message is for current user
            if (receiverId === authUserId) {
                // If message is for currently selected chat, add it to messages and mark as read
                if (selectedUser && String(selectedUser._id) === senderId) {
                    set({ messages: [...messages, newMessage] });
                    // Mark as read immediately if chat is open (count stays at 0 since chat is open)
                    await get().markMessageAsRead(newMessage._id);
                } else {
                    // Message is for a different chat - increment unread count immediately
                    get().updateUserUnreadCount(senderId, true);
                }
            }
        });
    },

    unsubscribeFromNewMessage: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

}))