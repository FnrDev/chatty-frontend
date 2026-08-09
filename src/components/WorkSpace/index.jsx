import React from 'react'
import { useParams } from 'react-router'

export default function WorkSpace() {

  const { id } = useParams()
  return (
    <div>
      <h2>This is the chat begning</h2>
    </div>
  )
}
