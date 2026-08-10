import Layout from '@/components/Layout/Layout'
import { getWorkSpaceData } from '@/services/workSpace'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { DataTable } from './data-table'

function WorkSpaceApp() {

  const { id } = useParams()
  const [workSpace, setWorkSpace] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getWorkSpaceData(id)
        setWorkSpace(response.data)
        setLoading(false)
      } catch (err) {
        console.log(err)
      }
    }

    fetchData()
  }, [])


  console.log(workSpace)

  return (
    <Layout>
      <div className='flex justify-center flex-col items-center mt-5'>
        <h1 className='text-2xl'>{workSpace.name}</h1>
        <div className='flex flex-col'>
            {
            loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable data={workSpace.members} />
            )
          }
        </div>
      </div>
    </Layout>
  )
}

export default WorkSpaceApp
