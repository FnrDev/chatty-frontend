import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LogIn, Plus } from "lucide-react";

import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import CreateWorkspace from "@/components/Workspace/CreateWorkspace";
import JoinWorkspace from "@/components/Workspace/JoinWorkspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const response = await api.get(`/workspaces`);
        setWorkspaces(response.data);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Could not load workspaces");
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaces();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="font-heading text-2xl font-medium">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Every workspace you own or belong to.
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setJoinDialogOpen(true)}
          >
            <LogIn className="size-4" />
            Join Workspace
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Create Workspace
          </Button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      {loading ? (
        <WorkspaceGrid>
          {[1, 2, 3].map((key) => (
            <WorkspaceCardSkeleton key={key} />
          ))}
        </WorkspaceGrid>
      ) : workspaces.length === 0 ? (
        <EmptyWorkspaces
          onCreate={() => setDialogOpen(true)}
          onJoin={() => setJoinDialogOpen(true)}
        />
      ) : (
        <WorkspaceGrid>
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace._id}
              workspace={workspace}
              isOwner={workspace.owner === user?._id}
              onOpen={() => navigate(`/workspaces/${workspace._id}`)}
            />
          ))}
        </WorkspaceGrid>
      )}

      <CreateWorkspace
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(workspace) =>
          setWorkspaces((currentWorkspaces) => [...currentWorkspaces, workspace])
        }
      />
      <JoinWorkspace
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
        onJoined={(workspace) =>
          setWorkspaces((currentWorkspaces) => [...currentWorkspaces, workspace])
        }
      />
    </div>
  );
}

function WorkspaceGrid({ children }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function WorkspaceCard({ workspace, isOwner, onOpen }) {
  const cover =
    workspace.imageURL || `https://avatar.vercel.sh/${workspace._id}`;

  return (
    <Card className="relative w-full pt-0">
      <img
        src={cover}
        alt={`${workspace.name} cover`}
        className="aspect-video w-full object-cover"
      />
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{isOwner ? "Owner" : "Member"}</Badge>
        </CardAction>
        <CardTitle className="truncate">{workspace.name}</CardTitle>
        <CardDescription>
          Invite code {workspace.code}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full" onClick={onOpen}>
          Open Workspace
        </Button>
      </CardFooter>
    </Card>
  );
}

function WorkspaceCardSkeleton() {
  return (
    <Card className="w-full pt-0">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function EmptyWorkspaces({ onCreate, onJoin }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Plus className="size-6" />
      </div>
      <h2 className="font-heading text-base font-medium">No workspaces yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        You are not part of any workspace. Create one to start adding channels
        and inviting people, or join an existing one with an invite code.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onJoin}>
          <LogIn className="size-4" />
          Join Workspace
        </Button>
        <Button variant="outline" onClick={onCreate}>
          <Plus className="size-4" />
          Create Workspace
        </Button>
      </div>
    </div>
  );
}

export default Workspaces;
