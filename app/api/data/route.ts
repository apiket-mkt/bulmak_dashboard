import { NextResponse } from 'next/server';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzZ13SP6EGcpmSKFIQXzfge7--UtKgxWXh839ubgC7zxsLCjhmBYxL9xYUozNTxKL5v22kCswF7n_5/pub?output=csv';

function parseCSV(text: string) {
  // Remove BOM if present
  const cleaned = text.replace(/^\uFEFF/, '');
  const lines = cleaned.trim().split('\n');

  if (lines.length < 2) return [];

  // Skip header row (line 0), parse data rows
  return lines
    .slice(1)
    .map((line) => {
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      fields.push(current.trim());

      const month = fields[0]?.replace(/[^0-9]/g, '') || '';
      const day = fields[1]?.replace(/[^0-9]/g, '') || '';
      const link = fields[2] || '';
      const comment = fields[3] || '';

      return { month, day, link, comment };
    })
    .filter((row) => row.month && row.link);
}

export async function GET() {
  try {
    const res = await fetch(CSV_URL, {
      next: { revalidate: 300 }, // 5분 캐시
    });

    if (!res.ok) {
      throw new Error(`CSV fetch failed: ${res.status}`);
    }

    const text = await res.text();
    const data = parseCSV(text);

    return NextResponse.json(data);
  } catch (err) {
    console.error('Data fetch error:', err);
    return NextResponse.json({ error: '데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}
