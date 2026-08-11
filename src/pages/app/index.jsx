import Layout from '@/components/Layout/Layout'
import MembersDataTable from '@/components/Workspace/MembersDataTable'
import { getWorkSpaceData } from '@/services/workSpace'
import { Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

function WorkSpaceApp() {

  const { id } = useParams()
  const [workSpace, setWorkSpace] = useState({ name: '', members: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getWorkSpaceData(id)
        setWorkSpace(response.data)
        setLoading(false)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load workspace members')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  return (
    <Layout
      headerTitle={(
        <div className='flex min-w-0 items-center gap-2 font-heading font-medium'>
          <Users className='size-4 text-muted-foreground' />
          <span className='truncate'>{workSpace.name || 'Workspace'}</span>
        </div>
      )}
    >
      <section className='mx-auto w-full max-w-6xl py-4'>
        <div>
          <h1 className='font-heading text-2xl font-medium'>Members</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Everyone who belongs to {workSpace.name || 'this workspace'}.
          </p>
        </div>

        {error && <p className='mt-6 text-sm text-destructive'>{error}</p>}

        {loading ? (
          <div className='mt-6 h-64 animate-pulse rounded-xl bg-muted' />
        ) : (
          <MembersDataTable members={workSpace.members || []} />
        )}
      </section>
    </Layout>
  )
}

export default WorkSpaceApp
