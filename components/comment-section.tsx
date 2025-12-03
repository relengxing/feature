'use client'

import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Button, Textarea, Avatar, Divider, Spinner } from '@heroui/react'
import { MessageCircle, Reply, Trash2 } from 'lucide-react'
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <h2 className="text-xl font-bold">评论 ({comments.length})</h2>
        </div>
      </CardHeader>
      <CardBody>
        {/* 发表评论表单 */}
        <form onSubmit={(e) => handleSubmit(e)} className="mb-6">
          <Textarea
            placeholder={userId ? '写下你的评论...' : '请先登录后评论'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!userId}
            minRows={3}
            className="mb-2"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              isDisabled={!newComment.trim() || !userId}
              isLoading={submitting}
            >
              发表评论
            </Button>
          </div>
        </form>

        <Divider className="mb-4" />

        {/* 评论列表 */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-default-500 py-8">还没有评论，来发表第一条吧！</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                userId={userId}
                onReply={loadComments}
                ideaId={ideaId}
              />
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
    <div className={depth > 0 ? 'ml-8 border-l-2 pl-4' : ''}>
      <div className="flex gap-3">
        <Avatar
          src={comment.profiles?.avatar || undefined}
          name={comment.profiles?.username || '用户'}
          size="sm"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {comment.profiles?.username || '匿名用户'}
            </span>
            <span className="text-xs text-default-500">{timeAgo}</span>
          </div>
          <p className="text-sm mb-2 whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-2">
            {depth < maxDepth && (
              <Button
                size="sm"
                variant="light"
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
                color="danger"
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
            <form onSubmit={handleReply} className="mt-3">
              <Textarea
                placeholder="写下你的回复..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                minRows={2}
                size="sm"
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  color="primary"
                  isDisabled={!replyContent.trim()}
                  isLoading={submitting}
                >
                  发表回复
                </Button>
                <Button size="sm" variant="flat" onClick={() => setShowReplyForm(false)}>
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

