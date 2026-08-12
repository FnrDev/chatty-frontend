import {
  Dialog,
  DialogClose,
  DialogContent,
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import IconUpload from "@/components/Workspace/IconUpload"
import { useAuth } from "@/context/AuthContext"
import { updateCurrentUser } from "@/services/authService"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function UserProfileSettings({ open, onOpenChange }) {
  const { user, setUser } = useAuth()
  const [profileImage, setProfileImage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({ defaultValues: { username: "" } })

  async function onSubmit(data) {
    try {
      const updatedUser = await updateCurrentUser({
        username: data.username,
        profileImage,
      })

      setUser(updatedUser)
      onOpenChange(false)
    } catch (err) {
      setError("server", {
        type: "server",
        message: err.response?.data?.message || "Something went wrong",
      })
    }
  }

  function handleOpenChange(nextOpen) {
    if (nextOpen) {
      reset({ username: user?.username || "" })
      setProfileImage(user?.profileImage || "")
    } else {
      reset({ username: "" })
      setProfileImage("")
    }
    onOpenChange(nextOpen)
  }

  const initial = user?.username?.[0]?.toUpperCase() || "U"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        aria-label="Open profile settings"
        className="flex w-full items-center gap-3 rounded-md bg-popover p-3 text-left transition-colors hover:bg-sidebar-accent"
      >
        {user?.profileImage ? (
          <img
            width={40}
            height={40}
            className="size-10 rounded-md object-cover"
            src={user.profileImage}
            alt=""
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground">
            {initial}
          </span>
        )}
        <span className="truncate">{user?.username}</span>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update the profile image and username other members see.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="profileImage">Profile image</FieldLabel>
                <IconUpload
                  id="profileImage"
                  value={profileImage}
                  onChange={setProfileImage}
                  fallback={initial}
                  label="Profile image"
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="username"
                  {...register("username", {
                    required: "Username is required",
                    maxLength: {
                      value: 100,
                      message: "Username must be under 100 characters",
                    },
                  })}
                  autoComplete="username"
                  placeholder="Set username"
                />
                {errors.username && (
                  <span className="text-sm text-destructive">
                    {errors.username.message}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
