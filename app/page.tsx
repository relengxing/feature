import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { IdeaCard } from '@/components/idea-card'
import { Button, Spinner } from '@heroui/react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

type SortOption = 'created_at' | 'updated_at' | 'upvotes' | 'comment_count'

interface HomePageProps {
  searchParams: Promise<{ sort?: SortOption }>
}

async function IdeasList({ sort = 'created_at' }: { sort: SortOption }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 获取想法列表
  let query = supabase
    .schema('feature').from('ideas_with_stats')
    .select('*')
    .eq('visibility', 'public')

  // 根据排序选项
  switch (sort) {
    case 'upvotes':
      query = query.order('vote_score', { ascending: false })
      break
    case 'comment_count':
      query = query.order('comment_count', { ascending: false })
      break
    case 'updated_at':
      query = query.order('updated_at', { ascending: false })
      break
    case 'created_at':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: ideas, error } = await query

  if (error) {
    return <div className="text-center text-danger">加载失败: {error.message}</div>
  }

  if (!ideas || ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-default-500 mb-4">还没有想法，成为第一个发布的人吧！</p>
        {user && (
          <Button as={Link} href="/ideas/new" color="primary" startContent={<PlusCircle />}>
            发布想法
          </Button>
        )}
      </div>
    )
  }

  // 获取当前用户的投票记录
  let userVotes: Record<string, 'up' | 'down'> = {}
  if (user) {
    const { data: votes } = await supabase
      .schema('feature').from('idea_votes')
      .select('idea_id, vote_type')
      .eq('user_id', user.id)
      .in(
        'idea_id',
        ideas.map((i: any) => i.id)
      )

    if (votes) {
      userVotes = (votes as any[]).reduce(
        (acc, vote) => ({
          ...acc,
          [vote.idea_id]: vote.vote_type,
        }),
        {}
      )
    }
  }

  return (
    <div className="space-y-4">
      {ideas.map((idea: any) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          userVote={userVotes[idea.id]}
          userId={user?.id}
        />
      ))}
    </div>
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const sort = (params.sort || 'created_at') as SortOption

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">想法大厅</h1>
        <div className="flex gap-2 items-center">
          <SortSelector currentSort={sort} />
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        }
      >
        <IdeasList sort={sort} />
      </Suspense>
    </div>
  )
}

function SortSelector({ currentSort }: { currentSort: SortOption }) {
  const sortOptions = [
    { key: 'created_at', label: '发布时间' },
    { key: 'updated_at', label: '更新时间' },
    { key: 'upvotes', label: '点赞数' },
    { key: 'comment_count', label: '评论数' },
  ]

  return (
    <div className="flex gap-2">
      {sortOptions.map((option) => (
        <Link
          key={option.key}
          href={`/?sort=${option.key}`}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            currentSort === option.key
              ? 'bg-primary text-white'
              : 'bg-default-100 hover:bg-default-200'
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  )
}
