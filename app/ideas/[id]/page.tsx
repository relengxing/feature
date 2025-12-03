import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader, Avatar, Chip, Divider } from '@heroui/react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Eye, Calendar, Edit, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/status-badge'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { VoteButtons } from '@/components/vote-buttons'
import { CommentSection } from '@/components/comment-section'
import { IdeaActions } from '@/components/idea-actions'

interface IdeaPageProps {
  params: Promise<{ id: string }>
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 获取想法详情
  const { data: idea, error } = await supabase
    .schema('feature').from('ideas_with_stats')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !idea) {
    notFound()
  }

  // 检查权限：如果是私有想法，只有作者可以查看
  const ideaData = idea as any
  if (ideaData.visibility === 'private' && ideaData.user_id !== user?.id) {
    notFound()
  }

  // 获取用户投票
  let userVote: 'up' | 'down' | null = null
  if (user) {
    const { data: vote } = await supabase
      .schema('feature').from('idea_votes')
      .select('vote_type')
      .eq('idea_id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    userVote = (vote as any)?.vote_type || null
  }

  const createdAt = formatDistanceToNow(new Date(ideaData.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  const updatedAt = formatDistanceToNow(new Date(ideaData.updated_at), {
    addSuffix: true,
    locale: zhCN,
  })

  const isAuthor = user?.id === ideaData.user_id

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
          返回想法大厅
        </Link>

        {/* 主卡片 */}
        <Card className="mb-6 bg-background/70 backdrop-blur-xl border border-default-200/50 shadow-medium animate-fade-in-up">
          <CardHeader className="flex flex-col gap-4 p-6">
            <div className="flex justify-between items-start w-full">
              <div className="flex gap-4 items-start flex-1">
                <div className="relative">
                  <Avatar
                    src={ideaData.author_avatar || undefined}
                    name={ideaData.author_username || '用户'}
                    size="lg"
                    className="ring-2 ring-offset-2 ring-offset-background ring-accent-primary/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-background"></div>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-default-900 mb-2">
                    {ideaData.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-default-500">
                    <span className="font-medium text-default-700">{ideaData.author_username || '匿名用户'}</span>
                    <span className="text-default-300">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {createdAt}
                    </span>
                    {ideaData.created_at !== ideaData.updated_at && (
                      <>
                        <span className="text-default-300">·</span>
                        <span className="flex items-center gap-1 text-accent-primary">
                          <Edit className="w-3.5 h-3.5" />
                          {updatedAt}更新
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {isAuthor && <IdeaActions ideaId={ideaData.id} />}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <StatusBadge status={ideaData.status} />
              {ideaData.visibility === 'private' && (
                <Chip 
                  size="sm" 
                  variant="flat" 
                  className="bg-warning/10 text-warning border border-warning/20"
                  startContent={<Eye size={12} />}
                >
                  私有
                </Chip>
              )}
              <Chip 
                size="sm" 
                variant="flat"
                className="bg-default-100/50 border border-default-200"
                startContent={<Calendar size={12} className="text-default-400" />}
              >
                {new Date(ideaData.created_at).toLocaleDateString('zh-CN')}
              </Chip>
            </div>
          </CardHeader>

          <Divider className="opacity-50" />

          <CardBody className="p-6 md:p-8">
            {/* 内容区 */}
            <div className="prose prose-default max-w-none">
              <MarkdownRenderer content={ideaData.content} />
            </div>

            <Divider className="my-8 opacity-50" />

            {/* 底部操作区 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <VoteButtons
                ideaId={ideaData.id}
                initialUpvotes={ideaData.upvotes}
                initialDownvotes={ideaData.downvotes}
                initialUserVote={userVote}
                userId={user?.id}
              />
              <div className="flex items-center gap-4 text-sm text-default-500">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-default-100/50">
                  <span className="font-medium text-default-700">评分</span>
                  <span className="text-accent-primary font-bold">{ideaData.vote_score}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-default-100/50">
                  <span className="font-medium text-default-700">评论</span>
                  <span className="text-accent-primary font-bold">{ideaData.comment_count}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 评论区 */}
        <div id="comments" className="animate-fade-in-up delay-200">
          <CommentSection ideaId={id} userId={user?.id} />
        </div>
      </div>
    </div>
  )
}
