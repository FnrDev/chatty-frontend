import {
  Dialog,
  DialogContent,
  DialogClose,
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
import { useForm } from "react-hook-form"
import { useAuth } from "@/context/AuthContext"
import { useParams } from "react-router"
import api from "@/services/api"

export default function WorkSpaceSettings({ open, onOpenChange, onUpdated }) {
  const params = useParams()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm()


  async function onSubmit(data) {
    try {
      const updated = await api.post(`/workspaces/${params.id}`, {
        name: data.name,  
        image: data.image
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
      reset()
    }
    onOpenChange(nextOpen)
  }


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger className="bg-[#1c1c1c] mt-2 font-light  rounded-md border-2 border-[#353535] text-[15px] h-11">Workspace Settings</DialogTrigger>
        <DialogContent showCloseButton={false}>
            <DialogHeader>
            <DialogTitle>Workspace Settings</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FieldSet>
            <FieldGroup>
                <Field>
                <FieldLabel htmlFor="name">Name <span className="text-destructive">*</span></FieldLabel>
                <Input id="name" {...register("name", {
                    required: "Name is required",
                    minLength: { value: 3, message: "Name must be at least 3 characters" },
                    maxLength: { value: 100, message: "Name must be under 100 characters" },
                  })}  autoComplete="off" placeholder="Set channel name" />
                </Field>
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                 <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input {...register("description")} id="description" autoComplete="off" placeholder="Any descreption" />
                 {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
                </Field>
            </FieldGroup>
            <Field orientation="vertical">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create"}</Button>
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
