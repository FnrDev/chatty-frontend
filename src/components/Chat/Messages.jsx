import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Pin, PinOff, PlusCircle, Send, Trash2 } from "lucide-react";
import { socket } from "../../socket";
import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import { useParams } from 'react-router'
import { useAuth } from "@/context/AuthContext";
import { uploadImage } from "@/services/uploadImage";

export function MessageDemo() {
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [pinnedMessageIds, setPinnedMessageIds] = useState(() => new Set());
  const [pinningMessageId, setPinningMessageId] = useState(null);
  const [pinError, setPinError] = useState("");
  const [message, setMessage] = useState({
    textContent: "",
    mediaURL: "",
    mediaMimeType: "",
    mentionEveryone: false,
  });
  const { id, channelId } = useParams()
  const { user } = useAuth()
  const lastMessageId = messages[messages.length - 1]?._id

  useEffect(() => {
    async function loadChannelMessages() {
      const response = await api.get(`/workspaces/${id}/channels/${channelId}/messages`)
      setMessages(response.data)
    }

    loadChannelMessages()
  }, [id, channelId])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const frame = requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [channelId, lastMessageId])

  useEffect(() => {
    let ignore = false

    async function loadPins() {
      try {
        const response = await api.get(
          `/workspaces/${id}/channels/${channelId}/pins`
        )
        if (!ignore) {
          setPinnedMessageIds(
            new Set(response.data.map((pin) => String(pin.message?._id || pin.message)))
          )
          setPinError("")
        }
      } catch (err) {
        if (!ignore) {
          setPinError(err.response?.data?.message || "Could not load pinned messages")
        }
      }
    }

    loadPins()

    return () => {
      ignore = true
    }
  }, [id, channelId])

  useEffect(() => {
    function handlePinCreated(pin) {
      if (String(pin.channel) !== channelId) return

      const messageId = String(pin.message?._id || pin.message)
      setPinnedMessageIds((currentIds) => new Set(currentIds).add(messageId))
    }

    function handlePinDeleted(pin) {
      if (String(pin.channel) !== channelId) return

      setPinnedMessageIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(String(pin.message))
        return nextIds
      })
    }

    socket.on("message_pin_created", handlePinCreated)
    socket.on("message_pin_deleted", handlePinDeleted)

    return () => {
      socket.off("message_pin_created", handlePinCreated)
      socket.off("message_pin_deleted", handlePinDeleted)
    }
  }, [channelId])

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

  useEffect(() => {
    function handleMessageEdited(editedMessage) {
      if (editedMessage.channel !== channelId) return

      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) =>
          currentMessage._id === editedMessage._id
            ? editedMessage
            : currentMessage
        )
      )
    }

    socket.on('message_edited', handleMessageEdited)

    return () => {
      socket.off('message_edited', handleMessageEdited)
    }
  }, [channelId])

  useEffect(() => {
    function handleMessageDeleted(deletedMessage) {
      if (deletedMessage.channel !== channelId) return

      setMessages((currentMessages) =>
        currentMessages.filter(
          (currentMessage) => currentMessage._id !== deletedMessage._id
        )
      )
    }

    socket.on('message_deleted', handleMessageDeleted)

    return () => {
      socket.off('message_deleted', handleMessageDeleted)
    }
  }, [channelId])

  function sendMessage() {
    if (!message.textContent.trim()) return;

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

  function startEditing(messageToEdit) {
    setEditingMessageId(messageToEdit._id)
    setEditText(messageToEdit.textContent || "")
    setEditError("")
  }

  function cancelEditing() {
    setEditingMessageId(null)
    setEditText("")
    setEditError("")
  }

  async function saveEditedMessage() {
    const textContent = editText.trim()

    if (!textContent) {
      setEditError("Message cannot be empty")
      return
    }

    try {
      setIsSavingEdit(true)
      setEditError("")

      await api.patch(
        `/workspaces/${id}/channels/${channelId}/messages/${editingMessageId}`,
        { textContent }
      )

      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) =>
          currentMessage._id === editingMessageId
            ? {
                ...currentMessage,
                textContent,
                editedAt: new Date().toISOString(),
              }
            : currentMessage
        )
      )

      cancelEditing()
    } catch (err) {
      setEditError(err.response?.data?.message || "Could not edit message")
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function deleteMessage() {
    if (!deletingMessage) return

    try {
      setIsDeleting(true)
      setDeleteError("")

      await api.delete(
        `/workspaces/${id}/channels/${channelId}/messages/${deletingMessage._id}`
      )

      setMessages((currentMessages) =>
        currentMessages.filter(
          (currentMessage) => currentMessage._id !== deletingMessage._id
        )
      )

      setDeletingMessage(null)
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete message")
    } finally {
      setIsDeleting(false)
    }
  }

  async function toggleMessagePin(messageToToggle) {
    const messageId = messageToToggle._id
    const isPinned = pinnedMessageIds.has(messageId)

    try {
      setPinningMessageId(messageId)
      setPinError("")

      if (isPinned) {
        await api.delete(
          `/workspaces/${id}/channels/${channelId}/messages/${messageId}/pin`
        )
      } else {
        await api.post(
          `/workspaces/${id}/channels/${channelId}/messages/${messageId}/pin`
        )
      }

      setPinnedMessageIds((currentIds) => {
        const nextIds = new Set(currentIds)
        if (isPinned) nextIds.delete(messageId)
        else nextIds.add(messageId)
        return nextIds
      })
    } catch (err) {
      setPinError(
        err.response?.data?.message ||
          `Could not ${isPinned ? "unpin" : "pin"} message`
      )
    } finally {
      setPinningMessageId(null)
    }
  }

  async function handleOnChange(event) {
    const { name, value, type, files } = event.target
    if (type === "file") {
      const file = files[0]

      const data = await uploadImage(file)

      setMessage((prev) => ({
        ...prev,
        mediaURL: data.url,
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
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-y-auto py-4"
      >
        <div className="flex flex-col gap-6">
          {messages.map((message) => {
            const author = typeof message.author === "object" ? message.author : null
            const authorId = author?._id || message.author
            const isSentMessage = user?._id === authorId
            const isEditing = editingMessageId === message._id
            const isPinned = pinnedMessageIds.has(message._id)

            return (
              <Message key={message._id} align={isSentMessage ? "end" : "start"}>
            <MessageAvatar>
              <Avatar>
                <AvatarImage src={author?.profileImage} alt={author?.username} />
                <AvatarFallback>
                  {author?.username?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              {isEditing ? (
                <form
                  className="flex w-full max-w-md flex-col gap-2 self-end"
                  onSubmit={(event) => {
                    event.preventDefault()
                    saveEditedMessage()
                  }}
                >
                  <Textarea
                    autoFocus
                    value={editText}
                    onChange={(event) => setEditText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        cancelEditing()
                      }

                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        saveEditedMessage()
                      }
                    }}
                    aria-label="Edit message"
                    className="min-h-20 resize-none"
                  />
                  {editError && (
                    <span className="text-sm text-destructive">{editError}</span>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={isSavingEdit}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isSavingEdit}>
                      {isSavingEdit ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className={`flex items-center gap-1 ${isSentMessage ? "self-end" : "self-start"}`}>
                  <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Message options"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={pinningMessageId === message._id}
                          onClick={() => toggleMessagePin(message)}
                        >
                          {isPinned ? (
                            <PinOff className="size-4" />
                          ) : (
                            <Pin className="size-4" />
                          )}
                          {isPinned ? "Unpin message" : "Pin message"}
                        </DropdownMenuItem>
                        {isSentMessage && (
                          <>
                            <DropdownMenuItem onClick={() => startEditing(message)}>
                              <Pencil className="size-4" />
                              Edit message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setDeletingMessage(message)
                                setDeleteError("")
                              }}
                            >
                              <Trash2 className="size-4" />
                              Delete message
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  <Bubble variant={isSentMessage ? "default" : "muted"}>
                    <BubbleContent>
                      {message.textContent}
                      {message.mediaURL && (
                      <img className="rounded-lg mt-2" width={300} height={300} src={message.mediaURL} alt={message.mediaURL} />
                    )}
                    </BubbleContent>
                  </Bubble>
                </div>
              )}
              {!isEditing && (message.editedAt || isPinned) && (
                <MessageFooter className="gap-2">
                  {isPinned && (
                    <span className="inline-flex items-center gap-1">
                      <Pin className="size-3" />
                      Pinned
                    </span>
                  )}
                  {message.editedAt && <span>Edited</span>}
                </MessageFooter>
              )}
            </MessageContent>
              </Message>
            )
          })}
        </div>
      </div>
      {pinError && (
        <p className="mb-2 text-sm text-destructive">{pinError}</p>
      )}
      <Card className="mt-3 flex flex-col min-h-max! gap-3! shrink-0 items-start px-2 py-2!">
         {message.mediaURL && (
          <img width={100} className="rounded-lg" height={100} src={message.mediaURL} alt={message.mediaURL} />
        )}
       <div className="flex items-center w-full flex-row">
         <Button
          variant={"outline"}
          aria-label="Attach a file"
          render={<label htmlFor="mediaURL" className="cursor-pointer" />}
        >
          <input id="mediaURL" name="mediaURL" type="file" className="sr-only" onChange={handleOnChange} />
          <PlusCircle />
        </Button>
        <Textarea
        name="textContent"
        value={message.textContent}
        placeholder="Write a message..."
        className="bg-transparent! resize-none min-h-max! border-none! focus:ring-0!"
        onChange={handleOnChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
          }
        }}
        ></Textarea>
        <Button type="button" onClick={sendMessage} aria-label="Send message">
          <Send />
        </Button>
       </div>
      </Card>
      <AlertDialog
        open={Boolean(deletingMessage)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingMessage(null)
            setDeleteError("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be removed for everyone in the channel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={deleteMessage}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
