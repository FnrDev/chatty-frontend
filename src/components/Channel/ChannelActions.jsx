import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import api from "@/services/api"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function ChannelActions({
  channel,
  workspaceId,
  onUpdated,
  onDeleted,
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({
    defaultValues: { name: "", description: "" },
  })

  function handleEditOpenChange(nextOpen) {
    if (nextOpen) {
      reset({
        name: channel.name || "",
        description: channel.description || "",
      })
    } else {
      reset({ name: "", description: "" })
    }
    setEditOpen(nextOpen)
  }

  async function updateChannel(data) {
    try {
      const response = await api.patch(
        `/workspaces/${workspaceId}/channels/${channel._id}`,
        data
      )
      onUpdated(response.data)
      window.dispatchEvent(
        new CustomEvent("channel-updated", { detail: response.data })
      )
      setEditOpen(false)
    } catch (err) {
      setError("server", {
        type: "server",
        message: err.response?.data?.message || "Could not update channel",
      })
    }
  }

  async function deleteChannel() {
    try {
      setIsDeleting(true)
      setDeleteError("")
      await api.delete(`/workspaces/${workspaceId}/channels/${channel._id}`)
      setDeleteOpen(false)
      onDeleted(channel._id)
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete channel")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-0.5 pr-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Edit ${channel.name}`}
          onClick={() => handleEditOpenChange(true)}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${channel.name}`}
          onClick={() => {
            setDeleteError("")
            setDeleteOpen(true)
          }}
        >
          <Trash2 />
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>
              Update the channel name and description.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(updateChannel)}
            className="flex flex-col gap-6"
          >
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`channel-name-${channel._id}`}>
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id={`channel-name-${channel._id}`}
                    {...register("name", {
                      required: "Name is required",
                      maxLength: {
                        value: 100,
                        message: "Name must be under 100 characters",
                      },
                    })}
                    autoComplete="off"
                  />
                  {errors.name && (
                    <span className="text-sm text-destructive">
                      {errors.name.message}
                    </span>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor={`channel-description-${channel._id}`}>
                    Description
                  </FieldLabel>
                  <Textarea
                    id={`channel-description-${channel._id}`}
                    {...register("description", {
                      maxLength: {
                        value: 2500,
                        message: "Description must be under 2500 characters",
                      },
                    })}
                  />
                  {errors.description && (
                    <span className="text-sm text-destructive">
                      {errors.description.message}
                    </span>
                  )}
                </Field>
              </FieldGroup>
            </FieldSet>
            {errors.server && (
              <span className="text-sm text-destructive">
                {errors.server.message}
              </span>
            )}
            <DialogFooter>
              <DialogClose
                render={<Button type="button" variant="outline" />}
                disabled={isSubmitting}
              >
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete #{channel.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This channel will be removed from the workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={deleteChannel}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
