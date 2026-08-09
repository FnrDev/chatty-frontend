import { useForm } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import api from "@/services/api"

export default function CreateWorkspace({ open, onOpenChange, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm()

  async function onSubmit(data) {
    try {
      const created = await api.post("/workspaces", data)
      onCreated?.(created.data)
      reset()
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
      reset()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create New WorkSpace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name <span className="text-destructive">*</span></FieldLabel>
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 3, message: "Name must be at least 3 characters" },
                    maxLength: { value: 100, message: "Name must be under 100 characters" },
                  })}
                  autoComplete="off"
                  placeholder="Set workspace name"
                />
                {errors.name && (
                  <span className="text-sm text-destructive">{errors.name.message}</span>
                )}
              </Field>
            </FieldGroup>
            {errors.server && (
              <span className="text-sm text-destructive">{errors.server.message}</span>
            )}
            <Field orientation="vertical">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
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
