import Layout from '@/components/Layout/Layout'
import { getWorkSpaceData } from '@/services/workSpace'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'

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
        <div className='flex flex-col bg-sidebar-accent rounded-lg border-accent w-[50%] mx-auto p-3 mt-5'>
            {
            loading ? (
              <p>Loading...</p>
            ) : (
                workSpace.members.map((e) => {
                  return (
                    <div key={e._id}>
                      <p>{e.user.username}</p>
                    </div>
                  )
                })
            )
          }
        </div>
      </div>
    </Layout>
  )
}

export default WorkSpaceApp
