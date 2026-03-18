(function () {
  'use strict';

  // ─── Supabase 設定 ────────────────────────────────────────────────────────
  const SUPABASE_URL = 'https://xtcopreojvmovdswhhgk.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0Y29wcmVvanZtb3Zkc3doaGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MjkzMjQsImV4cCI6MjA4OTMwNTMyNH0.l_ylqxCQ9LJDdPEBd_pbzjzk4N9v6hovqP2MOn1cGMQ';
  let db;
  if (window.supabase) {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  async function saveSession(name, email) {
    if (!db) return { error: 'Supabase が読み込まれていません' };
    const { data, error } = await db.from('sessions').insert([{
      user_name: name.trim(),
      user_email: email.trim().toLowerCase(),
      ideals: state.ideals,
      scores: state.scores,
      reasons: state.reasons,
      improvements: state.improvements,
      priority_order: state.priorityOrder
    }]);
    return { data, error };
  }

  async function loadSessions(email) {
    if (!db) return { data: null, error: 'Supabase が読み込まれていません' };
    const { data, error } = await db
      .from('sessions')
      .select('*')
      .eq('user_email', email.trim().toLowerCase())
      .order('created_at', { ascending: false });
    return { data, error };
  }

  const AREAS = ['収入', '働き方', '職場環境', '仕事内容', 'スキル', '生活'];

  const IMPROVEMENT_PLACEHOLDERS = {
    '収入':    '例：月収を○万円 → ○万円に上げる　／　副業で月○万円を稼ぐ　／　年収○○○万円を目標にする',
    '働き方':  '例：フルリモート勤務に変える　／　月の残業を○時間 → 0時間にする　／　週4日勤務にする',
    '職場環境': '例：評価制度が公平な職場に移る　／　尊重し合えるチームで働く　／　上司との関係を改善する',
    '仕事内容': '例：企画・提案の仕事を50%以上にする　／　○○の専門職になる　／　マネジメントから外れる',
    'スキル':  '例：○○の資格を取る　／　副業で案件を○件獲得し実績を作る　／　○○ができるレベルになる',
    '生活':    '例：毎日○時に退勤できる　／　家族と夕食を週○日一緒に食べる　／　休日に仕事を持ち込まない'
  };

  const REASON_PLACEHOLDERS = {
    '収入':    '例：昇給がほぼなく、5年で年収がほとんど変わっていない',
    '働き方':  '例：月40時間の残業があり、帰宅後に自分の時間がほとんどない',
    '職場環境': '例：上司との関係が良くなく、毎朝会社に行くのが憂鬱',
    '仕事内容': '例：ルーティン業務ばかりで、自分の裁量やアイデアを出せない',
    'スキル':  '例：今の仕事だけでは市場価値が上がっている実感がない',
    '生活':    '例：残業で家族との夕食をほとんど一緒に食べられていない'
  };

  // 選択肢ごと×領域ごとの具体的な根拠テキスト（ユーザーの改善テキストを使用）
  const AREA_OPTION_TEXTS = {
    '収入': {
      1: function(imp) {
        return (imp ? '「' + imp + '」を目指す場合、' : '収入目標に向けて、') +
          '転職で年収レンジを引き上げながら、会社員のまま月5〜30万円を稼ぐ副業を並走させる両輪戦略が最も確実です。さらに節税の仕組みを整えることで、月3〜10万円の手残り増加も同時に狙えます。あなたの場合、具体的にどんな副業の組み合わせが合っているか、気になりませんか？';
      },
      2: function(imp) {
        return (imp ? '「' + imp + '」を実現するには、' : '収入アップには、') +
          '転職市場での年収交渉が直接的なアプローチです。業界・職種・企業規模の見直しが収入レンジを変える最大の変数です。転職エージェントへの登録で自分の市場価値を確認し、希望年収を明確にして選考に臨みましょう。';
      },
      3: function(imp) {
        return (imp ? '「' + imp + '」のうち、' : '収入アップのため、') +
          '現職を続けながら副業で収入を積み上げる方法が最短ルートです。専門家のサポートのもとで月5〜30万円の副業収入を設計しながら、節税で手残りも増やす二重の収入改善が狙えます。まず月5万円の目標から設計しましょう。';
      },
      4: function(imp) {
        return (imp ? '「' + imp + '」に向けて、' : '収入改善に向けて、') +
          'まず現職での改善余地を確認しましょう。昇給交渉・等級の見直し・インセンティブ制度の活用・残業代の正確な把握など、転職前に試せることが意外とあります。評価者に「何をすれば昇給できるか」を直接確認することが最初の一歩です。';
      }
    },
    '働き方': {
      1: function(imp) {
        return (imp ? '「' + imp + '」を実現するには、' : '働き方を変えるには、') +
          '転職先の働き方条件（リモート・フレックス・残業実態）を選考軸に入れつつ、副業で時間・場所の自由度を高める組み合わせが有効です。週数時間からスタートできる副業で、本業とは別の自律的な働き方を小さく試せます。あなたにとって「理想の時間の使い方」を実現する方法、実は思ったよりシンプルかもしれません。';
      },
      2: function(imp) {
        return (imp ? '「' + imp + '」を転職条件に入れることが、' : '転職の条件に働き方を入れることが、') +
          '最短の改善ルートです。求人票だけでなく、面接で実態（残業平均・リモート頻度・有休取得率）を必ず確認しましょう。現職と比較できる数字をもって判断することが大切です。';
      },
      3: function(imp) {
        return (imp ? '「' + imp + '」と並行して、' : '働き方の自由度を上げるために、') +
          '副業で自分の裁量で動ける時間を持つことが有効です。稼働時間・場所・案件を自分でコントロールできるため、現職を続けながら理想の働き方を小さく試す場にもなります。';
      },
      4: function(imp) {
        return (imp ? '「' + imp + '」に向けて、' : '働き方の改善に向けて、') +
          '現職でリモート勤務・フレックス・残業削減を上司や人事に交渉することから始めましょう。制度があるのに周知されていないケースも多く、申請するだけで変わることがあります。';
      }
    },
    '職場環境': {
      1: function(imp) {
        return (imp ? '「' + imp + '」を目指すなら、' : '職場環境を変えるには、') +
          '転職で環境を一新しつつ、副業で全く別のコミュニティ・評価環境に触れることで、比較軸が生まれ次の選択がしやすくなります。同じ目標を持つ仲間や専属サポーターとのつながりが、現職以外の心理的な拠り所にもなります。「こういう環境で働きたい」という基準、副業を通じて具体的に見えてくるかもしれません。';
      },
      2: function(imp) {
        return (imp ? '「' + imp + '」を実現するには、' : '職場環境の改善には、') +
          '転職で職場そのものを変えることが最も直接的です。面接での逆質問（チームの雰囲気・評価制度・離職率・マネジメントスタイル）で実態を見極めることが、ミスマッチを防ぐ鍵です。';
      },
      3: function(imp) {
        return (imp ? '「' + imp + '」と並行して、' : '現職の環境とは別に、') +
          '副業コミュニティで自分が快適に活動できる人間関係に触れることで、「こういう環境がいい」という基準が具体的になります。次の転職先選びの判断軸にもなります。';
      },
      4: function(imp) {
        return (imp ? '「' + imp + '」に向けて、' : '職場環境の改善に向けて、') +
          '異動希望・上司への直接相談・社内コミュニティへの参加など、環境を変えずに関係性を変えるアプローチから試しましょう。問題の原因が特定の人物や部署にある場合は、異動申請が有効なケースがあります。';
      }
    },
    '仕事内容': {
      1: function(imp) {
        return (imp ? '「' + imp + '」を目指す場合、' : '仕事内容を変えるには、') +
          '転職で職種・業務内容を刷新しつつ、副業で自分の裁量でやりたい仕事に挑戦する組み合わせが有効です。本業で経験を積み、副業で「人の人生に関わる仕事」を実践するサイクルが成長と市場価値を加速させます。あなたの経験とスキルで、どんな副業の仕事ができるか、具体的に聞いてみませんか？';
      },
      2: function(imp) {
        return (imp ? '「' + imp + '」を条件に加えた転職が、' : '仕事内容の転換には、') +
          '直接的なアプローチです。職種・業界・役割・裁量の大きさを整理し、やりたい仕事に近い求人を軸に選考を進めましょう。職種変更を伴う場合は、現職での実績を棚卸しして強みを整理することが重要です。';
      },
      3: function(imp) {
        return (imp ? '「' + imp + '」に挑戦するために、' : '仕事内容の多様化のために、') +
          '副業で本業とは全く別の「人の人生に関わる仕事」に挑戦できます。スモールスタートで適性と需要を確認しながら、コミュニケーション・金融・ライフプランのスキルが実践で身につきます。';
      },
      4: function(imp) {
        return (imp ? '「' + imp + '」に向けて、' : '仕事内容の見直しに向けて、') +
          '社内で担当範囲の変更・新プロジェクトへの参加・役割交渉を試みましょう。希望する業務内容を上司に伝え、機会を作ることから始めることで、転職前に試せることが見えてきます。';
      }
    },
    'スキル': {
      1: function(imp) {
        return (imp ? '「' + imp + '」を達成するには、' : 'スキルを伸ばすには、') +
          '転職で実務経験を積める環境に移りつつ、副業でそのスキルを外部で試す組み合わせが市場価値を最も高めます。「対人折衝能力・マネーリテラシー・投資判断」というAI時代に代替不可能なスキルが、副業の実践を通じて身につきます。今のあなたのスキルで、副業としてどこまでできるか、一度確かめてみませんか？';
      },
      2: function(imp) {
        return (imp ? '「' + imp + '」のために、' : 'スキルアップのために、') +
          '転職で成長できる環境・役割・職種を選ぶことが重要です。スキルが伸びる職場かどうか、入社前にチームの業務難易度・育成方針・挑戦できる案件の有無を確認しましょう。';
      },
      3: function(imp) {
        return (imp ? '「' + imp + '」に向けて、' : 'スキルの実践のために、') +
          '副業でスキルに対して報酬をもらう経験が市場価値を飛躍的に高めます。動画学習と専属サポーターによる実践支援で、再現性ある「稼ぐスキル」を最短で構築できます。';
      },
      4: function(imp) {
        return (imp ? '「' + imp + '」に向けて、' : 'スキル向上に向けて、') +
          '社内研修・異動・担当範囲の拡大など、現職のまま経験できることを整理しましょう。社内でどんな学習機会があるか（勉強会・資格補助・OJT）を確認することが出発点です。';
      }
    },
    '生活': {
      1: function(imp) {
        return (imp ? '「' + imp + '」を実現するには、' : '理想の生活を実現するには、') +
          '転職で働き方・勤務地・拘束時間を変えつつ、副業で収入の柔軟性を持つ組み合わせが、生活設計の自由度を最も高めます。節税の仕組みで手残りを増やしながら長期的な資産形成も並走できます。あなたが描く理想の生活、副業収入があれば現実的にどのくらい近づけるか、試算してみませんか？';
      },
      2: function(imp) {
        return (imp ? '「' + imp + '」を実現するには、' : '理想の生活を実現するには、') +
          '転職で勤務地・労働時間・働き方を変えることが直接的なアプローチです。家族との時間・健康・生活リズムを転職条件の優先軸として、妥協しない姿勢で求人を選びましょう。';
      },
      3: function(imp) {
        return (imp ? '「' + imp + '」のために、' : '生活の質を高めるために、') +
          '副業で収入に余白を作ることで、生活の選択肢が広がります。月5〜30万円の収入柱を作れば現職への依存度が下がり、無理に残業する必要がなくなります。節税効果で手残りも月3〜10万円増える可能性があります。';
      },
      4: function(imp) {
        return (imp ? '「' + imp + '」に向けて、' : '生活改善に向けて、') +
          'まず現職での働き方を見直しましょう。有給取得促進・残業削減交渉・在宅勤務の活用など、転職なしで生活の質を上げられることがあります。小さな変化から始めることが重要です。';
      }
    }
  };

  const OPTIONS = [
    { id: 1, name: '① 転職＋副業', recommended: true },
    { id: 2, name: '② 転職', recommended: false },
    { id: 3, name: '③ 副業から始める', recommended: false },
    { id: 4, name: '④ 現状の見直し', recommended: false }
  ];

  const OPTION_META = {
    1: { reach: '収入・スキル・働き方・生活など広く', risk: '高（環境変化＋時間・体力）', time: '数ヶ月〜1年', next: '転職軸の整理と副業の収入設計を並行してスタート' },
    2: { reach: '収入・働き方・職場環境・仕事内容など', risk: '高（環境が変わる）', time: '数ヶ月〜1年', next: '判断軸の整理 → 求人検討' },
    3: { reach: '収入・スキル・生活・マネーリテラシーなど', risk: '低〜中（現職維持のまま）', time: '3ヶ月〜', next: 'まず副業で月5万円の収入を作ることを目標にスタート' },
    4: { reach: '職場環境・働き方・仕事内容など', risk: '低（現状維持の延長）', time: '継続的', next: '現職で交渉・調整できることの洗い出し' }
  };

  let state = {
    step: 1,
    ideals: {},        // area -> string（理想の記述）
    scores: {},        // area -> number 1-10
    reasons: {},       // area -> string（点数をつけた理由）
    improvements: {},  // area -> string（具体的な改善内容）
    priorityOrder: []  // area[]（優先順位順、全6領域）
  };

  function getEl(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // ─── Step 1: 理想の状態を記述 ──────────────────────────────────────────

  const IDEAL_PLACEHOLDERS = {
    '収入':    '例：月収60万円で、家族が安心して暮らせる収入がある',
    '働き方':  '例：週4日リモート、残業なしで子育てと両立できている',
    '職場環境': '例：互いに尊重し合え、成長を応援してくれるチームにいる',
    '仕事内容': '例：自分の得意なことを活かせる仕事で、やりがいを感じている',
    'スキル':  '例：市場価値のあるスキルがあり、どこでも働ける自信がある',
    '生活':    '例：家族との時間を大切にし、健康で充実した毎日を送っている'
  };

  function renderStep1() {
    const form = getEl('form-step1');
    if (!form) return;

    form.innerHTML = AREAS.map(function (area, i) {
      return (
        '<div class="area-block" data-area="' + area + '">' +
          '<div class="area-label">' +
            '<span class="area-name">' + area + '</span>' +
            '<span class="area-hint">この状態 ＝ 10点満点</span>' +
          '</div>' +
          '<textarea id="ideal-' + i + '" data-area="' + area + '" ' +
            'placeholder="' + IDEAL_PLACEHOLDERS[area] + '" rows="2"></textarea>' +
        '</div>'
      );
    }).join('');

    AREAS.forEach(function (area, i) {
      const ta = getEl('ideal-' + i);
      if (ta && state.ideals[area]) ta.value = state.ideals[area];
    });

    form.querySelectorAll('textarea').forEach(function (ta) {
      ta.addEventListener('input', checkStep1Complete);
    });
    checkStep1Complete();
  }

  function checkStep1Complete() {
    const form = getEl('form-step1');
    if (!form) return;
    const allFilled = AREAS.every(function (area, i) {
      const ta = form.querySelector('#ideal-' + i);
      return ta && ta.value.trim().length > 0;
    });
    const btn = getEl('btn-to-step2');
    if (btn) btn.disabled = !allFilled;
  }

  function collectStep1() {
    const form = getEl('form-step1');
    AREAS.forEach(function (area, i) {
      const ta = form && form.querySelector('#ideal-' + i);
      state.ideals[area] = ta ? ta.value.trim() : '';
    });
  }

  // ─── Step 2: 現状スコア + 理由 ─────────────────────────────────────────

  function renderStep2() {
    const list = getEl('score-list');
    if (!list) return;

    list.innerHTML = AREAS.map(function (area, i) {
      const idealText = state.ideals[area] || '—';
      const savedScore = state.scores[area] || 5;
      return (
        '<div class="score-block" data-area="' + area + '">' +
          '<div class="score-header">' +
            '<span class="score-area-name">' + area + '</span>' +
          '</div>' +
          '<div class="score-ideal-ref">' +
            '<span class="ref-label">理想（10点）：</span>' +
            '<span class="ref-text">' + escapeHtml(idealText) + '</span>' +
          '</div>' +
          '<div class="score-input-row">' +
            '<span class="score-min-label">1点</span>' +
            '<input type="range" id="score-' + i + '" data-area="' + area + '" ' +
              'min="1" max="10" value="' + savedScore + '" class="score-slider">' +
            '<span class="score-max-label">10点</span>' +
            '<span class="score-display" id="score-display-' + i + '">' + savedScore + '点</span>' +
          '</div>' +
          '<div class="reason-row">' +
            '<label class="reason-label" for="reason-' + i + '">この点数をつけた理由</label>' +
            '<textarea id="reason-' + i + '" data-area="' + area + '" ' +
              'placeholder="' + REASON_PLACEHOLDERS[area] + '" rows="2" class="reason-textarea"></textarea>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    AREAS.forEach(function (area, i) {
      const slider = getEl('score-' + i);
      const display = getEl('score-display-' + i);
      if (slider && display) {
        if (state.scores[area]) {
          slider.value = state.scores[area];
          display.textContent = state.scores[area] + '点';
        }
        slider.addEventListener('input', function () {
          display.textContent = slider.value + '点';
          state.scores[area] = parseInt(slider.value, 10);
        });
      }
      const reasonTa = getEl('reason-' + i);
      if (reasonTa && state.reasons[area]) {
        reasonTa.value = state.reasons[area];
      }
    });
  }

  function collectStep2() {
    AREAS.forEach(function (area, i) {
      const slider = getEl('score-' + i);
      const reasonTa = getEl('reason-' + i);
      state.scores[area] = slider ? parseInt(slider.value, 10) : 5;
      state.reasons[area] = reasonTa ? reasonTa.value.trim() : '';
    });
  }

  // ─── Step 3: ギャップ確認 + 改善内容 + 優先順位 ────────────────────────

  function initPriorityOrder() {
    if (state.priorityOrder.length !== AREAS.length) {
      // ギャップが大きい順にデフォルト設定
      state.priorityOrder = AREAS.slice().sort(function (a, b) {
        return (10 - (state.scores[b] || 5)) - (10 - (state.scores[a] || 5));
      });
    }
  }

  function renderStep3() {
    initPriorityOrder();
    const list = getEl('gap-detail-list');
    if (!list) return;
    renderGapCards();
  }

  function renderGapCards() {
    const list = getEl('gap-detail-list');
    if (!list) return;

    list.innerHTML = state.priorityOrder.map(function (area, rankIndex) {
      const score = state.scores[area] || 5;
      const reason = state.reasons[area] || '';
      const idealText = state.ideals[area] || '—';
      const gap = 10 - score;
      const savedImp = state.improvements[area] || '';

      const isFirst = rankIndex === 0;
      const isLast = rankIndex === state.priorityOrder.length - 1;

      return (
        '<div class="gap-detail-card" data-area="' + area + '" data-rank="' + rankIndex + '">' +
          '<div class="gap-detail-header">' +
            '<span class="rank-badge">第' + (rankIndex + 1) + '位</span>' +
            '<span class="gap-area-name">' + area + '</span>' +
            '<span class="gap-score-badge">現在 <strong>' + score + '点</strong>　ギャップ <strong>' + gap + '点</strong></span>' +
            '<div class="rank-controls">' +
              '<button type="button" class="rank-btn rank-up" data-area="' + area + '" ' + (isFirst ? 'disabled' : '') + '>↑</button>' +
              '<button type="button" class="rank-btn rank-down" data-area="' + area + '" ' + (isLast ? 'disabled' : '') + '>↓</button>' +
            '</div>' +
          '</div>' +
          '<div class="gap-info-row">' +
            '<div class="gap-info-item">' +
              '<span class="gap-info-label">理想（10点）</span>' +
              '<span class="gap-info-text">' + escapeHtml(idealText) + '</span>' +
            '</div>' +
            (reason ? (
              '<div class="gap-info-item">' +
                '<span class="gap-info-label">現在（' + score + '点）の理由</span>' +
                '<span class="gap-info-text">' + escapeHtml(reason) + '</span>' +
              '</div>'
            ) : '') +
          '</div>' +
          '<div class="improvement-row">' +
            '<label class="improvement-label" for="imp-' + area + '">具体的に何が改善されれば理想に近づきますか？<span class="label-hint">できるだけ数字で</span></label>' +
            '<textarea id="imp-' + area + '" data-area="' + area + '" class="improvement-textarea" ' +
              'placeholder="' + IMPROVEMENT_PLACEHOLDERS[area] + '" rows="2">' +
            '</textarea>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    // 改善内容を復元
    state.priorityOrder.forEach(function (area) {
      const ta = getEl('imp-' + area);
      if (ta && state.improvements[area]) ta.value = state.improvements[area];
    });

    // 並び替えボタンのイベント
    list.querySelectorAll('.rank-up').forEach(function (btn) {
      btn.addEventListener('click', function () {
        collectImprovements();
        const area = btn.dataset.area;
        const idx = state.priorityOrder.indexOf(area);
        if (idx > 0) {
          const tmp = state.priorityOrder[idx - 1];
          state.priorityOrder[idx - 1] = state.priorityOrder[idx];
          state.priorityOrder[idx] = tmp;
          renderGapCards();
        }
      });
    });

    list.querySelectorAll('.rank-down').forEach(function (btn) {
      btn.addEventListener('click', function () {
        collectImprovements();
        const area = btn.dataset.area;
        const idx = state.priorityOrder.indexOf(area);
        if (idx < state.priorityOrder.length - 1) {
          const tmp = state.priorityOrder[idx + 1];
          state.priorityOrder[idx + 1] = state.priorityOrder[idx];
          state.priorityOrder[idx] = tmp;
          renderGapCards();
        }
      });
    });
  }

  function collectImprovements() {
    state.priorityOrder.forEach(function (area) {
      const ta = getEl('imp-' + area);
      state.improvements[area] = ta ? ta.value.trim() : '';
    });
  }

  // ─── Step 4: 選択肢の提示 ──────────────────────────────────────────────

  function renderStep4() {
    const container = getEl('option-cards');
    const bridgeEl = getEl('bridge-message');
    if (!container) return;

    const topAreas = state.priorityOrder.slice(0, 3);

    // 共感の一文（優先度1）- AI分析中も表示
    if (bridgeEl) {
      const a1 = topAreas[0] || '';
      const a2 = topAreas[1] || '';
      const empathy = a1 && a2
        ? 'あなたは今、' + a1 + ' と ' + a2 + ' を最優先に変えたいと感じています。'
        : a1 ? 'あなたは今、' + a1 + ' を最優先に変えたいと感じています。' : '';
      const areaLabels = topAreas.map(function (a, i) { return (i + 1) + '位：' + a; }).join('　');
      bridgeEl.innerHTML =
        (empathy ? '<strong class="empathy-line">' + escapeHtml(empathy) + '</strong><br>' : '') +
        '<span class="priority-line">' + escapeHtml(areaLabels) + ' を優先改善する想定で分析します。</span>';
    }

    runAgentAnalysis();
  }

  // ─── Step 4: AIエージェント分析 ───────────────────────────────────────

  function renderAgentLoading() {
    const container = getEl('option-cards');
    if (!container) return;
    container.innerHTML = (
      '<div class="agent-loading">' +
        '<div class="agent-loading-title">4人のエージェントが並列分析中…</div>' +
        '<div class="agent-progress-list">' +
          '<div class="agent-progress-item" id="progress-career-strategist">' +
            '<span class="agent-icon">💼</span><span class="agent-name">キャリア戦略家</span>' +
            '<span class="agent-status loading">分析中…</span>' +
          '</div>' +
          '<div class="agent-progress-item" id="progress-life-planner">' +
            '<span class="agent-icon">🏠</span><span class="agent-name">ライフ設計士</span>' +
            '<span class="agent-status loading">分析中…</span>' +
          '</div>' +
          '<div class="agent-progress-item" id="progress-income-analyst">' +
            '<span class="agent-icon">💰</span><span class="agent-name">収入アナリスト</span>' +
            '<span class="agent-status loading">分析中…</span>' +
          '</div>' +
          '<div class="agent-progress-item" id="progress-psychology-coach">' +
            '<span class="agent-icon">🧠</span><span class="agent-name">心理・動機分析官</span>' +
            '<span class="agent-status loading">分析中…</span>' +
          '</div>' +
        '</div>' +
        '<div class="agent-synthesizing" id="agent-synthesizing" hidden>' +
          '<span class="synthesizing-dot"></span>シニアコンサルタントが統合分析中…' +
        '</div>' +
      '</div>'
    );
  }

  function updateAgentProgress(agentType, success) {
    const el = getEl('progress-' + agentType);
    if (!el) return;
    const status = el.querySelector('.agent-status');
    if (status) {
      status.textContent = success ? '完了 ✓' : 'エラー';
      status.className = 'agent-status ' + (success ? 'done' : 'error');
    }
  }

  function renderNogakiCaseStudy() {
    return (
      '<div class="case-study-card">' +
        '<div class="case-study-header">' +
          '<span class="case-study-badge">成功事例</span>' +
          '<span class="case-study-name">野々垣さん（これから。ロールモデル）</span>' +
        '</div>' +
        '<div class="case-study-photo-wrap">' +
          '<img src="nogaki.jpeg" alt="野々垣さん" class="case-study-photo">' +
          '<div class="case-study-photo-caption">社会人5年目・グランドキャニオンにて</div>' +
        '</div>' +
        '<p class="case-study-lead">転職＋副業を組み合わせて、社会人5年目に年収2,000万円・海外生活を実現。</p>' +
        '<div class="case-study-timeline">' +
          '<div class="timeline-item">' +
            '<span class="timeline-dot">1年目</span>' +
            '<div class="timeline-body">' +
              '<strong>年収290万円の過酷な職場で限界を感じる</strong>' +
              '<p>朝7時〜深夜の激務。FPとの出会いで「人生の逆算」を行い、<em>時間を確保できる環境</em>への戦略的転職を決意。副業を夏から開始し、初月15万円を達成。</p>' +
            '</div>' +
          '</div>' +
          '<div class="timeline-item">' +
            '<span class="timeline-dot">2年目</span>' +
            '<div class="timeline-body">' +
              '<strong>顧客の課題を解決する「コトを売る」営業スキルを転職先で習得</strong>' +
              '<p>副業と本業を並走。「なぜ断られたか」を徹底的に書き出し、改善を繰り返す。</p>' +
            '</div>' +
          '</div>' +
          '<div class="timeline-item">' +
            '<span class="timeline-dot">3年目</span>' +
            '<div class="timeline-body">' +
              '<strong>独立。月50万円の安定利益を達成</strong>' +
              '<p>量をこなしながら成功者に教えを乞い、泥臭い積み上げで1年後に月利50万を安定化。</p>' +
            '</div>' +
          '</div>' +
          '<div class="timeline-item">' +
            '<span class="timeline-dot">4年目</span>' +
            '<div class="timeline-body">' +
              '<strong>年収1,200万円。組織として成長</strong>' +
              '<p>同じ目標を持つ仲間と本気で向き合い、成功者を徹底的に模倣し続けた結果。</p>' +
            '</div>' +
          '</div>' +
          '<div class="timeline-item timeline-item-last">' +
            '<span class="timeline-dot">5年目</span>' +
            '<div class="timeline-body">' +
              '<strong>年収2,000万円超。2ヶ月に1回は海外へ</strong>' +
              '<p>「自分一人でやった方が早い」というエゴを捨て、業務をマニュアル化して組織をスケール。仲間も同様のライフスタイルを実現。</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<p class="case-study-cta">あなたも、<em>転職と副業の組み合わせ</em>でこの軌道を歩めます。まず一歩、話してみませんか？</p>' +
      '</div>'
    );
  }

  function renderAgentResults(result) {
    const container = getEl('option-cards');
    if (!container || !result) return;

    const optionsHtml = (result.options || []).map(function (opt) {
      const isRec = opt.recommended;
      // AIが "UGS副業" や "UGS" と出力する場合は "副業" に正規化
      function fixUGS(s) {
        return (s || '')
          .replace(/転職[＋+＆&]UGS副業?/g, '転職＋副業')
          .replace(/現職[＋+＆&]UGS副業?/g, '現職＋副業')
          .replace(/UGS副業/g, '副業')
          .replace(/UGS/g, '副業');
      }
      // 根拠テキストに改行を入れて読みやすくする（「→」「。」の後で改行）
      function formatRationale(s) {
        return escapeHtml(fixUGS(s))
          .replace(/→\s*/g, '→\n')
          .replace(/。(?=[^\n])/g, '。\n');
      }
      const title = fixUGS(opt.title || opt.type || '');
      const rationaleHtml = (
        '<div class="agent-rationale-grid">' +
          '<div class="rationale-agent-item"><span class="agent-tag career">💼 キャリア戦略家</span><p>' + formatRationale(opt.rationale.career) + '</p></div>' +
          '<div class="rationale-agent-item"><span class="agent-tag life">🏠 ライフ設計士</span><p>' + formatRationale(opt.rationale.life) + '</p></div>' +
          '<div class="rationale-agent-item"><span class="agent-tag income">💰 収入アナリスト</span><p>' + formatRationale(opt.rationale.income) + '</p></div>' +
          '<div class="rationale-agent-item"><span class="agent-tag psych">🧠 心理分析官</span><p>' + formatRationale(opt.rationale.psychology) + '</p></div>' +
        '</div>'
      );
      const card = (
        '<div class="option-card' + (isRec ? ' option-card-recommended' : '') + '">' +
          (isRec ? '<div class="recommended-badge">推奨</div>' : '') +
          '<h3 class="option-card-title">' + escapeHtml(title) + '</h3>' +
          '<p class="option-summary">' + escapeHtml(opt.summary || '') + '</p>' +
          '<div class="option-card-rationale">' +
            '<div class="option-card-rationale-title">4人のエージェントからの根拠</div>' +
            rationaleHtml +
          '</div>' +
          '<div class="option-footer">' +
            '<div class="option-next-action"><span class="footer-label">今すぐできる一歩</span>' + escapeHtml(opt.nextAction || '') + '</div>' +
            '<div class="option-risk"><span class="footer-label">リスク</span>' + escapeHtml(opt.risk || '') + '</div>' +
          '</div>' +
        '</div>'
      );
      // 推奨カード（転職＋副業）の直後に成功事例を挿入
      return card + (isRec ? renderNogakiCaseStudy() : '');
    }).join('');

    container.innerHTML = optionsHtml;
  }

  async function runAgentAnalysis() {
    if (!window.CareerAgents) {
      const container = getEl('option-cards');
      if (container) container.innerHTML = '<p class="agent-error">エージェントの読み込みに失敗しました。ページを再読み込みしてください。</p>';
      return;
    }

    renderAgentLoading();

    try {
      const result = await window.CareerAgents.orchestrate(state, {
        onAgentDone: function (agentType, res) {
          updateAgentProgress(agentType, res !== null);
          const allDone = ['career-strategist', 'life-planner', 'income-analyst', 'psychology-coach']
            .every(function (t) {
              const el = getEl('progress-' + t);
              const s = el && el.querySelector('.agent-status');
              return s && (s.classList.contains('done') || s.classList.contains('error'));
            });
          if (allDone) {
            const synthEl = getEl('agent-synthesizing');
            if (synthEl) synthEl.hidden = false;
          }
        }
      });
      renderAgentResults(result);
    } catch (err) {
      const container = getEl('option-cards');
      if (container) {
        container.innerHTML = '<div class="agent-error">分析中にエラーが発生しました。<br><small>' + escapeHtml(err.message) + '</small></div>';
      }
    }
  }

  // ─── 履歴レンダリング ──────────────────────────────────────────────────

  function renderHistoryList(sessions) {
    return sessions.map(function (s) {
      const date = new Date(s.created_at);
      const dateStr = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 ' +
        ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
      const priorities = (s.priority_order || []).slice(0, 3);
      const scores = s.scores || {};
      const ideals = s.ideals || {};
      const improvements = s.improvements || {};

      const summaryItems = priorities.map(function (area, i) {
        const score = scores[area] || '—';
        const gap = score !== '—' ? (10 - score) + '点差' : '';
        return '<span class="history-priority-item"><strong>' + (i + 1) + '位</strong> ' + area + '（' + score + '点/' + gap + '）</span>';
      }).join('');

      const detailRows = (s.priority_order || []).map(function (area) {
        const score = scores[area] || '—';
        const ideal = ideals[area] || '—';
        const imp = improvements[area] || '—';
        return (
          '<div class="history-detail-row">' +
            '<div class="history-detail-area">' + area + '（' + score + '点）</div>' +
            '<div class="history-detail-item"><span>理想：</span>' + escapeHtml(ideal) + '</div>' +
            '<div class="history-detail-item"><span>改善：</span>' + escapeHtml(imp) + '</div>' +
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
          '<button type="button" class="history-toggle">詳細を見る ▼</button>' +
          '<div class="history-item-detail" hidden>' + detailRows + '</div>' +
        '</div>'
      );
    }).join('');
  }

  // ─── ステップ切り替え ──────────────────────────────────────────────────

  function setStep(step) {
    state.step = step;
    document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
    const panel = getEl('panel-step' + step);
    if (panel) {
      panel.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.querySelectorAll('.step').forEach(function (el, i) {
      const num = i + 1;
      el.classList.remove('current', 'done');
      if (num === step) el.classList.add('current');
      else if (num < step) el.classList.add('done');
    });
  }

  // ─── イベントバインド ──────────────────────────────────────────────────

  function bindEvents() {
    var b;

    b = getEl('btn-to-step2');
    if (b) b.addEventListener('click', function () {
      collectStep1();
      renderStep2();
      setStep(2);
    });

    b = getEl('btn-back-step1');
    if (b) b.addEventListener('click', function () {
      collectStep2();
      renderStep1();
      setStep(1);
    });

    b = getEl('btn-to-step3');
    if (b) b.addEventListener('click', function () {
      collectStep2();
      state.priorityOrder = []; // ギャップ順をリセット（スコアが変わった可能性）
      renderStep3();
      setStep(3);
    });

    b = getEl('btn-back-step2');
    if (b) b.addEventListener('click', function () {
      collectImprovements();
      renderStep2();
      setStep(2);
    });

    b = getEl('btn-to-step4');
    if (b) b.addEventListener('click', function () {
      collectImprovements();
      renderStep4();
      setStep(4);
    });

    b = getEl('btn-back-step3');
    if (b) b.addEventListener('click', function () {
      renderStep3();
      setStep(3);
    });

    b = getEl('btn-pdf');
    if (b) b.addEventListener('click', function () {
      window.print();
    });

    // 保存する（btnSave にローカル変数でキャプチャ）
    var btnSave = getEl('btn-save');
    if (btnSave) btnSave.addEventListener('click', async function () {
      const name = (getEl('save-name') || {}).value || '';
      const email = (getEl('save-email') || {}).value || '';
      const status = getEl('save-status');
      if (!name.trim()) {
        if (status) { status.textContent = '氏名を入力してください。'; status.className = 'save-status error'; }
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        if (status) { status.textContent = 'メールアドレスを正しく入力してください。'; status.className = 'save-status error'; }
        return;
      }
      btnSave.disabled = true;
      btnSave.textContent = '保存中…';
      const { error } = await saveSession(name, email);
      if (error) {
        btnSave.disabled = false;
        btnSave.textContent = '保存する';
        if (status) { status.textContent = '保存に失敗しました：' + error.message; status.className = 'save-status error'; }
      } else {
        btnSave.textContent = '保存済み ✓';
        if (status) { status.textContent = '保存しました！このメールアドレスで後から見返せます。'; status.className = 'save-status success'; }
      }
    });

    // 過去の記録モーダルを開く
    b = getEl('btn-open-history');
    if (b) b.addEventListener('click', function () {
      const modal = getEl('history-modal');
      if (modal) modal.hidden = false;
    });

    // モーダルを閉じる
    b = getEl('btn-close-history');
    if (b) b.addEventListener('click', function () {
      const modal = getEl('history-modal');
      if (modal) modal.hidden = true;
      const list = getEl('history-list');
      if (list) list.innerHTML = '';
      const st = getEl('history-status');
      if (st) { st.textContent = ''; st.className = 'save-status'; }
    });

    // 記録を読み込む（btnLoad にローカル変数でキャプチャ）
    var btnLoad = getEl('btn-load-history');
    if (btnLoad) btnLoad.addEventListener('click', async function () {
      const email = (getEl('history-email') || {}).value || '';
      const status = getEl('history-status');
      const list = getEl('history-list');
      if (!email.trim() || !email.includes('@')) {
        if (status) { status.textContent = 'メールアドレスを正しく入力してください。'; status.className = 'save-status error'; }
        return;
      }
      btnLoad.disabled = true;
      btnLoad.textContent = '読み込み中…';
      const { data, error } = await loadSessions(email);
      btnLoad.disabled = false;
      btnLoad.textContent = '記録を見る';
      if (error) {
        if (status) { status.textContent = '読み込みに失敗しました。'; status.className = 'save-status error'; }
        return;
      }
      if (!data || data.length === 0) {
        if (status) { status.textContent = 'この메ールアドレスの記録は見つかりませんでした。'; status.className = 'save-status error'; }
        if (list) list.innerHTML = '';
        return;
      }
      if (status) { status.textContent = data.length + '件の記録が見つかりました。'; status.className = 'save-status success'; }
      if (list) {
        list.innerHTML = renderHistoryList(data);
        list.querySelectorAll('.history-toggle').forEach(function (btn) {
          btn.addEventListener('click', function () {
            const detail = btn.nextElementSibling;
            if (detail) {
              const isHidden = detail.hidden;
              detail.hidden = !isHidden;
              btn.textContent = isHidden ? '詳細を閉じる ▲' : '詳細を見る ▼';
            }
          });
        });
      }
    });
  }

  // ─── 初期化 ────────────────────────────────────────────────────────────

  renderStep1();
  setStep(1);
  bindEvents();

})();
