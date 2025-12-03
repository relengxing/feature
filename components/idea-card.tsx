import { Card, CardHeader, CardBody, CardFooter, Avatar, Chip } from '@heroui/react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MessageCircle, Eye, ArrowRight } from 'lucide-react'
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
    <Card 
      className="w-full bg-background/60 backdrop-blur-sm border border-default-200/50 hover:border-accent-primary/30 shadow-soft hover:shadow-medium transition-all duration-300 group"
    >
      <CardHeader className="flex gap-4 justify-between pb-2">
        <div className="flex gap-3 items-center flex-1 min-w-0">
          {showAuthor && (
            <div className="relative">
              <Avatar
                src={idea.author_avatar || undefined}
                name={idea.author_username || '用户'}
                size="sm"
                className="ring-2 ring-offset-2 ring-offset-background ring-default-200 group-hover:ring-accent-primary/50 transition-all duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-background"></div>
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <Link 
              href={`/ideas/${idea.id}`} 
              className="group/link inline-flex items-center gap-2"
            >
              <h3 className="text-lg font-semibold truncate group-hover/link:text-accent-primary transition-colors duration-200">
                {idea.title}
              </h3>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200 text-accent-primary" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-default-500">
              {showAuthor && (
                <>
                  <span className="font-medium text-default-600">{idea.author_username || '匿名用户'}</span>
                  <span className="text-default-300">·</span>
                </>
              )}
              <span className="text-default-400">{timeAgo}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={idea.status} />
          {idea.visibility === 'private' && (
            <Chip 
              size="sm" 
              variant="flat" 
              className="bg-warning/10 text-warning border border-warning/20"
              startContent={<Eye size={12} />}
            >
              私有
            </Chip>
          )}
        </div>
      </CardHeader>

      <CardBody className="py-3">
        <Link href={`/ideas/${idea.id}`}>
          <p className="line-clamp-2 text-default-600 leading-relaxed hover:text-default-800 transition-colors duration-200">
            {idea.content.substring(0, 200)}
            {idea.content.length > 200 && (
              <span className="text-accent-primary ml-1">...阅读更多</span>
            )}
          </p>
        </Link>
      </CardBody>

      <CardFooter className="flex justify-between items-center pt-2 border-t border-default-100">
        <VoteButtons
          ideaId={idea.id}
          initialUpvotes={idea.upvotes}
          initialDownvotes={idea.downvotes}
          initialUserVote={userVote}
          userId={userId}
          compact
        />
        <Link 
          href={`/ideas/${idea.id}#comments`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-default-500 hover:text-accent-primary hover:bg-accent-primary/5 transition-all duration-200"
        >
          <MessageCircle size={16} />
          <span className="font-medium">{idea.comment_count}</span>
          <span className="hidden sm:inline">评论</span>
        </Link>
      </CardFooter>
    </Card>
  )
}
