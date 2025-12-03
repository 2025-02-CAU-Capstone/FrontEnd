/* -----------------------------------------------
 * API BASE URLs
 * ----------------------------------------------- */
const SPRING_API = "https://13-209-30-220.nip.io/api";

/* -----------------------------------------------
 * Types
 * ----------------------------------------------- */

/** OCR 결과 (Spring Boot → FastAPI 결과 래핑) */
export interface OCRResponse {
  success: boolean;
  textBoxes: TextBox[];
  sentences: string[];
  raw_text: string;
  confidence: number;
  imageWidth: number;
  imageHeight: number;
  message?: string;
  processed_groups?: ProcessedGroup[];
}

/** 유사도 검색 결과 */
export interface MatchResult {
  lectureId: number;
  chapterId: number;
  startTimestamp: string;
  peakTimestamp: string;
  sentence: string;
}

/** 히스토리 응답 */
export interface HistoryResponse {
  id: number;
  queryText: string;
  lectureId: number;
  chapterId: number;
  timestamp: string;
  youtubeUrl: string;
  createdAt: string;
}

export interface TextBox {
  text: string;
  confidence: number;
  box: number[][];
}
export interface ProcessedGroup {
  choose_id: number;
  group_position: number[][];
  merged_text: string;
}

/* -----------------------------------------------
 * 1) Spring Boot - OCR 요청 (/api/ocr/extract)
 * ----------------------------------------------- */
export async function requestOCR(file: File): Promise<OCRResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${SPRING_API}/ocr/extract`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("OCR 요청 실패");
  }

  return await res.json();
}

/* -----------------------------------------------
 * 2) Spring Boot - 문장 유사도 검색 (/api/search/text)
 * ----------------------------------------------- */
export async function requestSimilaritySearch(
  text: string
): Promise<MatchResult> {
  const res = await fetch(`${SPRING_API}/search/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selectedText: text }),
  });

  if (!res.ok) throw new Error("유사도 검색 실패");

  return await res.json();
}

/* -----------------------------------------------
 * 3) Server Health Check
 * ----------------------------------------------- */
// TODO: 서버 상태 체크 기능은 프로젝트 마무리 직전에 제거해도 됨.
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`https://13-209-30-220.nip.io/ping`);
    return res.ok;
  } catch {
    return false;
  }
}

/* -----------------------------------------------
 * 4) Search History CRUD
 * ----------------------------------------------- */
export async function getSearchHistory(): Promise<HistoryResponse[]> {
  const res = await fetch(`${SPRING_API}/history`);

  if (!res.ok) throw new Error("검색 기록을 가져오지 못했습니다");

  return await res.json();
}

export async function deleteSearchHistory(id: number): Promise<boolean> {
  const res = await fetch(`${SPRING_API}/history/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function clearAllHistory(): Promise<boolean> {
  const res = await fetch(`${SPRING_API}/history`, { method: "DELETE" });
  return res.ok;
}
