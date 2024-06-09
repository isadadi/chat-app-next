"use client";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@nextui-org/spinner";

import { SendIcon } from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import ChatBubble from "@/components/chat-bubble";
import UserModal from "@/components/user-modal";

type Message = {
  id: number;
  body: string;
  sender: string;
};

export default function Home() {
  const [userName, setUserName] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const [socket, setSocket] = useState<WebSocket>();
  const [errorMessage, setErrorMessage] = useState("");

  const messageRef = useRef<HTMLDivElement>(null);

  const handleConnectSocket = async () => {
    const ws = new WebSocket(`wss://${process.env.NEXT_PUBLIC_WS}/cable`);

    ws.onopen = () => {
      console.log("Socket connected");
      setSocket(ws);
    };

    ws.onerror = (e) => {
      console.log("Socket error");
      setErrorMessage("Application Errror");
    };
  };

  useEffect(() => {
    handleConnectSocket();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "ping") return;
      if (data.type === "welcome") return;
      if (data.type === "confirm_subscription") return;

      const message = data.message;

      setMessagesAndScrollDown([...messages, message]);
    };
  });

  const resetScroll = () => {
    const scrollableElement = messageRef.current;

    if (!scrollableElement) return;
    scrollableElement.scrollTop = scrollableElement.scrollHeight;
  };

  const setMessagesAndScrollDown = (data: Message[]) => {
    setMessages(data);
    resetScroll();
  };

  const fetchMessages = async () => {
    const response = await fetch("http://localhost:3000/messages");
    const data = await response.json();

    setMessagesAndScrollDown(data);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: inputMessage, sender: userName }),
    });

    setInputMessage("");
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    resetScroll();
  }, [messages]);

  const handleJoin = (value: string) => {
    if (!socket) return;
    console.log(socket);
    const guid = Math.random().toString(36).substring(2, 15);

    socket.send(
      JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({
          id: guid,
          channel: "MessagesChannel",
        }),
      }),
    );

    setUserName(value);
  };

  const renderContent = (state: "loading" | "error" | "success") => {
    switch (state) {
      case "loading":
        return (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center h-full">
            {errorMessage}
          </div>
        );

      case "success":
        return (
          <>
            <div className="bg-blue-100 dark:bg-slate-700 h-20 py-4 flex items-center justify-between px-2">
              <p className="font-bold dark:text-neutral-50 text-neutral-600">
                CHIT CHAT
              </p>
              <p className="dark:text-neutral-300">Welcome, {userName}</p>
              <ThemeSwitch />
            </div>
            <div
              ref={messageRef}
              className="flex-auto px-1 flex flex-col gap-1 overflow-y-auto"
              id="chat"
            >
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message.body}
                  position={message.sender === userName ? "left" : "right"}
                  sender={message.sender}
                />
              ))}
            </div>
            <div id="submit-message">
              <form className="flex gap-2 px-2" onSubmit={handleSubmit}>
                <Input
                  name="message"
                  placeholder="Type your message"
                  value={inputMessage}
                  onValueChange={setInputMessage}
                />
                <Button
                  isIconOnly
                  color="primary"
                  type="submit"
                  variant="solid"
                >
                  <SendIcon color="#fffff" size={20} />
                </Button>
              </form>
            </div>
          </>
        );
    }
  };

  return (
    <section className="flex justify-center">
      <div
        className="bg-blue-200 dark:bg-slate-800 text-neutral-500 min-h-[100%-4rem] w-full md:w-1/3 pb-5 h-svh flex flex-col gap-3"
        id="messages"
      >
        {renderContent(
          errorMessage ? "error" : !userName ? "loading" : "success",
        )}
      </div>
      <UserModal wsOpen={!!socket} onJoin={handleJoin} />
    </section>
  );
}
