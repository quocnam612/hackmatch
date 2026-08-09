# Kịch bản Video Demo — HackMatch (SPD Challenge 2026)

Thời lượng mục tiêu: **3:00** (tối đa theo đề). Ngôn ngữ: tiếng Việt. Bám sát đúng 5 checkpoint bắt buộc ở mục 4 của đề bài.

## Chuẩn bị trước khi quay

- Trình duyệt đã mở sẵn `http://localhost:3000`, đăng nhập sẵn tài khoản demo **`an`** / `12345678` (chủ dự án "Ứng dụng đặt lịch tình nguyện sinh viên").
- Mở sẵn trang chi tiết dự án đó (`/projects/seed-project-1`) ở một tab, trang chủ (`/`) ở một tab khác.
- Tắt các extension/thanh bookmark gây rối hình, dùng chế độ toàn màn hình trình duyệt.
- Ghi màn hình + giọng đọc song song (voice-over), không cắt cảnh giữa các checkpoint để giám khảo thấy luồng liền mạch, không dựng cảnh giả.
- Lưu ý: đoạn "báo cáo giải thích" (reason) trong Đội hình đề xuất hiện bằng **tiếng Anh** theo thiết kế (đây là chuỗi do thuật toán sinh ra, xem `CLAUDE.md`) — người thuyết minh diễn giải lại bằng tiếng Việt khi đọc, không cần đọc nguyên văn tiếng Anh.

---

## 0:00 – 0:10 | Mở đầu

**Màn hình:** Trang chủ HackMatch — badge "SPD Challenge 2026 · Ghép đội", tiêu đề, thanh thống kê trực tiếp.

**Lời thoại:**
> "Xin chào ban giám khảo. Đây là **HackMatch** — hệ thống khám phá, đánh giá và hình thành đội ngũ dự án dựa trên ràng buộc đa biến, xây dựng cho SPD Challenge 2026. Bối cảnh ứng dụng: một nền tảng ghép đội cho dự án — hackathon, khóa luận, startup — nơi chủ dự án khai báo các vai trò cần tuyển, và hệ thống tự động đề xuất đội hình tối ưu từ kho ứng viên."

---

## 0:10 – 0:35 | ✅ Checkpoint 1 — Khai báo mục tiêu và ràng buộc

**Màn hình:** Vào trang chi tiết dự án, phần **"Ràng buộc"** (chủ dự án). Trỏ chuột lần lượt vào: giới hạn số thành viên, danh sách 3 vai trò (Frontend Developer / Backend Developer / UI/UX Designer) mỗi vai trò kèm kỹ năng bắt buộc riêng, và mục kỹ năng mềm ưu tiên.

**Lời thoại:**
> "Với vai trò chủ dự án, tôi khai báo mục tiêu và ràng buộc cụ thể: giới hạn đội tối đa **3 thành viên**, chia thành **3 vai trò** — mỗi vai trò mang một bộ kỹ năng bắt buộc riêng, không phải một danh sách kỹ năng chung chung cho cả đội. Tôi cũng chọn thêm kỹ năng mềm ưu tiên như thuyết trình, động não ý tưởng — hệ thống sẽ dùng để xếp hạng khi có nhiều lựa chọn ngang nhau."

---

## 0:35 – 1:00 | ✅ Checkpoint 2 — Thao tác đánh giá, lọc ứng viên

**Màn hình:** Cuộn xuống mục **"Ứng viên tiềm năng"** — danh sách ứng viên theo từng vai trò còn trống, xếp hạng theo số kỹ năng khớp, badge xanh (khớp) / đỏ (thiếu) cho từng người.

**Lời thoại:**
> "Hệ thống quét toàn bộ **30 hồ sơ ứng viên mẫu**, lọc ra người có kỹ năng liên quan tới từng vai trò còn trống, xếp hạng theo mức độ khớp — không cần tôi tự dò từng hồ sơ. Một ứng viên hoàn toàn có thể đáp ứng nhiều kỹ năng, nhiều vai trò cùng lúc, dữ liệu không giả định quan hệ một-một giữa người và kỹ năng."

---

## 1:00 – 1:40 | ✅ Checkpoint 3 — Đề xuất đội hình + báo cáo giải thích

**Màn hình:** Cuộn lên mục **"Đội hình đề xuất"** — badge "Vai trò còn trống được đáp ứng: 3/3", danh sách từng vai trò kèm người đảm nhận và kỹ năng họ bao phủ, đoạn giải thích bên dưới.

