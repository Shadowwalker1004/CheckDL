"""Trich xuat 190 cau hoi + dap an tu file goc ra questions.json.

Quy tac xac dinh dap an dung: chu cai phuong an (A./B./C.) duoc dinh dang
BOLD + UNDERLINE. Rieng Cau 180 chi co BOLD (khong underline) nen dung do
lam phuong an du phong khi khong co lua chon nao vua bold vua underline.
"""
import json
import re
from pathlib import Path

import docx

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "BỘ CÂU HỎI LÝ THUYẾT 190 CÂU CÓ ĐÁP ÁN.docx"
OUT = ROOT / "app" / "src" / "data" / "questions.json"

TOPIC_RULES = [
    ("Xử lý vi phạm điều lệnh", [r"113/2025", r"xử lý vi phạm điều lệnh", r"liên đới"]),
    ("Kiểm tra, tập huấn điều lệnh", [r"09/2021", r"115/2025", r"kiểm tra điều lệnh", r"tập huấn", r"hội thi"]),
    ("Quy tắc ứng xử CAND", [r"12/2023", r"ứng xử"]),
    ("Trang phục CAND", [r"3[4-6]/2019", r"04/2025", r"trang phục", r"quân hàm", r"cấp hiệu"]),
    ("Điều lệnh đội ngũ", [r"đội hình", r"hàng ngang", r"hàng dọc", r"động tác", r"\bbước\b", r"chào\b", r"đội ngũ", r"giậm chân", r"quay đằng"]),
    ("Khen thưởng, kỷ luật, nghi lễ", [r"khen thưởng", r"kỷ luật", r"trao thưởng", r"tặng thưởng", r"danh hiệu thi đua"]),
]


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def classify_topic(stem: str) -> str:
    low = stem.lower()
    for topic, patterns in TOPIC_RULES:
        for pat in patterns:
            if re.search(pat, low):
                return topic
    return "Điều lệnh nội vụ chung"


def parse_master(path: Path):
    d = docx.Document(str(path))
    questions = []
    cur = None
    for p in d.paragraphs:
        text = p.text.strip()
        if not text:
            continue
        m = re.match(r"^Câu\s*(\d+)\s*[\.:]", text)
        om = re.match(r"^([A-D])\s*[\.\)]", text)
        if m:
            if cur:
                questions.append(cur)
            stem = re.sub(r"^Câu\s*\d+\s*[\.:]\s*", "", text)
            cur = {"num": int(m.group(1)), "stem": stem, "options": []}
        elif om and cur is not None:
            letter = om.group(1)
            has_bold_underline = any(r.bold and r.underline for r in p.runs)
            has_bold_any = any(r.bold for r in p.runs)
            otext = re.sub(r"^[A-D]\s*[\.\)]\s*", "", text)
            cur["options"].append(
                {"letter": letter, "text": otext, "bu": has_bold_underline, "ba": has_bold_any}
            )
        else:
            if cur and cur["options"]:
                cur["options"][-1]["text"] += " " + text
            elif cur:
                cur["stem"] += " " + text
    if cur:
        questions.append(cur)
    return questions


def build_questions():
    raw = parse_master(SRC)
    assert len(raw) == 190, f"Expected 190 questions, got {len(raw)}"

    out = []
    fallback_used = []
    for q in raw:
        assert len(q["options"]) == 3, f"Câu {q['num']} không có đúng 3 phương án"
        bu = [o for o in q["options"] if o["bu"]]
        if len(bu) == 1:
            ans = bu[0]
        else:
            ba = [o for o in q["options"] if o["ba"]]
            assert len(ba) == 1, f"Câu {q['num']}: không xác định được đáp án duy nhất"
            ans = ba[0]
            fallback_used.append(q["num"])

        stem = norm(q["stem"])
        options = [{"letter": o["letter"], "text": norm(o["text"])} for o in q["options"]]
        out.append(
            {
                "id": f"q-{q['num']:03d}",
                "num": q["num"],
                "stem": stem,
                "options": options,
                "answer": ans["letter"],
                "topic": classify_topic(stem),
            }
        )

    print(f"Trích xuất {len(out)} câu. Dùng quy tắc dự phòng (bold-only) cho: {fallback_used}")
    from collections import Counter
    topic_counts = Counter(q["topic"] for q in out)
    print("Phân bố chủ đề:")
    for t, c in topic_counts.most_common():
        print(f"  {t}: {c}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Đã ghi {OUT}")


if __name__ == "__main__":
    build_questions()
