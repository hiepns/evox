# Hướng dẫn cài Linear MCP cho Cursor (chính xác)

Linear MCP dùng **OAuth** (mở browser chọn workspace), không cần API key trong config.

---

## Bước 1: Config MCP

### Cách A — One-click (khuyến nghị)

1. Mở link sau trong browser (hoặc Cursor sẽ mở):
   ```
   cursor://anysphere.cursor-deeplink/mcp/install?name=Linear&config=eyJ1cmwiOiJodHRwczovL21jcC5saW5lYXIuYXBwL21jcCJ9
   ```
2. Cursor sẽ thêm server Linear với config chuẩn.

### Cách B — Sửa file thủ công

1. Mở **Cursor Settings** (Ctrl/Cmd + Shift + J) → **MCP**.
2. Chọn **Add new global MCP server** (hoặc **Edit** nếu đã có).
3. Dán config:
   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
       }
     }
   }
   ```
4. Lưu.

**Hoặc** sửa trực tiếp file trong project:

- **`evox/.cursor/mcp.json`** (project)
- Hoặc **Cursor Settings → MCP** (global)

Nội dung chuẩn (theo [Linear Docs](https://linear.app/docs/mcp)):

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
    }
  }
}
```

**Không** thêm `LINEAR_API_KEY` hay `@linear/mcp-server` — dùng đúng `mcp-remote` + URL trên.

---

## Bước 2: Xóa auth cũ (nếu trước đây đã cài sai workspace)

Trong **Terminal**:

```bash
rm -rf ~/.mcp-auth
```

Sau đó kết nối lại để browser mở OAuth và chọn đúng workspace (ví dụ **Affitor AI** / **Agent Factory**).

---

## Bước 3: Restart Cursor

1. Đóng Cursor hoàn toàn (Cmd+Q / Alt+F4).
2. Mở lại Cursor, mở project **evox**.

---

## Bước 4: Đăng nhập Linear (OAuth)

1. Khi Cursor load MCP Linear lần đầu (hoặc sau khi xóa `~/.mcp-auth`), browser sẽ mở trang Linear.
2. Đăng nhập Linear (nếu chưa).
3. **Chọn workspace** — chọn **Affitor AI** (hoặc workspace có team **Agent Factory** / issues AGT-xxx).
4. Authorize xong, quay lại Cursor.

---

## Bước 5: Kiểm tra (Verify)

Trong Cursor (chat với AI hoặc MCP tools):

1. **Linear: list_teams()** — phải thấy team **"Agent Factory"** (hoặc tên team của workspace Affitor AI).
2. **Linear: get_issue("AGT-142")** — phải trả về issue (có title, v.v.).

Nếu vẫn thấy **My Time Zone** hoặc **Entity not found** cho AGT-142 → chưa đúng workspace: xóa `~/.mcp-auth` và OAuth lại, chọn workspace **Affitor AI**.

---

## Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| Internal server error / connection fail | Chạy `rm -rf ~/.mcp-auth` rồi kết nối lại. |
| MCP server không xuất hiện | Restart Cursor; kiểm tra Settings → MCP có server "linear" không. |
| list_teams chỉ thấy My Time Zone | Đang đúng workspace khác → xóa `~/.mcp-auth`, OAuth lại và chọn **Affitor AI**. |
| get_issue("AGT-142") Entity not found | Issue AGT-142 thuộc workspace Affitor AI; nếu đang OAuth My Time Zone thì phải đổi workspace như trên. |

---

## Tóm tắt

- Config: **`npx` + `mcp-remote` + `https://mcp.linear.app/mcp`** (không dùng API key trong config).
- Auth: **OAuth trong browser** → chọn workspace **Affitor AI** để thấy Agent Factory và AGT-xxx.
- Sau khi sửa config hoặc đổi workspace: **Restart Cursor** và nếu cần thì **xóa `~/.mcp-auth`** rồi OAuth lại.
