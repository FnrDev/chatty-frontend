import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import IconUpload from "../Workspace/IconUpload"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import api from "@/services/api"

export default function WorkSpaceSettings({ open, onOpenChange, onUpdated }) {
  const params = useParams()
  const [imageURL, setImageURL] = useState("")
  const [initial, setInitial] = useState("W")
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({ defaultValues: { name: "" } })

  useEffect(() => {
    if (!open) return

    let ignore = false

    async function loadWorkspace() {
      try {
        setIsLoading(true)

        const response = await api.get(`/workspaces/${params.id}`)
        if (ignore) return

        reset({ name: response.data.name || "" })
        setImageURL(response.data.imageURL || "")
        setInitial(response.data.name?.[0]?.toUpperCase() || "W")
      } catch (err) {
        if (ignore) return
        setError("server", {
          type: "server",
          message: err.response?.data?.message || "Could not load workspace",
        })
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadWorkspace()

    return () => {
      ignore = true
    }
  }, [open, params.id, reset, setError])

  async function onSubmit(data) {
    try {
      const updated = await api.patch(`/workspaces/${params.id}`, {
        name: data.name,
        imageURL,
      })
      onUpdated?.(updated.data)
      onOpenChange(false)
    } catch (err) {
      console.log(err)
      setError("server", {
        type: "server",
        message: err.response?.data?.message || "Something went wrong",
      })
    }
  }

  function handleOpenChange(nextOpen) {
    if (!nextOpen) {
      reset({ name: "" })
      setImageURL("")
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="mt-2 h-11 rounded-md border-2 border-[#353535] bg-[#1c1c1c] text-[15px] font-light">
        Workspace Settings
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Workspace Settings</DialogTitle>
          <DialogDescription>
            Update the icon and name everyone in this workspace sees.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="imageURL">Icon</FieldLabel>
                {isLoading ? (
                  <Skeleton className="size-16 rounded-xl" />
                ) : (
                  <IconUpload
                    id="imageURL"
                    value={imageURL}
                    onChange={setImageURL}
                    fallback={initial}
                    disabled={isSubmitting}
                  />
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </FieldLabel>
                {isLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Input
                    id="name"
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 3,
                        message: "Name must be at least 3 characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Name must be under 100 characters",
                      },
                    })}
                    autoComplete="off"
                    placeholder="Set workspace name"
                  />
                )}
                {errors.name && (
                  <span className="text-sm text-destructive">
                    {errors.name.message}
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
              render={<Button variant="outline" type="button" />}
              disabled={isSubmitting}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
