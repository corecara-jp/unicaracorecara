// LINE Messaging API webhook handler
// 診断結果メッセージを受信して、フォーマットされた結果を返信する

const SUPABASE_URL = 'https://xtcopreojvmovdswhhgk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Y29wcmVvanZtb3Zkc3doaGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MjkzMjQsImV4cCI6MjA4OTMwNTMyNH0.l_ylqxCQ9LJDdPEBd_pbzjzk4N9v6hovqP2MOn1cGMQ';
const SHINDAN_URL = 'https://xtcopreojvmovdswhhgk.supabase.co/functions/v1/shindan';

const TYPES: Record<string, { name: string; emoji: string; desc: string; story: { lead: string; timeline: Array<{ phase: string; body: string }> } }> = {
  earner: {
    name: '稼ぎ方を変えたいタイプ',
    emoji: '💰',
    desc: '今の仕事量や努力が、収入にきちんと反映されていないと感じています。やりがいと報酬を両立できる環境に移ることで、大きく変われる可能性があります。',
    story: {
      lead: 'Aさん（28歳・メーカー営業）は「頑張っても給料が上がらない」という閉塞感から相談。',
      timeline: [
        { phase: '相談前', body: '5年間同じ給与体系。頑張っても評価されない。' },
        { phase: '面談後', body: '「仕事内容×収入」の不一致が明確に。インセンティブ型企業へ転職を検討開始。' },
        { phase: '現在', body: '月収1.3倍。「評価される実感」を初めて得られた。' },
      ],
    },
  },
  freedom: {
    name: '自由を求めているタイプ',
    emoji: '🕊️',
    desc: '時間・場所・ペースへの制約が積み重なり、じわじわと消耗しています。働き方を変えることで、生活全体のクオリティが一気に上がる可能性があります。',
    story: {
      lead: 'Bさん（31歳・事務）は「出社＋残業」の毎日に疲弊していました。',
      timeline: [
        { phase: '相談前', body: '通勤往復2時間＋毎日残業。趣味も家族時間もなかった。' },
        { phase: '面談後', body: 'フルリモート可の職種に絞った転職活動を開始。' },
        { phase: '現在', body: '週3在宅。「平日の夜が自分のものになった」と話す。' },
      ],
    },
  },
  escape: {
    name: '環境脱出タイプ',
    emoji: '🚪',
    desc: '人間関係・評価制度・会社の方針——何か一つではなく「この職場全体」へのストレスが積み上がっています。環境を変えることで、本来の力を発揮できます。',
    story: {
      lead: 'Cさん（34歳・IT）は「上司が変わるたびに評価がリセットされる」と悩んでいました。',
      timeline: [
        { phase: '相談前', body: '職場の人間関係に消耗し、仕事自体が嫌になっていた。' },
        { phase: '面談後', body: '「環境」が問題と整理でき、スキルへの自信を取り戻せた。' },
        { phase: '現在', body: '転職後「こんなに仕事って楽しいんだ」と実感。' },
      ],
    },
  },
  growth: {
    name: '成長渇望タイプ',
    emoji: '🌱',
    desc: '今の仕事では自分の可能性を使い切れていない感覚があります。学びたいスキルと実際の業務のズレを解消することが、最初の一歩になります。',
    story: {
      lead: 'Dさん（26歳・営業事務）は「同じことの繰り返しで、何も身についていない」と感じていました。',
      timeline: [
        { phase: '相談前', body: '日々の業務をこなすだけで、1年前と何も変わっていない気がした。' },
        { phase: '面談後', body: '「身につけたいスキル」を言語化し、職種転換の方向性が決まった。' },
        { phase: '現在', body: 'Webマーケ職へ転換。「毎日何かを学んでいる感覚がある」。' },
      ],
    },
  },
  balance: {
    name: 'バランス回復タイプ',
    emoji: '⚖️',
    desc: 'やりがいを諦めたくはない。でも、今の自分の生活も守りたい。その両方を叶えるために、働く条件を整理することから始めましょう。',
    story: {
      lead: 'Eさん（35歳・医療職）は「仕事は好きだが、このままでは倒れる」と話していました。',
      timeline: [
        { phase: '相談前', body: '仕事内容は好きなのに、激務で体力・気力が限界だった。' },
        { phase: '面談後', body: '「仕事内容はそのままに、働く環境だけを変える」という軸が決まった。' },
        { phase: '現在', body: '同職種で残業の少ない職場へ。仕事へのモチベが戻った。' },
      ],
    },
  },
  organize: {
    name: '整理が必要なタイプ',
    emoji: '🗂️',
    desc: '何かが違うという感覚はあるのに、何を変えればいいのかがまだ見えていない状態です。まず「変えたいもの」を整理することが、最初の一手になります。',
    story: {
      lead: 'Fさん（29歳・総合職）は「モヤモヤはあるが、転職すべきかもわからない」と来てくれました。',
      timeline: [
        { phase: '相談前', body: '何となく不満はあるが、何を変えればいいか整理できていなかった。' },
        { phase: '面談後', body: '6領域で優先度を整理した結果、「まず職場環境を変える」という軸が決まった。' },
        { phase: '現在', body: '転職を検討中。「次に何をすべきか」が明確になった。' },
      ],
    },
  },
};

