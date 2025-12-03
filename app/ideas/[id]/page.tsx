import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader, Avatar, Chip, Divider } from '@heroui/react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Eye, Calendar, Edit } from 'lucide-react'
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex justify-between items-start w-full">
            <div className="flex gap-3 items-start flex-1">
              <Avatar
                src={ideaData.author_avatar || undefined}
                name={ideaData.author_username || '用户'}
                size="lg"
              />
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">{ideaData.title}</h1>
                <div className="flex items-center gap-2 text-sm text-default-500 mt-1">
                  <span>{ideaData.author_username || '匿名用户'}</span>
                  <span>·</span>
                  <span>{createdAt}</span>
                  {ideaData.created_at !== ideaData.updated_at && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Edit size={14} />
                        {updatedAt}更新
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {isAuthor && <IdeaActions ideaId={ideaData.id} />}
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={ideaData.status} />
            {ideaData.visibility === 'private' && (
              <Chip size="sm" variant="flat" color="warning" startContent={<Eye size={14} />}>
                私有
              </Chip>
            )}
            <Chip size="sm" variant="flat" startContent={<Calendar size={14} />}>
              {new Date(ideaData.created_at).toLocaleDateString('zh-CN')}
            </Chip>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          <MarkdownRenderer content={ideaData.content} />

          <Divider className="my-6" />

          <div className="flex items-center justify-between">
            <VoteButtons
              ideaId={ideaData.id}
              initialUpvotes={ideaData.upvotes}
              initialDownvotes={ideaData.downvotes}
              initialUserVote={userVote}
              userId={user?.id}
            />
            <div className="text-sm text-default-500">
              评分: {ideaData.vote_score} · {ideaData.comment_count} 条评论
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 评论区 */}
      <CommentSection ideaId={id} userId={user?.id} />
    </div>
  )
}

