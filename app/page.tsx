import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { IdeaCard } from '@/components/idea-card'
import { Button, Spinner } from '@heroui/react'
import Link from 'next/link'
import { PlusCircle, Sparkles, TrendingUp, Clock, MessageSquare, Lightbulb } from 'lucide-react'

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
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 mb-4">
          <span className="text-danger text-2xl">!</span>
        </div>
        <p className="text-danger">加载失败: {error.message}</p>
      </div>
    )
  }

  if (!ideas || ideas.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-tertiary/20 mb-6 animate-float">
          <Lightbulb className="w-10 h-10 text-accent-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">还没有想法</h3>
        <p className="text-default-500 mb-6">成为第一个发布想法的人吧！</p>
        {user && (
          <Button 
            as={Link} 
            href="/ideas/new" 
            color="primary"
            size="lg"
            className="btn-gradient"
            startContent={<PlusCircle className="w-5 h-5" />}
          >
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
    <div className="space-y-5">
      {ideas.map((idea: any, index: number) => (
        <div 
          key={idea.id} 
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <IdeaCard
            idea={idea}
            userVote={userVotes[idea.id]}
            userId={user?.id}
          />
        </div>
      ))}
    </div>
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const sort = (params.sort || 'created_at') as SortOption

  return (
    <div className="min-h-screen">
      {/* Hero 区域 */}
      <div className="hero-pattern grid-pattern py-16 mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-sm font-medium text-accent-primary">记录灵感，分享创意</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">想法大厅</span>
            </h1>
            <p className="text-lg text-default-600 max-w-xl mx-auto">
              探索来自社区的精彩想法，或分享你的灵感火花
            </p>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 max-w-4xl pb-16">
        {/* 排序和操作栏 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up delay-100">
          <SortSelector currentSort={sort} />
        </div>

        {/* 想法列表 */}
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent-primary/20 animate-pulse-glow"></div>
                <Spinner size="lg" color="primary" />
              </div>
              <p className="mt-4 text-default-500">加载中...</p>
            </div>
          }
        >
          <IdeasList sort={sort} />
        </Suspense>
      </div>
    </div>
  )
}

function SortSelector({ currentSort }: { currentSort: SortOption }) {
  const sortOptions = [
    { key: 'created_at', label: '最新发布', icon: Clock },
    { key: 'updated_at', label: '最近更新', icon: TrendingUp },
    { key: 'upvotes', label: '最多点赞', icon: Sparkles },
    { key: 'comment_count', label: '最多评论', icon: MessageSquare },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {sortOptions.map((option) => {
        const Icon = option.icon
        const isActive = currentSort === option.key
        return (
          <Link
            key={option.key}
            href={`/?sort=${option.key}`}
            className={`
              inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl
              transition-all duration-300 ease-out
              ${isActive
                ? 'bg-gradient-to-r from-accent-primary to-[#ff8c5a] text-white shadow-glow-accent'
                : 'bg-default-100/60 hover:bg-default-200/80 text-default-700 hover:shadow-soft'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {option.label}
          </Link>
        )
      })}
    </div>
  )
}