function buildReplyMessage(typeId: string): string {
  const type = TYPES[typeId];
  if (!type) return '診断結果が見つかりませんでした。もう一度お試しください。';

  const storyLines = type.story.timeline
    .map(t => `【${t.phase}】${t.body}`)
    .join('\n');

  return `${type.emoji} あなたは「${type.name}」です

${type.desc}

━━━━━━━━━━━━━
📖 似たケースの事例
━━━━━━━━━━━━━
${type.story.lead}

${storyLines}

━━━━━━━━━━━━━
✨ あなたにも、整理すれば見えてくる「次の一手」があります。

まず30分、話してみませんか？
👇 無料面談はこちら
https://lin.ee/TZLZX4P`;
}

async function lookupToken(token: string): Promise<string | null> {
  const res = await fetch(
    SUPABASE_URL + '/rest/v1/shindan_tokens?token=eq.' + encodeURIComponent(token) + '&select=type_id&limit=1',
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.[0]?.type_id ?? null;
}

async function sendReply(replyToken: string, text: string, accessToken: string): Promise<void> {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text }],
    }),
  });
}

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
  return signature === expectedSignature;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'GET') {
    return new Response('LINE webhook is running', { status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const channelSecret = Deno.env.get('LINE_CHANNEL_SECRET');
  const channelAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');

  if (!channelSecret || !channelAccessToken) {
    console.error('LINE credentials not set');
    return new Response('Server configuration error', { status: 500 });
  }

  const bodyText = await req.text();

  // LINE署名の検証
  const signature = req.headers.get('x-line-signature') || '';
  const isValid = await verifySignature(bodyText, signature, channelSecret);
  if (!isValid) {
    console.error('Invalid signature');
    return new Response('Invalid signature', { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  for (const event of body.events || []) {
    // 友達追加イベント
    if (event.type === 'follow') {
      await sendReply(
        event.replyToken,
        'ともだち追加ありがとうございます！🎉\n\n診断を受けた方は、診断ページに戻って「LINEで結果を受け取る」ボタンを押してください。\n\nまだの方はこちらから無料で診断できます👇\n' + SHINDAN_URL,
        channelAccessToken,
      );
      continue;
    }

    // メッセージイベントのみ処理
    if (event.type !== 'message' || event.message?.type !== 'text') continue;

    const text: string = event.message.text.trim();
    const replyToken: string = event.replyToken;

    // 新形式: SHINDAN-XXXXXX トークン
    const tokenMatch = text.match(/^SHINDAN-([A-Z0-9]{6})$/i);
    if (tokenMatch) {
      const token = tokenMatch[1].toUpperCase();
      const typeId = await lookupToken(token);
      if (typeId) {
        await sendReply(replyToken, buildReplyMessage(typeId), channelAccessToken);
      } else {
        await sendReply(replyToken, '診断結果が見つかりませんでした。もう一度診断ページからお試しください。\n' + SHINDAN_URL, channelAccessToken);
      }
      continue;
    }

    // 旧形式: 診断:typeId:scores（後方互換）
    const match = text.match(/^診断:([a-z]+):[\d-]+$/);
    if (match) {
      await sendReply(replyToken, buildReplyMessage(match[1]), channelAccessToken);
    }
  }

  return new Response('OK', { status: 200 });
});
