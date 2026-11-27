import type { ReactNode } from 'react'
import type { InsightLevel } from './lib/businessInsights'
import './InsightPanel.css'

export default function InsightPanel({
  area,
  level = 'info',
  title,
  explanation,
  action,
  evidence,
}: {
  area: string
  level?: InsightLevel
  title: string
  explanation: string
  action: string
  evidence?: ReactNode
}) {
  return (
    <aside className={`tool-insight-panel tool-insight-${level}`} aria-label={`${area} business insight`}>
      <div className="tool-insight-label">PROFITPILOT INSIGHT · {area}</div>
      <strong>{title}</strong>
      <p>{explanation}</p>
      <div className="tool-insight-action"><b>Suggested next step</b><span>{action}</span></div>
      {evidence !== undefined && <small>{evidence}</small>}
    </aside>
  )
}
