import { Chip } from '@heroui/react'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import type { IdeaStatus } from '@/types/database.types'
import { Circle, CheckCircle2, Clock, XCircle, Sparkles } from 'lucide-react'

interface StatusBadgeProps {
  status: IdeaStatus
}

const statusIcons: Record<IdeaStatus, React.ReactNode> = {
  draft: <Circle className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  approved: <CheckCircle2 className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
  implemented: <Sparkles className="w-3 h-3" />,
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Chip 
      size="sm" 
      color={STATUS_COLORS[status]} 
      variant="flat"
      startContent={statusIcons[status]}
      classNames={{
        base: "border border-current/20 px-2",
        content: "font-medium",
      }}
    >
      {STATUS_LABELS[status]}
    </Chip>
  )
}
