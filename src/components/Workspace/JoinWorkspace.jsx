import { useForm } from "react-hook-form"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/services/api"

export default function JoinWorkspace({ open, onOpenChange, onJoined }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm()

  async function onSubmit(data) {
    try {
      const response = await api.post("/workspaces/join", {
        code: data.code.trim().toUpperCase(),
      })

      onJoined?.(response.data)
      reset()
      onOpenChange(false)
    } catch (err) {
      setError("server", {
        type: "server",
        message: err.response?.data?.message || "Could not join workspace",
      })
    }
  }

  function handleOpenChange(nextOpen) {
    if (!nextOpen) {
      reset()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Join Workspace</DialogTitle>
          <DialogDescription>
            Enter the six-character code shared by the workspace owner.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="workspace-code">
                  Workspace code <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="workspace-code"
                  {...register("code", {
                    required: "Workspace code is required",
                    minLength: {
                      value: 6,
                      message: "Workspace code must be 6 characters",
                    },
                    maxLength: {
                      value: 6,
                      message: "Workspace code must be 6 characters",
                    },
                  })}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="uppercase"
                  maxLength={6}
                  placeholder="ABC123"
                />
                {errors.code && (
                  <span className="text-sm text-destructive">
                    {errors.code.message}
                  </span>
                )}
              </Field>
            </FieldGroup>
            {errors.server && (
              <span className="text-sm text-destructive">
                {errors.server.message}
              </span>
            )}
            <Field orientation="vertical">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Joining..." : "Join Workspace"}
              </Button>
              <DialogClose
                render={<Button variant="outline" className="w-full" type="button" />}
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
