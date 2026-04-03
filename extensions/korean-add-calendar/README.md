# Korean Add Calendar (Raycast)

Create Apple Calendar events or Apple Reminders from Korean schedule sentences.

![raycast2x](https://github.com/user-attachments/assets/72f3dc0d-e1ec-42d8-809e-b297242b4639)

## Quick Start

1. Run `Create Korean Schedule Item` in Raycast.
2. Enter a Korean schedule sentence.
3. Select the target (`Apple Calendar Event` or `Reminder Item`) and destination list.
4. Run one of the actions (`Add to Apple Calendar` / `Add and Open Calendar` / `Add to Reminders`).

For full behavior details and parsing rules, see:

- [Usage and Parsing Guide](docs/usage-and-parsing-guide.md)

## Example Inputs

- `내일 오후 3시에 회의`
- `다음주 화요일 오전 10시 반에 강남에서 팀 미팅`
- `내일 오후 3시 회의 장소: B1 대회의실`
- `내일 오후 5시 코드리뷰 회의실에서`
- `3월 12일 점심 12시 30분에 점심 약속`
- `오늘 19:00에 운동`
- `내일 오후 4시부터 6시까지 회의`
- `내일 6시 전에 제출`
- `3일 안에 계약서 보내기`
- `이번주 내 정산`
- `3시간 이내 계약서 회신`
- `오늘 중 결재`
- `이번달 내 정산`
- `내일 오후 3시 회의 그리고 오후 5시 코드리뷰`
- `매주 화요일 오후 4시 회의`

## Behavior

- If no time is provided, the item is created as all-day.
- If a parsed weekday-only expression is in the past (for example, `월요일 3시`), it moves to the next week.
- Event creation uses EventKit through `assets/add_event.swift`.
- Reminder creation uses EventKit through `assets/add_reminder.swift`.
- You can select the destination calendar or reminder list from writable EventKit lists.
- The last selected target and destination are restored automatically.
- The optional location field overrides the parsed location when provided.
- Batch parsing supports up to 3 clauses. Clauses can be split by `,`, `;`, and conditionally by `그리고/하고`.
- If a later clause omits date but has time, the first parsed date cue is inherited.
- Parse status, summary, and recommended target are shown above destination fields.
- If a sentence only contains time (for example, `6시 직장인 미팅`), date defaults to today. If that time has already passed, it rolls to the next day.
- Time ranges in the form `부터 ~까지` are supported.
- Recurrence patterns (`매일`, `매주`, `매월`) are supported for Calendar target.
- Recurrence end can be set by count or end date.
- Deadline patterns such as `까지/전에/전까지/이전`, `N일 안에/이내/내`, `N시간 안에/이내/내`, `오늘/내일/모레 중`, and `이번주/다음주/이번달/다음달 내` are supported.
- Deadline sentences are interpreted as due points (not duration blocks).
- Deadline intent defaults to `Reminder Item` unless manually overridden.
- Location parsing priority is `장소는/장소:/장소=` > sentence-end `...에서` > leading `...에서 ...`.
- You can use `Create and Open Calendar` to jump to the created event time in Calendar.app.
- macOS Calendar and Reminders permissions are required on first use.

## Development

```bash
npx ray develop
```
