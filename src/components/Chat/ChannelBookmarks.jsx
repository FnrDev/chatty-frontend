import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Bookmark,
  ExternalLink,
  Link2,
  Plus,
  Trash2,
} from "lucide-react"

import api from "@/services/api"
import { socket } from "@/socket"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChannelBookmarks({ workspaceId, channelId }) {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadBookmarks() {
      try {
        setLoading(true)
        setError("")
        const response = await api.get(
          `/workspaces/${workspaceId}/channels/${channelId}/bookmarks`
        )
        if (!ignore) setBookmarks(response.data)
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Could not load bookmarks")
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadBookmarks()

    return () => {
      ignore = true
    }
  }, [workspaceId, channelId])

  useEffect(() => {
    function handleBookmarkCreated(bookmark) {
      if (String(bookmark.channel) !== channelId) return

      setBookmarks((currentBookmarks) => [
        bookmark,
        ...currentBookmarks.filter((item) => item._id !== bookmark._id),
      ])
    }

    function handleBookmarkDeleted(bookmark) {
      if (String(bookmark.channel) !== channelId) return

      setBookmarks((currentBookmarks) =>
        currentBookmarks.filter((item) => item._id !== bookmark._id)
      )
    }

    socket.on("bookmark_created", handleBookmarkCreated)
    socket.on("bookmark_deleted", handleBookmarkDeleted)

    return () => {
      socket.off("bookmark_created", handleBookmarkCreated)
      socket.off("bookmark_deleted", handleBookmarkDeleted)
    }
  }, [channelId])

  function handleCreated(bookmark) {
    setBookmarks((currentBookmarks) => [
      bookmark,
      ...currentBookmarks.filter((item) => item._id !== bookmark._id),
    ])
  }

  async function deleteBookmark(bookmarkId) {
    try {
      setDeletingId(bookmarkId)
      setError("")
      await api.delete(
        `/workspaces/${workspaceId}/channels/${channelId}/bookmarks/${bookmarkId}`
      )
      setBookmarks((currentBookmarks) =>
        currentBookmarks.filter((bookmark) => bookmark._id !== bookmarkId)
      )
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove bookmark")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="flex min-h-0 w-full flex-col" aria-labelledby="bookmarks-heading">
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="bookmarks-heading" className="font-heading text-lg font-medium">
            Bookmarks
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep useful links and resources close to the conversation.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Add bookmark
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-24 w-full" />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Bookmark className="size-5" />
            </div>
            <h2 className="font-heading font-medium">No bookmarks yet</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add a link that everyone in this channel can quickly find later.
            </p>
            <Button className="mt-5" variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              Add the first bookmark
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark._id}
                bookmark={bookmark}
                deleting={deletingId === bookmark._id}
                onDelete={() => deleteBookmark(bookmark._id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddBookmarkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workspaceId={workspaceId}
        channelId={channelId}
        onCreated={handleCreated}
      />
    </section>
  )
}

function BookmarkCard({ bookmark, deleting, onDelete }) {
  let hostname = bookmark.url

  try {
    hostname = new URL(bookmark.url).hostname
  } catch {
    // The server validates URLs; keep the full value if old data is malformed.
  }

  return (
    <Card className="flex-row items-center gap-3 p-4!">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Link2 className="size-5" />
      </div>
      <a
        href={bookmark.url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex items-center gap-1.5 font-medium">
          <span className="truncate">{bookmark.title}</span>
          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {hostname}
          {bookmark.createdBy?.username && ` · added by ${bookmark.createdBy.username}`}
        </span>
      </a>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${bookmark.title}`}
        disabled={deleting}
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </Card>
  )
}

function AddBookmarkDialog({ open, onOpenChange, workspaceId, channelId, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm()

  async function onSubmit(data) {
    try {
      const response = await api.post(
        `/workspaces/${workspaceId}/channels/${channelId}/bookmarks`,
        data
      )
      onCreated(response.data)
      reset()
      onOpenChange(false)
    } catch (err) {
      setError("server", {
        type: "server",
        message: err.response?.data?.message || "Could not add bookmark",
      })
    }
  }

  function handleOpenChange(nextOpen) {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add bookmark</DialogTitle>
          <DialogDescription>
            Share a useful link with everyone in this channel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="bookmark-title">Title</FieldLabel>
                <Input
                  id="bookmark-title"
                  autoComplete="off"
                  placeholder="Project brief"
                  {...register("title", {
                    required: "Title is required",
                    maxLength: {
                      value: 100,
                      message: "Title must be under 100 characters",
                    },
                  })}
                />
                {errors.title && (
                  <span className="text-sm text-destructive">{errors.title.message}</span>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="bookmark-url">URL</FieldLabel>
                <Input
                  id="bookmark-url"
                  type="url"
                  autoComplete="url"
                  placeholder="https://example.com"
                  {...register("url", {
                    required: "URL is required",
                  })}
                />
                {errors.url && (
                  <span className="text-sm text-destructive">{errors.url.message}</span>
                )}
              </Field>
            </FieldGroup>
            {errors.server && (
              <span className="text-sm text-destructive">{errors.server.message}</span>
            )}
            <Field orientation="vertical">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add bookmark"}
              </Button>
              <DialogClose
                render={<Button type="button" variant="outline" className="w-full" />}
              >
                Cancel
              </DialogClose>
            </Field>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  )
}
