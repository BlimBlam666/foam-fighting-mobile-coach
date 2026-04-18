import { describe, expect, it } from 'vitest'
import { calculateDerivedMetrics } from '../metrics.js'
import { makeLog } from './testUtils.js'

describe('derived metrics', () => {
  it('derives beta-critical dashboard numbers from real logs', () => {
    const logs = [
      makeLog({ duration: 45, success: 'Yes', energy: 8, confidence: 6, focus: 'Defense', problem: 'Late retreat', metricType: 'Clean blocks', result: '80' }, { id: 'log_1' }),
      makeLog({ duration: 30, success: 'No', energy: 6, confidence: 4, focus: 'Defense', problem: 'Late retreat', metricType: 'Clean blocks', result: '60' }, { id: 'log_2' }),
      makeLog({ duration: 60, success: 'Yes', energy: 7, confidence: 8, focus: 'Footwork', problem: 'Crossed feet', metricType: 'Notes', result: 'steady' }, { id: 'log_3' }),
      makeLog({ metricType: 'Accuracy %', result: '40', attempts: 80, successes: 72 }, { id: 'log_4' }),
      makeLog({ metricType: 'Clean reps', result: '10', cleanReps: 70 }, { id: 'log_5' }),
    ]

    const metrics = calculateDerivedMetrics(logs)

    expect(metrics.sessions).toBe(5)
    expect(metrics.wins).toBe(4)
    expect(metrics.losses).toBe(1)
    expect(metrics.minutes).toBe(225)
    expect(metrics.winRate).toBe(80)
    expect(metrics.avgEnergy).toBe(7)
    expect(metrics.avgConfidence).toBe(6)
    expect(metrics.weaknessTarget).toBe('Late retreat')
    expect(metrics.focusStats.find((row) => row.focus === 'Defense')).toMatchObject({ sessions: 2, wins: 1, minutes: 75, winRate: 50 })
    expect(metrics.metricTypeStats.find((row) => row.metricType === 'Clean blocks')).toMatchObject({ count: 2, averageResult: 70 })
    expect(metrics.metricTypeStats.find((row) => row.metricType === 'Notes')).toMatchObject({ count: 1, averageResult: null })
    expect(metrics.programTracking.find((row) => row.key === 'accuracy')).toMatchObject({ averageResult: 90, count: 1, source: 'structured' })
    expect(metrics.programTracking.find((row) => row.key === 'cleanReps')).toMatchObject({ averageResult: 70, count: 1, source: 'structured' })
  })

  it('returns useful empty-state metrics with no logs', () => {
    expect(calculateDerivedMetrics([])).toMatchObject({
      sessions: 0,
      wins: 0,
      losses: 0,
      minutes: 0,
      winRate: 0,
      avgEnergy: 0,
      avgConfidence: 0,
      weaknessTarget: 'No weakness identified yet',
      focusStats: [],
      metricTypeStats: [],
    })
  })
})
