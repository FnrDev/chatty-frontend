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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"

export default function CreateChannel() {

  return (
    <Dialog>
        <DialogTrigger className="bg-[#1c1c1c] mt-2 font-light  rounded-md border-2 border-dashed border-[#353535] text-[15px] h-11">Create New Channel</DialogTrigger>
        <DialogContent showCloseButton={false}>
            <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
            </DialogHeader>
            <form>
                <FieldSet>
            <FieldGroup>
                <Field>
                <FieldLabel htmlFor="name">Name <span className="text-destructive">*</span></FieldLabel>
                <Input id="name" required autoComplete="off" placeholder="Set channel name" />
                </Field>
                 <Field>
                <FieldLabel htmlFor="name">Descreption </FieldLabel>
                <Input id="name" autoComplete="off" placeholder="Any descreption" />
                </Field>
            </FieldGroup>
            <Field orientation="vertical">
            <Button type="submit">Submit</Button>
            <DialogClose>
                  <Button variant="outline" className="w-full" type="button">
                Cancel
               </Button>
            </DialogClose>
            </Field>
            </FieldSet>
            </form>
        </DialogContent>
        </Dialog>
  )
}
