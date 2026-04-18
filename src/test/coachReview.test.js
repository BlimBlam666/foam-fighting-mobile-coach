import { describe, expect, it } from 'vitest'
import { calculateWeeklyCoachReview, generateCoachVerdict, prioritizeWeakness } from '../coachReview.js'
import { makeLog } from './testUtils.js'

describe('weekly coach review', () => {
  it('calculates weekly summary and trends from structured logs', () => {
    const logs = [
      makeLog({ date: '2026-04-13', duration: 90, cleanReps: 40, attempts: 80, successes: 56, sparWins: 2, sparLosses: 3, conditioningRoundsSurvived: 2, mistakeCount: 8, problem: 'slow footwork' }, { id: 'log_1' }),
      makeLog({ date: '2026-04-15', duration: 75, cleanReps: 50, attempts: 80, successes: 60, sparWins: 3, sparLosses: 3, conditioningRoundsSurvived: 2, mistakeCount: 7, problem: 'slow footwork' }, { id: 'log_2' }),
      makeLog({ date: '2026-04-17', duration: 90, cleanReps: 70, attempts: 80, successes: 68, sparWins: 5, sparLosses: 2, conditioningRoundsSurvived: 3, mistakeCount: 4, problem: 'late block recovery' }, { id: 'log_3' }),
      makeLog({ date: '2026-04-18', duration: 60, cleanReps: 80, attempts: 80, successes: 72, sparWins: 6, sparLosses: 2, conditioningRoundsSurvived: 3, mistakeCount: 3, problem: 'slow footwork' }, { id: 'log_4' }),
    ]

    const review = calculateWeeklyCoachReview(logs, { anchorDate: '2026-04-18' })

    expect(review.sessions).toBe(4)
    expect(review.minutes).toBe(315)
    expect(review.weakness).toMatchObject({ label: 'Slow footwork', count: 3, enoughData: true })
    expect(review.trends.cleanReps).toMatchObject({ direction: 'up', startAverage: 45, endAverage: 75 })
    expect(review.trends.accuracy).toMatchObject({ direction: 'up', startAverage: 73, endAverage: 88 })
    expect(review.trends.sparPerformance).toMatchObject({ direction: 'up', startAverage: 45, endAverage: 73 })
    expect(review.trends.conditioning).toMatchObject({ direction: 'up', startAverage: 2, endAverage: 3 })
    expect(review.trends.mistakeFrequency).toMatchObject({ direction: 'down', label: 'Improved', startAverage: 8, endAverage: 4 })
    expect(review.nextWeekFocus).toContain('Keep the Olympic split steady')
  })

  it('prioritizes repeated structured mistake categories deterministically', () => {
    const logs = [
      makeLog({ mistakeCategory: 'panicUnderPressure', problem: 'panic under pressure' }, { id: 'log_1' }),
      makeLog({ mistakeCategory: 'slowFootwork', problem: 'slow footwork' }, { id: 'log_2' }),
      makeLog({ mistakeCategory: 'slowFootwork', problem: 'late first step' }, { id: 'log_3' }),
      makeLog({ problem: 'No issue noted' }, { id: 'log_4' }),
    ]

    expect(prioritizeWeakness(logs)).toMatchObject({
      label: 'Slow footwork',
      count: 2,
      enoughData: true,
    })
  })

  it('falls back to free-text weakness for old custom logs', () => {
    const logs = [
      makeLog({ mistakeCategory: 'otherCustom', problem: 'weird grip timing' }, { id: 'log_1' }),
      makeLog({ mistakeCategory: 'otherCustom', problem: 'weird grip timing' }, { id: 'log_2' }),
    ]

    expect(prioritizeWeakness(logs)).toMatchObject({
      label: 'weird grip timing',
      count: 2,
      enoughData: true,
    })
  })

  it('generates sparse-data guidance without pretending to know the answer', () => {
    const review = calculateWeeklyCoachReview([makeLog({ date: '2026-04-13', problem: 'late retreat' })], { anchorDate: '2026-04-13' })

    expect(review.sparse).toBe(true)
    expect(review.verdict[0]).toBe('Not enough logs for a strong weekly verdict yet.')
    expect(review.nextWeekFocus).toBe('Build the data baseline: log two or more sessions before changing the plan.')
  })

  it('uses transparent verdict rules for conflicting trends', () => {
    const verdict = generateCoachVerdict({
      sessions: 4,
      minutes: 240,
      weakness: { label: 'block recovery' },
      trends: {
        accuracy: { direction: 'up' },
        mistakeFrequency: { direction: 'up' },
        sparPerformance: { direction: 'down' },
        conditioning: { direction: 'flat' },
      },
    })

    expect(verdict).toContain('Priority weakness this week: block recovery.')
    expect(verdict).toContain('Accuracy improved, but mistake frequency rose under pressure.')
    expect(verdict).toContain('Spar performance is trending down. Emphasize tactical reads over extra volume.')
    expect(verdict).toContain('Friday should isolate block recovery and reduce repeat mistakes before broad sparring.')
  })
})
