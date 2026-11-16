(() => {
  'use strict';
  const ASSET='../comic-player/assets/';
  const PDF=ASSET+'medikuru-ai-summary.pdf';
  const $=id=>document.getElementById(id);
  const stillRender=new URLSearchParams(window.location.search).get('render')==='still';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches||stillRender;
  document.documentElement.classList.toggle('render-still',stillRender);
  const state={scene:0,step:0};
  const icon=(name,alt='')=>`<img src="${ASSET}icons/${name}.svg" alt="${alt}" width="48" height="48">`;
  const fmt=(value,decimals=0)=>Number(value).toLocaleString('ja-JP',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
  const metric=(value,unit,cls='',decimals=0)=>`<span class="metric ${cls}"><strong class="count" data-count="${value}" data-decimals="${decimals}">${fmt(value,decimals)}</strong><span>${unit}</span></span>`;
  const reveal=(n,html,cls='')=>`<div class="reveal ${cls}" data-reveal="${n}">${html}</div>`;
  // Original atlas: 1254×1254, four 627×627 tiles. Width alone scales the image.
  const atlas=(position,label,cls='')=>{
    const [x,y]=position.split(/\s+/).map(value=>parseFloat(value)>0?1:0);
    return `<div class="atlas-window ${cls}" role="img" aria-label="${label}"><img class="atlas-source" src="${ASSET}comic-scenes-atlas.png" alt="" width="1254" height="1254" decoding="async" style="left:${-x*100}%;top:${-y*100}%"></div>`;
  };
  const art=(position,label,cls='')=>atlas(position,label,`art atlas ${cls}`);
  const panel=(body,cls='')=>`<div class="panel ${cls}">${body}</div>`;
  const speech=(speaker,text,tone='pink')=>({speaker,text,tone});
  const allocationRow=(i,label,amount,extra='')=>`<div class="allocation-row">${icon(i)}<b>${label}</b><span class="amount">${amount}<small>MC</small>${extra?`<em>${extra}</em>`:''}</span></div>`;

  const menuA=[
    ['news','取材ニュース・<br>掲載実績PR','3,000MC','取材・記事掲載・DreamNews配信',true],
    ['search','企業情報・<br>AI検索対策整理','600MC','社名・強み・サービス・FAQを整理',true],
    ['monitor','競合分析・<br>月次レポート','300MC／月','自社と競合3社の比較・報告',true],
    ['specialty','業界の専門媒体<br>向け記事','300MC／本','業種に合ったテーマで記事を制作'],
    ['reputation','みんなの評判.com<br>向け記事','300MC／本','企業・サービスの紹介記事'],
    ['executive_article','社長の取材.com<br>向け記事','300MC／本','経営者の経験や考えを取材記事に']
  ];
  const menuB=[
    ['video','動画対談','6,000MC','対談の企画・収録'],
    ['story_lp','オリジナル<br>ストーリーLP','3,000MC','企業の背景と強みを1ページに'],
    ['survey','アンケート・<br>調査PR','3,000MC〜','対象・回答人数等により個別見積'],
    ['distribution','PR TIMES<br>追加配信','300MC＋媒体実費','取材ニュース・調査PRのオプション'],
    ['strategy','役員指名の<br>事業戦略相談','1,500MC／60分','役員1名とのマンツーマン'],
    ['wikipedia_profile','Wikipedia掲載<br>コミット<br>（社長名限定）','8,000MC','第三者の報道・資料から人物記事を準備']
  ];
  const boostMenu=["news","search","monitor","reputation","specialty","video","story_lp","executive_article","survey","distribution","strategy","wikipedia_profile"].map(id=>[...menuA,...menuB].find(item=>item[0]===id));
  const menuGrid=items=>`<div class="visual-stack"><div class="menu-grid">${items.map(([i,name,fee,desc,required],n)=>reveal(items===menuA?[0,0,0,1,2,2][n]:Math.floor(n/2),`<div class="menu-name">${icon(i)}<h3>${name}</h3></div><p class="fee">${required?'<span class="required">基本施策</span>':''}${fee}</p><small>${desc}</small>`,'menu-card')).join('')}</div></div>`;

  const referenceScenes=[
    {
      id:'strengths',short:'御社の強みを取材する',eyebrow:'まず、御社のお話を聞かせてください',title:'社長！御社の強みを<br>取材させてください',pages:[5,6],
      visual:()=>art('0% 0%','経営者と記者が、会社の強みを話しているイラスト'),
      takeaway:'お客様に選ばれてきた場面に、御社ならではの強みがあります',
      beats:[speech('御社が選ばれてきた場面から','お客様は、どんなときに<br><strong>御社を選んでいますか？</strong>'),speech('普段の工夫にも、御社ならではの価値','当たり前に続けている工夫から、<br><strong>選ばれる理由を見つけます</strong>','blue'),speech('私たちが取材して、言葉にする','経験・実績・お客様の声を伺い、<br><strong>伝える強みを整理します</strong>')]
    },
    {
      id:'interviewer',short:'代表記者が取材する',eyebrow:'経営者の視点で、事業の背景まで',title:'御社ならではの強みを<br>代表の漆沢が引き出す',pages:[7,6],
      visual:()=>`<figure class="portrait"><img src="${ASSET}portraits/urushizawa-original.jpg" alt="メディくる代表取締役・記者 漆沢祐樹"><figcaption><small>メディくる代表取締役・記者</small><strong>漆沢 祐樹</strong></figcaption></figure>`,
      takeaway:'代表記者本人が、判断・工夫・事業を続けてきた思いまで伺います',
      beats:[speech('取材を担当する人','代表・記者の<strong>漆沢祐樹</strong>が、<br>御社を直接取材します'),speech('経営の経験',`上場企業<strong><span class="count" data-count="4">4</span>社</strong>で<br>取締役・執行役員等を経験`,'blue'),speech('取材の経験',`<strong><span class="count" data-count="500">500</span>社以上</strong>の経営者を取材<br>魅力を、伝わる言葉に`)]
    },
    {
      id:'reporting',short:'ニュースで報道する',eyebrow:'御社の強みを、ニュースとして伝える',title:'その強みを<br><span class="phrase">大手ネットニュースで</span><wbr><span class="phrase">報道</span>',pages:[9,10,11],
      visual:()=>`<div class="visual-stack">${atlas('100% 0%','スマートフォンに表示された取材ニュース','stat-illustration')}${reveal(1,`<section class="panel stat-center"><h2>ニュース報道成功率</h2>${metric(94,'％')}<p>直近50件の取材相談実績・自社集計</p><div class="stat-pair"><span>取材相談50件</span><span>うち報道47件</span></div></section>`)}</div>`,
      takeaway:'報道には審査があります。取材・原稿確認を経て掲載へ進みます',
      beats:[speech('正式に取材して伝える','会社の取り組みを、<br><strong>大手ネットニュースで報道します</strong>'),speech('これまでの報道実績','直近50件の取材相談で<br><strong>47件が報道に</strong>','blue'),speech('メディくるクレジット（MC）','施策に使うMCを確保して着手<br><strong>取材から最短2週間で掲載へ</strong>')]
    },
    {
      id:'spread',short:'報道された実績をPRする',eyebrow:'ニュースとして報道された、その後に',title:'報道された実績を<br>プレスリリースで広める',pages:[17,12,13],
      visual:()=>`<div class="flow-grid">${reveal(0,`${icon('news')}<b>御社の強みを<br>ニュースで報道</b>`,'flow-card wide')}${reveal(1,`${icon('distribution')}<b>掲載実績をPR</b><small>報道された事実を御社からも発信</small>`,'flow-card')}${reveal(2,`${icon('reputation')}<b>関連メディアへ</b><small>会社と経営者の魅力を詳しく</small>`,'flow-card')}</div>`,
      takeaway:'取材記事として報道された実績を、御社のPRにも活かします',
      beats:[speech('まず、強みを取材記事で報道','私たちが取材した御社の強みを、<br><strong>大手ネットニュースで伝えます</strong>'),speech('次に、報道された実績を御社からも','ニュースで報道された実績を、<br><strong>プレスリリースで広く発信</strong>','blue'),speech('報道を、さらに知ってもらうきっかけへ','記事URLや取り組みの背景を伝え、<br><strong>会社の魅力を知る接点を増やす</strong>')]
    },
    {
      id:'prospects',short:'報道実績を関連メディアへ',eyebrow:'ニュース報道を、会社と経営者を知るきっかけに',title:'報道された会社として<br>会社と経営者の魅力を伝える',pages:[14,12],
      visual:()=>`<div class="related-media-grid">${reveal(0,`${icon('reputation')}<small>会社・サービスを知る</small><h2>みんなの評判.com</h2><p>特徴・取り組み・選ばれる理由を<br>会社の紹介記事で伝える</p>`,'related-media-card')}${reveal(1,`${icon('executive_article')}<small>経営者の考えを知る</small><h2>社長の取材.com</h2><p>事業を始めた背景や、<br>大切にしている考えを伝える</p>`,'related-media-card')}</div>`,
      takeaway:'報道された実績を起点に、比較中の人にも新しい見込み客にも、御社の情報を届けます',
      beats:[speech('会社の強みを、より詳しく','みんなの評判.comで、<br><strong>報道された会社の魅力を紹介</strong>'),speech('経営者の思いや背景も','社長の取材.comで、<br><strong>経営者の経験や考えを記事に</strong>','blue'),speech('お客様が知りたい情報へ','調べて比較している人にも、<br><strong>まだ御社を知らない人にも</strong>')]
    },
    {
      id:'case',short:'集客に変化が出た事例',eyebrow:'ゆうきや整体院・木野竜太郎院長の事例',title:'伝え方が変わると<br>集客にも変化が',pages:[19,20],
      visual:()=>`<div class="visual-stack">${panel(`<div class="icon-row">${icon('news')}${icon('video')}<h2 class="visual-title">取材ニュース<br>＋漆沢との動画対談</h2></div>`)}${reveal(1,`<div class="case-metrics"><div><label>比較前の平均CPA</label><b>19,277<span>円</span></b></div><div><label>比較後の平均CPA</label><b>約13,965<span>円</span></b></div></div>`)}${reveal(2,`<div class="case-result"><h3>広告費あたりの顧客獲得効率</h3>${metric(1.38,'倍','',2)}</div>`)}<p class="case-note">同院提供の月別CPAの単純平均を比較。取材ニュース・対談と既存広告を組み合わせた事例です。</p></div>`,
      takeaway:'CPAは、お客様1人の獲得にかかった広告費です',
      beats:[speech('会社の強みと人柄を伝える','ニュース記事と動画対談で、<br><strong>来院前に院を知る機会を増加</strong>'),speech('広告費あたりの変化を見る','平均CPAが<br><strong>19,277円から約13,965円へ</strong>','blue'),speech('同じ広告費を活かしやすく','広告費あたりの顧客獲得効率が<br><strong>約1.38倍に</strong>')]
    },
    {
      id:'monitor',short:'専門メディア・検索・AIへ',eyebrow:'記事・企業情報を整え、競合とも比べて改善',title:'専門メディアから<br>SEO・AI検索対策へ',pages:[15,16,22,23,24,26],
      visual:()=>`<div class="visual-stack"><img class="natural-illustration" src="${ASSET}illustrations/ai-consultation.png" alt="情報とAIの回答を調べて分析している担当者" width="1536" height="1024">${panel(`<div class="icon-row">${icon('monitor')}<h2>競合分析・月次レポート</h2></div>${metric(300,'MC／月','compact turquoise')}<p>自社＋競合3社<br>最大30の質問で比較</p>`,'blue')}</div>`,
      takeaway:'専門記事・HP・FAQを整え、検索・AIでの紹介や引用と、確認できる集客データを見ます',
      beats:[speech('業界に合う情報を伝える','専門メディアの記事で、<br><strong>お客様の疑問に答える情報を</strong>'),speech('検索で見つかり、伝わるように','記事・HP・FAQを整えて、<br><strong>SEO・AI検索対策を進める</strong>','blue'),speech('自社と競合を比べて改善','自社と競合3社を毎月分析し、<br><strong>次の施策を一緒に選びます</strong>')]
    },
    {
      id:'menu-a',short:'12施策：取材・情報・記事',eyebrow:'企業の成長エンジン メディくるブースト',title:'12の施策から<br>今、必要なものを選ぶ',pages:[26],
      visual:()=>menuGrid(menuA),takeaway:'取材ニュース・AI検索対策整理・競合分析を軸に、課題に合わせて組み合わせます',
      beats:[speech('基本の3施策で土台を整える','取材ニュース・AI検索対策整理・月次分析<br><strong>3つの基本施策から進めます</strong>'),speech('専門性を記事で伝える','業種に合ったテーマで<br><strong>業界の専門媒体向け記事を制作</strong>','blue'),speech('会社と経営者も伝える','企業・サービスの紹介と、経営者の考えを<br><strong>関連メディアの記事へ</strong>')]
    },
    {
      id:'menu-b',short:'12施策：制作・調査・相談',eyebrow:'企業の成長エンジン メディくるブースト',title:'記事だけでなく<br>制作も、調査も、相談も',pages:[27,28],
      visual:()=>menuGrid(menuB),takeaway:'動画対談は条件によりラジオ出演も相談可能。出演可否・放送枠・費用は個別確認です',
      beats:[speech('伝わるコンテンツをつくる','<strong>動画対談やストーリーLP</strong>で、<br>御社の背景まで伝える'),speech('発信する話題を増やす','<strong>アンケート・調査PR</strong>と<br>PR TIMESへの追加配信','blue'),speech('次の成長の選択肢も','<strong>役員への事業戦略相談</strong>や<br>社長名のWikipedia記事準備')]
    },
    {
      id:'monthly',short:'月額と毎月のMC',eyebrow:'基本は月額10万円・6か月契約',title:'毎月の予算を<br>選べる施策に変える',pages:[30,31],
      visual:()=>`<div class="visual-stack">${panel(`<h2>広報PR戦略パートナー</h2><div class="monthly-price"><span class="prefix">月額</span>${metric(10,'万円')}</div><p class="price-note">税別／税込11万円・6か月契約</p><p>毎月<strong>1,000MC</strong>を付与</p>`,'pink')}${reveal(1,`<div class="credit-equation"><div><label>毎月付与</label><b>1,000<span>MC</span></b></div><span>−</span><div><label>分析</label><b>300<span>MC</span></b></div><span>＝</span><div class="remaining"><label>施策へ</label><b>700<span>MC</span></b></div></div>`)}${reveal(2,panel('<h3>初月は、情報整理から</h3><p>情報整理600MC＋分析300MC<br><strong>初月の残りは100MC</strong></p>','blue'))}</div>`,
      takeaway:'ニュースは3,000MC。必要MCの確保と着手時期を一緒に相談します',
      beats:[speech('予算を施策に変える','月額10万円（税込11万円）で<br><strong>毎月1,000MCを付与</strong>'),speech('分析を続けながら選ぶ','毎月の分析300MCを使い、<br><strong>残り700MCを次の施策へ</strong>','blue'),speech('最初に土台を整える','初月は情報整理<span class="phrase">600MCも使い、</span><br><strong>残り100MCからスタート</strong>')]
    },
    {
      id:'prepay-six',short:'55万円で6,000MC',eyebrow:'施策を早く進めたい場合の、先行購入',title:'6か月分を先に確保<br>同じMCをお得に',pages:[32],
      visual:()=>`<div class="visual-stack"><div class="compare-boxes">${panel(`<h3>月払いで6か月</h3>${metric(66,'万円')}<p>税込／6,000MC</p>`)}${reveal(1,panel(`<h3>6か月分を一括</h3>${metric(55,'万円')}<p>税込／6,000MC</p>`,'pink'))}</div>${reveal(2,`<div class="saving-band"><span>同じ6,000MCで</span>${metric(11,'万円お得','turquoise')}</div>`)}</div>`,
      takeaway:'月払いは税別60万円、一括は税別50万円。税込で11万円の差です',
      beats:[speech('月払いで貯める場合','税込11万円×6か月で<br><strong>税込66万円・6,000MC</strong>'),speech('最初から配分したい場合','一括なら<strong>税込55万円</strong>で<br>同じ6,000MCを先に確保','blue'),speech('早く始める施策を選べる','<strong>税込11万円お得</strong>に、<br>取材や制作の着手を相談')]
    },
    {
      id:'prepay-ten',short:'88万円で10,000MC',eyebrow:'取り組む施策を、さらに広げたい方へ',title:'施策を広く進めるなら<br>10,000MCを先に確保',pages:[32],
      visual:()=>`<div class="visual-stack"><div class="compare-boxes">${panel(`<h3>通常購入の換算額</h3>${metric(110,'万円')}<p>税込／10,000MC</p>`)}${reveal(1,panel(`<h3>先行購入なら</h3>${metric(88,'万円')}<p>税込／10,000MC</p>`,'pink'))}</div>${reveal(2,`<div class="saving-band"><span>通常購入換算から</span>${metric(22,'万円お得','turquoise')}</div>`)}</div>`,
      takeaway:'通常の追加購入は1,000MC＝税別10万円（税込11万円）です',
      beats:[speech('通常購入の換算では','10,000MCは<br><strong>税込110万円相当</strong>'),speech('先に確保する場合','一括<strong>税込88万円</strong>で、<br>10,000MCを取得','blue'),speech('施策の選択肢を広げる','通常購入換算から<br><strong>税込22万円お得</strong>')]
    },
    {
      id:'allocation-six',short:'6,000MCの基本配分',eyebrow:'6か月分の、組み合わせ例',title:'初回6か月の<br>基本の組み合わせ',pages:[33],
      visual:()=>`<div class="visual-stack"><div class="allocation">${reveal(0,allocationRow('news','取材ニュース・<br>掲載実績PR','3,000'))}${reveal(1,allocationRow('search','企業情報・<br>AI検索対策整理','600'))}${reveal(2,allocationRow('monitor','<span class="allocation-label-phrase">競合分析・</span><wbr><span class="allocation-label-phrase">月次レポート</span><br>6か月分','1,800'))}${reveal(2,allocationRow('reputation','みんなの評判.com・<br>社長の取材.com 各1本','600'))}</div><div class="mc-total"><span>合計</span>${metric(6000,'MC','compact')}</div></div>`,
      takeaway:'3,000＋600＋1,800＋600＝6,000MC。ニュース2記事目の特典は別枠です',
      beats:[speech('御社の強みを報道へ','取材ニュース・掲載実績PRに<br><strong>3,000MC</strong>'),speech('最初に企業情報を整える','企業情報・AI検索対策整理に<br><strong>600MC</strong>','blue'),speech('6か月の分析と記事で広げる','<span class="phrase">分析300MC×6か月</span><wbr><span class="phrase">＝1,800MC</span>＋<span class="phrase">関連2記事600MC</span><br><strong>合計6,000MCで配分</strong>')]
    },
    {
      id:'allocation-ten',short:'10,000MCの活用例',eyebrow:'基本の施策に、LP制作を組み合わせる',title:'LPまで進める<br>10,000MCの活用例',pages:[33],
      visual:()=>`<div class="visual-stack"><div class="allocation">${reveal(0,allocationRow('news','6か月の基本セット','6,000'))}${reveal(1,allocationRow('story_lp','オリジナル<br>ストーリーLP','3,000'))}</div>${reveal(1,`<div class="mc-total"><span>合計9,000MC<br>残り</span>${metric(1000,'MC','compact turquoise')}</div>`,'budget-total')}${reveal(2,panel('<h3>役員相談60分も加えるなら</h3><p>合計10,500MC → 500MCを追加<br><strong>追加分は税込55,000円</strong></p>','blue'),'budget-extra')}</div>`,
      takeaway:'基本6,000MC＋LP3,000MC＋役員相談1,500MC＝10,500MCです',
      beats:[speech('土台となる施策を実施','まずは6か月の基本セットに<br><strong>6,000MCを配分</strong>'),speech('強みを伝えるLPも制作','LPに3,000MCを使い、<br><strong>合計9,000MC・残り1,000MC</strong>','blue'),speech('さらに事業戦略も相談したい','役員相談60分を加えるなら<br><strong>500MCを追加で確保</strong>')]
    },
    {
      id:'bonus',short:'初回・当日契約の特典',eyebrow:'初回の55万円・88万円一括購入が対象',title:'初回・商談当日の一括で<br>ニュースがもう1本',pages:[34],
      visual:()=>`<div class="visual-stack"><div class="bonus-card">${icon('news')}<h2>ニュース2記事目専用</h2>${metric(3000,'MC')}<p>税込33万円相当</p><div class="tag-list"><span>初回55万円一括</span><span>初回88万円一括</span></div></div>${reveal(2,'<p class="bonus-terms">通常のMC残高とは別枠です。月払い・更新契約は対象外です。</p>')}</div>`,
      takeaway:'2記事目専用3,000MCは、LP・相談などほかの施策には使いません',
      beats:[speech('1記事目は通常残高から','取材ニュース1記事目に<br><strong>通常の3,000MCを使用</strong>'),speech('別のテーマを、もう1本','初回・商談当日の一括購入で<br><strong>ニュース2記事目専用3,000MC</strong>','blue'),speech('特典はニュース専用','<strong>自由に使える残高には合算せず</strong><br>ニュース2記事目へ活用')]
    },
    {
      id:'survey',short:'調査PRと追加配信の条件',eyebrow:'対象・人数・設問数から、調査を設計',title:'調査の目的に合わせ<br>回答人数から設計する',pages:[27,28],
      visual:()=>`<div class="visual-stack">${panel(`<div class="icon-row">${icon('survey')}<h2>アンケート・調査PR</h2></div>${metric(3000,'MC〜','compact')}<p>回答人数・対象・設問数などで<br>個別にお見積もり</p>`,'pink')}${reveal(1,panel(`<h3>調査パネルの規模</h3><p>全国約${metric(700,'万人','compact turquoise')}</p><small>パネル全体の人数です。<br><span class="survey-note-phrase">1回の調査の回答人数ではありません。</span></small>`,'blue'))}${reveal(2,panel('<h3>PR TIMES追加配信</h3><p><strong>300MC＋媒体実費</strong><br>取材ニュース・調査PRに追加</p>'))}</div>`,
      takeaway:'調査・集計・結果の解説・DreamNews配信を含む見積目安です',
      beats:[speech('何を明らかにしたいか','調査の目的から、対象と設問、<br><strong>目標の有効回答数を決定</strong>'),speech('パネル規模と回答数を分ける','約700万人規模のパネルから、<br><strong>御社の調査条件を設計</strong>','blue'),speech('発信先も組み合わせる','基本の配信に加え、必要なら<br><strong>PR TIMES追加配信を選択</strong>')]
    },
    {
      id:'future',short:'会社の成長に向けた相談',eyebrow:'強み・集客導線・必要な施策を、役員と相談',title:'会社の成長に向けて<br>次の施策を一緒に考える',pages:[7,24,27,33],
      visual:()=>`<div class="visual-stack"><div class="future-grid">${reveal(0,'<span class="future-number">01</span><b>強みを<br>言葉に</b>','flow-card')}${reveal(0,'<span class="future-number">02</span><b>集客の<br>導線を整理</b>','flow-card')}${reveal(1,'<span class="future-number">03</span><b>ストーリーLP<br>で伝える</b>','flow-card')}${reveal(1,'<span class="future-number">04</span><b>アンケート調査<br>で知る</b>','flow-card')}</div>${reveal(2,panel(`<div class="icon-row">${icon('strategy')}<h3>役員1名とのマンツーマン</h3></div><p><strong>60分・1,500MC</strong><br>漆沢祐樹・竹之内教博・安藤功一郎</p>`,'blue'))}</div>`,
      takeaway:'集客・発信・改善の優先順位を、御社の強みと課題から一緒に整理します',
      beats:[speech('今、優先する課題は何か','御社の強みや集客の導線を見て、<br><strong>最初に整えることを相談</strong>'),speech('LP・調査も、目的に合わせて','ストーリーLPやアンケート調査を、<br><strong>課題に合う選択肢として考える</strong>','blue'),speech('役員1名とのマンツーマン','経営の経験を持つ役員に、<br><strong>60分・1,500MCで相談</strong>')]
    },
    {
      id:'start',short:'最初の施策を一緒に決める',eyebrow:'メディくるは、御社の広報PR戦略パートナーです',title:'御社の強みを<br>次の成長につなげる',pages:[24,25,35],
      visual:()=>`<div class="visual-stack"><div class="next-path">${reveal(0,'<span>01</span><div><b>優先する課題</b><small>何を、誰に伝えるか</small></div>','path-step')}${reveal(1,'<span>02</span><div><b>施策とMCの配分</b><small>必要な制作・発信・分析を選ぶ</small></div>','path-step')}${reveal(2,'<span>03</span><div><b>着手時期と進め方</b><small>取材・公開・確認の予定を決める</small></div>','path-step')}</div><a class="resource-button" href="${PDF}" target="_blank" rel="noopener">詳しいAI要約用資料を開く</a></div>`,
      takeaway:'詳しい資料はAIで自由に要約し、知りたいことをご質問ください',
      beats:[speech('まずは、御社の強みから','御社が選ばれてきた場面から、<br><strong>取材で伝えるテーマを整理</strong>'),speech('選ぶだけで終わらせない','取材・制作・発信・分析を、<br><strong>戦略から実行・改善まで支援</strong>','blue'),speech('6か月の進め方を具体的に','施策・MC配分・開始時期を、<br><strong>一緒に決めましょう</strong>')]
    }
  ];

  const numberRuns=new WeakMap();
  function animateNumbers(root){
    root.querySelectorAll('[data-count]').forEach(el=>{
      if(el.closest('.is-hidden,.is-upcoming,.is-compact-hidden')){
        if(numberRuns.has(el))cancelAnimationFrame(numberRuns.get(el));
        numberRuns.delete(el);delete el.dataset.done;
        el.textContent=fmt(Number(el.dataset.count),Number(el.dataset.decimals||0));
        return;
      }
      if(el.dataset.done)return;
      el.dataset.done='true';
      const target=Number(el.dataset.count),decimals=Number(el.dataset.decimals||0),final=fmt(target,decimals);
      el.style.minWidth=final.length+'ch';
      if(reduced){el.textContent=final;return;}
      el.textContent=fmt(0,decimals);el.classList.add('number-pop');
      const entrance=el.closest('.is-revealed');
      const delay=entrance?Number.parseFloat(entrance.style.getPropertyValue('--enter-delay'))||0:0;
      const beginning=performance.now()+delay,duration=650;
      function tick(now){if(!el.isConnected)return;const p=Math.max(0,Math.min(1,(now-beginning)/duration)),eased=1-Math.pow(1-p,3);el.textContent=fmt(target*eased,decimals);if(p<1)numberRuns.set(el,requestAnimationFrame(tick));else{el.textContent=final;numberRuns.delete(el);}}
      numberRuns.set(el,requestAnimationFrame(tick));
    });
  }
  const reference=id=>referenceScenes.find(scene=>scene.id===id);
  const local='assets/';
  const plainName=name=>name.replace(/<br>/g,'');
  const overviewFlow=()=>`<div class="service-flow">${[
    ['news','強みを取材','大手ニュースで報道'],['distribution','報道実績をPR','プレスリリースで発信'],['reputation','接点を増やす','関連・専門メディアへ'],['search','検索・AIへ','企業情報を整える'],['monitor','分析と改善','競合と比べて次の一手へ']
  ].map(([i,name,desc],n)=>reveal(Math.min(n,2),`${icon(i)}<b>${name}</b><small>${desc}</small>`,'service-flow-item')).join('')}</div>`;
  const questionCard=(n,title,text)=>reveal(n,`<span class="question-no">0${n+1}</span><h2>${title}</h2><p>${text}</p>`,'question-card');
  const mainScenes=[
    {
      id:'cover',short:'サービスご提案資料',eyebrow:'',title:'ニュース掲載を選ばれる理由に',pages:[1],
      visual:()=>`<div class="sales-cover"><div class="cover-copy"><p class="cover-kicker">サービスご提案資料</p><h2>ニュース掲載を<br>選ばれる理由に</h2><p class="cover-description">大手ネットニュースを活用した<br>企業ブランディング</p><p class="cover-position">御社の広報PR戦略パートナーです</p></div><img src="${local}cover-interview.png" alt="経営者への取材から、ネットニュース・検索・AIへ広がる様子" width="1536" height="1024"></div>`,
      takeaway:'株式会社メディくる　｜　2026年11月',beats:[speech('サービスのご提案','')]
    },
    {
      id:'overview',short:'メディくるが支援すること',eyebrow:'サービスの全体像',title:'御社の強みを見つけ、報道し<br>選ばれる理由として広める',pages:[2,12,24,25],visual:overviewFlow,
      takeaway:'戦略づくりから、取材・制作・発信・分析・改善まで、ひとつの窓口で支援します',
      beats:[speech('強みを、伝わる言葉に','まずは御社を取材し、<strong>選ばれてきた理由を整理</strong>します'),speech('取材した強みを報道へ','その強みを<strong>大手ネットニュースで報道</strong>し、掲載実績を広めます','blue'),speech('報道されて、終わりではない','検索・AI・関連メディアまで、<strong>知ってもらう接点を育てます</strong>')]
    },
    {
      id:'team',short:'取材と戦略を支える3人',eyebrow:'メディくるのチーム',title:'<span class="title-clause">取材と事業戦略を</span><wbr><span class="title-clause">支える3人</span>',pages:[7,6,27],
      visual:()=>`<div class="team-grid">${[
        ['takenouchi-approved-original.jpg','取締役／「令和の虎」出演','竹之内 教博','りらくる創業者'],['urushizawa-approved-original.jpg','代表取締役・記者','漆沢 祐樹','上場企業4社の役員経験'],['ando-approved-smile.png','取締役／「令和の虎」出演','安藤 功一郎','海外市場を含む事業経営を経験']
      ].map(([src,role,name,desc],n)=>reveal(n,`<figure><div class="team-photo person-${n}"><img src="${local+src}" alt="${name}" loading="eager"></div><figcaption><small>${role}</small><h2>${name}</h2><p>${desc}</p></figcaption></figure>`,'team-person')).join('')}</div>`,
      takeaway:'取材は代表の漆沢が担当。事業戦略の相談と、施策の制作・実行をつなぎます',
      beats:[speech('経営の経験から考える','事業を育ててきた経験を、<strong>御社の強みと次の施策に活かします</strong>'),speech('代表記者が直接取材','漆沢は<strong>500社以上の経営者を取材</strong>。御社の魅力を引き出します','blue'),speech('相談も、実行につなぐ','役員への相談と、<strong>制作・発信・分析の施策を組み合わせます</strong>')]
    },
    {
      id:'audiences',short:'2つの見込み客への接点',eyebrow:'選ばれるために、誰に伝えるか',title:'比較しているお客様にも<br>まだ御社を知らないお客様にも',pages:[4,2,15,16],
      visual:()=>`<div class="audience-grid"><div class="audience-card">${atlas('0% 100%','会社の情報を調べて比較するお客様','audience-art')}<small>御社を知り、比較している人</small><h2>選ぶ決め手を伝える</h2><p>会社名で調べた先に、<br>御社ならではの強みを</p></div><div class="audience-card">${atlas('100% 100%','課題や希望から企業を探すお客様','audience-art')}<small>御社をまだ知らない人</small><h2><span class="audience-phrase">新しく知る</span><wbr><span class="audience-phrase">接点をつくる</span></h2><p>課題やサービスを探すときに、<br>御社の情報に出会えるように</p></div></div>`,
      takeaway:'今ある見込み客の取りこぼしを減らし、新しい見込み客との接点を増やします',
      beats:[speech('比較の中で選ばれるために','価格だけでなく、<strong>御社を選ぶ理由が分かる情報</strong>を届けます'),speech('新しく知ってもらうために','ニュース・専門記事・検索・AIなど、<strong>会社を知る接点を増やします</strong>','blue'),speech('御社は、どちらを重点的に？','既存の見込み客と新しい見込み客。<strong>今の課題から優先順位を考えます</strong>')]
    },
    {
      id:'hearing',short:'選ばれてきた理由を伺う',eyebrow:'御社の言葉を伺って、伝える強みを見つける',title:'お客様が御社を選んだ理由を<br>聞かせてください',pages:[5,6],
      visual:()=>`<div class="question-grid">${questionCard(0,'選ばれたきっかけは？','お客様は、何を期待して<br>御社に相談していますか')}${questionCard(1,'他社との違いは？','仕事の進め方や実績に、<br>どんな工夫がありますか')}${questionCard(2,'これから伝えたいことは？','もっと知ってほしいサービスや<br>新しい取り組みはありますか')}</div>`,
      takeaway:'うまく言葉になっていなくても大丈夫です。具体的な仕事やお客様の声から伺います',
      beats:[speech('まずは、最近のお客様の話から','「なぜ御社を選んだのか」。<strong>実際の場面からお聞かせください</strong>'),speech('当たり前の工夫も、強みに','続けてきた取り組みや判断に、<strong>御社ならではの価値があります</strong>','blue'),speech('誰に、何を伝えるかを整理','取材で深掘りするテーマと、<strong>届けたい相手を一緒に考えます</strong>')]
    },
    {...reference('strengths'),id:'comic-interview',short:'漫画：取材で強みを引き出す',eyebrow:'ここから、取材と発信の流れをご説明します',title:'御社の強みを<br>取材で引き出す',beats:[speech('社長のお話を伺う','「私たちの強みは、どこにあるのでしょう？」'),speech('代表記者が深掘り','経営と取材の経験から、<strong>お客様に伝える魅力を引き出します</strong>','blue'),speech('記事としてまとめる','会社の取り組みと強みを、<strong>伝わるニュース記事にします</strong>')]},
    {...reference('reporting'),id:'comic-reporting',short:'漫画：強みをニュースで報道',beats:[speech('取材した御社の強みを','<strong>大手ネットニュースで報道します</strong>'),speech('これまでの相談・報道実績','直近50件の取材相談で<strong>47件が報道に</strong>。ニュース報道成功率94％です','blue'),speech('取材から掲載まで','必要なMCを<span class="phrase">確保して着手し、</span><br><strong><span class="phrase">取材から最短2週間で</span><wbr><span class="phrase">掲載へ</span></strong>')]},
    {
      id:'comic-spread',short:'漫画：報道実績を広める',eyebrow:'報道された実績を、次の接点へ',title:'<span class="title-clause">報道されて</span><wbr><span class="title-clause">終わりではありません</span>',pages:[10,13,14,15,16],
      visual:()=>`<div class="reporting-path">${reveal(0,`${icon('distribution')}<h2>報道実績をPR</h2><p>ニュースで報道された実績を<br>プレスリリースで広める</p>`,'reporting-node')}${reveal(1,`${icon('reputation')}<h2>関連・専門メディアへ</h2><p>みんなの評判.com・社長の取材.comや、<br>約100の業種別メディアから、<br>御社に合う媒体へ</p>`,'reporting-node')}${reveal(2,`${icon('search')}<h2>SEO・AI検索対策</h2><p>人にもAIにも強みを伝え<br>競合と比べて継続改善</p>`,'reporting-node')}</div>`,
      takeaway:'報道された実績を、お客様が選ぶ際の安心・信頼につなげます',
      beats:[speech('御社のHP・LPでも紹介できます','<span class="phrase">「大手ネットニュースで</span><wbr><strong class="phrase">取材・報道されました」</strong>'),speech('会社と経営者の魅力を、さらに詳しく','報道された会社として、<strong>関連・専門メディアの記事へ展開</strong>します','blue'),speech('調べられたときにも、探されたときにも','企業情報や記事を整え、<strong>検索・AIで伝わる状態へ改善</strong>します')]
    },
    {
      id:'diagnosis',short:'継続分析から次の施策を決める',eyebrow:'継続的なブランディングを、分析で支える',title:'報道・発信の変化を数値で確認し<br>次の施策を決める',pages:[3,21,22,23],
      visual:()=>`<div class="diagnosis-sheet"><div class="diagnosis-lead">${icon('monitor')}<div><small>自社と競合の変化を、継続して確認</small><h2>スコアを、次の施策選びに活かす</h2></div></div><div class="check-list">${reveal(0,'<b>検索・AIの引用</b><span>どの情報が根拠になっているか</span>','check-row')}${reveal(1,'<b>競合との違い</b><span>引用される媒体や、強みの根拠</span>','check-row')}${reveal(2,'<b>実行後の変化</b><span>不足を補う施策を選び、結果を比べる</span>','check-row')}</div></div>`,
      takeaway:'開始時を基準に、競合比較・施策・確認を重ねます。無料相談では、御社の強みと検索・AIでの見つかり方を一緒に確認します。',
      beats:[speech('開始時と、施策後を比べる','スコアや検索・AIでの紹介・引用状況から、<strong>発信後の変化を継続して確認</strong>します'),speech('競合が引用される情報を調べる','媒体や記事、強みの根拠を比べ、<strong>自社に足りない情報を探します</strong>','blue'),speech('分析から、次の施策へ','調査PR・専門記事・LPなど、<strong>課題とMC残高に合わせて選び、改善します</strong>')]
    },
    {
      id:'kino',short:'木野院長の事例',eyebrow:'ゆうきや整体院・木野竜太郎院長',title:'ブランディングを強化し<br>集客に変化が',pages:[19,20],
      visual:()=>`<div class="kino-case"><figure><img src="${local}kino-approved.jpg" alt="ゆうきや整体院 木野竜太郎院長" width="683" height="1024"><figcaption>木野 竜太郎 院長<br><small>ゆうきや整体院</small></figcaption></figure><div class="kino-results">${reveal(0,`<div class="case-method">${icon('news')}${icon('video')}<div><b>取材ニュース＋漆沢との動画対談</b><p>会社の強みと、院長の人柄を発信</p></div></div>`)}${reveal(1,`<div class="case-metrics"><div><label>比較前の平均CPA</label><b>19,277<span>円</span></b></div><div><label>比較後の平均CPA</label><b>約13,965<span>円</span></b></div></div><div class="case-result"><h3>広告費あたりの顧客獲得効率</h3>${metric(1.38,'倍','',2)}</div>`)}${reveal(2,'<div class="case-growth"><span>予約待ち：1か月になることも → 2.5か月へ</span><span>広告以外の自然流入からの新規問い合わせも増加</span></div>')}<p class="case-note">同院提供の月別CPAの単純平均を比較。取材ニュース・対談と既存広告を組み合わせた事例です。</p></div></div>`,
      takeaway:'CPAは、お客様1人の獲得にかかった広告費です',
      beats:[speech('強みと人柄を、来院前に伝える','ニュース記事と動画対談で、<strong>院を知る機会を増やしました</strong>'),speech('広告費あたりの変化を見る','平均CPAは19,277円から約13,965円へ。<strong>顧客獲得効率は約1.38倍に</strong>','blue'),speech('問い合わせの接点にも変化','予約待ちの期間や、<strong>自然流入からの新規問い合わせにも変化</strong>が出ています')]
    },
    {
      id:'story-lp',short:'ストーリーLPで強みを伝える',eyebrow:'報道された強みを、選ぶ決め手へ',title:'御社ならではの背景と強みを<br>ストーリーLPで伝える',pages:[24,27,33],
      visual:()=>`<div class="lp-layout"><div class="lp-preview">${icon('story_lp')}<p>御社の強みを伝えるページ</p><h2>なぜ、この会社を<br>選ぶのか</h2><div class="lp-block">強み・生まれた背景</div><div class="lp-block">取材記事・取り組み・実績</div><div class="lp-block accent">相談・問い合わせへ</div></div><div class="lp-value">${reveal(0,'<h2>伝える内容を整理</h2><p>御社の背景と、選ばれる理由を<br>ひとつの流れで伝える</p>')}${reveal(1,'<h2>記事からの接点をつなぐ</h2><p>知って終わりにせず、<br>サービスを理解するページへ</p>')}${reveal(2,`<h2>オリジナルストーリーLP</h2>${metric(3000,'MC','compact')}`)}</div></div>`,
      takeaway:'ページの内容と役割を、御社のサービスと集客導線に合わせて設計します',
      beats:[speech('強みを、まとまった流れで','事業の背景や取り組みを、<strong>御社ならではのストーリーに</strong>します'),speech('比較中のお客様の、決め手に','取材や報道で知ったお客様が、<strong>サービスを詳しく理解できるページへ</strong>','blue'),speech('必要なタイミングで制作','オリジナルストーリーLPは<strong>3,000MC</strong>。施策と組み合わせます')]
    },
    {
      id:'survey-pr',short:'アンケート調査からPRする',eyebrow:'お客様・市場の声を、次の発信に活かす',title:'調査で知り、数字で伝える<br>アンケート・調査PR',pages:[27,28],
      visual:()=>`<div class="survey-process">${reveal(0,`${icon('survey')}<h2>知りたいことを設計</h2><p>対象・設問・有効回答数を<br>目的に合わせて決める</p>`,'survey-step')}${reveal(1,`${icon('monitor')}<h2>集計し、読み解く</h2><p>お客様や市場の声から<br>伝えるテーマを見つける</p>`,'survey-step')}${reveal(2,`${icon('distribution')}<h2>調査結果をPR</h2><p>結果を解説し<br>プレスリリースで発信</p>`,'survey-step')}</div><div class="survey-summary"><span>調査PR <b>3,000MC〜</b>・個別見積</span><small>約700万人規模の調査パネル。1回の調査の回答人数は目的に合わせて設計します。</small></div>`,
      takeaway:'対象・回答人数・設問数などで見積もります。詳細条件は補足資料で確認できます',
      beats:[speech('発信の前に、お客様を知る','御社が明らかにしたいことから、<strong>調査内容を設計</strong>します'),speech('数字を、伝えるテーマへ','調査結果を集計・解説し、<strong>サービスや市場への理解を深めます</strong>','blue'),speech('調査結果を、広く発信','プレスリリースを組み合わせ、<strong>御社を知る新たな接点に</strong>します')]
    },
    {
      id:'boost-menu',short:'メディくるブースト・12施策',eyebrow:'企業の成長エンジン メディくるブースト',title:'12の施策を<br>課題に合わせて選ぶ',pages:[26,27],
      visual:()=>`<div class="boost-grid">${boostMenu.map(([i,name,,,required],n)=>reveal(Math.min(2,Math.floor(n/4)),`${icon(i)}<b>${name}</b>${required?'<small>基本施策</small>':''}`,'boost-item item-'+i)).join('')}</div>`,
      takeaway:'各施策の必要MCと詳しい内容は、補足の施策一覧で確認できます',
      beats:[speech('基本の3施策を軸に','取材ニュース・AI検索対策整理・月次分析を、<br><strong>3つの基本施策として進めます</strong>'),speech('制作・発信を組み合わせる','企業情報・記事・LP・調査・動画から、<strong>目的に合う施策を選びます</strong>','blue'),speech('予算と順番を一緒に考える','すべてを一度に行うのではなく、<strong>今、優先する施策から進めます</strong>')]
    },
    {...reference('monthly'),beats:[speech('メディくるクレジット（MC）','月額10万円（税込11万円）で、施策に使う<strong>1,000MCを毎月付与</strong>します'),...reference('monthly').beats.slice(1)]},
    reference('allocation-six'),
    {...reference('start'),title:'御社が最初に取り組む施策を<br>一緒に決めましょう',takeaway:'必要に応じて、一括購入・特典・各施策の詳細を補足資料で確認できます'}
  ];
  const supplements=['menu-a','menu-b','prepay-six','prepay-ten','allocation-ten','bonus','survey','future'].map(reference);
  const scenes=[...mainScenes,...supplements];
  const MAIN_COUNT=mainScenes.length;
  const layouts={cover:'cover',overview:'wide',team:'wide',audiences:'wide',diagnosis:'wide',hearing:'wide','comic-spread':'wide',kino:'wide','story-lp':'wide','survey-pr':'wide','boost-menu':'wide',
    interviewer:'reverse',monitor:'reverse',future:'reverse','menu-a':'menu','menu-b':'menu',monthly:'monthly','prepay-six':'comparison','prepay-ten':'comparison','allocation-six':'allocation','allocation-ten':'allocation',survey:'survey',start:'path'};
  const compactLayouts=new Set(['wide','menu','monthly','comparison','allocation','survey','path','split','reverse']);
  const mobilePointLabels={
    overview:['強みを言葉に','報道とPR','接点を育てる'],team:['経営の経験','直接取材','相談と実行'],audiences:['比較中の人','新たな接点','優先順位'],diagnosis:['施策前後を比較','競合の引用元','次の施策へ'],hearing:['選ばれた理由','普段の工夫','伝える相手'],
    'comic-spread':['報道実績PR','メディアへ','検索とAI'],kino:['強みと人柄','CPAの変化','新たな接点'],'story-lp':['ストーリー','選ぶ決め手','制作の時期'],'survey-pr':['調査の設計','結果を解説','PRで発信'],'boost-menu':['基本の3施策','制作と発信','施策の順番'],
    'menu-a':['基本の3施策','専門性の記事','会社と経営者'],'menu-b':['動画とLP','調査と配信','経営相談'],monthly:['MCで選ぶ','毎月の分析','初月の整理'],'prepay-six':['月払い','一括購入','割引の違い'],'prepay-ten':['通常の換算','先行購入','選択肢を拡大'],'allocation-six':['ニュース','情報整理','分析と記事'],'allocation-ten':['基本の施策','LPの制作','経営相談'],survey:['調査を設計','パネル規模','追加配信'],start:['伝えたい強み','戦略と実行','進め方を決定']
  };

  // Keep photographs and the diagram's context in place. Reveal only the
  // explanation or value being introduced, without changing its allocated space.
  function prepareStepReveals(scene){
    const root=$('visual');
    const step=(el,n)=>{if(!el)return;el.classList.add('reveal');el.dataset.reveal=String(n);};
    const context=el=>{el.dataset.motionStatic='true';};
    if(['team','boost-menu'].includes(scene.id))root.querySelectorAll('[data-reveal]').forEach(context);
    if(scene.id==='overview')root.querySelectorAll('.service-flow-item').forEach(el=>{context(el);step(el.querySelector('small'),Number(el.dataset.reveal));});
    if(scene.id==='audiences')root.querySelectorAll('.audience-card').forEach((el,n)=>step(el.querySelector('p'),n));
    if(scene.id==='survey-pr')root.querySelectorAll('.survey-step').forEach(el=>{context(el);step(el.querySelector('p'),Number(el.dataset.reveal));});
    if(['allocation-six','allocation-ten'].includes(scene.id)){
      root.querySelectorAll('.allocation>.reveal').forEach(el=>{context(el);step(el.querySelector('.amount'),Number(el.dataset.reveal));});
      if(scene.id==='allocation-six')step(root.querySelector('.mc-total'),2);
    }
    if(scene.id==='monthly'){
      const first=root.querySelector('.visual-stack>.panel');
      if(first){step(first.querySelector('.monthly-price'),0);first.querySelectorAll(':scope>p').forEach(el=>step(el,0));}
    }
    if(['prepay-six','prepay-ten'].includes(scene.id)){
      root.querySelectorAll('.compare-boxes>.reveal').forEach(el=>{context(el);step(el.querySelector('.metric'),Number(el.dataset.reveal));step(el.querySelector('.panel>p'),Number(el.dataset.reveal));});
      step(root.querySelector('.compare-boxes>.panel>.metric'),0);
    }
    if(scene.id==='bonus'){step(root.querySelector('.bonus-card>.metric'),1);step(root.querySelector('.bonus-card>p'),1);}
  }
  // One pink focus follows the current explanation. Preserve every reveal,
  // photograph and click step; use a single meaningful graphic when available,
  // otherwise frame the paragraph being read. Never frame the whole slide.
  function updatePresenterFocus(scene){
    const stage=$('stage');
    stage.querySelectorAll('.presenter-focus').forEach(el=>{
      el.classList.remove('presenter-focus');delete el.dataset.presenterActive;
    });
    let target=null,kind='paragraph';
    if(scene.id==='cover'){
      target=$('visual').querySelector('.cover-description');kind='cover';
    }else{
      const candidates=Array.from($('visual').querySelectorAll('[data-reveal]')).filter(el=>
        Number(el.dataset.reveal)===state.step&&el.dataset.motionStatic!=='true'&&
        !el.closest('.is-hidden,.is-upcoming,.is-compact-hidden'));
      const leaves=candidates.filter(el=>!candidates.some(other=>other!==el&&el.contains(other)));
      if(leaves.length===1&&leaves[0].textContent.trim()){
        target=leaves[0];kind='visual';
      }
    }
    if(!target||!target.textContent.trim()){
      target=$('speech-stack').querySelector('.speech.is-current p');kind='paragraph';
    }
    if(target&&target.textContent.trim()){
      target.classList.add('presenter-focus');target.dataset.presenterActive='true';
      stage.dataset.focusKind=kind;stage.dataset.focusStep=String(state.step);
    }else{
      delete stage.dataset.focusKind;delete stage.dataset.focusStep;
    }
  }
  let stillEpoch=0;
  function presenterImageStatus(){
    const stage=$('stage');
    return Array.from(stage.querySelectorAll('img')).map(img=>{
      let opacity=1,visible=true;
      if(typeof window.getComputedStyle==='function'){
        for(let el=img;el&&el!==stage.parentElement;el=el.parentElement){
          const style=window.getComputedStyle(el);opacity*=Number(style.opacity||1);
          if(style.display==='none'||style.visibility==='hidden')visible=false;
        }
      }
      const expectedVisible=!img.closest('.is-hidden,.is-upcoming,.is-compact-hidden');
      const loaded=img.complete&&img.naturalWidth>0;
      return {src:img.getAttribute('src'),loaded:Boolean(loaded),naturalWidth:img.naturalWidth||0,naturalHeight:img.naturalHeight||0,expectedVisible,effectiveOpacity:Number(opacity.toFixed(3)),visible};
    });
  }
  function settleStillFrame(){
    if(!stillRender)return;
    const epoch=++stillEpoch,stage=$('stage');stage.dataset.qaSettled='false';
    const images=Array.from(stage.querySelectorAll('img'));
    const waits=images.map(img=>{
      if(img.complete)return Promise.resolve();
      return new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
    });
    if(document.fonts?.ready)waits.push(document.fonts.ready);
    Promise.all(waits).then(()=>{if(epoch!==stillEpoch)return;stage.dataset.qaSettled='true';});
  }
  function updateStep(animate=true,entering=false){
    const current=scenes[state.scene],allowAnimation=animate&&!reduced;
    $('speech-stack').querySelectorAll('[data-step]').forEach(el=>{
      const n=Number(el.dataset.step),active=n===state.step;
      const compact=$('speech-stack').classList.contains('compact-points');
      const wasVisible=el.dataset.presented==='true';
      const visible=compact?active:n<=state.step;
      el.classList.remove('is-future');el.classList.toggle('is-upcoming',n>state.step);el.classList.toggle('is-current',active);el.classList.toggle('is-compact-hidden',compact&&!active);
      el.classList.remove('is-new');
      if(visible&&allowAnimation&&(entering||!wasVisible)){void el.offsetWidth;el.classList.add('is-new');}
      el.dataset.presented=String(visible);
      el.setAttribute('aria-hidden',String(!visible));
    });
    let sequence=0;
    $('visual').querySelectorAll('[data-reveal]').forEach(el=>{
      const n=Number(el.dataset.reveal),active=n===state.step;
      const permanent=el.dataset.motionStatic==='true';
      const visible=permanent||n<=state.step,wasVisible=el.dataset.presented==='true';
      el.classList.remove('is-hidden','is-revealed','graphic-focus');
      el.classList.toggle('is-hidden',!visible);
      el.classList.toggle('is-active-graphic',active);el.setAttribute('aria-hidden',String(!visible));
      if(!permanent&&visible&&allowAnimation&&(entering||!wasVisible)){
        el.style.setProperty('--enter-delay',Math.min(sequence++*45,180)+'ms');
        void el.offsetWidth;el.classList.add('is-revealed');
      }
      el.dataset.presented=String(visible);
    });
    $('dots').innerHTML=current.beats.map((_,i)=>`<span class="${i===state.step?'current':i<state.step?'past':''}"></span>`).join('');
    $('speech-stack').querySelectorAll('[data-point-tab]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.pointTab)===state.step)));
    $('step-label').textContent=current.id==='cover'?'表紙':`説明 ${state.step+1} / ${current.beats.length}`;
    $('forward').disabled=(state.scene===scenes.length-1||state.scene===MAIN_COUNT-1)&&state.step===current.beats.length-1;
    $('forward').textContent=state.step===current.beats.length-1?'次のページ →':'次の説明 →';
    $('back').disabled=state.scene===0&&state.step===0;
    updatePresenterFocus(current);
    animateNumbers($('stage'));
    settleStillFrame();
  }
  const phoneTitles={
    overview:'御社の強みを報道し<br>選ばれる理由へ',
    team:'取材と事業戦略を<br>支える3人',
    audiences:'比較中のお客様にも<br>新しいお客様にも',
    diagnosis:'報道・発信の変化を<br>数値で確認する',
    hearing:'御社が選ばれた理由を<br>聞かせてください',
    'comic-reporting':'大手ネットニュースで<br>御社の強みを報道',
    kino:'ブランディングで<br>集客に変化が',
    'story-lp':'御社の強みを<br>ストーリーLPで伝える',
    'survey-pr':'調査で知り、広める<br>アンケート・調査PR',
    start:'最初に取り組む施策を<br>一緒に決めましょう',
    'menu-b':'記事も、制作も<br>調査も、相談も',
    bonus:'初回・当日の一括で<br>ニュースがもう1本',
    future:'会社の成長に向け<br>次の施策を考える'
  };
  function render(animate=true){
    const current=scenes[state.scene];
    $('stage').dataset.scene=current.id;
    const layout=layouts[current.id]||'split',compact=compactLayouts.has(layout);
    $('stage').dataset.layout=layout;
    $('scene-number').textContent=(state.scene>=MAIN_COUNT?'補足 ':'')+String(state.scene>=MAIN_COUNT?state.scene-MAIN_COUNT+1:state.scene+1).padStart(2,'0');
    $('scene-total').textContent=String(state.scene>=MAIN_COUNT?supplements.length:MAIN_COUNT).padStart(2,'0');
    $('eyebrow').textContent=current.eyebrow;$('title').innerHTML=phoneTitles[current.id]?`<span class="title-desktop">${current.title}</span><span class="title-mobile">${phoneTitles[current.id]}</span>`:current.title;
    $('visual').innerHTML=current.visual();
    prepareStepReveals(current);
    $('speech-stack').classList.toggle('compact-points',compact);
    const points=current.beats.map((b,i)=>`<section class="speech ${b.tone}" data-step="${i}"><span class="speaker"><span class="point-number" aria-hidden="true">0${i+1}</span>${b.speaker}</span><p>${b.text}</p></section>`).join('');
    $('speech-stack').innerHTML=compact?`<div class="point-tabs" aria-label="3つの説明">${current.beats.map((b,i)=>`<button type="button" data-point-tab="${i}" aria-pressed="${i===state.step}" aria-label="${b.speaker}" title="${b.speaker}"><span class="tab-number" aria-hidden="true">0${i+1}</span><span class="point-label-full">${b.speaker}</span><span class="point-label-short" aria-hidden="true">${mobilePointLabels[current.id]?.[i]||b.speaker}</span></button>`).join('')}</div><div class="point-body">${points}</div>`:points;
    $('speech-stack').querySelectorAll('[data-point-tab]').forEach(button=>button.addEventListener('click',()=>{state.step=Number(button.dataset.pointTab);updateStep();}));
    $('takeaway').textContent=current.takeaway;
    $('source-link').textContent='AI要約用資料 p'+current.pages.join('・');
    $('source-link').href=PDF+'#page='+current.pages[0];
    $('scene-select').value=String(state.scene);updateStep(animate,true);
  }
  function next(){if(state.step<scenes[state.scene].beats.length-1){state.step++;updateStep();}else if(state.scene<scenes.length-1&&state.scene!==MAIN_COUNT-1){state.scene++;state.step=0;render();}}
  function previous(){if(state.step>0){state.step--;updateStep(false);}else if(state.scene>0){state.scene--;state.step=scenes[state.scene].beats.length-1;render(false);}}
  function go(scene){state.scene=Math.min(Math.max(0,scene),scenes.length-1);state.step=0;render();}
  const mainGroup=document.createElement('optgroup');mainGroup.label='ご提案資料｜本編16ページ';const supplementGroup=document.createElement('optgroup');supplementGroup.label='補足｜条件・料金・施策の詳細';$('scene-select').append(mainGroup,supplementGroup);
  scenes.forEach((s,i)=>{
    const appendix=i>=MAIN_COUNT;const label=(appendix?'補足 ':'')+String(appendix?i-MAIN_COUNT+1:i+1).padStart(2,'0');
    const option=document.createElement('option');option.value=String(i);option.textContent=`${label} ${s.short}`;(appendix?supplementGroup:mainGroup).appendChild(option);
    const li=document.createElement('li'),a=document.createElement('a');a.href='#stage';a.textContent=`${label} ${s.short}`;a.addEventListener('click',()=>go(i));li.appendChild(a);$(appendix?'supplement-outline':'outline').appendChild(li);
  });
  $('forward').addEventListener('click',next);$('back').addEventListener('click',previous);$('reset').addEventListener('click',()=>go(0));$('scene-select').addEventListener('change',e=>go(Number(e.target.value)));
  document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,a,button,summary'))return;if(e.code==='ArrowRight'||e.code==='Space'){e.preventDefault();next();}else if(e.code==='ArrowLeft'){e.preventDefault();previous();}});
  window.MEDIKURU_DETAIL_PRESENTER=Object.freeze({getState:()=>Object.freeze({...state,sceneId:scenes[state.scene].id,scenes:scenes.length,mainScenes:MAIN_COUNT,supplements:supplements.length,stepsPerScene:scenes[state.scene].beats.length,focus:{kind:$('stage').dataset.focusKind||'none',count:$('stage').querySelectorAll('.presenter-focus').length,text:($('stage').querySelector('.presenter-focus')?.textContent||'').replace(/\s+/g,' ').trim()},automaticPlayback:false,audio:false,qa:{still:stillRender,settled:$('stage').dataset.qaSettled==='true',images:presenterImageStatus()},sourcePages:[...scenes[state.scene].pages]})});
  // Optional deep links for manual presentation review; defaults remain unchanged.
  // scene uses a stable scene ID and step is zero-based. No autoplay is introduced.
  const initialParams=new URLSearchParams(window.location.search);
  const initialScene=scenes.findIndex(scene=>scene.id===initialParams.get('scene'));
  if(initialScene>=0){
    state.scene=initialScene;
    const initialStep=Number.parseInt(initialParams.get('step')||'0',10);
    state.step=Number.isFinite(initialStep)?Math.min(Math.max(0,initialStep),scenes[state.scene].beats.length-1):0;
  }
  render();
})();
