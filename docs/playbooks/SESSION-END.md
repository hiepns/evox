# Session End Playbook

Chạy khi kết thúc mỗi session làm việc để chia sẻ kiến thức cho cả team.

---

## Quy trình

### 1. Tạo Session Summary

```bash
# Tạo file summary với format: YYYY-MM-DD-session-N.md
touch docs/sessions/$(date +%Y-%m-%d)-session-N.md
```

### 2. Điền template

```markdown
# Session [N] — [Date]

## Người thực hiện
- Human: [tên]
- Agent: [SAM/LEO/QUINN/MAX/...]

## Mục tiêu
[Mục tiêu chính của session]

## Đã hoàn thành
| # | Task | Ticket | Status |
|---|------|--------|--------|
| 1 | ... | AGT-XX | ✅ Done |

## Files đã thay đổi
```
path/to/file1.ts — Mô tả ngắn
path/to/file2.ts — Mô tả ngắn
```

## Bài học (QUAN TRỌNG)
1. **[Keyword]** — Giải thích ngắn gọn
2. **[Keyword]** — Giải thích ngắn gọn

## Lỗi gặp phải & Cách fix
| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| ... | ... | ... |

## Còn lại / Ngày mai
- [ ] Task 1
- [ ] Task 2

## Commands hữu ích
```bash
# Command 1
command here

# Command 2
command here
```
```

### 3. Lưu vào thư mục sessions

```bash
docs/sessions/
├── 2026-02-04-session-17.md
├── 2026-02-03-session-16.md
└── ...
```

### 4. Commit & Push

```bash
git add docs/sessions/
git commit -m "docs: Session summary $(date +%Y-%m-%d)"
git push
```

---

## Tại sao cần làm này?

1. **Knowledge sharing** — Agents khác học từ session trước
2. **Onboarding** — Agent mới đọc history để hiểu context
3. **Debug** — Khi gặp lỗi tương tự, tìm lại cách fix
4. **Tracking** — Theo dõi tiến độ dự án

---

## Tips

- Viết **bài học** rõ ràng, ngắn gọn
- Ghi lại **commands** đã dùng
- Note **lỗi & fix** để tránh lặp lại
- Link đến **Linear tickets** liên quan

---

## Ví dụ tốt

### Bài học
```
1. **Convex "use node"** — File có "use node" chỉ được chứa actions,
   queries/mutations phải tách ra file riêng.

2. **Subscription vs API** — Claude CLI cần TTY để dùng subscription,
   headless process sẽ fallback về API (tốn tiền).
```

### Lỗi & Fix
```
| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| Convex deploy fail: "Only actions can be defined in Node.js" | File có "use node" chứa mutation | Tách mutations ra file riêng không có "use node" |
```
