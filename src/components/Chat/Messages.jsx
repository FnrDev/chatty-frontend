import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { PlusCircle, Send } from "lucide-react";
import { socket } from "../../socket";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useParams } from 'react-router'
import { useAuth } from "@/context/AuthContext";

export function MessageDemo() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState({
    textContent: "",
    mediaURL: "",
    mediaMimeType: "",
    mentionEveryone: false,
  });
  const { id, channelId } = useParams()
  const { user } = useAuth()

  useEffect(() => {
    async function loadChannelMessages() {
      const response = await api.get(`/workspaces/${id}/channels/${channelId}/messages`)
      setMessages(response.data)
    }

    loadChannelMessages()
  }, [])

  useEffect(() => {
    function handleMessageReceived(receivedMessage) {
      if (receivedMessage.channel !== channelId) return

      setMessages((currentMessages) => [
        ...currentMessages,
        receivedMessage,
      ])
    }

    socket.on('message_received', handleMessageReceived)

    return () => {
      socket.off('message_received', handleMessageReceived)
    }
  }, [channelId])

  function sendMessage() {
    if (!message.textContent.trim()) return;
    console.log(message)

    socket.emit('send_message', {
      ...message,
      channelId,
      workspaceId: id,
      author: user._id
    })

    setMessage({
      textContent: "",
      mediaMimeType: "",
      mediaURL: "",
      mentionEveryone: false,
    })
  }

  function handleOnChange(event) {
    const { name, value, type, files } = event.target
    if (type === "file") {
      const file = files[0]

      setMessage((prev) => ({
        ...prev,
        [name]: file,
        mediaMimeType: file.type || ""
      }))

      return
    }

    setMessage((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="flex w-full flex-col gap-6 py-12">
      {messages.map(message => (
        <Message align={user._id == message.author._id ? "end" : "start"}>
          <MessageAvatar>
            <Avatar>
              <AvatarImage src={message.author.profileImage} alt={message.author.username} />
              <AvatarFallback>{message.author.username}</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <Bubble>
              <BubbleContent>{message.textContent}</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      ))}
       <Card className="min-h-max! flex items-start flex-row px-2 py-2! mt-5">
        <Button
          variant={"outline"}
          aria-label="Attach a file"
          render={<label htmlFor="chat-file" className="cursor-pointer" />}
        >
          <input id="chat-file" type="file" className="sr-only" onChange={handleOnChange} />
          <PlusCircle />
        </Button>
        <Textarea
        name="textContent"
        value={message.textContent}
        className="bg-transparent! resize-none min-h-max! border-none! focus:ring-0!"
        onChange={handleOnChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
          }
        }}
        ></Textarea>
        <Button>
          <Send />
        </Button>
      </Card>
    </div>
  )
}
