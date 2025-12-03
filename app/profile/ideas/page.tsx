import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IdeaCard } from '@/components/idea-card'
import { Button, Tabs, Tab } from '@heroui/react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

type TabKey = 'all' | 'public' | 'private'

interface MyIdeasPageProps {
  searchParams: Promise<{ tab?: TabKey }>
}

export default async function MyIdeasPage({ searchParams }: MyIdeasPageProps) {
  const params = await searchParams
  const activeTab = (params.tab || 'all') as TabKey

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 获取用户的想法
  let query = supabase
    .schema('feature').from('ideas_with_stats')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 根据标签过滤
  if (activeTab === 'public') {
    query = query.eq('visibility', 'public')
  } else if (activeTab === 'private') {
    query = query.eq('visibility', 'private')
  }

  const { data: ideas, error } = await query

  if (error) {
    return <div className="text-center text-danger">加载失败: {error.message}</div>
  }

  // 获取用户投票
  const { data: votes } = await supabase
    .schema('feature').from('idea_votes')
    .select('idea_id, vote_type')
    .eq('user_id', user.id)

  const userVotes: Record<string, 'up' | 'down'> = {}
  if (votes) {
    votes.forEach((vote: any) => {
      userVotes[vote.idea_id] = vote.vote_type
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">我的想法</h1>
        <Button as={Link} href="/ideas/new" color="primary" startContent={<PlusCircle />}>
          发布新想法
        </Button>
      </div>

      <TabSelector activeTab={activeTab} />

      {!ideas || ideas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-default-500 mb-4">
            {activeTab === 'all'
              ? '你还没有发布任何想法'
              : activeTab === 'public'
                ? '你还没有发布公开想法'
                : '你还没有私有想法'}
          </p>
          <Button as={Link} href="/ideas/new" color="primary" startContent={<PlusCircle />}>
            发布想法
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea: any) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              userVote={userVotes[idea.id]}
              userId={user.id}
              showAuthor={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TabSelector({ activeTab }: { activeTab: TabKey }) {
  return (
    <div className="mb-6">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => {
          window.location.href = `/profile/ideas?tab=${key}`
        }}
      >
        <Tab key="all" title="全部" />
        <Tab key="public" title="公开" />
        <Tab key="private" title="私有" />
      </Tabs>
    </div>
  )
}

