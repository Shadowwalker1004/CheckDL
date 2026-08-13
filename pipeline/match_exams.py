"""Doi chieu 40 de mau (Bo de so 1 & 2) nguoc lai ngan hang 190 cau goc
de suy ra dap an dung cho tung de (cac file de khong tu mang dap an).

Chien luoc:
  1. So khop cau hoi (stem) theo chuoi chinh xac (sau khi chuan hoa khoang trang).
  2. Neu khong khop chinh xac, dung so khop mo (difflib) tren toan bo 190 cau,
     chi chap nhan neu diem tuong dong >= FUZZY_STEM_THRESHOLD.
  3. Voi cau da khop duoc cau goc, tim phuong an trong de trung voi noi dung
     dap an dung cua cau goc (chinh xac, roi mo).
  4. Bat ky buoc nao khong chac chan (khong khop, khop mo, khong tim ra dap an)
     deu bi danh dau needsReview=True va liet ke rieng de ra soat tay.
"""
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

import docx

ROOT = Path(__file__).resolve().parent.parent
QUESTIONS_PATH = ROOT / "app" / "src" / "data" / "questions.json"
OUT_EXAMS = ROOT / "app" / "src" / "data" / "exams.json"
OUT_REVIEW = ROOT / "pipeline" / "needs_review.json"

FUZZY_STEM_THRESHOLD = 0.82
FUZZY_OPTION_THRESHOLD = 0.80

EXAM_SOURCES = [
    {
        "folder": ROOT / "BỘ ĐỀ SỐ 1",
        "glob": "De6_*.docx",
        "examPrefix": "bo1",
        "titlePrefix": "Bộ đề số 1",
        "numFromName": re.compile(r"De6_(\d+)\.docx$"),
    },
    {
        "folder": ROOT / "BỘ ĐỀ SỐ  2",
        "glob": "cau_*__bo_2.docx",
        "examPrefix": "bo2",
        "titlePrefix": "Bộ đề số 2",
        "numFromName": re.compile(r"cau_(\d+)__bo_2\.docx$"),
    },
]


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


MID_OPTION = re.compile(r"\t\s*([A-D])\s*[\.\)]\s*")


def parse_exam_file(path: Path):
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
            cur = {"num": int(m.group(1)), "stem": "", "options": []}
            mid = MID_OPTION.search(stem)
            if mid:
                # Rare source formatting quirk: stem and option A share one
                # Word paragraph, separated only by a tab (no paragraph break).
                cur["stem"] = stem[: mid.start()].strip()
                cur["options"].append({"letter": mid.group(1), "text": stem[mid.end() :].strip()})
            else:
                cur["stem"] = stem
        elif om and cur is not None:
            letter = om.group(1)
            otext = re.sub(r"^[A-D]\s*[\.\)]\s*", "", text)
            cur["options"].append({"letter": letter, "text": otext})
        elif cur is not None and not cur["options"] and MID_OPTION.search(text):
            # Rare source formatting quirk: the stem and option A end up in the
            # same Word paragraph, separated only by a tab (no paragraph break).
            mid = MID_OPTION.search(text)
            stem_part = text[: mid.start()].strip()
            option_part = text[mid.end() :].strip()
            if stem_part:
                cur["stem"] += " " + stem_part
            cur["options"].append({"letter": mid.group(1), "text": option_part})
        else:
            if cur and cur["options"]:
                cur["options"][-1]["text"] += " " + text
            elif cur:
                cur["stem"] += " " + text
    if cur:
        questions.append(cur)
    for q in questions:
        q["stem"] = norm(q["stem"])
        for o in q["options"]:
            o["text"] = norm(o["text"])
    return questions


def find_master_match(stem: str, stem_map: dict, master_list: list):
    if stem in stem_map:
        return stem_map[stem], 1.0
    best, best_score = None, 0.0
    for mq in master_list:
        score = similarity(stem, mq["stem"])
        if score > best_score:
            best, best_score = mq, score
    if best_score >= FUZZY_STEM_THRESHOLD:
        return best, best_score
    return None, best_score


