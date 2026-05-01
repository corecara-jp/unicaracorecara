(function () {
  'use strict';

  // ─── Supabase ─────────────────────────────────────────────────────────────
  var SUPABASE_URL = 'https://xtcopreojvmovdswhhgk.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Y29wcmVvanZtb3Zkc3doaGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MjkzMjQsImV4cCI6MjA4OTMwNTMyNH0.l_ylqxCQ9LJDdPEBd_pbzjzk4N9v6hovqP2MOn1cGMQ';
  var db;
  if (window.supabase) {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  async function saveSession(name, email) {
    if (!db) return { error: 'Supabase が読み込まれていません' };
    var { data, error } = await db.from('sessions').insert([{
      user_name: name.trim(),
      user_email: email.trim().toLowerCase(),
      ideals: state.ideals,
      scores: state.scores,
      reasons: state.reasons,
      improvements: state.improvements,
      priority_order: state.priorityOrder,
      agent_results: state.agentResults
    }]);
    return { data: data, error: error };
  }

  async function loadSessions(email) {
    if (!db) return { data: null, error: 'Supabase が読み込まれていません' };
    var { data, error } = await db
      .from('sessions')
      .select('*')
      .eq('user_email', email.trim().toLowerCase())
      .order('created_at', { ascending: false });
    return { data: data, error: error };
  }

  // ─── Constants ────────────────────────────────────────────────────────────
  var AREAS = ['収入', '働き方', '職場環境', '仕事内容', 'スキル', '生活'];

  var DOMAINS = [
    { id: 'income', name: '収入', en: 'Income', glyph: '収', placeholder: '例：手取り月35万円。賞与年2回。生活費に余裕があり、年100万円を貯蓄に回せている。' },
    { id: 'work_style', name: '働き方', en: 'Work Style', glyph: '働', placeholder: '例：週3〜4日リモート。残業は月20時間以内。有休が取りやすく、家族との時間が確保できる。' },
    { id: 'environment', name: '職場環境', en: 'Environment', glyph: '環', placeholder: '例：尊敬できる上司・同僚と心理的安全性のある関係。フィードバックが率直に交わせる。' },
    { id: 'content', name: '仕事内容', en: 'Content', glyph: '事', placeholder: '例：自分の強みが活きる企画系の仕事。裁量があり、社会的にも意義を感じられるテーマ。' },
    { id: 'skill', name: 'スキル', en: 'Skill', glyph: '技', placeholder: '例：データ分析と顧客理解で社外でも通用するレベル。年1回は学びの機会に投資できる。' },
    { id: 'life', name: '生活', en: 'Life', glyph: '活', placeholder: '例：朝7時起き・夜23時就寝のリズム。週2で運動、月1で家族旅行ができている。' },
  ];

  var REASON_PLACEHOLDERS = {
    '収入': '例：月収30万で毎月の余力が2万円しかない。旅行も自己投資もできず、このままで大丈夫か不安',
    '働き方': '例：残業月40時間で副業や勉強の時間がゼロ。収入の柱が給料だけで将来が不安',
    '職場環境': '例：評価が不透明で昇給の見込みが立たない。このまま居続けて経済的に大丈夫か不安',
    '仕事内容': '例：やりがいはないが転職して年収が下がるのが怖い。今の収入で生活が回るのかわからない',
    'スキル': '例：今のスキルで10年後も同じ年収を維持できるか不安。市場価値を上げないと収入が先細りしそう',
    '生活': '例：家賃と生活費で手取りの9割が消える。貯金が月1万円で結婚・子育ての資金計画が立たない',
  };

  var IMPROVEMENT_PLACEHOLDERS = {
    '収入':    '例：月収を○万円 → ○万円に上げる / 副業で月○万円を稼ぐ',
    '働き方':  '例：フルリモート勤務に変える / 月の残業を○時間 → 0時間にする',
    '職場環境': '例：評価制度が公平な職場に移る / 尊重し合えるチームで働く',
    '仕事内容': '例：企画・提案の仕事を50%以上にする / ○○の専門職になる',
    'スキル':  '例：○○の資格を取る / 副業で案件を○件獲得し実績を作る',
    '生活':    '例：毎日○時に退勤できる / 家族と夕食を週○日一緒に食べる'
  };

  var RECOMMENDED_OPTION = {
    tag: '推奨',
    routeCode: 'ROUTE 01',
    title: '転職+副業で人生の最大化と生活の安定化',
    subtitle: '「収入」と「働き方」を同時に動かす、最もレバレッジの効く道。',
    hero: {
      label: 'CASE STUDY',
      name: '野々垣さん（これから。ロールモデル）',
      quote: '本業と副業のかけ算が、人生の選択肢を広げてくれた。',
      stats: [
        { k: '本業年収', v: '600万 → 820万' },
        { k: '副業月商', v: '0 → 18万' },
        { k: '所要期間', v: '14ヶ月' },
      ],
    },
    sections: [
      { h: '今後12ヶ月で本業の収入を着実に伸ばす', body: '実績の棚卸し → 職務経歴書の言語化 → エージェント2社と並行で月1社ペースの面談。「年収+150万・残業30h以内」を交渉ラインに置きます。' },
      { h: '同時並行で副業を「コトを動かす経験」として育てる', body: '週6〜8時間の副業時間を確保。最初の3ヶ月は知人案件で月3〜5万円、半年で月10万円規模の継続案件を持つ状態を目指します。' },
      { h: '月20万円の副業収入を作る', body: '本業の信用を担保にしつつ、リスクを取らずに「もう一つの食い扶持」を持つ。心理的な余裕がさらに大きな決断を可能にします。' },
      { h: '本業と副業、どちらに「振り切る」かを判断する', body: '12ヶ月後の数字と手触りで「副業を法人化する／転職先で全力」を選び直す。決め打ちではなく、選択肢を増やしてから選ぶ戦略です。' },
    ],
  };

  var SAMPLE_OPTIONS = [
    { routeCode: 'ROUTE 02', tag: '安定志向', title: '現職+副業で人生の充実化と生活の安定化', body: '転職リスクを取らずに、副業で「収入」と「仕事内容」のギャップを埋める。本業の安定を活かしながら、新しい経験値を蓄積。', chips: ['低リスク', '6〜12ヶ月', '蓄積型'], fit: { match: '安定志向の方に', shadow: 'スキル更新が遅れがち' } },
    { routeCode: 'ROUTE 03', tag: 'スキル投資', title: '転職のみで年収・働き方の改善', body: '副業に手を広げず、本業で勝負を決める。職務経歴書とポートフォリオを磨き、年収・働き方の両方をワンステップで動かす。', chips: ['中リスク', '6〜12ヶ月', '集中型'], fit: { match: 'シンプルに進めたい方に', shadow: '時間と気力の集中投下が必要' } },
    { routeCode: 'ROUTE 04', tag: '現状最適', title: '現状の見直しから、まず動き出す', body: '今の職場で「働き方」「環境」の交渉余地を探る。1on1の運用を変える・業務範囲を再定義するなど、今いる場所を整えてから次を考える。', chips: ['超低リスク', '3ヶ月', '内省型'], fit: { match: 'まず行動の手触りから', shadow: '抜本的な変化は期待しにくい' } },
  ];

  // ─── State ────────────────────────────────────────────────────────────────
  var state = {
    view: 'landing',  // 'landing' | 'tool'
    step: 1,
    ideals: {},
    scores: {},
    reasons: {},
    improvements: {},
    priorityOrder: [],
    agentResults: null,
  };

  // Helper to find DOMAIN by area name
  function domainByName(name) {
    for (var i = 0; i < DOMAINS.length; i++) {
      if (DOMAINS[i].name === name) return DOMAINS[i];
    }
    return null;
  }

  function getEl(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // ─── View switching ───────────────────────────────────────────────────────
  function showLanding() {
    state.view = 'landing';
    getEl('landing').classList.remove('hidden');
    getEl('app').classList.add('hidden');
  }

  function showTool() {
    state.view = 'tool';
    getEl('landing').classList.add('hidden');
    getEl('app').classList.remove('hidden');
  }

  // ─── Step navigation ──────────────────────────────────────────────────────
  function setStep(step) {
    state.step = step;
    // Panels
    document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
    var panel = getEl('panel-step' + step);
    if (panel) {
      panel.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Sidebar nav
    document.querySelectorAll('.step-item').forEach(function (el) {
      var s = parseInt(el.getAttribute('data-step'), 10);
      el.classList.remove('active', 'done');
      if (s === step) el.classList.add('active');
      else if (s < step) el.classList.add('done');
    });
    // Update step-num text for done steps
    document.querySelectorAll('.step-item').forEach(function (el) {
      var s = parseInt(el.getAttribute('data-step'), 10);
      var numEl = el.querySelector('.step-num');
      if (el.classList.contains('done')) {
        numEl.textContent = '\u2713'; // checkmark
      } else {
        numEl.textContent = s;
      }
    });
  }

  // ─── Step 1: 理想を決める ──────────────────────────────────────────────────
  function renderStep1() {
    var container = getEl('domain-list');
    if (!container) return;

    container.innerHTML = AREAS.map(function (area, i) {
      var d = domainByName(area);
      return (
        '<div class="domain-row" data-area="' + area + '">' +
          '<div class="domain-icon">' + d.glyph + '</div>' +
          '<div>' +
            '<div class="domain-name">' + d.name + '</div>' +
            '<div class="domain-name-sub">' + d.en + '</div>' +
          '</div>' +
          '<textarea class="ideal-input" id="ideal-' + i + '" data-area="' + area + '" ' +
            'placeholder="' + escapeHtml(d.placeholder) + '" rows="2"></textarea>' +
        '</div>'
      );
    }).join('');

    // Restore values
    AREAS.forEach(function (area, i) {
      var ta = getEl('ideal-' + i);
      if (ta && state.ideals[area]) ta.value = state.ideals[area];
    });

    // Listen for input
    container.querySelectorAll('.ideal-input').forEach(function (ta) {
      ta.addEventListener('input', checkStep1Complete);
    });
    checkStep1Complete();
  }

  function checkStep1Complete() {
    var allFilled = AREAS.every(function (area, i) {
      var ta = getEl('ideal-' + i);
      return ta && ta.value.trim().length > 0;
    });
    var btn = getEl('btn-to-step2');
    if (btn) btn.disabled = !allFilled;
  }

  function collectStep1() {
    AREAS.forEach(function (area, i) {
      var ta = getEl('ideal-' + i);
      state.ideals[area] = ta ? ta.value.trim() : '';
    });
  }

  // ─── Step 2: 現状スコア ──────────────────────────────────────────────────
  function renderStep2() {
    var list = getEl('score-list');
    if (!list) return;

    list.innerHTML = AREAS.map(function (area, i) {
      var idealText = state.ideals[area] || '';
      var truncated = idealText.length > 24 ? idealText.slice(0, 24) + '...' : idealText;
      var savedScore = state.scores[area] || 5;
      var pct = (savedScore / 10) * 100;

      return (
        '<div class="score-row-v2" data-area="' + area + '">' +
          '<div class="score-row">' +
            '<div class="score-label">' +
              '<div class="score-name">' + area + '</div>' +
              '<div class="score-ideal">理想：' + escapeHtml(truncated || '（未入力）') + '</div>' +
            '</div>' +
            '<div class="slider-wrap" id="slider-wrap-' + i + '">' +
              '<div class="slider-track" id="slider-track-' + i + '">' +
                '<div class="slider-fill" style="width:' + pct + '%"></div>' +
                '<div class="slider-thumb" style="left:' + pct + '%"></div>' +
              '</div>' +
              '<div class="slider-ticks">' +
                '<span>0</span><span>1</span><span>2</span><span>3</span><span>4</span>' +
                '<span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>' +
              '</div>' +
            '</div>' +
            '<div class="score-value" id="score-value-' + i + '">' + savedScore + '<span class="score-value-of"> / 10</span></div>' +
          '</div>' +
          '<div class="reason-wrap">' +
            '<div class="reason-label">なぜその点数？</div>' +
            '<textarea class="reason-input" id="reason-' + i + '" data-area="' + area + '" ' +
              'placeholder="' + escapeHtml(REASON_PLACEHOLDERS[area] || '') + '" rows="2"></textarea>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    // Restore reasons & init sliders
    AREAS.forEach(function (area, i) {
      var reasonTa = getEl('reason-' + i);
      if (reasonTa && state.reasons[area]) reasonTa.value = state.reasons[area];
      initCustomSlider(i, area);
    });
  }

  function initCustomSlider(index, area) {
    var track = getEl('slider-track-' + index);
    var valueEl = getEl('score-value-' + index);
    if (!track || !valueEl) return;

    var fill = track.querySelector('.slider-fill');
    var thumb = track.querySelector('.slider-thumb');
    var dragging = false;

    function updateFromX(clientX) {
      var rect = track.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      var val = Math.round(ratio * 10);
      var pct = (val / 10) * 100;
      fill.style.width = pct + '%';
      thumb.style.left = pct + '%';
      valueEl.innerHTML = val + '<span class="score-value-of"> / 10</span>';
      state.scores[area] = val;
    }

    function onMouseDown(e) {
      e.preventDefault();
      dragging = true;
      thumb.classList.add('grabbing');
      updateFromX(e.clientX || (e.touches && e.touches[0].clientX));
    }

    function onMouseMove(e) {
      if (!dragging) return;
      updateFromX(e.clientX || (e.touches && e.touches[0].clientX));
    }

    function onMouseUp() {
      dragging = false;
      thumb.classList.remove('grabbing');
    }

    track.addEventListener('mousedown', onMouseDown);
    track.addEventListener('touchstart', function (e) { onMouseDown(e.touches[0]); }, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', function (e) { if (dragging) onMouseMove(e.touches[0]); });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
  }

  function collectStep2() {
    AREAS.forEach(function (area, i) {
      var reasonTa = getEl('reason-' + i);
      state.reasons[area] = reasonTa ? reasonTa.value.trim() : '';
      // scores already updated by slider
      if (!state.scores[area]) state.scores[area] = 5;
    });
  }

  // ─── Step 3: ギャップ確認 ──────────────────────────────────────────────────
  function initPriorityOrder() {
    if (state.priorityOrder.length !== AREAS.length) {
      state.priorityOrder = AREAS.slice().sort(function (a, b) {
        return (10 - (state.scores[b] || 5)) - (10 - (state.scores[a] || 5));
      });
    }
  }

  function renderStep3() {
    initPriorityOrder();
    renderRadarChart();
    renderBarChart();
    renderImpList();
  }

  function renderRadarChart() {
    var svg = getEl('radar-svg');
    if (!svg) return;

    var size = 320;
    var center = size / 2;
    var radius = size * 0.38;
    var n = AREAS.length;

    function point(i, value) {
      var angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      var r = (value / 10) * radius;
      return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
    }

    function labelPoint(i) {
      var angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      var r = radius + 22;
      return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
    }

    var html = '';

    // Grid rings
    [2, 4, 6, 8, 10].forEach(function (v) {
      var pts = AREAS.map(function (_, i) { return point(i, v).join(','); }).join(' ');
      html += '<polygon points="' + pts + '" fill="none" stroke="var(--line)" stroke-width="1"/>';
    });

    // Spokes
    AREAS.forEach(function (_, i) {
      var p = point(i, 10);
      html += '<line x1="' + center + '" y1="' + center + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="var(--line-soft)" stroke-width="1"/>';
    });

    // Ideal polygon
    var idealPoly = AREAS.map(function (_, i) { return point(i, 10).join(','); }).join(' ');
    html += '<polygon points="' + idealPoly + '" fill="var(--beige)" fill-opacity="0.35" stroke="var(--beige-deep)" stroke-width="1" stroke-dasharray="3 3"/>';

    // Actual polygon
    var actualPoly = AREAS.map(function (area, i) { return point(i, state.scores[area] || 5).join(','); }).join(' ');
    html += '<polygon points="' + actualPoly + '" fill="var(--sage)" fill-opacity="0.35" stroke="var(--sage-deep)" stroke-width="2"/>';

    // Actual points
    AREAS.forEach(function (area, i) {
      var p = point(i, state.scores[area] || 5);
      html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="var(--sage-deep)"/>';
    });

    // Labels
    AREAS.forEach(function (area, i) {
      var p = labelPoint(i);
      html += '<text x="' + p[0] + '" y="' + p[1] + '" text-anchor="middle" dominant-baseline="middle" font-size="12" font-family="var(--font-serif)" fill="var(--ink)">' + area + '</text>';
    });

    svg.innerHTML = html;
  }

  function renderBarChart() {
    var card = getEl('bars-card');
    if (!card) return;

    var barsHtml = '<div class="radar-title">GAP DETAIL</div>';
    AREAS.forEach(function (area) {
      var s = state.scores[area] || 5;
      var gap = 10 - s;
      var pct = (s / 10) * 100;
      barsHtml += (
        '<div class="bar-row">' +
          '<div class="bar-name">' + area + '</div>' +
          '<div class="bar-track">' +
            '<div class="bar-actual" style="width:' + pct + '%"></div>' +
            '<div class="bar-ideal-mark" style="left:calc(100% - 2px)"></div>' +
          '</div>' +
          '<div class="bar-gap-text' + (gap === 0 ? ' small' : '') + '">' +
            (gap === 0 ? '達成' : '-' + gap) +
          '</div>' +
        '</div>'
      );
    });
    card.innerHTML = barsHtml;
  }

  // Drag and drop state
  var dragId = null;
  var dragOverId = null;

  function renderImpList() {
    var list = getEl('imp-list');
    if (!list) return;

    list.innerHTML = state.priorityOrder.map(function (area, idx) {
      var d = domainByName(area);
      var s = state.scores[area] || 5;
      var gap = 10 - s;
      var savedImp = state.improvements[area] || '';

      return (
        '<div class="imp-item" data-area="' + area + '" draggable="true">' +
          '<div class="imp-handle" title="ドラッグして並び替え">::</div>' +
          '<div class="imp-rank">' + (idx + 1) + '</div>' +
          '<div class="imp-domain">' +
            '<div class="imp-domain-name">' + area + '</div>' +
            '<div class="imp-gap">' + (gap === 0 ? '達成' : 'ギャップ -' + gap) + '</div>' +
          '</div>' +
          '<textarea class="imp-text" id="imp-' + area + '" data-area="' + area + '" ' +
            'placeholder="' + escapeHtml(IMPROVEMENT_PLACEHOLDERS[area] || (area + 'で、何が改善されれば理想に近づきますか？')) + '" rows="1">' +
            escapeHtml(savedImp) +
          '</textarea>' +
          '<div class="imp-arrows">' +
            '<button type="button" class="imp-up" data-area="' + area + '"' + (idx === 0 ? ' disabled' : '') + '>&#x2191;</button>' +
            '<button type="button" class="imp-down" data-area="' + area + '"' + (idx === state.priorityOrder.length - 1 ? ' disabled' : '') + '>&#x2193;</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    // Arrow button events
    list.querySelectorAll('.imp-up').forEach(function (btn) {
      btn.addEventListener('click', function () {
        collectImprovements();
        var area = btn.getAttribute('data-area');
        var idx = state.priorityOrder.indexOf(area);
        if (idx > 0) {
          var tmp = state.priorityOrder[idx - 1];
          state.priorityOrder[idx - 1] = state.priorityOrder[idx];
          state.priorityOrder[idx] = tmp;
          renderImpList();
        }
      });
    });

    list.querySelectorAll('.imp-down').forEach(function (btn) {
      btn.addEventListener('click', function () {
        collectImprovements();
        var area = btn.getAttribute('data-area');
        var idx = state.priorityOrder.indexOf(area);
        if (idx < state.priorityOrder.length - 1) {
          var tmp = state.priorityOrder[idx + 1];
          state.priorityOrder[idx + 1] = state.priorityOrder[idx];
          state.priorityOrder[idx] = tmp;
          renderImpList();
        }
      });
    });

    // Drag & drop events
    list.querySelectorAll('.imp-item').forEach(function (item) {
      item.addEventListener('dragstart', function (e) {
        dragId = item.getAttribute('data-area');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', dragId); } catch (_) {}
        setTimeout(function () { item.classList.add('is-dragging'); }, 0);
      });

      item.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var overArea = item.getAttribute('data-area');
        if (dragOverId !== overArea) {
          // Remove old dragover styles
          list.querySelectorAll('.imp-item').forEach(function (el) { el.classList.remove('is-over'); });
          if (dragId !== overArea) {
            item.classList.add('is-over');
          }
          dragOverId = overArea;
        }
      });

      item.addEventListener('drop', function (e) {
        e.preventDefault();
        var targetArea = item.getAttribute('data-area');
        if (!dragId || dragId === targetArea) {
          cleanupDrag();
          return;
        }
        collectImprovements();
        var next = state.priorityOrder.filter(function (x) { return x !== dragId; });
        var ti = next.indexOf(targetArea);
        next.splice(ti, 0, dragId);
        state.priorityOrder = next;
        cleanupDrag();
        renderImpList();
      });

      item.addEventListener('dragend', function () {
        cleanupDrag();
      });
    });
  }

  function cleanupDrag() {
    dragId = null;
    dragOverId = null;
    document.querySelectorAll('.imp-item').forEach(function (el) {
      el.classList.remove('is-dragging', 'is-over');
    });
  }

  function collectImprovements() {
    state.priorityOrder.forEach(function (area) {
      var ta = getEl('imp-' + area);
      state.improvements[area] = ta ? ta.value.trim() : '';
    });
  }

  // ─── Helpers for agent output ────────────────────────────────────────────
  function fixUGS(s) {
    return (s || '')
      .replace(/転職[＋+＆&]UGS副業?/g, '転職＋副業')
      .replace(/現職[＋+＆&]UGS副業?/g, '現職＋副業')
      .replace(/UGS副業/g, '副業')
      .replace(/UGS/g, '副業')
      .replace(/FGS/g, '副業')
      .replace(/FUG/g, '副業')
      .replace(/UGS活動/g, '副業活動');
  }

  function formatRationale(s) {
    return escapeHtml(fixUGS(s))
      .replace(/\s*[／/]\s*/g, '<br>')
      .replace(/\s*→\s*/g, '<br>->')
      .replace(/(<br>\s*){2,}/g, '<br>');
  }

  function renderRationaleToggle(rationale, idx) {
    if (!rationale) return '';
    return (
      '<div class="rationale-toggle-section">' +
        '<button type="button" class="rationale-toggle-btn" data-rationale-idx="' + idx + '">' +
          '4人のエージェントの根拠を見る' +
          '<span class="rationale-toggle-arrow">&#x25BC;</span>' +
        '</button>' +
        '<div class="rationale-toggle-content">' +
          '<div class="agent-rationale-list">' +
            '<div class="rationale-agent-item"><span class="agent-tag career">キャリア戦略家</span><p>' + formatRationale(rationale.career) + '</p></div>' +
            '<div class="rationale-agent-item"><span class="agent-tag life">ライフ設計士</span><p>' + formatRationale(rationale.life) + '</p></div>' +
            '<div class="rationale-agent-item"><span class="agent-tag income">収入アナリスト</span><p>' + formatRationale(rationale.income) + '</p></div>' +
            '<div class="rationale-agent-item"><span class="agent-tag psych">心理分析官</span><p>' + formatRationale(rationale.psychology) + '</p></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function bindRationaleToggles() {
    document.querySelectorAll('.rationale-toggle-btn').forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        var content = btn.nextElementSibling;
        var arrow = btn.querySelector('.rationale-toggle-arrow');
        if (content) content.classList.toggle('open');
        if (arrow) arrow.classList.toggle('open');
      });
    });
  }

  // ─── Step 4: 選択肢 ──────────────────────────────────────────────────────
  function renderStep4() {
    // If already analyzed, skip loading and render cached results
    if (state.agentResults) {
      renderStep4Results(state.agentResults);
      return;
    }

    // Clear containers
    var featuredContainer = getEl('route-featured-container');
    var otherContainer = getEl('other-routes-container');
    var agentSection = getEl('agent-analysis-section');
    if (featuredContainer) featuredContainer.innerHTML = '';
    if (otherContainer) otherContainer.innerHTML = '';
    if (agentSection) agentSection.innerHTML = '';

    // Hide simulation & save until results arrive
    var simSection = getEl('simulation-section');
    if (simSection) simSection.style.display = 'none';
    var saveInline = document.querySelector('.save-inline');
    if (saveInline) saveInline.style.display = 'none';

    // Loading title
    var titleEl = getEl('step4-title');
    var leadEl = getEl('step4-lead');
    if (titleEl) titleEl.innerHTML = 'AIが<em>あなたの回答</em>を<br>分析しています...';
    if (leadEl) leadEl.innerHTML = '4人の専門エージェントがあなたのギャップと優先順位を分析し、最適な選択肢を導き出します。';

    // Agent progress indicators
    if (featuredContainer) {
      featuredContainer.innerHTML =
        '<div class="agent-loading-panel">' +
          '<div class="agent-progress-list">' +
            '<div class="agent-progress-item" id="progress-career-strategist">' +
              '<span class="agent-icon">C</span><span class="agent-name">キャリア戦略家</span>' +
              '<span class="agent-status loading">分析中...</span>' +
            '</div>' +
            '<div class="agent-progress-item" id="progress-life-planner">' +
              '<span class="agent-icon">L</span><span class="agent-name">ライフ設計士</span>' +
              '<span class="agent-status loading">分析中...</span>' +
            '</div>' +
            '<div class="agent-progress-item" id="progress-income-analyst">' +
              '<span class="agent-icon">I</span><span class="agent-name">収入アナリスト</span>' +
              '<span class="agent-status loading">分析中...</span>' +
            '</div>' +
            '<div class="agent-progress-item" id="progress-psychology-coach">' +
              '<span class="agent-icon">P</span><span class="agent-name">心理・動機分析官</span>' +
              '<span class="agent-status loading">分析中...</span>' +
            '</div>' +
          '</div>' +
          '<div class="agent-synthesizing" id="agent-synthesizing" hidden>' +
            '<span class="synthesizing-dot"></span>シニアコンサルタントが統合分析中...' +
          '</div>' +
        '</div>';
    }

    // Start AI analysis
    runAgentAnalysis();
  }

  function renderStep4Results(result) {
    var total = AREAS.reduce(function (sum, area) { return sum + (state.scores[area] || 5); }, 0);
    var avg = (total / AREAS.length).toFixed(1);
    var topGapArea = state.priorityOrder[0] || AREAS[0];

    // Update title & lead
    var titleEl = getEl('step4-title');
    var leadEl = getEl('step4-lead');
    if (titleEl) {
      titleEl.innerHTML = 'あなたは、<em>' + escapeHtml(topGapArea) + '</em>を<br>重点的に変えたいと感じています。';
    }
    if (leadEl) {
      leadEl.innerHTML = '平均 <strong>' + avg + '/10</strong>、最大ギャップは<strong>「' + escapeHtml(topGapArea) + '」</strong>。<br>AIが4つのルートを導き出しました。';
    }

    // Split options into recommended + others
    var options = (result && result.options) || [];
    var recommended = null;
    var others = [];
    options.forEach(function (opt) {
      if (opt.recommended && !recommended) recommended = opt;
      else others.push(opt);
    });
    if (!recommended && options.length > 0) {
      recommended = options[0];
      others = options.slice(1);
    }

    renderFeaturedRoute(recommended);
    renderOtherRoutes(others);

    // Show simulation & save
    renderSimulation();
    var saveInline = document.querySelector('.save-inline');
    if (saveInline) saveInline.style.display = '';
  }

  function renderFeaturedRoute(aiOption) {
    var container = getEl('route-featured-container');
    if (!container) return;

    var opt = RECOMMENDED_OPTION;
    var title = aiOption ? fixUGS(aiOption.title || aiOption.type || opt.title) : opt.title;
    var subtitle = aiOption ? fixUGS(aiOption.summary || opt.subtitle) : opt.subtitle;

    var statsHtml = opt.hero.stats.map(function (s) {
      return '<div class="case-stat"><div class="case-stat-k">' + escapeHtml(s.k) + '</div><div class="case-stat-v">' + escapeHtml(s.v) + '</div></div>';
    }).join('');

    // CASE STUDY story: always show static sections
    var storySectionsHtml = opt.sections.map(function (sec, i) {
      return (
        '<div class="route-plan-row">' +
          '<div class="route-plan-num">0' + (i + 1) + '</div>' +
          '<div>' +
            '<h4 class="route-plan-h">' + escapeHtml(sec.h) + '</h4>' +
            '<p class="route-plan-body">' + escapeHtml(sec.body) + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    // Rationale toggle - show from AI results or from cached state
    var rationale = aiOption ? aiOption.rationale : null;
    var rationaleHtml = renderRationaleToggle(rationale, 0);

    container.innerHTML = (
      '<article class="route-featured">' +

        // 1. 選択肢（ルートヘッダー）
        '<header class="route-featured-head">' +
          '<div class="route-tag-row">' +
            '<span class="route-tag-pill">推奨</span>' +
            '<span class="route-code">ROUTE 01</span>' +
          '</div>' +
          '<h2 class="route-featured-title">' + escapeHtml(title) + '</h2>' +
          '<p class="route-featured-sub">' + escapeHtml(subtitle) + '</p>' +
        '</header>' +

        // 2. 推奨の根拠
        rationaleHtml +

        // 3. ケーススタディ（ヒーロー + ストーリー一体）
        '<div class="case-study-section">' +
          '<div class="case-study-label">' +
            '<div class="eyebrow">CASE STUDY</div>' +
            '<h3 class="case-study-heading">成功事例</h3>' +
          '</div>' +
          '<div class="case-hero">' +
            '<div class="case-hero-img">' +
              '<img src="nogaki.jpeg" alt="' + escapeHtml(opt.hero.name) + '">' +
              '<div class="case-hero-caption">グランドキャニオンにて</div>' +
            '</div>' +
            '<div class="case-hero-body">' +
              '<div class="case-hero-eyebrow">' + escapeHtml(opt.hero.label) + '</div>' +
              '<h3 class="case-hero-name">' + escapeHtml(opt.hero.name) + '</h3>' +
              '<blockquote class="case-hero-quote">「' + escapeHtml(opt.hero.quote) + '」</blockquote>' +
              '<div class="case-stats">' + statsHtml + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="case-story">' +
            '<div class="case-story-header">' +
              '<div class="eyebrow">SUCCESS STORY</div>' +
              '<h4 class="case-story-title">成功までのストーリー</h4>' +
            '</div>' +
            storySectionsHtml +
          '</div>' +
        '</div>' +

      '</article>'
    );

    bindRationaleToggles();
  }

  function renderOtherRoutes(aiOptions) {
    var container = getEl('other-routes-container');
    if (!container) return;

    var useAI = aiOptions && aiOptions.length > 0;
    var options = useAI ? aiOptions : SAMPLE_OPTIONS;

    var cardsHtml = options.map(function (o, idx) {
      var title, body, tag, routeCode, chipsHtml, fitHtml, rationaleHtml;

      if (useAI) {
        title = fixUGS(o.title || o.type || '');
        body = fixUGS(o.summary || '');
        tag = o.type || 'ルート';
        routeCode = 'ROUTE 0' + (idx + 2);
        chipsHtml = '';
        fitHtml = '';
        rationaleHtml = renderRationaleToggle(o.rationale, idx + 1);
      } else {
        title = o.title;
        body = o.body;
        tag = o.tag;
        routeCode = o.routeCode;
        chipsHtml = o.chips.map(function (c) {
          return '<span class="option-chip">' + escapeHtml(c) + '</span>';
        }).join('');
        fitHtml =
          '<div class="route-fit">' +
            '<div><span class="route-fit-k">向いている</span> ' + escapeHtml(o.fit.match) + '</div>' +
            '<div><span class="route-fit-k route-fit-shadow">注意</span> ' + escapeHtml(o.fit.shadow) + '</div>' +
          '</div>';
        rationaleHtml = '';
      }

      return (
        '<div class="route-card">' +
          '<div class="route-card-meta">' +
            '<span class="route-tag-pill route-tag-quiet">' + escapeHtml(tag) + '</span>' +
            '<span class="route-code">' + escapeHtml(routeCode) + '</span>' +
          '</div>' +
          '<h3 class="route-card-title">' + escapeHtml(title) + '</h3>' +
          '<p class="route-card-body">' + escapeHtml(body) + '</p>' +
          '<div class="route-card-foot">' +
            fitHtml +
            (chipsHtml ? '<div class="option-meta">' + chipsHtml + '</div>' : '') +
          '</div>' +
          rationaleHtml +
        '</div>'
      );
    }).join('');

    container.innerHTML = (
      '<div class="other-routes">' +
        '<div class="other-routes-head">' +
          '<div class="eyebrow">OTHER ROUTES</div>' +
          '<h3 class="other-routes-h">他の選択肢</h3>' +
        '</div>' +
        cardsHtml +
      '</div>'
    );

    bindRationaleToggles();
  }

  // ─── Agent analysis ────────────────────────────────────────────────────────
  function updateAgentProgress(agentType, success) {
    var el = getEl('progress-' + agentType);
    if (!el) return;
    var status = el.querySelector('.agent-status');
    if (status) {
      status.textContent = success ? '完了' : 'エラー';
      status.className = 'agent-status ' + (success ? 'done' : 'error');
    }
  }

  async function runAgentAnalysis() {
    if (!window.CareerAgents) {
      // Fallback to static content
      renderStep4Results(null);
      return;
    }

    try {
      var result = await window.CareerAgents.orchestrate(state, {
        onAgentDone: function (agentType, res) {
          updateAgentProgress(agentType, res !== null);
          var allDone = ['career-strategist', 'life-planner', 'income-analyst', 'psychology-coach']
            .every(function (t) {
              var el = getEl('progress-' + t);
              var s = el && el.querySelector('.agent-status');
              return s && (s.classList.contains('done') || s.classList.contains('error'));
            });
          if (allDone) {
            var synthEl = getEl('agent-synthesizing');
            if (synthEl) synthEl.hidden = false;
          }
        }
      });
      state.agentResults = result;
      renderStep4Results(result);
    } catch (err) {
      console.error('Agent analysis error:', err);
      renderStep4Results(null);
    }
  }

  // ─── 10年放置シミュレーション ─────────────────────────────────────────────
  function calcCompound(monthly, annualRate, years) {
    var r = annualRate / 12;
    var n = years * 12;
    if (r === 0) return monthly * n;
    return monthly * ((Math.pow(1 + r, n) - 1) / r);
  }

  function renderSimulation() {
    var section = getEl('simulation-section');
    if (!section) return;
    section.style.display = 'block';

    var incomeInput = getEl('sim-income');
    var surplusInput = getEl('sim-surplus');

    function update() {
      var surplus = parseInt(surplusInput.value, 10) || 0;
      var addAmount = 3;
      var improved = surplus + addAmount;
      var years = 10;
      var rate = 0.03;

      var currentTotal = surplus * 12 * years;
      var improvedTotal = Math.round(calcCompound(improved, rate, years));
      var diff = improvedTotal - currentTotal;

      var resultEl = getEl('sim-result');
      if (!resultEl) return;

      resultEl.innerHTML =
        '<div class="sim-comparison">' +
          '<div class="sim-card sim-card-current">' +
            '<span class="sim-card-label">今のまま10年間</span>' +
            '<span class="sim-card-amount">' + currentTotal + '万円</span>' +
            '<span class="sim-card-sub">月' + surplus + '万円 x 10年（貯蓄のみ）</span>' +
          '</div>' +
          '<div class="sim-card sim-card-improved">' +
            '<span class="sim-card-label">月' + addAmount + '万円の余力を作れたら</span>' +
            '<span class="sim-card-amount">' + improvedTotal + '万円</span>' +
            '<span class="sim-card-sub">月' + improved + '万円 x 10年（年利3%運用）</span>' +
          '</div>' +
        '</div>' +
        '<div class="sim-diff">' +
          '<span class="sim-diff-label">10年後の差額</span>' +
          '<span class="sim-diff-amount">+' + diff + '万円</span>' +
        '</div>' +
        '<p class="sim-message">' +
          '<strong>月' + addAmount + '万円の余力を作るだけ</strong>で、10年後に<strong>' + diff + '万円</strong>の差が生まれます。<br><br>' +
          'でも「どこから' + addAmount + '万円を作るか」は、<br>収入と支出の全体像を見ないとわかりません。<br><br>' +
          'まずFPと一緒に<strong>キャッシュフローを整理</strong>してみませんか？' +
        '</p>';
    }

    incomeInput.addEventListener('input', update);
    surplusInput.addEventListener('input', update);
    update();
  }

  // ─── History ──────────────────────────────────────────────────────────────
  function renderHistoryList(sessions) {
    return sessions.map(function (s) {
      var date = new Date(s.created_at);
      var dateStr = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 ' +
        ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
      var priorities = (s.priority_order || []).slice(0, 3);
      var scores = s.scores || {};
      var ideals = s.ideals || {};
      var improvements = s.improvements || {};
      var reasons = s.reasons || {};

      var summaryItems = priorities.map(function (area, i) {
        var score = scores[area] || '-';
        var gap = score !== '-' ? (10 - score) + '点差' : '';
        return '<span class="history-priority-item"><strong>' + (i + 1) + '位</strong> ' + area + '（' + score + '点/' + gap + '）</span>';
      }).join('');

      var detailRows = (s.priority_order || []).map(function (area) {
        var score = scores[area] || '-';
        var ideal = ideals[area] || '-';
        var reason = reasons[area] || '-';
        var imp = improvements[area] || '-';
        return (
          '<div class="history-detail-row">' +
            '<div class="history-detail-area">' + area + '（' + score + '点）</div>' +
            '<div class="history-detail-item"><span>理想：</span>' + escapeHtml(ideal) + '</div>' +
            '<div class="history-detail-item"><span>現状：</span>' + escapeHtml(reason) + '</div>' +
            '<div class="history-detail-item"><span>改善策：</span>' + escapeHtml(imp) + '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="history-item">' +
          '<div class="history-item-header">' +
            '<span class="history-item-name">' + escapeHtml(s.user_name || '名前なし') + '</span>' +
            '<span class="history-item-date">' + dateStr + '</span>' +
          '</div>' +
          '<div class="history-item-summary">' + summaryItems + '</div>' +
          '<button type="button" class="history-toggle">詳細を見る</button>' +
          '<div class="history-item-detail" style="display:none">' + detailRows + '</div>' +
        '</div>'
      );
    }).join('');
  }

  // ─── Modal helpers ────────────────────────────────────────────────────────
  function openModal(id) {
    var modal = getEl(id);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(id) {
    var modal = getEl(id);
    if (modal) modal.classList.add('hidden');
  }

  // ─── Event binding ────────────────────────────────────────────────────────
  function bindEvents() {
    // Landing
    var btnStart = getEl('btn-landing-start');
    if (btnStart) btnStart.addEventListener('click', function () {
      showTool();
      renderStep1();
      setStep(1);
    });

    var btnLandingHistory = getEl('btn-landing-history');
    if (btnLandingHistory) btnLandingHistory.addEventListener('click', function () {
      openModal('history-modal');
    });

    // Step navigation
    var btnToStep2 = getEl('btn-to-step2');
    if (btnToStep2) btnToStep2.addEventListener('click', function () {
      collectStep1();
      renderStep2();
      setStep(2);
    });

    var btnBackStep1 = getEl('btn-back-step1');
    if (btnBackStep1) btnBackStep1.addEventListener('click', function () {
      collectStep2();
      renderStep1();
      setStep(1);
    });

    var btnToStep3 = getEl('btn-to-step3');
    if (btnToStep3) btnToStep3.addEventListener('click', function () {
      collectStep2();
      state.priorityOrder = [];
      renderStep3();
      setStep(3);
    });

    var btnBackStep2 = getEl('btn-back-step2');
    if (btnBackStep2) btnBackStep2.addEventListener('click', function () {
      collectImprovements();
      renderStep2();
      setStep(2);
    });

    var btnToStep4 = getEl('btn-to-step4');
    if (btnToStep4) btnToStep4.addEventListener('click', function () {
      collectImprovements();
      renderStep4();
      setStep(4);
    });

    var btnBackStep3 = getEl('btn-back-step3');
    if (btnBackStep3) btnBackStep3.addEventListener('click', function () {
      renderStep3();
      setStep(3);
    });

    var btnPdf = getEl('btn-pdf');
    if (btnPdf) btnPdf.addEventListener('click', function () {
      window.print();
    });

    // Sidebar step navigation (click to jump)
    document.querySelectorAll('.step-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var targetStep = parseInt(el.getAttribute('data-step'), 10);
        if (targetStep === state.step) return;
        // Collect current step's data before jumping
        if (state.step === 1) collectStep1();
        else if (state.step === 2) collectStep2();
        else if (state.step === 3) collectImprovements();

        // Render target step
        if (targetStep === 1) renderStep1();
        else if (targetStep === 2) renderStep2();
        else if (targetStep === 3) renderStep3();
        else if (targetStep === 4) renderStep4();

        setStep(targetStep);
      });
    });

    // Sidebar buttons
    var btnSidebarHistory = getEl('btn-sidebar-history');
    if (btnSidebarHistory) btnSidebarHistory.addEventListener('click', function () {
      openModal('history-modal');
    });

    var btnSidebarSave = getEl('btn-sidebar-save');
    if (btnSidebarSave) btnSidebarSave.addEventListener('click', function () {
      openModal('save-modal');
    });

    // Save inline (Step 4)
    var btnSave = getEl('btn-save');
    if (btnSave) btnSave.addEventListener('click', async function () {
      var name = (getEl('save-name') || {}).value || '';
      var email = (getEl('save-email') || {}).value || '';
      var status = getEl('save-status');
      if (!name.trim()) {
        if (status) { status.textContent = '氏名を入力してください。'; status.className = 'save-status error'; }
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        if (status) { status.textContent = 'メールアドレスを正しく入力してください。'; status.className = 'save-status error'; }
        return;
      }
      btnSave.disabled = true;
      btnSave.textContent = '保存中...';
      var result = await saveSession(name, email);
      if (result.error) {
        btnSave.disabled = false;
        btnSave.textContent = '保存する';
        if (status) { status.textContent = '保存に失敗しました：' + (result.error.message || result.error); status.className = 'save-status error'; }
      } else {
        btnSave.textContent = '保存済み';
        if (status) { status.textContent = '保存しました！このメールアドレスで後から見返せます。'; status.className = 'save-status success'; }
      }
    });

    // Save modal
    var btnModalClose = getEl('btn-modal-close');
    if (btnModalClose) btnModalClose.addEventListener('click', function () { closeModal('save-modal'); });

    var saveModalBackdrop = getEl('save-modal');
    if (saveModalBackdrop) saveModalBackdrop.addEventListener('click', function (e) {
      if (e.target === saveModalBackdrop) closeModal('save-modal');
    });

    var btnModalSave = getEl('btn-modal-save');
    if (btnModalSave) btnModalSave.addEventListener('click', async function () {
      var name = (getEl('modal-save-name') || {}).value || '';
      var email = (getEl('modal-save-email') || {}).value || '';
      var status = getEl('modal-save-status');
      if (!name.trim()) {
        if (status) { status.textContent = '氏名を入力してください。'; status.className = 'save-status error'; }
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        if (status) { status.textContent = 'メールアドレスを正しく入力してください。'; status.className = 'save-status error'; }
        return;
      }
      // Collect latest data
      if (state.step === 1) collectStep1();
      else if (state.step === 2) collectStep2();
      else if (state.step === 3) collectImprovements();

      btnModalSave.disabled = true;
      btnModalSave.textContent = '保存中...';
      var result = await saveSession(name, email);
      if (result.error) {
        btnModalSave.disabled = false;
        btnModalSave.textContent = '保存する';
        if (status) { status.textContent = '保存に失敗しました：' + (result.error.message || result.error); status.className = 'save-status error'; }
      } else {
        btnModalSave.textContent = '保存済み';
        if (status) { status.textContent = '保存しました！'; status.className = 'save-status success'; }
      }
    });

    // History modal
    var btnHistoryClose = getEl('btn-history-close');
    if (btnHistoryClose) btnHistoryClose.addEventListener('click', function () {
      closeModal('history-modal');
      var list = getEl('history-list');
      if (list) list.innerHTML = '';
      var st = getEl('history-status');
      if (st) { st.textContent = ''; st.className = 'save-status'; }
    });

    var historyBackdrop = getEl('history-modal');
    if (historyBackdrop) historyBackdrop.addEventListener('click', function (e) {
      if (e.target === historyBackdrop) {
        closeModal('history-modal');
      }
    });

    var btnLoadHistory = getEl('btn-load-history');
    if (btnLoadHistory) btnLoadHistory.addEventListener('click', async function () {
      var email = (getEl('history-email') || {}).value || '';
      var status = getEl('history-status');
      var list = getEl('history-list');
      if (!email.trim() || !email.includes('@')) {
        if (status) { status.textContent = 'メールアドレスを正しく入力してください。'; status.className = 'save-status error'; }
        return;
      }
      btnLoadHistory.disabled = true;
      btnLoadHistory.textContent = '読み込み中...';
      var result = await loadSessions(email);
      btnLoadHistory.disabled = false;
      btnLoadHistory.textContent = '記録を見る';
      if (result.error) {
        if (status) { status.textContent = '読み込みに失敗しました。'; status.className = 'save-status error'; }
        return;
      }
      if (!result.data || result.data.length === 0) {
        if (status) { status.textContent = 'このメールアドレスの記録は見つかりませんでした。'; status.className = 'save-status error'; }
        if (list) list.innerHTML = '';
        return;
      }
      if (status) { status.textContent = result.data.length + '件の記録が見つかりました。'; status.className = 'save-status success'; }
      if (list) {
        list.innerHTML = renderHistoryList(result.data);
        list.querySelectorAll('.history-toggle').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var detail = btn.nextElementSibling;
            if (detail) {
              var isHidden = detail.style.display === 'none' || detail.style.display === '';
              detail.style.display = isHidden ? 'flex' : 'none';
              btn.textContent = isHidden ? '詳細を閉じる' : '詳細を見る';
            }
          });
        });
      }
    });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  showLanding();
  bindEvents();

})();
