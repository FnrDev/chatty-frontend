import api from '@/services/api'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'

export default function Workspace() {
  const [workspaces, setWorkspaces] = useState([])

  useEffect(() => {
    async function loadWorkspaceDetails() {
      const response = await api.get(`/workspaces`)
      setWorkspaces(response.data)

    }

    loadWorkspaceDetails()
  }, [])

  if (!workspace) {
    return <div>Loading ...</div>
  }
  return (
    <div>
      <h1>Workspaces</h1>
      {workspaces.map(workspace => (
        <div key={workspace._id}>
          <p>name: {workspace.name}</p>
        </div>
      ))}
    </div>
  )
}
