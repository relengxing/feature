import { Chip } from '@heroui/react'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import type { IdeaStatus } from '@/types/database.types'

interface StatusBadgeProps {
  status: IdeaStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Chip size="sm" color={STATUS_COLORS[status]} variant="flat">
      {STATUS_LABELS[status]}
    </Chip>
  )
}

