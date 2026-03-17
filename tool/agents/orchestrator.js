/**
 * キャリア支援エージェントチーム オーケストレーター
 * 4エージェントを並列実行 → シンセサイザーで統合
 */

const EDGE_FUNCTION_URL = 'https://xtcopreojvmovdswhhgk.supabase.co/functions/v1/agent';
const SUPABASE_ANON_KEY = 'sb_publishable_S2XXYnqCuiEkrGAD9_yHYQ_hMjh1JWe';

// 領域名（日本語 → UserInput キー）のマッピング
const AREA_KEY_MAP = {
  '収入':    'income',
  '働き方':  'workStyle',
  '職場環境': 'environment',
  '仕事内容': 'jobContent',
  'スキル':  'skills',
  '生活':    'life',
};

/**
 * app.js の state からエージェント用 UserInput に変換
 */
function buildUserInput(state) {
  const ideals = {};
  const scores = {};

  Object.keys(AREA_KEY_MAP).forEach(function (area) {
    const key = AREA_KEY_MAP[area];
    ideals[key] = state.ideals[area] || '';
    scores[key] = state.scores[area] || 5;
  });

  const gaps = (state.priorityOrder || []).map(function (area, i) {
    const key = AREA_KEY_MAP[area];
    return {
      area: area,
      gap: 10 - (state.scores[area] || 5),
      improvement: state.improvements[area] || '',
      reason: state.reasons[area] || '',
      priority: i + 1,
    };
  });

  return { ideals, scores, gaps };
}

/**
 * 単一エージェントを呼び出す
 */
async function callAgent(agentType, userInput) {
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ agentType, userInput }),
  });

  if (!res.ok) {
    throw new Error(agentType + ' のレスポンスエラー: ' + res.status);
  }

  const data = await res.json();

  // Claude API レスポンスからテキストを取り出す
  const text = data.content && data.content[0] && data.content[0].text;
  if (!text) throw new Error(agentType + ' のレスポンスが空です');

  // JSON部分を抽出してパース
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(agentType + ' のJSONパースに失敗しました');

  return JSON.parse(jsonMatch[0]);
}

/**
 * メイン: 4エージェントを並列実行 → シンセサイザーで統合
 * @param {object} state - app.js の state オブジェクト
 * @param {object} callbacks - { onAgentDone(agentType, result), onError(msg) }
 * @returns {object} synthesized result
 */
async function orchestrate(state, callbacks) {
  const userInput = buildUserInput(state);
  callbacks = callbacks || {};

  // 4エージェント並列実行
  const agentTypes = ['career-strategist', 'life-planner', 'income-analyst', 'psychology-coach'];

  const agentPromises = agentTypes.map(function (agentType) {
    return callAgent(agentType, userInput)
      .then(function (result) {
        if (callbacks.onAgentDone) callbacks.onAgentDone(agentType, result);
        return result;
      })
      .catch(function (err) {
        console.error(agentType + ' エラー:', err);
        if (callbacks.onAgentDone) callbacks.onAgentDone(agentType, null);
        return null;
      });
  });

  const [careerResult, lifeResult, incomeResult, psychResult] = await Promise.all(agentPromises);

  // シンセサイザーへ
  const synthesisInput = {
    userInput,
    agentResults: {
      career: careerResult,
      life: lifeResult,
      income: incomeResult,
      psychology: psychResult,
    },
  };

  const synthesized = await callAgent('synthesizer', synthesisInput);
  return synthesized;
}

// グローバルに公開
window.CareerAgents = { orchestrate };
