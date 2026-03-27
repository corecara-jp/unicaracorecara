// Google Calendar と連携した無料面談予約 API
// 必要な Supabase Secrets:
//   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN / GOOGLE_CALENDAR_ID

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const SLOT_DURATION_MIN = 30;
const BUSINESS_START_HOUR = 10; // 10:00 JST
const BUSINESS_END_HOUR = 19;   // 18:30 開始が最後のスロット

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google OAuth credentials not configured');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function getFreeBusy(accessToken: string, calendarId: string, timeMin: string, timeMax: string) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
      timeZone: 'Asia/Tokyo',
    }),
  });
  return await res.json();
}

// 指定日のすべての 30 分スロットを JST ISO 文字列で返す
function generateSlots(dateStr: string): string[] {
  const slots: string[] = [];
  for (let h = BUSINESS_START_HOUR; h < BUSINESS_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_DURATION_MIN) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${dateStr}T${hh}:${mm}:00+09:00`);
    }
  }
  return slots;
}

// スロット開始時刻から 30 分後の終了時刻を返す (JST)
function slotEnd(slotStart: string): string {
  const [datePart, timePart] = slotStart.replace('+09:00', '').split('T');
  const [hh, mm] = timePart.split(':').map(Number);
  const totalMin = hh * 60 + mm + SLOT_DURATION_MIN;
  const endHH = String(Math.floor(totalMin / 60)).padStart(2, '0');
  const endMM = String(totalMin % 60).padStart(2, '0');
  return `${datePart}T${endHH}:${endMM}:00+09:00`;
}

// busy 配列に対してスロットが空いているか確認
function isSlotFree(slotStart: string, busyTimes: Array<{ start: string; end: string }>): boolean {
  const startMs = new Date(slotStart).getTime();
  const endMs = new Date(slotEnd(slotStart)).getTime();
  return !busyTimes.some((busy) => {
    const bs = new Date(busy.start).getTime();
    const be = new Date(busy.end).getTime();
    return startMs < be && endMs > bs;
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const url = new URL(req.url);
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID') || 'primary';

    // ─── GET: 空き日付一覧 ───────────────────────────────────────────
    if (req.method === 'GET' && url.searchParams.get('action') === 'available_dates') {
      const days = Math.min(parseInt(url.searchParams.get('days') || '14'), 30);
      const accessToken = await getAccessToken();

      // 今日の JST 日付
      const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000);
      const timeMin = new Date(Date.now()).toISOString();
      const timeMax = new Date(Date.now() + (days + 1) * 24 * 60 * 60 * 1000).toISOString();

      const freeBusy = await getFreeBusy(accessToken, calendarId, timeMin, timeMax);
      const busyTimes: Array<{ start: string; end: string }> =
        freeBusy.calendars?.[calendarId]?.busy || [];

      const availableDates: string[] = [];
      for (let i = 1; i <= days; i++) {
        const d = new Date(nowJST.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

        const slots = generateSlots(dateStr);
        const hasAvailability = slots.some((s) => {
          if (new Date(s).getTime() < Date.now()) return false; // 過去スロット除外
          return isSlotFree(s, busyTimes);
        });
        if (hasAvailability) availableDates.push(dateStr);
      }

      return json({ dates: availableDates });
    }

    // ─── GET: 指定日の空きスロット ──────────────────────────────────
    if (req.method === 'GET' && url.searchParams.get('action') === 'slots') {
      const date = url.searchParams.get('date'); // YYYY-MM-DD
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return json({ error: 'date (YYYY-MM-DD) required' }, 400);
      }

      const accessToken = await getAccessToken();
      const freeBusy = await getFreeBusy(
        accessToken,
        calendarId,
        `${date}T00:00:00+09:00`,
        `${date}T23:59:59+09:00`,
      );
      const busyTimes: Array<{ start: string; end: string }> =
        freeBusy.calendars?.[calendarId]?.busy || [];

      const now = Date.now();
      const availableSlots = generateSlots(date).filter((s) => {
        if (new Date(s).getTime() < now) return false;
        return isSlotFree(s, busyTimes);
      });

      return json({ slots: availableSlots });
    }

    // ─── POST: 予約作成 ──────────────────────────────────────────────
    if (req.method === 'POST') {
      const { name, email, phone, message, slot } = await req.json();

      if (!name || !email || !slot) {
        return json({ error: 'name・email・slot は必須です' }, 400);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'メールアドレスの形式が正しくありません' }, 400);
      }
      if (new Date(slot).getTime() < Date.now()) {
        return json({ error: '過去の時間帯は予約できません' }, 400);
      }

      const accessToken = await getAccessToken();

      // 再度空き確認（二重予約防止）
      const [slotDate] = slot.split('T');
      const freeBusy = await getFreeBusy(
        accessToken,
        calendarId,
        `${slotDate}T00:00:00+09:00`,
        `${slotDate}T23:59:59+09:00`,
      );
      const busyTimes: Array<{ start: string; end: string }> =
        freeBusy.calendars?.[calendarId]?.busy || [];

      if (!isSlotFree(slot, busyTimes)) {
        return json({ error: 'この時間帯はすでに予約済みです。別の時間をお選びください。' }, 409);
      }

      const description = [
        `お名前：${name}`,
        `メールアドレス：${email}`,
        phone ? `電話番号：${phone}` : null,
        message ? `\nご相談内容：\n${message}` : null,
        '\n─────────────\nこれから。キャリア無料面談（30分）',
      ].filter(Boolean).join('\n');

      const createRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: `【無料面談】${name} 様`,
            description,
            start: { dateTime: slot, timeZone: 'Asia/Tokyo' },
            end: { dateTime: slotEnd(slot), timeZone: 'Asia/Tokyo' },
            attendees: [{ email, displayName: name }],
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 1440 }, // 前日
                { method: 'email', minutes: 60 },
                { method: 'popup', minutes: 10 },
              ],
            },
          }),
        },
      );

      const event = await createRes.json();
      if (event.error) {
        console.error('Calendar API error:', JSON.stringify(event.error));
        return json({ error: 'カレンダーへの登録に失敗しました: ' + event.error.message }, 500);
      }

      console.log('Booking created:', event.id, slot, name);
      return json({
        success: true,
        eventId: event.id,
        slot,
        slotEnd: slotEnd(slot),
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  } catch (err) {
    console.error(err);
    return json({ error: String(err) }, 500);
  }
});
