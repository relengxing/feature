import { Card, CardHeader, CardBody, CardFooter, Avatar, Chip } from '@heroui/react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MessageCircle, Eye } from 'lucide-react'
import { StatusBadge } from './status-badge'
import { VoteButtons } from './vote-buttons'
import type { IdeaWithStats } from '@/types/database.types'

interface IdeaCardProps {
  idea: IdeaWithStats
  userVote?: 'up' | 'down' | null
  userId?: string
  showAuthor?: boolean
}

export function IdeaCard({ idea, userVote, userId, showAuthor = true }: IdeaCardProps) {
  const timeAgo = formatDistanceToNow(new Date(idea.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3 justify-between">
        <div className="flex gap-3 items-center flex-1">
          {showAuthor && (
            <Avatar
              src={idea.author_avatar || undefined}
              name={idea.author_username || '用户'}
              size="sm"
            />
          )}
          <div className="flex flex-col flex-1">
            <Link href={`/ideas/${idea.id}`} className="hover:text-primary">
              <h3 className="text-lg font-semibold">{idea.title}</h3>
            </Link>
            <div className="flex items-center gap-2 text-sm text-default-500">
              {showAuthor && <span>{idea.author_username || '匿名用户'}</span>}
              <span>·</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={idea.status} />
          {idea.visibility === 'private' && (
            <Chip size="sm" variant="flat" color="warning">
              <Eye size={14} className="mr-1" />
              私有
            </Chip>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <p className="line-clamp-3 text-default-700">
          {idea.content.substring(0, 200)}
          {idea.content.length > 200 && '...'}
        </p>
      </CardBody>
      <CardFooter className="flex justify-between items-center">
        <VoteButtons
          ideaId={idea.id}
          initialUpvotes={idea.upvotes}
          initialDownvotes={idea.downvotes}
          initialUserVote={userVote}
          userId={userId}
          compact
        />
        <div className="flex items-center gap-4 text-sm text-default-500">
          <div className="flex items-center gap-1">
            <MessageCircle size={16} />
            <span>{idea.comment_count}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

