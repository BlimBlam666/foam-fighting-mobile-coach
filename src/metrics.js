export function calculateDerivedMetrics(logs) {
  const wins = logs.filter((log) => log.success === 'Yes').length
  const losses = logs.filter((log) => log.success === 'No').length
  const minutes = logs.reduce((sum, log) => sum + log.duration, 0)
  const sessions = logs.length
  const winRate = wins + losses === 0 ? 0 : Math.round((wins / (wins + losses)) * 100)
  const avgEnergy = average(logs.map((log) => log.energy))
  const avgConfidence = average(logs.map((log) => log.confidence))
  const weaknessTarget = mostCommon(logs.map((log) => log.problem).filter(Boolean)) || 'No weakness identified yet'
  const focusStats = calculateFocusStats(logs)
  const metricTypeStats = calculateMetricTypeStats(logs)

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
  }
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