def find_answer_option(exam_options: list, master_answer_text: str):
    for o in exam_options:
        if o["text"] == master_answer_text:
            return o["letter"], 1.0
    best_letter, best_score = None, 0.0
    for o in exam_options:
        score = similarity(o["text"], master_answer_text)
        if score > best_score:
            best_letter, best_score = o["letter"], score
    if best_score >= FUZZY_OPTION_THRESHOLD:
        return best_letter, best_score
    return None, best_score


def main():
    master_list = json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))
    stem_map = {mq["stem"]: mq for mq in master_list}
    answer_text_map = {
        mq["id"]: norm(next(o["text"] for o in mq["options"] if o["letter"] == mq["answer"]))
        for mq in master_list
    }

    exams = []
    review_items = []
    stats = {"total": 0, "stem_exact": 0, "stem_fuzzy": 0, "stem_fail": 0,
              "answer_exact": 0, "answer_fuzzy": 0, "answer_fail": 0}

    for source in EXAM_SOURCES:
        files = sorted(source["folder"].glob(source["glob"]))
        for fpath in files:
            m = source["numFromName"].search(fpath.name)
            de_num = int(m.group(1)) if m else 0
            exam_id = f"{source['examPrefix']}-de{de_num}"
            title = f"{source['titlePrefix']} — Đề {de_num}"

            exam_questions = []
            for q in parse_exam_file(fpath):
                stats["total"] += 1
                mq, stem_score = find_master_match(q["stem"], stem_map, master_list)
                need_review = False
                answer_letter = None

                if mq is None:
                    stats["stem_fail"] += 1
                    need_review = True
                    review_items.append({
                        "exam": exam_id, "num": q["num"], "issue": "stem-not-found",
                        "stem": q["stem"][:120],
                    })
                else:
                    if stem_score >= 0.999:
                        stats["stem_exact"] += 1
                    else:
                        stats["stem_fuzzy"] += 1
                        need_review = True
                        review_items.append({
                            "exam": exam_id, "num": q["num"], "issue": "stem-fuzzy-match",
                            "score": round(stem_score, 3),
                            "stem": q["stem"][:120], "matchedMasterId": mq["id"],
                        })

                    answer_letter, ans_score = find_answer_option(q["options"], answer_text_map[mq["id"]])
                    if answer_letter is None:
                        stats["answer_fail"] += 1
                        need_review = True
                        review_items.append({
                            "exam": exam_id, "num": q["num"], "issue": "answer-not-found",
                            "stem": q["stem"][:120], "matchedMasterId": mq["id"],
                        })
                    elif ans_score >= 0.999:
                        stats["answer_exact"] += 1
                    else:
                        stats["answer_fuzzy"] += 1
                        need_review = True
                        review_items.append({
                            "exam": exam_id, "num": q["num"], "issue": "answer-fuzzy-match",
                            "score": round(ans_score, 3),
                            "stem": q["stem"][:120], "matchedMasterId": mq["id"],
                        })

                exam_questions.append({
                    "masterId": mq["id"] if mq else None,
                    "stem": q["stem"],
                    "options": q["options"],
                    "answer": answer_letter,
                    "needsReview": need_review,
                })

            exams.append({
                "examId": exam_id,
                "title": title,
                "questions": exam_questions,
            })

    OUT_EXAMS.parent.mkdir(parents=True, exist_ok=True)
    OUT_EXAMS.write_text(json.dumps(exams, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_REVIEW.write_text(json.dumps(review_items, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Đã ghi {OUT_EXAMS} ({len(exams)} đề, {stats['total']} câu)")
    print(f"Đã ghi {OUT_REVIEW} ({len(review_items)} mục cần rà soát tay)")
    print(stats)


if __name__ == "__main__":
    main()
