import { useState } from "react"
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Search, Trash2 } from "lucide-react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/services/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const features = tableFeatures({
  columnFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { text: sortFn_text },
})

const columnHelper = createColumnHelper()

const memberColumns = columnHelper.columns([
  columnHelper.accessor((member) => member.user?.username || "", {
    id: "member",
    header: ({ column }) => <SortableHeader column={column} label="Member" />,
    cell: ({ row }) => {
      const username = row.original.user?.username || "Unknown user"

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={row.original.user?.profileImage} alt={username} />
            <AvatarFallback>{username[0]?.toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{username}</p>
            <p className="text-xs text-muted-foreground">Workspace member</p>
          </div>
        </div>
      )
    },
    filterFn: "includesString",
    sortFn: "text",
  }),
  columnHelper.accessor("role", {
    header: ({ column }) => <SortableHeader column={column} label="Role" />,
    cell: ({ row }) => (
      <Badge variant={row.original.role === "owner" ? "default" : "secondary"}>
        {capitalize(row.original.role)}
      </Badge>
    ),
    sortFn: "text",
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => <SortableHeader column={column} label="Status" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span
          className={`size-2 rounded-full ${
            row.original.status === "active" ? "bg-emerald-500" : "bg-muted-foreground"
          }`}
        />
        <span>{capitalize(row.original.status)}</span>
      </div>
    ),
    sortFn: "text",
  }),
  columnHelper.accessor("joinedAt", {
    header: ({ column }) => <SortableHeader column={column} label="Joined" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.joinedAt || row.original.createdAt)}
      </span>
    ),
  }),
])

const ownerColumns = [
  ...memberColumns,
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => {
      if (row.original.role === "owner") return null

      return (
        <div className="flex justify-end">
          <RemoveMemberButton
            member={row.original}
            workspaceId={table.options.meta.workspaceId}
            onRemoved={table.options.meta.onMemberRemoved}
          />
        </div>
      )
    },
  }),
]

export default function MembersDataTable({
  members,
  canRemoveMembers = false,
  onMemberRemoved,
  workspaceId,
}) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const columns = canRemoveMembers ? ownerColumns : memberColumns

  const table = useTable({
    features,
    data: members,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      onMemberRemoved,
      workspaceId,
    },
  })

  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <div>
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={table.getColumn("member")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("member")?.setFilterValue(event.target.value)
            }
            placeholder="Search members..."
            aria-label="Search members"
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredCount} {filteredCount === 1 ? "member" : "members"}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3 py-4">
        <p className="text-sm text-muted-foreground">
          Page {table.state.pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function RemoveMemberButton({ member, workspaceId, onRemoved }) {
  const [open, setOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState("")
  const username = member.user?.username || "this member"

  async function removeMember() {
    try {
      setIsRemoving(true)
      setError("")
      await api.delete(`/workspaces/${workspaceId}/members/${member._id}`)
      setOpen(false)
      onRemoved(member._id)
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove member")
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => {
          setError("")
          setOpen(true)
        }}
      >
        <Trash2 />
        Delete member
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {username}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will lose access to this workspace. They can join again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isRemoving}
            onClick={removeMember}
          >
            {isRemoving ? "Removing..." : "Remove member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function SortableHeader({ column, label }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  )
}

function capitalize(value) {
  if (!value) return "Unknown"
  return `${value[0].toUpperCase()}${value.slice(1)}`
}

function formatDate(value) {
  if (!value) return "—"

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}
