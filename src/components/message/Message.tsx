"use client";

import React, {
    useState,
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useRef,
    useEffect,
} from "react";
import { IConversation } from "@/types/conversation";
import { FaPaperPlane } from "react-icons/fa";
import { IUserS } from "@/types/user";
import { useRouter } from "next/navigation";
import { IMessage } from "@/types/message";
import MessageDetail from "@/components/message/MessageDetail";
import { IoMdClose } from "react-icons/io";
import SimpleBar from "simplebar-react";
import { FaPhotoFilm } from "react-icons/fa6";
import { uploadOneImage } from "@/hooks/useUploadImage";
import { MdDelete } from "react-icons/md";
import { removeOneImage } from "@/hooks/useRemoveOneImage";
import {
    useCreateConversation,
    useCreateMessage,
    useUpdateConversation,
} from "@/hooks/react-query/message";

export default function Message({
    conversations,
    conversation,
    conversation_id,
    currentUser,
    messages,
    isReplying,
    setIsReplying,
    replyingTo,
    setReplyingTo,
    onlineUsers,
}: {
    conversations: IConversation[];
    conversation: IConversation;
    conversation_id: string;
    currentUser: IUserS;
    messages: IMessage[];
    isReplying: boolean;
    setIsReplying: Dispatch<SetStateAction<boolean>>;
    replyingTo: {
        messageid: string;
        messagetext: string;
        _id: string;
        name: string;
    };
    setReplyingTo: Dispatch<
        SetStateAction<{
            messageid: string;
            messagetext: string;
            _id: string;
            name: string;
        }>
    >;
    onlineUsers: string[];
}) {
    const [messageForm, setMessageForm] = useState<string>("");
    const [user, setUser] = useState<{
        name: string;
        username: string;
        profilePicture: string;
        _id: string;
    }>({
        name: "",
        username: "",
        profilePicture: "",
        _id: "",
    });
    const [fileToSendMessage, setFileToSendMessage] = useState<string>("");
    const [typeOfFileToSendMessage, setTypeOfFileToSendMessage] =
        useState<string>("");
    const conversationId =
        conversation_id?.replace("temp_", "") || "default_id";
    const [isTypeing, setIsTyping] = useState<any>();
    const router = useRouter();

    const otherUser = conversation?.members?.find(
        (mem) => mem?._id !== currentUser?._id
    );

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessageForm(e.target.value);
    };

    const createConversation = useCreateConversation();
    const updateConversation = useUpdateConversation(conversation._id);
    const createMessage = useCreateMessage();
    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!messageForm && !fileToSendMessage) return;
        const lastMessageTime = new Date().toISOString();

        if (conversation_id && conversation_id.startsWith("temp_")) {
            createConversation.mutate(
                {
                    members: [conversationId, currentUser?._id],
                    lastMessage: typeOfFileToSendMessage
                        ? `Sent a ${typeOfFileToSendMessage}`
                        : messageForm,
                    lastMessageTime: lastMessageTime,
                },
                {
                    onSuccess: (newConversation: IConversation) => {
                        const conversationId = newConversation._id;

                        // Gửi tin nhắn nếu có file
                        if (fileToSendMessage) {
                            createMessage.mutate({
                                conversationId: conversationId,
                                text: fileToSendMessage,
                                members: [
                                    conversation_id.replace("temp_", ""),
                                    currentUser?._id,
                                ],
                                type: typeOfFileToSendMessage,
                            });
                            setFileToSendMessage("");
                            setTypeOfFileToSendMessage("");
                        }

                        // Gửi tin nhắn nếu có text
                        if (messageForm) {
                            createMessage.mutate({
                                conversationId: conversationId,
                                text: messageForm,
                                members: [
                                    conversation_id.replace("temp_", ""),
                                    currentUser?._id,
                                ],
                                type: "message",
                            });
                        }

                        // Điều hướng đến trang chi tiết tin nhắn
                        router.replace(`/messages/${conversationId}`);
                    },
                }
            );
        } else {
            updateConversation.mutate({
                conversationId: conversation_id,
                lastMessage: typeOfFileToSendMessage
                    ? `Sent a ${typeOfFileToSendMessage}`
                    : messageForm,
                lastMessageTime: lastMessageTime,
            });

            if (fileToSendMessage) {
                createMessage.mutate({
                    conversationId: conversation_id,
                    text: fileToSendMessage,
                    members: conversation.members,
                    type: typeOfFileToSendMessage,
                });

                setFileToSendMessage("");
                setTypeOfFileToSendMessage("");
            }

            if (messageForm) {
                createMessage.mutate({
                    conversationId: conversation_id,
                    text: messageForm,
                    members: conversation.members,
                    type: "message",
                    ...(isReplying
                        ? {
                              replyTo: {
                                  messageId: replyingTo.messageid,
                                  text: replyingTo.messagetext,
                                  id: replyingTo._id,
                              },
                          }
                        : {}),
                });
            }
        }

        setIsReplying(false);
        setReplyingTo({
            messageid: "",
            messagetext: "",
            _id: "",
            name: "",
        });
        setMessageForm("");
        if (fileToSendMessage) {
            setFileToSendMessage("");
            setTypeOfFileToSendMessage("");
        }
    };

    const handleKeyPress = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage(
                event as unknown as React.FormEvent<HTMLFormElement>
            );
        }
    };

    const closeReplyMessage = () => {
        setIsReplying(false);
        setReplyingTo({
            messageid: "",
            messagetext: "",
            _id: "",
            name: "",
        });
    };

    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (conversation_id.startsWith("temp")) {
            const temp_conversation = localStorage.getItem(
                `${conversation_id.replace(/^temp/, "conversation")}`
            );
            if (temp_conversation) {
                setUser(JSON.parse(temp_conversation));
            }
            return;
        }
        if (conversation.conversationType !== "private") {
            return;
        }

        const userId = conversation.members.find(
            (member) => member._id !== currentUser?._id
        );

        if (!userId) return;

        setUser(userId);
    }, [conversation._id]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (
            file &&
            (file.type.startsWith("image/") || file.type.startsWith("video/"))
        ) {
            let type: string = "";
            if (file.type.startsWith("image/")) {
                type = "message-image";
                setTypeOfFileToSendMessage("photo");
            }
            if (file.type.startsWith("video/")) {
                type = "message-video";
                setTypeOfFileToSendMessage("video");
            }
            const username = currentUser?.username;
            const uploadedImage = await uploadOneImage(file, type, username);
            if (uploadedImage) {
                setFileToSendMessage(uploadedImage);
            }
        } else {
            return;
        }
    };

    const removeImage = async () => {
        if (fileToSendMessage) {
            await removeOneImage(fileToSendMessage);
            setFileToSendMessage("");
        }
    };

    return (
        <div className="relative bg-white px-2 rounded-lg h-[calc(100vh-64px-16px-16px)] lg:h-[calc(100vh-64px-32px-32px)]">
            <div className="py-5 flex gap-3 items-center border-b">
                <img
                    src={
                        conversation.conversationPicture || user.profilePicture
                    }
                    alt=""
                    className="w-10 h-10 rounded-full border"
                />
                <p className="font-semibold">
                    {conversation.conversationName || user.name}
                </p>
                {otherUser && onlineUsers.includes(otherUser._id) && (
                    <p className="text-xs text-green-500">Active now</p>
                )}
            </div>
            <SimpleBar
                className={`${
                    isReplying
                        ? "lg:h-[calc(100vh-64px-32px-32px-120px-34px-33px)] h-[calc(100vh-64px-16px-16px-120px-34px-33px)]"
                        : "lg:h-[calc(100vh-64px-32px-32px-120px-19px)] h-[calc(100vh-64px-16px-16px-120px-19px)]"
                } overflow-y-auto w-full mt-2`}
            >
{messages &&
    messages
        .filter((message, index, self) => 
            index === self.findIndex((m) => m._id === message._id)
        )
        .map((message) => (
            <div key={message?._id} className="pr-2">
                <MessageDetail
                    message={message}
                    currentUser={currentUser}
                    setIsReplying={setIsReplying}
                    setReplyingTo={setReplyingTo}
                />
            </div>
        ))}


                <div ref={endOfMessagesRef} />
            </SimpleBar>
            <div className="absolute group bottom-[54px] right-2">
                {isTypeing && (
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-secondary">
                            typing
                        </p>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    </div>
                )}
            </div>
            {fileToSendMessage && (
                <div className="absolute group bottom-[54px] right-2">
                    {typeOfFileToSendMessage === "photo" ? (
                        <img
                            src={fileToSendMessage}
                            alt="message"
                            className="w-20 aspect-square object-cover rounded"
                        />
                    ) : (
                        <video className="w-20 aspect-square object-cover rounded">
                            <source
                                className="w-20 aspect-square object-cover rounded"
                                src={fileToSendMessage}
                                type="video/mp4"
                            />
                        </video>
                    )}
                    <div
                        onClick={removeImage}
                        className="w-full h-full inset-0 flex justify-center items-center bg-gray-200 opacity-0 group group-hover:opacity-100 transition duration-500 ease-in-out absolute top-0 bottom-0 right-0 left-0 bg-opacity-60 hover:cursor-pointer"
                    >
                        <MdDelete className="text-3xl text-red-500" />
                    </div>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="absulute">
                {isReplying && (
                    <div className="px-2 border-t flex justify-between items-center">
                        <div>
                            <div className="flex gap-2">
                                <p>Replying to </p>
                                <p className="font-semibold">
                                    {replyingTo._id === currentUser?._id
                                        ? "yourself"
                                        : replyingTo.name}
                                </p>
                            </div>
                            <p className="text-secondary">
                                {replyingTo.messagetext}
                            </p>
                        </div>
                        <button
                            onClick={closeReplyMessage}
                            type="button"
                            className="text-secondary hover:text-primary"
                        >
                            <IoMdClose className="text-2xl" />
                        </button>
                    </div>
                )}
                <div className="flex item-center border rounded border-l-0">
                    <div className="">
                        <label
                            htmlFor="message-send_image"
                            className="px-4 h-full border-l rounded text-secondary hover:text-black flex justify-center items-center hover:cursor-pointer"
                        >
                            <FaPhotoFilm />
                        </label>
                        <input
                            onChange={handleFileChange}
                            type="file"
                            accept="image/* video/*"
                            id="message-send_image"
                            className="hidden"
                            hidden
                        />
                    </div>
                    <textarea
                        onKeyDown={handleKeyPress}
                        value={messageForm}
                        onChange={handleChange}
                        rows={1}
                        placeholder="Type a message"
                        className="resize-none w-full border-l outline-none p-2 mr-2"
                    />
                    <button
                        type="submit"
                        className="px-3 outline-none border-0"
                    >
                        <FaPaperPlane className="text-xl text-secondary hover:text-black" />
                    </button>
                </div>
            </form>
        </div>
    );
}
