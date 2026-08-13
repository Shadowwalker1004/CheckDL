# Ôn tập & thi thử Điều lệnh CAND

Web app học và thi thử 190 câu hỏi lý thuyết điều lệnh nội vụ CAND + 40 đề mẫu có sẵn.
Không có backend/tài khoản — tiến trình luyện tập lưu trong `localStorage` của trình duyệt.

## Chạy thử

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
```

Kết quả nằm ở `dist/` — đây là site tĩnh, có thể deploy lên bất kỳ static hosting nào.

## Deploy lên Vercel

```bash
npm install -g vercel   # nếu chưa có
vercel deploy --prod
```

Hoặc vào [vercel.com](https://vercel.com), "Import Project" từ thư mục `app/` (không cần cấu hình gì
thêm — Vercel tự nhận diện Vite). App dùng `HashRouter` nên không cần cấu hình rewrite cho SPA.

## Deploy lên Netlify

Kéo thả thư mục `dist/` vào [app.netlify.com/drop](https://app.netlify.com/drop), hoặc dùng Netlify CLI:

```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

## Cập nhật lại dữ liệu câu hỏi

Dữ liệu (`src/data/questions.json`, `src/data/exams.json`) được sinh ra từ các file `.docx` gốc
bằng script Python trong `../pipeline`. Chạy lại khi nguồn `.docx` thay đổi:

```bash
cd ../pipeline
python3 extract_master.py   # ghi lại src/data/questions.json
python3 match_exams.py      # ghi lại src/data/exams.json + needs_review.json
```

`needs_review.json` liệt kê các câu trong 40 đề mẫu mà script không tự tin 100% khi đối chiếu
đáp án ngược lại ngân hàng gốc — nên rà soát lại trước khi tin tưởng tuyệt đối vào điểm thi thử.
