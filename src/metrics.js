import { DEFAULT_MISTAKE_CATEGORY, getMistakeCategoryLabel, normalizeMistakeCategory } from './dataModel.js'

export function calculateDerivedMetrics(logs) {
  const wins = logs.filter((log) => log.success === 'Yes').length
  const losses = logs.filter((log) => log.success === 'No').length
  const minutes = logs.reduce((sum, log) => sum + log.duration, 0)
  const sessions = logs.length
  const winRate = wins + losses === 0 ? 0 : Math.round((wins / (wins + losses)) * 100)
  const avgEnergy = average(logs.map((log) => log.energy))
  const avgConfidence = average(logs.map((log) => log.confidence))
  const weaknessTarget = mostCommon(logs.map(weaknessLabelForLog).filter(Boolean)) || 'No weakness identified yet'
  const focusStats = calculateFocusStats(logs)
  const metricTypeStats = calculateMetricTypeStats(logs)
  const programTracking = calculateProgramTracking(logs, metricTypeStats)

  return {
    sessions,
    wins,
    losses,
    minutes,
    winRate,
    avgEnergy,
    avgConfidence,
    weaknessTarget,
    focusStats,
    metricTypeStats,
    programTracking,
  }
}

function calculateProgramTracking(logs, metricTypeStats) {
  const byType = new Map(metricTypeStats.map((item) => [item.metricType, item]))
  const specs = [
    { key: 'cleanReps', label: 'Clean reps', metricType: 'Clean reps', suffix: '', empty: 'No clean reps logged', values: logs.map((log) => log.cleanReps) },
    { key: 'sparWins', label: 'Spar wins', metricType: 'Spar wins %', suffix: '%', empty: 'No spar win % logged', values: logs.map(sparWinRate) },
    { key: 'accuracy', label: 'Accuracy', metricType: 'Accuracy %', suffix: '%', empty: 'No accuracy logged', values: logs.map(accuracyRate) },
    { key: 'conditioningRounds', label: 'Conditioning rounds', metricType: 'Conditioning rounds survived', suffix: '', empty: 'No conditioning rounds logged', values: logs.map((log) => log.conditioningRoundsSurvived) },
    { key: 'mistakeFrequency', label: 'Mistake frequency', metricType: 'Mistake frequency', suffix: '', empty: 'No mistakes logged', values: logs.map((log) => log.mistakeCount) },
    { key: 'tournamentPlacement', label: 'Tournament placement', metricType: 'Tournament placement', suffix: '', empty: 'No placement logged', values: logs.map((log) => log.tournamentPlacement) },
  ]

  return specs.map((spec) => {
    const structuredValues = spec.values.filter((value) => typeof value === 'number' && Number.isFinite(value))
    const stat = byType.get(spec.metricType)
    const hasStructured = structuredValues.length > 0
    return {
      ...spec,
      count: hasStructured ? structuredValues.length : stat?.count || 0,
      averageResult: hasStructured ? average(structuredValues) : stat?.averageResult ?? null,
      source: hasStructured ? 'structured' : stat?.count ? 'legacy' : 'none',
    }
  })
}

function accuracyRate(log) {
  if (typeof log.attempts === 'number' && log.attempts > 0 && typeof log.successes === 'number') {
    return Math.round((log.successes / log.attempts) * 100)
  }
  return null
}

function sparWinRate(log) {
  if (typeof log.sparWins !== 'number') return null
  const losses = typeof log.sparLosses === 'number' ? log.sparLosses : 0
  const total = log.sparWins + losses
  if (total <= 0) return null
  return Math.round((log.sparWins / total) * 100)
}

function calculateFocusStats(logs) {
  const totals = logs.reduce((acc, log) => {
    const key = log.focus
    if (!acc[key]) {
      acc[key] = { focus: key, sessions: 0, wins: 0, minutes: 0 }
    }
    acc[key].sessions += 1
    acc[key].wins += log.success === 'Yes' ? 1 : 0
    acc[key].minutes += log.duration
    return acc
  }, {})

  return Object.values(totals)
    .map((item) => ({
      ...item,
      winRate: item.sessions ? Math.round((item.wins / item.sessions) * 100) : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
}

function calculateMetricTypeStats(logs) {
  const totals = logs.reduce((acc, log) => {
    const key = log.metricType
    if (!acc[key]) {
      acc[key] = { metricType: key, count: 0, numericResults: [] }
    }
    acc[key].count += 1

    const numericResult = Number(log.result)
    if (Number.isFinite(numericResult)) {
      acc[key].numericResults.push(numericResult)
    }

    return acc
  }, {})

  return Object.values(totals)
    .map((item) => ({
      metricType: item.metricType,
      count: item.count,
      averageResult: item.numericResults.length ? average(item.numericResults) : null,
    }))
    .sort((a, b) => b.count - a.count)
}

function average(values) {
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function mostCommon(values) {
  const counts = values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
}

function weaknessLabelForLog(log) {
  const category = normalizeMistakeCategory(log.mistakeCategory, log.problem)
  if (category !== DEFAULT_MISTAKE_CATEGORY) return getMistakeCategoryLabel(category)

  if (typeof log.problem !== 'string') return ''
  const problem = log.problem.trim()
  if (!problem || problem.toLowerCase() === 'no issue noted') return ''
  return problem
}
