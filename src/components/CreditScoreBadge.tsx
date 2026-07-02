import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { CreditScoreFactors } from '@/types'

const tierConfig: Record<string, { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  excellent: { label: 'Excellent', color: 'text-green-600 dark:text-green-400', variant: 'default' },
  good: { label: 'Good', color: 'text-blue-600 dark:text-blue-400', variant: 'secondary' },
  fair: { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', variant: 'outline' },
  needs_improvement: { label: 'Needs Improvement', color: 'text-orange-600 dark:text-orange-400', variant: 'outline' },
  poor: { label: 'Poor', color: 'text-red-600 dark:text-red-400', variant: 'destructive' },
}

interface CreditScoreBadgeProps {
  score: number
  factors?: CreditScoreFactors
  size?: 'sm' | 'md'
}

export default function CreditScoreBadge({ score, factors, size = 'sm' }: CreditScoreBadgeProps) {
  const tier = factors?.tier || 'fair'
  const config = tierConfig[tier] || tierConfig.fair
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className={`${config.color} ${textSize} cursor-help`}>
            Credit: {score}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <p className="font-semibold">{config.label} — {score}/900</p>
            {factors && (
              <>
                <p>Completion: {factors.completion.score}/{factors.completion.max}</p>
                <p>Reliability: {factors.reliability.score}/{factors.reliability.max}</p>
                <p>Reviews: {factors.reviews.score}/{factors.reviews.max}</p>
                <p>Communication: {factors.communication.score}/{factors.communication.max}</p>
                <p>Tenure: {factors.tenure.score}/{factors.tenure.max}</p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
