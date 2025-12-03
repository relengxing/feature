'use client'

import { useState } from 'react'
import { Button } from '@heroui/react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { VoteType } from '@/types/database.types'
import { cn } from '@/lib/utils'

interface VoteButtonsProps {
  ideaId: string
  initialUpvotes: number
  initialDownvotes: number
  initialUserVote?: VoteType | null
  userId?: string
  compact?: boolean
}

export function VoteButtons({
  ideaId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote = null,
  userId,
  compact = false,
}: VoteButtonsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleVote = async (voteType: VoteType) => {
    if (!userId) {
      // 未登录用户，跳转到登录页
      window.location.href = '/auth/login'
      return
    }

    setLoading(true)

    if (userVote === voteType) {
      // 取消投票
      const { error } = await supabase
        .schema('feature').from('idea_votes')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', userId)

      if (!error) {
        if (voteType === 'up') {
          setUpvotes((prev) => prev - 1)
        } else {
          setDownvotes((prev) => prev - 1)
        }
        setUserVote(null)
      }
    } else {
      // 新投票或更改投票
      const { error } = await (supabase as any)
        .schema('feature').from('idea_votes')
        .upsert(
          {
            idea_id: ideaId,
            user_id: userId,
            vote_type: voteType,
          },
          { onConflict: 'idea_id,user_id' }
        )

      if (!error) {
        if (userVote === 'up') {
          setUpvotes((prev) => prev - 1)
        } else if (userVote === 'down') {
          setDownvotes((prev) => prev - 1)
        }

        if (voteType === 'up') {
          setUpvotes((prev) => prev + 1)
        } else {
          setDownvotes((prev) => prev + 1)
        }
        setUserVote(voteType)
      }
    }

    setLoading(false)
  }

  return (
    <div className={cn('flex items-center gap-2', compact && 'gap-1.5')}>
      <Button
        size={compact ? 'sm' : 'md'}
        variant="flat"
        className={cn(
          'transition-all duration-300 font-medium',
          userVote === 'up'
            ? 'bg-success/20 text-success border-success/30 shadow-[0_4px_15px_rgba(34,197,94,0.2)]'
            : 'bg-default-100/50 text-default-600 hover:bg-success/10 hover:text-success border-transparent hover:border-success/20'
        )}
        startContent={
          <ThumbsUp 
            size={compact ? 14 : 16} 
            className={cn(
              'transition-transform',
              userVote === 'up' && 'scale-110'
            )} 
          />
        }
        onClick={() => handleVote('up')}
        isDisabled={loading}
      >
        {upvotes}
      </Button>
      <Button
        size={compact ? 'sm' : 'md'}
        variant="flat"
        className={cn(
          'transition-all duration-300 font-medium',
          userVote === 'down'
            ? 'bg-danger/20 text-danger border-danger/30 shadow-[0_4px_15px_rgba(239,68,68,0.2)]'
            : 'bg-default-100/50 text-default-600 hover:bg-danger/10 hover:text-danger border-transparent hover:border-danger/20'
        )}
        startContent={
          <ThumbsDown 
            size={compact ? 14 : 16}
            className={cn(
              'transition-transform',
              userVote === 'down' && 'scale-110'
            )}
          />
        }
        onClick={() => handleVote('down')}
        isDisabled={loading}
      >
        {downvotes}
      </Button>
    </div>
  )
}
