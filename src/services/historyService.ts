const API_BASE_URL = "https://13-209-30-220.nip.io/api";

export interface History {
  id: number;
  queryText: string;
  lectureId: number;
  chapterId: number;
  timestamp: string;
  youtubeUrl: string;
  createdAt: string;
}


/** 히스토리 조회 */
export async function fetchHistory(): Promise<History[]> {
  const res = await fetch(`${API_BASE_URL}/history`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

/** 개별 삭제 */
export async function deleteHistory(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/history/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

/** 전체 삭제 */
export async function clearHistory(): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/history`, {
    method: "DELETE",
  });
  return res.ok;
}
