# Lessons Learned

> Mỗi sai lầm là cơ hội học. Document để không lặp lại.

---

## Security

### 2026-02-05: KHÔNG hardcode secrets

**Context:** EVOX tạo agent-boot.sh với Linear API key hardcoded làm fallback.

**Sai:**
```bash
LINEAR_API_KEY="${LINEAR_API_KEY:-lin_api_xxx...}"
```

**Đúng:**
```bash
LINEAR_API_KEY="${LINEAR_API_KEY:-}"
# Load từ .env.local
LINEAR_API_KEY=$(grep LINEAR_API_KEY .env.local | cut -d'=' -f2)
```

**Pre-commit check:**
```bash
# Thêm vào pre-commit hook
grep -rE "(api_key|token|secret|password).*=" --include="*.sh" --include="*.ts" | grep -v ".env"
```

**Rule:** Mọi secret phải ở `.env.local` (gitignored), KHÔNG BAO GIỜ trong code.

---

## Process

### Khi có lesson mới:

1. **Ghi ngay** vào docs/LESSONS.md
2. **Update MEMORY.md** nếu là lesson quan trọng
3. **Update CLAUDE.md** nếu cần enforce cho tất cả agents
4. **Commit** với message `docs: Add lesson - [tóm tắt]`

### Agents load lessons:

1. **Boot sequence** đọc CLAUDE.md (có rules chung)
2. **Định kỳ** review LESSONS.md trong heartbeat
3. **Trước commit** chạy pre-commit checks

---

## Template

```markdown
### YYYY-MM-DD: [Tên lesson]

**Context:** [Tình huống xảy ra]

**Sai:** [Làm gì sai]

**Đúng:** [Nên làm gì]

**Rule:** [Rule mới để tránh lặp lại]
```

### 2026-02-05: Verify sau khi gửi task

**Context:** EVOX báo "đã giao việc" nhưng agents không chạy vì thiếu Enter.

**Sai:** `tmux send-keys "task" Enter` rồi báo done ngay.

**Đúng:** Gửi task → đợi → verify agent đang "thinking/working" → mới báo done.

**Solution:** Tạo `scripts/send-task.sh` với verification built-in.

---

### 2026-02-05: Agent-specific boot files

**Context:** Boot prompt cho COLE lại ghi "You are MAX" vì dùng chung 1 file.

**Sai:** Ghi đè `boot-prompt.md` cho mọi agent.

**Đúng:** Tạo `boot-prompt-{agent}.md` riêng cho từng agent.

**Rule:** Mỗi agent cần file context riêng, không dùng chung.
