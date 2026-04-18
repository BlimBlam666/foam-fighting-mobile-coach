# Foam Fighter Mobile Coach - Beta User Guide

## What This App Does

Foam Fighter Mobile Coach runs an Olympic Coach foam fighting program for Warlord acceleration. It helps you:

- see what to train today in a 6-day training / 1-day recovery split
- customize the weekly schedule around real park practice
- log a practice session quickly
- notice repeated mistake patterns
- track clean reps, spar wins, accuracy, conditioning rounds, mistakes, and placement
- back up your local training data

It is meant to be used on your phone, especially right after practice.

## First Time Using It

When you open the app for the first time, you will see a short welcome screen.

The basic flow is:

1. Check `Home` for today's Olympic Coach focus.
2. Use `Plan` if you need a preset or custom park schedule.
3. Tap `Log`.
4. Fill out the quick session form.
5. Tap `Save session`.
6. Check `Stats` to see what changed.

You can reopen the help screen later from the `Help` tab.

## Tabs

### Home

Home shows today's training focus, system type, day goal, required drills, and 5-phase session plan.

On a new install, Home starts with no training history. The plan is visible, but performance metrics begin only after you log real sessions.

It also shows your current weakness target after you have enough logs.

### Log

Log is where you save a session. The app shows a small Olympic metrics block with fields that match the scheduled day:

- Monday: clean reps, attempts, and successes for accuracy
- Thursday: conditioning rounds, fatigue spar wins/losses, and mistakes
- Friday: weakness mistakes and clean correction reps
- Saturday: spar wins/losses, tournament placement, and mistakes

The generic metric/result fields are still available for older logs or flexible notes.

The required fields are shown first. Tap the small `?` next to a confusing field for a quick definition, what to enter, and an example.

Choose one primary mistake category so the coach can spot repeat patterns. Notes are optional. Tap `Add notes` if you want to record your biggest win and extra mistake detail.

Quick field translations:

- `Attempts`: total tries.
- `Successful reps`: tries that met the standard.
- `Mistake category`: the repeatable issue the coach should count.
- `Mistake detail`: optional free-text context.
- `Metric being tracked`: what you measured.
- `Result`: the value for that metric.
- `Session success`: yes/no for the whole practice.
- `Energy`: how much fuel you had, 0-10.
- `Confidence`: how solid the skill felt, 0-10.

You can also edit old logs here:

1. Tap an existing log.
2. Make changes.
3. Tap `Save changes`.

To delete one log, open it first and tap `Delete this log`. The app will ask for confirmation.

### Stats

Stats are created from your saved logs.

They include:

- total sessions
- total minutes
- wins and losses
- success rate
- clean reps from structured clean-rep logging
- spar wins from structured win/loss counts
- accuracy from structured attempts/successes
- conditioning rounds survived
- mistake frequency
- tournament placement
- average energy
- average confidence
- repeated weakness target from the controlled mistake category
- focus breakdown

If you have no logs yet, there are no real stats yet.

Stats also includes a Weekly Coach Review. It compares the early part of the logged week to the later part of the week and produces deterministic guidance:

- what improved
- what declined or stagnated
- the most repeated weakness/mistake category
- what Friday weakness work should target
- what to review on Sunday
- what next week should emphasize

This is rule-based, not AI. If there are too few logs, the app will say so clearly instead of inventing a verdict.

### Backup

Your data is stored locally on this device/browser. It is not synced to an account.

Use Backup before:

- changing phones
- clearing browser data
- testing in another browser
- uninstalling a browser

Use `Export JSON backup` to save a file. If file download does not work on your phone, use the copyable backup text.

To restore data, choose a JSON backup file.

Import options:

- `Merge by ID`: adds new logs and keeps the newest version of matching logs.
- `Replace all`: replaces all current app data after confirmation.

### Plan

Plan shows the weekly training structure and lets you customize scheduling.

The main schedule control is weekday assignment. Choose the training focus that belongs on each weekday. This controls what Home shows for the day and what Log expects after practice.

Optional presets are available as starting points:

- Standard Olympic split
- Fighters Practice Wednesday
- Full Park Sunday

After applying a preset, you can still remap any weekday. This is useful when park day, travel, or sparring partners do not match the default split.

Each day has a focus, system, goal, required drills, and tracked metrics. The app starts on Week 1 by default. The four-week cycle builds for three weeks and then deloads at 50% workload.

The periodization bars are planned target load for the program, not completed user performance. Your real performance history appears in Stats after logging sessions.

### Help

Help explains the Olympic Coach loop, how local data works, why backups matter, and how schedule customization works.

## Weakness Targeting

The coaching loop is: diagnose weakness, isolate variable, overload specifically, pressure test, measure outcome, repeat.

Every log includes one primary mistake category, such as `Slow footwork`, `Bad blocks`, or `Panic under pressure`. You can add optional free-text detail when something does not fit cleanly.

When the same category appears repeatedly, the app uses it as your weakness target. That gives your next practice a clear job.

Example:

If several logs use `Poor range control`, the coach verdict will point you toward fixing range and retreat timing.

## Tips For Fast Logging

- Use the default day and focus when they are correct.
- Enter minutes, main drill, result, success, energy, and confidence.
- Skip notes when you are tired.
- Add notes later by editing the log.
- Pick the closest mistake category first, then add detail only if it helps.

## Important Data Warning

This beta is local-first.

That means your data lives in this browser on this device. If browser storage is cleared, the data may be lost.

Export a backup regularly.
