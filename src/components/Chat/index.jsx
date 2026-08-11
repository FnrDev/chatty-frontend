import { useEffect, useState } from "react"
import { Bookmark, Hash, MessageCircle } from "lucide-react"
import { useParams } from "react-router"

import Layout from '../Layout/Layout'
import { MessageDemo } from './Messages'
import ChannelBookmarks from './ChannelBookmarks'
import api from '@/services/api'

export default function Chat() {
  const [activeTab, setActiveTab] = useState("messages")
  const [channelName, setChannelName] = useState("")
  const { id, channelId } = useParams()

  useEffect(() => {
    let ignore = false

    async function loadChannel() {
      try {
        const response = await api.get(`/workspaces/${id}/channels/${channelId}`)
        if (!ignore) setChannelName(response.data.name)
      } catch {
        if (!ignore) setChannelName("Channel")
      }
    }

    loadChannel()

    return () => {
      ignore = true
    }
  }, [id, channelId])

  return (
    <Layout
      headerTitle={(
        <div className="flex min-w-0 items-center gap-2 font-heading font-medium">
          <Hash className="size-4 text-muted-foreground" />
          <span className="truncate">{channelName || "Channel"}</span>
        </div>
      )}
      headerNavigation={(
        <div
          className="flex h-11 min-w-max items-end gap-1"
          role="tablist"
          aria-label="Channel sections"
        >
          <ChannelTab
            active={activeTab === "messages"}
            icon={MessageCircle}
            label="Messages"
            onClick={() => setActiveTab("messages")}
          />
          <ChannelTab
            active={activeTab === "bookmarks"}
            icon={Bookmark}
            label="Bookmarks"
            onClick={() => setActiveTab("bookmarks")}
          />
        </div>
      )}
      contentClassName="flex"
    >
      {activeTab === "messages" ? (
        <MessageDemo />
      ) : (
        <ChannelBookmarks workspaceId={id} channelId={channelId} />
      )}
    </Layout>
  )
}

function ChannelTab({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`relative flex h-10 items-center gap-2 px-3 text-sm font-medium transition-colors ${
        active
          ? "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
