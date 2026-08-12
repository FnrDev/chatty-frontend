import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleReactions, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

const REACTION_CHOICES = ["👍", "❤️", "😂", "🎉", "👀", "🙏"]

function groupReactions(reactions, currentUserId) {
  const groups = new Map()

  for (const reaction of reactions || []) {
    const authorId = String(reaction.author?._id || reaction.author)
    const group = groups.get(reaction.reaction) || {
      reaction: reaction.reaction,
      count: 0,
      mine: null,
    }

    group.count += 1
    if (authorId === String(currentUserId)) group.mine = reaction

    groups.set(reaction.reaction, group)
  }

  return [...groups.values()]
}

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
  const [reactingMessageId, setReactingMessageId] = useState(null);
  const [reactionError, setReactionError] = useState("");
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

  useEffect(() => {
    function handleReactionChanged(updatedMessage) {
      if (String(updatedMessage.channel) !== channelId) return

      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) =>
          currentMessage._id === updatedMessage._id
            ? { ...currentMessage, reactions: updatedMessage.reactions }
            : currentMessage
        )
      )
    }

    socket.on('message_reaction_added', handleReactionChanged)
    socket.on('message_reaction_removed', handleReactionChanged)

    return () => {
      socket.off('message_reaction_added', handleReactionChanged)
      socket.off('message_reaction_removed', handleReactionChanged)
    }
  }, [channelId])

  function sendMessage() {
    const textContent = message.textContent.trim()
    if (!textContent && !message.mediaURL) return

    socket.emit('send_message', {
      ...message,
      textContent,
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

  async function toggleReaction(messageToReact, reaction) {
    const messageId = messageToReact._id
    const mine = groupReactions(messageToReact.reactions, user?._id).find(
      (group) => group.reaction === reaction
    )?.mine

    try {
      setReactingMessageId(messageId)
      setReactionError("")

      const response = mine
        ? await api.delete(
            `/workspaces/${id}/channels/${channelId}/messages/${messageId}/reactions/${mine._id}`
          )
        : await api.post(
            `/workspaces/${id}/channels/${channelId}/messages/${messageId}/reactions`,
            { reaction }
          )

      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) =>
          currentMessage._id === messageId
            ? { ...currentMessage, reactions: response.data.reactions }
            : currentMessage
        )
      )
    } catch (err) {
      setReactionError(
        err.response?.data?.message ||
          `Could not ${mine ? "remove" : "add"} reaction`
      )
    } finally {
      setReactingMessageId(null)
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
            const hasTextContent = Boolean(message.textContent?.trim())
            const reactionGroups = groupReactions(message.reactions, user?._id)

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
                <div className={`flex w-fit max-w-[90%] items-center gap-1 ${isSentMessage ? "self-end" : "self-start"}`}>
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
                      <DropdownMenuContent align="end" className="w-auto">
                        <DropdownMenuGroup className="flex items-center gap-0.5">
                          {REACTION_CHOICES.map((choice) => {
                            const isMine = reactionGroups.some(
                              (group) => group.reaction === choice && group.mine
                            )

                            return (
                              <DropdownMenuItem
                                key={choice}
                                closeOnClick={false}
                                label={choice}
                                aria-label={`React with ${choice}`}
                                aria-pressed={isMine}
                                disabled={reactingMessageId === message._id}
                                className={`size-8 justify-center p-0 text-base ${
                                  isMine ? "bg-accent" : ""
                                }`}
                                onClick={() => toggleReaction(message, choice)}
                              >
                                {choice}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
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
                  <Bubble
                    variant={isSentMessage ? "default" : "muted"}
                    className="max-w-[calc(100%-2.25rem)]"
                  >
                    <BubbleContent className={hasTextContent ? "" : "p-0"}>
                      {message.textContent}
                      {message.mediaURL && (
                        <img
                          className={hasTextContent ? "mt-2 rounded-lg" : "block rounded-none"}
                          width={300}
                          height={300}
                          src={message.mediaURL}
                          alt="Message attachment"
                        />
                      )}
                    </BubbleContent>
                    {reactionGroups.length > 0 && (
                      <BubbleReactions
                        align={isSentMessage ? "start" : "end"}
                        aria-label={`Reactions: ${reactionGroups
                          .map((group) => `${group.reaction} ${group.count}`)
                          .join(", ")}`}
                      >
                        {reactionGroups.map((group) => (
                          <button
                            key={group.reaction}
                            type="button"
                            aria-label={`${group.reaction} ${group.count}`}
                            aria-pressed={Boolean(group.mine)}
                            disabled={reactingMessageId === message._id}
                            onClick={() => toggleReaction(message, group.reaction)}
                            className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs transition-colors hover:bg-accent ${
                              group.mine ? "bg-accent" : ""
                            }`}
                          >
                            <span className="text-sm leading-none">{group.reaction}</span>
                            <span className="text-muted-foreground">{group.count}</span>
                          </button>
                        ))}
                      </BubbleReactions>
                    )}
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
      {reactionError && (
        <p className="mb-2 text-sm text-destructive">{reactionError}</p>
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
