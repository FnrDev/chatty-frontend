import { useState } from "react"
import { ImagePlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { uploadImage } from "@/services/uploadImage"
import { cn } from "@/lib/utils"

export default function IconUpload({
  id = "icon",
  value,
  onChange,
  fallback,
  label = "Icon",
  disabled,
  className,
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  async function handleFileChange(event) {
    const file = event.target.files?.[0]

    event.target.value = ""

    if (!file) return

    try {
      setIsUploading(true)
      setError("")

      const data = await uploadImage(file)
      onChange(data.url)
    } catch (err) {
      setError(err.response?.data?.message || "Could not upload image")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-4">
        <label
          htmlFor={id}
          aria-label={value ? `Change ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
          className={cn(
            "group relative flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-input bg-muted/40 transition-colors hover:border-ring focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
            (disabled || isUploading) && "pointer-events-none opacity-60"
          )}
        >
          <input
            id={id}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={handleFileChange}
          />
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-lg font-medium text-muted-foreground">
              {fallback || <ImagePlus className="size-5" />}
            </span>
          )}
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100",
              isUploading && "opacity-100"
            )}
          >
            {isUploading ? <Spinner /> : <ImagePlus className="size-4" />}
          </span>
        </label>

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              render={<label htmlFor={id} className="cursor-pointer" />}
            >
              {isUploading ? "Uploading..." : value ? "Change" : "Upload"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => {
                  setError("")
                  onChange("")
                }}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP or GIF, up to 5 MB
          </p>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
