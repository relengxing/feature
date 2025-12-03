import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IdeaCard } from '@/components/idea-card'
import { Button } from '@heroui/react'
import Link from 'next/link'
import { PlusCircle, Lightbulb, Globe, Lock, LayoutList, ArrowLeft } from 'lucide-react'

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 mb-4">
            <span className="text-danger text-2xl">!</span>
          </div>
          <p className="text-danger">加载失败: {error.message}</p>
        </div>
      </div>
    )
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

  // 统计数量
  const allCount = ideas?.length || 0
  const publicCount = ideas?.filter((i: any) => i.visibility === 'public').length || 0
  const privateCount = ideas?.filter((i: any) => i.visibility === 'private').length || 0

  return (
    <div className="min-h-screen py-8">
      {/* 装饰背景 */}
      <div className="fixed inset-0 hero-pattern grid-pattern opacity-30 pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* 返回按钮 */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-default-500 hover:text-accent-primary mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回首页
        </Link>

        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center shadow-glow-accent">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">我的想法</h1>
              <p className="text-default-500 text-sm">管理你发布的所有想法</p>
            </div>
          </div>
          <Button 
            as={Link} 
            href="/ideas/new" 
            className="btn-gradient font-semibold"
            startContent={<PlusCircle className="w-4 h-4" />}
          >
            发布新想法
          </Button>
        </div>

        {/* 标签选择器 */}
        <div className="mb-8 animate-fade-in-up delay-100">
          <TabSelector activeTab={activeTab} counts={{ all: allCount, public: publicCount, private: privateCount }} />
        </div>

        {/* 想法列表 */}
        {!ideas || ideas.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-tertiary/20 mb-6 animate-float">
              <Lightbulb className="w-10 h-10 text-accent-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === 'all'
                ? '你还没有发布任何想法'
                : activeTab === 'public'
                  ? '你还没有公开想法'
                  : '你还没有私有想法'}
            </h3>
            <p className="text-default-500 mb-6">开始记录你的第一个灵感吧！</p>
            <Button 
              as={Link} 
              href="/ideas/new" 
              className="btn-gradient font-semibold"
              size="lg"
              startContent={<PlusCircle className="w-5 h-5" />}
            >
              发布想法
            </Button>
          </div>
        ) : (
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
                  userId={user.id}
                  showAuthor={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TabSelector({ activeTab, counts }: { activeTab: TabKey; counts: { all: number; public: number; private: number } }) {
  const tabs = [
    { key: 'all', label: '全部', icon: LayoutList, count: counts.all },
    { key: 'public', label: '公开', icon: Globe, count: counts.public },
    { key: 'private', label: '私有', icon: Lock, count: counts.private },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.key
        return (
          <Link
            key={tab.key}
            href={`/profile/ideas?tab=${tab.key}`}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl
              transition-all duration-300 ease-out
              ${isActive
                ? 'bg-gradient-to-r from-accent-primary to-[#ff8c5a] text-white shadow-glow-accent'
                : 'bg-default-100/60 hover:bg-default-200/80 text-default-700 hover:shadow-soft'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${isActive ? 'bg-white/20' : 'bg-default-200/80'}
            `}>
              {tab.count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
