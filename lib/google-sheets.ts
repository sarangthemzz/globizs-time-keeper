type GoogleSheetTimeLogRow = {
  username: string;
  date: string;
  startTime: string;
  endTime: string;
  work: string;
};

export async function syncTimeLogsToGoogleSheet(rows: GoogleSheetTimeLogRow[]) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!webhookUrl || rows.length === 0) {
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({ rows }),
  });

  const responseBody = await response.text();

  if (!response.ok) {
    throw new Error(`Google Sheet sync failed with status ${response.status}: ${responseBody}`);
  }

  if (!responseBody.trim().startsWith("{")) {
    throw new Error(`Google Sheet sync returned an unexpected response: ${responseBody.slice(0, 300)}`);
  }

  const result = JSON.parse(responseBody) as { success?: boolean; error?: string };
  if (result.success === false) {
    throw new Error(result.error || "Google Sheet sync failed");
  }
}