**Lời thoại:**
> "Chỉ với dữ liệu đã có, hệ thống chạy thuật toán tìm-kiếm-có-giới-hạn để đề xuất đội hình. Kết quả: **bao phủ 3 trên 3 vai trò**. Từng vai trò được gán rõ ràng cho một người cụ thể — ai đảm nhận Frontend, ai đảm nhận Backend, ai đảm nhận UI/UX, cùng đúng những kỹ năng họ đóng góp. Phía dưới là báo cáo giải thích bằng ngôn ngữ tự nhiên: đây là đội hình nhỏ nhất bao phủ đủ yêu cầu, đồng thời được ưu tiên theo kỹ năng mềm mong muốn — đúng như báo cáo tôi cần khi ra quyết định."

---

## 1:40 – 2:15 | ✅ Checkpoint 4 — Xử lý thay đổi điều kiện động

**Màn hình:** Quay lại phần "Ràng buộc", gõ thêm kỹ năng **"Docker"** vào ô kỹ năng của vai trò Backend Developer, nhấn Enter — **không tải lại trang**, cuộn xuống cho thấy "Đội hình đề xuất" cập nhật ngay.

**Lời thoại:**
> "Bây giờ tôi thử thay đổi điều kiện ngay trong lúc chạy: thêm yêu cầu **'Docker'** cho vai trò Backend Developer. Không cần thao tác gì thêm, không tải lại trang — hệ thống lập tức tính toán lại đội hình đề xuất, vì trong kho vẫn có ứng viên biết Docker nên đội hình vẫn hợp lệ và cập nhật ngay trước mắt."

---

## 2:15 – 2:50 | ✅ Checkpoint 5 — Xử lý ngoại lệ (trường hợp vô nghiệm)

**Màn hình:** Thêm tiếp một kỹ năng **không tồn tại trong bất kỳ hồ sơ nào**, ví dụ **"COBOL"**, vào cùng vai trò đó. Badge chuyển sang **"Chưa có đội hình hợp lệ"** kèm phần trăm kỹ năng đáp ứng và dòng **"Còn thiếu: COBOL"**.

**Lời thoại:**
> "Giờ tôi thêm một kỹ năng không ai trong kho 30 ứng viên sở hữu — 'COBOL'. Hệ thống lập tức nhận diện đây là **trường hợp vô nghiệm**: không tự bịa ứng viên để lấp chỗ trống, không lặp lại thành viên, không treo màn hình hay báo lỗi *undefined* — mà báo rõ ràng: đội hình chưa hợp lệ, đang thiếu chính xác kỹ năng gì, để tôi biết cần tuyển thêm ai."

---

## 2:50 – 3:00 | Kết

**Màn hình:** Xoá "COBOL" vừa thêm — đội hình đề xuất lập tức hợp lệ trở lại (chứng minh hệ thống phục hồi tức thời, không phải lỗi một chiều). Quay về trang chủ.

**Lời thoại:**
> "Từ khai báo ràng buộc, lọc ứng viên, đề xuất đội hình có giải thích, đến cập nhật động và xử lý vô nghiệm — toàn bộ luồng chạy mượt mà và minh bạch. Cảm ơn ban giám khảo đã theo dõi HackMatch."

---

## Bảng tóm tắt checkpoint ↔ thời lượng

| # | Checkpoint (theo đề, mục 4) | Thời gian | Màn hình chính |
|---|---|---|---|
| — | Mở đầu / bối cảnh ứng dụng | 0:00–0:10 | Trang chủ |
| 1 | Khai báo mục tiêu và các ràng buộc | 0:10–0:35 | `/projects/[id]` — Ràng buộc |
| 2 | Thao tác đánh giá, lọc ứng viên | 0:35–1:00 | `/projects/[id]` — Ứng viên tiềm năng |
| 3 | Kích hoạt đề xuất đội hình + báo cáo giải thích | 1:00–1:40 | `/projects/[id]` — Đội hình đề xuất |
| 4 | Xử lý thay đổi điều kiện động | 1:40–2:15 | `/projects/[id]` — thêm "Docker" |
| 5 | Xử lý ngoại lệ (vô nghiệm) | 2:15–2:50 | `/projects/[id]` — thêm "COBOL" |
| — | Kết | 2:50–3:00 | Trang chủ |

**Tổng: 3:00** — đúng giới hạn tối đa của đề.
