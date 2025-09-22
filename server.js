// server.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose(); // Import thư viện sqlite3
const app = express();
const PORT = 3000;

// --- KẾT NỐI DATABASE VÀ KHỞI TẠO BẢNG ---

// Thao tác này sẽ tạo ra file `clb-events.db` nếu nó chưa có
// File này chính là database của bạn
const db = new sqlite3.Database("./clb-events.db", (err) => {
  if (err) {
    console.error("Lỗi kết nối database:", err.message);
  } else {
    console.log("Đã kết nối tới database SQLite.");

    // Dùng db.serialize để các lệnh thực thi tuần tự
    db.serialize(() => {
      // Lệnh SQL để tạo bảng 'events'
      // IF NOT EXISTS: để không bị lỗi nếu bảng đã tồn tại rồi
      const createTableSql = `
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    date TEXT,
                    description TEXT
                )
            `;
      db.run(createTableSql, (err) => {
        if (err) {
          return console.error("Lỗi khi tạo bảng:", err.message);
        }
        console.log("Bảng 'events' đã sẵn sàng.");

        // Thêm một vài dữ liệu mẫu để test
        const insertSql = `INSERT INTO events (title, date, description) VALUES (?, ?, ?)`;

        db.run(
          insertSql,
          ["Workshop Guitar", "2025-10-20", "Học các hợp âm cơ bản."],
          (err) => {
            if (err) console.error(err.message);
          }
        );
        db.run(
          insertSql,
          [
            "Đêm nhạc Acoustic",
            "2025-11-05",
            "Giao lưu âm nhạc chào tân sinh viên.",
          ],
          (err) => {
            if (err) console.error(err.message);
          }
        );
      });
    });
  }
});

// Phục vụ các file tĩnh (frontend)
app.use(express.static("public"));

// server.js (thêm vào phần còn thiếu ở trên)

// --- TẠO API ĐỂ LẤY DANH SÁCH SỰ KIỆN ---
app.get("/api/events", (req, res) => {
  const sql = "SELECT * FROM events ORDER BY date DESC"; // Câu lệnh SQL quen thuộc của bạn

  // db.all() sẽ chạy câu lệnh SELECT và trả về tất cả các hàng kết quả
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Lỗi truy vấn:", err.message);
      // Nếu có lỗi, gửi phản hồi lỗi về cho client
      res.status(500).json({ error: err.message });
      return;
    }

    // Nếu không có lỗi, gửi dữ liệu (rows) về cho client
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy ngon lành tại http://localhost:${PORT}`);
});
