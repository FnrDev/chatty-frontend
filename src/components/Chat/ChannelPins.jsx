import { useEffect, useState } from "react"
import { Pin, PinOff } from "lucide-react"

import api from "@/services/api"
import { socket } from "@/socket"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChannelPins({ workspaceId, channelId }) {
  const [pins, setPins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [removingMessageId, setRemovingMessageId] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadPins() {
      try {
        setLoading(true)
        setError("")
        const response = await api.get(
          `/workspaces/${workspaceId}/channels/${channelId}/pins`
        )
        if (!ignore) setPins(response.data)
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Could not load pinned messages")
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadPins()

    return () => {
      ignore = true
    }
  }, [workspaceId, channelId])

  useEffect(() => {
    function handlePinCreated(pin) {
      if (String(pin.channel) !== channelId) return

      setPins((currentPins) => [
        pin,
        ...currentPins.filter((currentPin) => currentPin._id !== pin._id),
      ])
    }

    function handlePinDeleted(pin) {
      if (String(pin.channel) !== channelId) return

      setPins((currentPins) =>
        currentPins.filter(
          (currentPin) => String(currentPin.message?._id) !== String(pin.message)
        )
      )
    }

    function handleMessageDeleted(message) {
      if (String(message.channel) !== channelId) return

      setPins((currentPins) =>
        currentPins.filter(
          (currentPin) => String(currentPin.message?._id) !== String(message._id)
        )
      )
    }

    socket.on("message_pin_created", handlePinCreated)
    socket.on("message_pin_deleted", handlePinDeleted)
    socket.on("message_deleted", handleMessageDeleted)

    return () => {
      socket.off("message_pin_created", handlePinCreated)
      socket.off("message_pin_deleted", handlePinDeleted)
      socket.off("message_deleted", handleMessageDeleted)
    }
  }, [channelId])

  async function removePin(messageId) {
    try {
      setRemovingMessageId(messageId)
      setError("")
      await api.delete(
        `/workspaces/${workspaceId}/channels/${channelId}/messages/${messageId}/pin`
      )
      setPins((currentPins) =>
        currentPins.filter(
          (pin) => String(pin.message?._id) !== String(messageId)
        )
      )
    } catch (err) {
      setError(err.response?.data?.message || "Could not unpin message")
    } finally {
      setRemovingMessageId(null)
    }
  }

  return (
    <section className="flex min-h-0 w-full flex-col" aria-labelledby="pins-heading">
      <div className="border-b pb-4">
        <h1 id="pins-heading" className="font-heading text-lg font-medium">
          Pinned messages
        </h1>
        <p className="text-sm text-muted-foreground">
          Important messages saved for everyone in this channel.
        </p>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-28 w-full" />
            ))}
          </div>
        ) : pins.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Pin className="size-5" />
            </div>
            <h2 className="font-heading font-medium">No pinned messages</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Pin a message from its options menu to keep it easy to find.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {pins.map((pin) => (
              <PinnedMessageCard
                key={pin._id}
                pin={pin}
                removing={removingMessageId === pin.message?._id}
                onRemove={() => removePin(pin.message._id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PinnedMessageCard({ pin, removing, onRemove }) {
  const message = pin.message
  const author = message.author
  const authorName = author?.username || "Unknown user"

  return (
    <Card className="flex-row items-start gap-3 p-4!">
      <Avatar className="mt-0.5 size-9">
        <AvatarImage src={author?.profileImage} alt={authorName} />
        <AvatarFallback>{authorName[0]?.toUpperCase() || "?"}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">{authorName}</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Pin className="size-3" />
            Pinned by {pin.pinnedBy?.username || "a member"}
          </span>
        </div>
        {message.textContent && (
          <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm">
            {message.textContent}
          </p>
        )}
        {message.mediaURL && (
          <img
            className="mt-3 max-h-56 max-w-full rounded-lg object-cover"
            src={message.mediaURL}
            alt="Pinned message attachment"
          />
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Unpin message"
        disabled={removing}
        onClick={onRemove}
      >
        <PinOff className="size-4" />
      </Button>
    </Card>
  )
}
