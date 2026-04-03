# Korean Add Calendar: Usage and Parsing Guide

This document describes the current implementation behavior.

## 1) First Run Checklist

1. Install the extension and run `Create Korean Schedule Item`.
2. Allow macOS permissions when prompted:
   - Calendar access
   - Reminders access
3. If destination lists are empty, run `Refresh Lists` from the action panel.
4. Last selected target and destination are cached and restored automatically.

## 2) How to Use

1. Enter a Korean sentence in `Schedule Sentence`.
   - Parse status, parse summary, and recommended target update immediately.
2. Optionally fill `Location (Optional)`.
   - This value overrides the parsed location.
3. Choose `Target`:
   - `Apple Calendar Event`
   - `Reminder Item`
   - Deadline intent defaults to `Reminder Item` unless manually overridden.
4. Select the destination:
   - `Calendar` for events
   - `Reminder List` for reminders
5. Run one of the actions:
   - `Add to Apple Calendar`
   - `Add and Open Calendar`
   - `Add to Reminders`
6. If recurrence is detected and target is Calendar:
   - choose `Recurrence End`
   - `End by count` or `End by date`

## 3) Parsing Rules

### 3-1) Batch Input Rules

- Up to 3 clauses are accepted in one input.
- Primary split tokens: `,` and `;`
- Conditional split tokens: `그리고` / `하고`
  - split only when the next clause starts with a date/time cue
- If a later clause omits date but includes time, the first parsed date cue is inherited.

### 3-2) Date Rules

- Relative days: `오늘`, `내일`, `모레`
- Relative month day: `이번달 25일`, `이달 20일`, `다음달 3일`, `담달 1일`
- Absolute dates: `3월 12일`, `2026년 3월 2일`, `내년 1월 2일`
- Week/weekday: `이번주 화요일`, `다음주 금요일`, `다다음주 수요일`, `월요일`
- Relative day deadlines: `3일 안에`, `5일 이내`, `2일 내`
- Relative hour deadlines: `3시간 안에`, `3시간 이내`, `2시간 내`
- Day-level deadlines: `오늘 중`, `내일 중`, `모레 중`
- Week-level deadlines: `이번주 내`, `다음주 내`, `다다음주 내`
- Month-level deadlines: `이번달 내`, `이달 내`, `다음달 내`, `담달 내`

### 3-3) Time Rules

- AM/PM tokens: `오전 9시`, `오후 3시 반`, `밤 12시`
- 24-hour format: `14:30`
- Time-only sentences are allowed: `6시 직장인 미팅`, `14시부터 16시까지 회의`
  - If date is omitted, parser uses today.
  - If the parsed time has already passed, it rolls to the next day.
- If time is omitted, an all-day item is created.
- Range format: `... 4시부터 6시까지 ...`
  - If start has AM/PM and end omits it, end inherits start meridiem.
  - If end time is earlier than start, end rolls to the next day.
- Start-only emphasis: `... 4시부터 ...`
  - Uses default duration (60 minutes).

### 3-4) Recurrence Rules

- Supported recurrence prefixes:
  - `매일 ...`
  - `매주 (요일) ...`
  - `매월 N일 ...`
- Recurrence is currently submit-supported for Calendar target only.
- For Reminder target, recurring clauses are rejected at submit time with an explicit error.

### 3-5) Deadline Rules

Supported suffixes:

- `까지`, `까지는`, `전`, `전에`, `전까지`, `이전`, `이전까지`

Behavior:

- Deadline tokens are consumed from time/date text and not kept in title.
- Deadline input is treated as a due point, not a start-to-due duration block.
- For Calendar target:
  - due time -> starts at due time with default duration
  - due date only -> all-day item
- For Reminder target:
  - parsed `start` is saved as due date
  - all-day deadlines save date-only due components

### 3-6) Location Rules

- Location extraction priority:
  1. explicit marker: `장소는 ...`, `장소: ...`, `장소= ...`
  2. trailing sentence-end form: `... 회의실에서`
  3. leading form: `회의실에서 ...`
  4. fallback capture from parser head match
- Manual location overrides parsed location.

### 3-7) Title Rules

- Remaining text after removing date/time/location tokens is used as title.
- If empty, fallback title is `새 일정` (internal parser default).

### 3-8) Past-Time Adjustments

- Weekday-only expressions without week modifier move to next week when already past.
- Month/day without year moves to next year when already past.

### 3-9) Conflict Priority

1. `부터 ~까지` range expressions
2. Deadline expressions (`까지/전에/이내/내/중`)
3. Standalone `부터` start-only expressions

## 4) Calendar and Reminder Mapping

- Calendar:
  - Saves `title/start/end/location/allDay` to EventKit event.
  - Saves recurrence rule when recurrence is detected and validated.
- Reminder:
  - Saves parsed `start` as due date.
  - If location exists, stores `Location: ...` in reminder notes.

## 5) Runtime Performance

- Swift bridge prefers `swiftc` compiled binary cache.
- Falls back to interpreted `swift <script.swift>` if caching fails.
- Cache can be disabled with:
  - `RAYCAST_KOREAN_CALENDAR_DISABLE_SWIFT_BINARY_CACHE=1`

## 6) Known Limits

- At most 3 clauses per input are processed.
- Recurrence submission is Calendar-only.
- Complex nested deadline combinations may not match user intent exactly (for example, `오늘 중 3시간 이내`).
- Sentences without date/time cues fail parsing (for example, `회의 잡아줘`).
