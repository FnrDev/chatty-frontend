import api from '@/services/api'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'

export default function WorkSpace() {
  const [workspace, setWorkspace] = useState(null)
  const { id } = useParams()

  useEffect(() => {
    async function loadWorkspaceDetails() {
      const response = await api.get(`/workspaces/${id}`)
      setWorkspace(response.data)

    }

    loadWorkspaceDetails()
  }, [])

  if (!workspace) {
    return <div>Loading ...</div>
  }
  return (
    <div>
      <h1>{workspace.name}</h1>
      <h2>This is the chat begning</h2>
    </div>
  )
}
