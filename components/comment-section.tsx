'use client'

import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Button, Textarea, Avatar, Divider, Spinner } from '@heroui/react'
import { MessageCircle, Reply, Trash2, Send, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { CommentWithUser, CommentTree } from '@/types/database.types'

interface CommentSectionProps {
  ideaId: string
  userId?: string
}

export function CommentSection({ ideaId, userId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentTree[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadComments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .schema('feature').from('comments')
      .select(
        `
        *,
        profiles:user_id (username, avatar)
      `
      )
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      // 构建评论树
      const commentMap = new Map<string, CommentTree>()
      const rootComments: CommentTree[] = []

      // 先创建所有评论的映射
      data.forEach((comment: any) => {
        commentMap.set(comment.id, {
          ...comment,
          replies: [],
        })
      })

      // 然后构建树结构
      data.forEach((comment: any) => {
        const commentNode = commentMap.get(comment.id)!
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id)
          if (parent) {
            parent.replies = parent.replies || []
            parent.replies.push(commentNode)
          }
        } else {
          rootComments.push(commentNode)
        }
      })

      setComments(rootComments)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadComments()
  }, [ideaId])

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    if (!userId) {
      window.location.href = '/auth/login'
      return
    }

    setSubmitting(true)

    const supabase = createClient()
    const { error } = await (supabase as any).schema('feature').from('comments').insert({
      idea_id: ideaId,
      user_id: userId,
      parent_id: parentId || null,
      content: newComment,
    })

    if (!error) {
      setNewComment('')
      await loadComments()
    } else {
      alert('评论失败: ' + error.message)
    }

    setSubmitting(false)
  }

  // 计算总评论数（包括回复）
  const countAllComments = (comments: CommentTree[]): number => {
    return comments.reduce((acc, comment) => {
      return acc + 1 + (comment.replies ? countAllComments(comment.replies) : 0)
    }, 0)
  }

  const totalComments = countAllComments(comments)

  return (
    <Card className="bg-background/70 backdrop-blur-xl border border-default-200/50 shadow-medium">
      <CardHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-tertiary/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">评论讨论</h2>
            <p className="text-sm text-default-500">{totalComments} 条评论</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-6 pt-0">
        {/* 发表评论表单 */}
        <form onSubmit={(e) => handleSubmit(e)} className="mb-6">
          <Textarea
            placeholder={userId ? '分享你的看法...' : '请先登录后评论'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!userId}
            minRows={3}
            classNames={{
              inputWrapper: "bg-default-100/50 border border-default-200 hover:border-accent-primary/50 focus-within:border-accent-primary",
            }}
          />
          <div className="flex justify-end mt-3">
            <Button
              type="submit"
              isDisabled={!newComment.trim() || !userId}
              isLoading={submitting}
              className="btn-gradient font-medium"
              endContent={!submitting && <Send className="w-4 h-4" />}
            >
              {submitting ? '发送中...' : '发表评论'}
            </Button>
          </div>
        </form>

        <Divider className="mb-6 opacity-50" />

        {/* 评论列表 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" color="primary" />
            <p className="mt-3 text-default-500">加载评论中...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-default-300" />
            </div>
            <p className="text-default-500 mb-1">还没有评论</p>
            <p className="text-sm text-default-400">来发表第一条评论吧！</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CommentItem
                  comment={comment}
                  userId={userId}
                  onReply={loadComments}
                  ideaId={ideaId}
                />
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function CommentItem({
  comment,
  userId,
  onReply,
  ideaId,
  depth = 0,
}: {
  comment: CommentTree
  userId?: string
  onReply: () => void
  ideaId: string
  depth?: number
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      window.location.href = '/auth/login'
      return
    }

    setSubmitting(true)

    const supabase = createClient()
    const { error } = await (supabase as any).schema('feature').from('comments').insert({
      idea_id: ideaId,
      user_id: userId,
      parent_id: comment.id,
      content: replyContent,
    })

    if (!error) {
      setReplyContent('')
      setShowReplyForm(false)
      await onReply()
    } else {
      alert('回复失败: ' + error.message)
    }

    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) return

    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.schema('feature').from('comments').delete().eq('id', comment.id)

    if (!error) {
      await onReply()
    } else {
      alert('删除失败: ' + error.message)
    }
    setDeleting(false)
  }

  const isAuthor = userId === comment.user_id
  const maxDepth = 3 // 最大嵌套深度

  return (
    <div className={depth > 0 ? 'ml-6 pl-4 border-l-2 border-accent-primary/20' : ''}>
      <div className="flex gap-3">
        <Avatar
          src={comment.profiles?.avatar || undefined}
          name={comment.profiles?.username || '用户'}
          size="sm"
          className="ring-2 ring-offset-2 ring-offset-background ring-default-200 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-sm text-default-800">
              {comment.profiles?.username || '匿名用户'}
            </span>
            <span className="text-xs text-default-400">{timeAgo}</span>
          </div>
          <p className="text-sm text-default-700 mb-3 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
          <div className="flex items-center gap-2">
            {depth < maxDepth && (
              <Button
                size="sm"
                variant="light"
                className="text-default-500 hover:text-accent-primary"
                startContent={<Reply size={14} />}
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                回复
              </Button>
            )}
            {isAuthor && (
              <Button
                size="sm"
                variant="light"
                className="text-default-500 hover:text-danger"
                startContent={<Trash2 size={14} />}
                onClick={handleDelete}
                isLoading={deleting}
              >
                删除
              </Button>
            )}
          </div>

          {/* 回复表单 */}
          {showReplyForm && (
            <form onSubmit={handleReply} className="mt-4 p-4 rounded-xl bg-default-50/50 border border-default-200">
              <Textarea
                placeholder="写下你的回复..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                minRows={2}
                size="sm"
                classNames={{
                  inputWrapper: "bg-background border border-default-200 hover:border-accent-primary/50 focus-within:border-accent-primary",
                }}
              />
              <div className="flex gap-2 mt-3">
                <Button
                  type="submit"
                  size="sm"
                  isDisabled={!replyContent.trim()}
                  isLoading={submitting}
                  className="btn-gradient font-medium"
                >
                  发表回复
                </Button>
                <Button 
                  size="sm" 
                  variant="flat" 
                  onClick={() => setShowReplyForm(false)}
                  className="font-medium"
                >
                  取消
                </Button>
              </div>
            </form>
          )}

          {/* 嵌套回复 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  userId={userId}
                  onReply={onReply}
                  ideaId={ideaId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
