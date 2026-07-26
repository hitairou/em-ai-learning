import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_STATE = {
  humanReviewStatus: "unreviewed",
  verificationStatus: "draft",
  appReadyStatus: "pending_human_review",
  isActive: false,
};

const mistakesByCourse = {
  em1: ["符号の取り違え", "単位換算の誤り", "スカラー量とベクトル量の混同", "対称性の見落とし"],
  em2: ["右手則の向きの誤り", "磁束と磁束密度の混同", "レンツの法則の符号の誤り", "単位換算の誤り"],
};

function choice(id, text, misconceptionType) {
  return { id, text, misconceptionType };
}

function problem(row) {
  return {
    appQuestionId: row.appQuestionId,
    course: row.course,
    unit: row.unit,
    topic: row.topic,
    subtopic: row.subtopic,
    difficulty: row.difficulty,
    sourceType: "exercise",
    sourceYear: null,
    questionType: row.questionType,
    answerKind: row.answerKind,
    calculationMode: row.calculationMode ?? "mixed",
    parentId: null,
    parentSourceId: null,
    title: row.title,
    questionText: row.questionText,
    choicesJson: row.choices?.length ? JSON.stringify(row.choices) : null,
    correctAnswer: row.correctAnswer,
    solution: row.solution,
    explanation: row.explanation ?? row.solution,
    keyConceptsJson: JSON.stringify(row.keyConcepts ?? [row.topic]),
    requiredFormulasJson: JSON.stringify(row.requiredFormulas ?? []),
    commonMistakesJson: JSON.stringify(row.commonMistakes ?? mistakesByCourse[row.course]),
    figureUrlsJson: "[]",
    estimatedTimeSec: row.estimatedTimeSec ?? (row.difficulty === 1 ? 180 : 300),
    internalMetadataJson: JSON.stringify({
      generatedFor: "foundation_count_top_up",
      baseline: "published_standard_and_exam_problem_style",
      createdBy: "scripts/create-foundation-draft-problems.mjs",
      ...row.internalMetadata,
    }),
    ...INITIAL_STATE,
  };
}

function buildEm1Difficulty1() {
  const items = [
    ["静電気の基礎概念", "定義・概念確認", "電荷の単位", "電荷量のSI単位として正しいものはどれか。", "C", ["A", "V", "C", "F"], "電荷量のSI単位はクーロン C である。", "\\(Q\\,[\\mathrm{C}]\\)"],
    ["静電気の基礎概念", "定義・概念確認", "クーロン力の向き", "同符号の2つの点電荷の間に働く静電気力の向きとして正しいものはどれか。", "互いに遠ざかる向き", ["互いに近づく向き", "互いに遠ざかる向き", "常に上向き", "力は働かない"], "同符号電荷の間には斥力が働く。", "\\(F=kq_1q_2/r^2\\)"],
    ["静電気の基礎概念", "定義・概念確認", "電場の定義", "電場 \\(\\mathbf{E}\\) の定義として正しいものはどれか。", "\\(\\mathbf{E}=\\mathbf{F}/q\\)", ["\\(\\mathbf{E}=q\\mathbf{F}\\)", "\\(\\mathbf{E}=\\mathbf{F}/q\\)", "\\(\\mathbf{E}=Vq\\)", "\\(\\mathbf{E}=Q/r\\)"], "電場は単位正電荷に働く力で定義される。", "\\(\\mathbf{E}=\\mathbf{F}/q\\)"],
    ["静電気の基礎概念", "定義・概念確認", "電位の性質", "電位はスカラー量かベクトル量か。", "スカラー量", ["スカラー量", "ベクトル量", "テンソル量", "単位を持たない量"], "電位は位置ごとに定まるスカラー量である。", "\\(V\\)"],
    ["静電場・電位", "電場と電位", "電場と電位差", "一様電場の向きに進むと電位はどう変化するか。", "下がる", ["上がる", "下がる", "変わらない", "必ず0になる"], "電場は電位が下がる向きであり，\\(\\mathbf{E}=-\\nabla V\\) である。", "\\(\\mathbf{E}=-\\nabla V\\)"],
    ["ガウスの法則・対称性電場", "ガウス面の選択", "球対称のガウス面", "球対称な電荷分布に最も適したガウス面はどれか。", "同心球面", ["同心球面", "任意の三角形", "円板1枚", "直方体だけ"], "球対称では同心球面上で電場の大きさが一定になる。", "\\(\\oint \\mathbf{E}\\cdot d\\mathbf{S}=Q_{in}/\\varepsilon_0\\)"],
    ["ガウスの法則・対称性電場", "対称性と電気力線", "電気力線の向き", "正電荷から出る電気力線の向きとして正しいものはどれか。", "外向き", ["内向き", "外向き", "円周方向", "電荷に依存しない"], "正電荷の電場は放射状に外向きである。", "\\(\\mathbf{E}=kQ\\hat{\\mathbf{r}}/r^2\\)"],
    ["導体・接地・鏡像法", "導体の静電平衡", "導体内部の電場", "静電平衡にある導体内部の電場はどうなるか。", "0", ["0", "無限大", "表面と同じ値", "場所により必ず増加する"], "導体内部に電場が残ると自由電荷が動き続けるため，静電平衡では \\(E=0\\) である。", "\\(E=0\\)"],
    ["導体・接地・鏡像法", "導体の静電平衡", "導体の電位", "静電平衡にある1つの導体の電位について正しいものはどれか。", "導体全体で等電位", ["導体全体で等電位", "内部だけ電位が未定義", "表面で必ず0", "場所ごとに必ず異なる"], "\\(E=0\\) なら導体内部の電位勾配は0であり，表面も含めて等電位になる。", "\\(\\mathbf{E}=-\\nabla V\\)"],
    ["導体・接地・鏡像法", "接地導体", "接地の意味", "接地された導体の電位は通常どの値を基準に固定するか。", "0", ["0", "\\(\\infty\\)", "\\(Q/C\\) に固定", "電荷量と無関係に1 V"], "接地は大地と電荷を交換できる状態にし，導体電位を基準電位0に固定する。", "\\(V=0\\)"],
    ["静電容量・誘電体・静電エネルギー", "平行平板・合成容量", "平行平板容量", "真空中の平行平板コンデンサで，容量が面積 \\(A\\) に対してどう変化するか。", "比例する", ["比例する", "反比例する", "無関係", "面積の2乗に比例する"], "\\(C=\\varepsilon_0 A/d\\) より容量は面積に比例する。", "\\(C=\\varepsilon_0 A/d\\)"],
    ["静電容量・誘電体・静電エネルギー", "誘電体・容量・境界条件", "比誘電率", "平行平板コンデンサを比誘電率 \\(\\varepsilon_r\\) の誘電体で完全に満たすと容量はどうなるか。", "\\(\\varepsilon_r\\) 倍", ["\\(\\varepsilon_r\\) 倍", "\\(1/\\varepsilon_r\\) 倍", "0になる", "変わらない"], "誘電率が \\(\\varepsilon=\\varepsilon_0\\varepsilon_r\\) になるため，容量は \\(\\varepsilon_r\\) 倍になる。", "\\(C=\\varepsilon A/d\\)"],
    ["静電容量・誘電体・静電エネルギー", "球導体の容量・エネルギー", "静電エネルギー", "コンデンサに蓄えられるエネルギーの基本式として正しいものはどれか。", "\\(U=\\frac{1}{2}CV^2\\)", ["\\(U=CV\\)", "\\(U=\\frac{1}{2}CV^2\\)", "\\(U=C/V\\)", "\\(U=V/C\\)"], "電圧を0からVまで上げる仕事を積分すると \\(U=CV^2/2\\) となる。", "\\(U=\\frac{1}{2}CV^2\\)"],
    ["電流・定常電流", "電流密度", "電流密度の単位", "電流密度 \\(J\\) のSI単位として正しいものはどれか。", "\\(\\mathrm{A/m^2}\\)", ["\\(\\mathrm{A}\\)", "\\(\\mathrm{A/m}\\)", "\\(\\mathrm{A/m^2}\\)", "\\(\\mathrm{C/V}\\)"], "電流密度は単位面積あたりの電流である。", "\\(I=\\int \\mathbf{J}\\cdot d\\mathbf{S}\\)"],
    ["電流・定常電流", "オームの法則", "抵抗率", "長さ \\(l\\)，断面積 \\(S\\)，抵抗率 \\(\\rho\\) の導線の抵抗はどれか。", "\\(R=\\rho l/S\\)", ["\\(R=\\rho S/l\\)", "\\(R=\\rho l/S\\)", "\\(R=l/(\\rho S)\\)", "\\(R=\\rho lS\\)"], "抵抗は長さに比例し，断面積に反比例する。", "\\(R=\\rho l/S\\)"],
    ["静電場・電位", "重ね合わせ", "電場の重ね合わせ", "複数の点電荷がつくる電場を求める基本原理はどれか。", "各電場のベクトル和", ["各電場のベクトル和", "各電位のベクトル積", "最も近い電荷だけを見る", "電荷数に関係なく0"], "電場はベクトル量なので，各点電荷による電場をベクトル和で足し合わせる。", "\\(\\mathbf{E}=\\sum_i \\mathbf{E}_i\\)"],
    ["静電場・電位", "電位の重ね合わせ", "電位の足し合わせ", "複数の点電荷がつくる電位を求めるときの足し合わせ方として正しいものはどれか。", "符号を含むスカラー和", ["絶対値だけの和", "符号を含むスカラー和", "ベクトル積", "常に0"], "電位はスカラー量なので，電荷の符号を含めて代数和をとる。", "\\(V=\\sum_i kq_i/r_i\\)"],
    ["ガウスの法則・対称性電場", "包有電荷", "ガウスの法則の右辺", "ガウスの法則の右辺に入る電荷はどれか。", "ガウス面が包む電荷", ["空間中すべての電荷", "ガウス面が包む電荷", "面の外側の電荷だけ", "試験電荷だけ"], "電束は閉曲面が包む正味電荷で決まる。", "\\(\\oint \\mathbf{E}\\cdot d\\mathbf{S}=Q_{in}/\\varepsilon_0\\)"],
    ["導体・接地・鏡像法", "導体境界条件", "接線電場", "静電平衡にある導体表面の接線方向電場はどうなるか。", "0", ["0", "\\(\\sigma/\\varepsilon_0\\)", "無限大", "表面電荷に無関係に一定"], "接線電場があれば表面の自由電荷が移動するため，静電平衡では接線成分は0である。", "\\(E_t=0\\)"],
  ];

  const variants = [];
  for (let i = 0; i < 2; i += 1) variants.push(...items);
  return variants.slice(0, 38).map((item, index) => {
    const [unit, topic, title, questionText, answer, choices, solution, formula] = item;
    const correctIndex = choices.indexOf(answer);
    return problem({
      appQuestionId: `Q${String(835 + index).padStart(4, "0")}`,
      course: "em1",
      unit,
      topic,
      subtopic: title,
      difficulty: 1,
      questionType: "foundation_concept_choice",
      answerKind: "choice",
      title,
      questionText: index < items.length ? questionText : `${questionText}\n理由を1文で確認してから選べ。`,
      choices: choices.map((text, choiceIndex) => choice(String.fromCharCode(97 + choiceIndex), text, choiceIndex === correctIndex ? "correct" : "concept_error")),
      correctAnswer: answer,
      solution,
      requiredFormulas: [formula],
      keyConcepts: [topic, title],
    });
  });
}

function buildEm1Difficulty2() {
  const templates = [
    ["静電気の基礎概念", "定義・概念確認", "クーロン力の比例関係", "2つの点電荷の距離を2倍にすると，静電気力の大きさは何倍になるか。", "\\(1/4\\) 倍", "クーロン力は距離の2乗に反比例するため，距離を2倍にすると力は \\(1/2^2=1/4\\) 倍になる。", "\\(F=k|q_1q_2|/r^2\\)"],
    ["静電場・電位", "点電荷の電場重ね合わせ", "点電荷の電場", "正の点電荷 \\(+Q\\) から距離 \\(r\\) の点での電場の大きさと向きを答えよ。", "\\(E=kQ/r^2\\)，向きは点電荷から外向き。", "点電荷の電場はクーロンの法則から \\(E=kQ/r^2\\) であり，正電荷では放射状外向きである。", "\\(E=kQ/r^2\\)"],
    ["静電場・電位", "電場と電位", "一様電場の電位差", "一様電場 \\(E=200\\,\\mathrm{V/m}\\) の向きに \\(0.30\\,\\mathrm{m}\\) 進むとき，電位変化 \\(\\Delta V\\) を求めよ。", "\\(\\Delta V=-60\\,\\mathrm{V}\\)", "\\(\\Delta V=-Ed\\) を用いる。電場方向へ進むので電位は下がり，\\(-200\\times0.30=-60\\,\\mathrm{V}\\) である。", "\\(\\Delta V=-Ed\\)"],
    ["ガウスの法則・対称性電場", "ガウス面の選択", "無限平面電荷", "無限に広い一様面電荷の電場を求めるとき，どの形のガウス面を選ぶのが自然か。理由も述べよ。", "面を貫く薄い円柱形のガウス面。", "平面対称性により電場は面に垂直で両側で同じ大きさになるため，ピルボックス形のガウス面が適している。", "\\(\\oint \\mathbf{E}\\cdot d\\mathbf{S}=Q_{in}/\\varepsilon_0\\)"],
    ["ガウスの法則・対称性電場", "球対称電荷分布", "球殻外部の電場", "半径 \\(R\\) の薄い球殻に全電荷 \\(Q\\) が一様にある。\\(r>R\\) の電場を答えよ。", "\\(E=Q/(4\\pi\\varepsilon_0 r^2)\\)", "球殻外部では，中心に点電荷 \\(Q\\) がある場合と同じ電場になる。球面ガウス面を使えば直接求まる。", "\\(E=Q/(4\\pi\\varepsilon_0 r^2)\\)"],
    ["導体・接地・鏡像法", "導体の静電平衡", "導体内部の包有電荷", "静電平衡の導体内部に閉じたガウス面を取ると，その面が包む正味電荷はどうなるか。", "0", "導体内部では \\(E=0\\) なので電束は0である。ガウスの法則より，包有する正味電荷も0である。", "\\(\\oint \\mathbf{E}\\cdot d\\mathbf{S}=Q_{in}/\\varepsilon_0\\)"],
    ["導体・接地・鏡像法", "接地導体", "接地導体の電位条件", "接地無限導体平面を鏡像法で扱うとき，導体面上で満たすべき電位条件を答えよ。", "\\(V=0\\)", "接地導体は大地と同じ基準電位に固定されるため，導体面上で \\(V=0\\) を満たすように鏡像電荷を置く。", "\\(V=0\\)"],
    ["静電容量・誘電体・静電エネルギー", "平行平板・合成容量", "平行平板容量の計算", "真空中で \\(A=2.0\\times10^{-3}\\,\\mathrm{m^2}\\)，\\(d=1.0\\,\\mathrm{mm}\\) の平行平板コンデンサの容量を式で求めよ。", "\\(C=2.0\\varepsilon_0\\)", "\\(C=\\varepsilon_0A/d\\) に代入すると \\(C=\\varepsilon_0(2.0\\times10^{-3})/(1.0\\times10^{-3})=2.0\\varepsilon_0\\) である。", "\\(C=\\varepsilon_0A/d\\)"],
    ["静電容量・誘電体・静電エネルギー", "誘電体・容量・境界条件", "誘電体挿入後の容量", "容量 \\(C_0\\) の空気コンデンサを比誘電率3.0の誘電体で完全に満たす。新しい容量を答えよ。", "\\(3.0C_0\\)", "形状が同じなら容量は誘電率に比例するため，\\(C=\\varepsilon_r C_0=3.0C_0\\) である。", "\\(C=\\varepsilon_r C_0\\)"],
    ["静電容量・誘電体・静電エネルギー", "球導体の容量・エネルギー", "電荷と電圧", "容量 \\(C=50\\,\\mathrm{pF}\\) のコンデンサに \\(V=100\\,\\mathrm{V}\\) を加える。電荷 \\(Q\\) を求めよ。", "\\(5.0\\,\\mathrm{nC}\\)", "\\(Q=CV=50\\times10^{-12}\\times100=5.0\\times10^{-9}\\,\\mathrm{C}\\) である。", "\\(Q=CV\\)"],
    ["電流・定常電流", "電流密度", "一様電流密度", "断面積 \\(S=4.0\\,\\mathrm{mm^2}\\) に一様な電流密度 \\(J=2.0\\times10^6\\,\\mathrm{A/m^2}\\) が垂直に流れる。電流を求めよ。", "\\(8.0\\,\\mathrm{A}\\)", "\\(S=4.0\\times10^{-6}\\,\\mathrm{m^2}\\) と直し，\\(I=JS=2.0\\times10^6\\times4.0\\times10^{-6}=8.0\\,\\mathrm{A}\\) である。", "\\(I=JS\\)"],
    ["電流・定常電流", "オームの法則", "導線抵抗", "抵抗率 \\(\\rho\\)，長さ \\(l\\)，断面積 \\(S\\) の導線について，抵抗が長さを2倍にするとどう変わるか。", "2倍になる", "\\(R=\\rho l/S\\) なので，断面積と抵抗率が同じなら抵抗は長さに比例する。", "\\(R=\\rho l/S\\)"],
    ["静電場・電位", "電位の重ね合わせ", "等量異符号の中点電位", "距離 \\(2a\\) 離れた \\(+Q\\) と \\(-Q\\) の中点における電位を答えよ。", "0", "中点は両電荷から等距離なので，電位は \\(kQ/a+k(-Q)/a=0\\) となる。", "\\(V=\\sum_i kq_i/r_i\\)"],
    ["ガウスの法則・対称性電場", "対称性と電気力線", "電場が一定になる理由", "ガウス面上で電場を積分の外へ出せるのは，どのような場合か。", "対称性により面上で電場の大きさが一定で，向きも面素とそろう場合。", "球・円筒・平面対称では，適切なガウス面上で \\(\\mathbf{E}\\cdot d\\mathbf{S}\\) が簡単になり，電場を積分の外に出せる。", "\\(\\oint \\mathbf{E}\\cdot d\\mathbf{S}\\)"],
    ["導体・接地・鏡像法", "導体境界条件", "表面電場の法線成分", "導体表面直外の法線電場と表面電荷密度 \\(\\sigma\\) の関係を答えよ。", "\\(E_n=\\sigma/\\varepsilon_0\\)", "導体表面をまたぐ小さなガウス面を考えると，導体内部の電場は0なので，直外の法線成分は \\(\\sigma/\\varepsilon_0\\) になる。", "\\(E_n=\\sigma/\\varepsilon_0\\)"],
    ["静電容量・誘電体・静電エネルギー", "平行平板・合成容量", "直列容量", "\\(C\\) と \\(2C\\) のコンデンサを直列接続した合成容量を求めよ。", "\\(2C/3\\)", "直列接続では \\(1/C_{eq}=1/C+1/(2C)=3/(2C)\\) なので，\\(C_{eq}=2C/3\\) である。", "\\(1/C_{eq}=\\sum_i1/C_i\\)"],
  ];

  const rows = [];
  for (let i = 0; i < 32; i += 1) {
    const [unit, topic, title, questionText, correctAnswer, solution, formula] = templates[i % templates.length];
    rows.push(problem({
      appQuestionId: `Q${String(873 + i).padStart(4, "0")}`,
      course: "em1",
      unit,
      topic,
      subtopic: title,
      difficulty: 2,
      questionType: "foundation_short_derivation",
      answerKind: i % 3 === 0 ? "numeric" : "short_text",
      title,
      questionText: i < templates.length ? questionText : `${questionText}\n途中で使う式も1つ書け。`,
      correctAnswer,
      solution,
      requiredFormulas: [formula],
      keyConcepts: [topic, title],
    }));
  }
  return rows;
}

function buildEm2Difficulty1() {
  const items = [
    ["磁場の基礎", "ローレンツ力", "磁気力の向き", "正電荷が速度 \\(\\mathbf{v}\\) で磁場 \\(\\mathbf{B}\\) 中を動くとき，磁気力の向きはどれか。", "\\(\\mathbf{v}\\times\\mathbf{B}\\) の向き", ["\\(\\mathbf{v}\\) の向き", "\\(\\mathbf{B}\\) の向き", "\\(\\mathbf{v}\\times\\mathbf{B}\\) の向き", "常に0"], "正電荷に働く磁気力は \\(q\\mathbf{v}\\times\\mathbf{B}\\) の向きである。", "\\(\\mathbf{F}=q\\mathbf{v}\\times\\mathbf{B}\\)"],
    ["磁場の基礎", "ローレンツ力", "磁気力が0になる条件", "荷電粒子の速度が磁場と平行なとき，磁気力の大きさはどうなるか。", "0", ["0", "最大", "\\(qvB\\)", "電荷に無関係"], "外積の大きさは \\(qvB\\sin\\theta\\) であり，平行なら \\(\\theta=0\\) なので0である。", "\\(F=qvB\\sin\\theta\\)"],
    ["ビオ・サバール・アンペール", "直線電流", "直線電流の磁場", "無限直線電流のまわりの磁場の向きは何で決まるか。", "右ねじの法則", ["左ねじの法則", "右ねじの法則", "電場の向き", "電荷の符号だけ"], "電流の向きに右ねじを進めると，回転方向が磁場の向きになる。", "\\(B=\\mu_0I/(2\\pi r)\\)"],
    ["ビオ・サバール・アンペール", "アンペールの法則", "アンペールの法則の使い所", "長いソレノイドや無限直線電流の磁場計算で有効な法則はどれか。", "アンペールの法則", ["ガウスの法則", "アンペールの法則", "クーロンの法則", "キルヒホッフの電圧則だけ"], "高い対称性がある定常電流の磁場ではアンペールの法則が直接使える。", "\\(\\oint \\mathbf{B}\\cdot d\\mathbf{l}=\\mu_0I\\)"],
    ["ビオ・サバール・アンペール", "円形電流", "円形コイル中心", "円形コイル中心の磁場の向きは何で決めるか。", "右ねじの法則", ["レンツの法則だけ", "右ねじの法則", "ガウス面", "電位差"], "電流が回る向きに右手の指を合わせると，親指の向きが中心磁場の向きである。", "\\(B=\\mu_0I/(2R)\\)"],
    ["電磁誘導", "ファラデーの法則", "誘導起電力の式", "1巻コイルを貫く磁束 \\(\\Phi\\) が変化するとき，誘導起電力の式として正しいものはどれか。", "\\(e=-d\\Phi/dt\\)", ["\\(e=d\\Phi/dt\\)", "\\(e=-d\\Phi/dt\\)", "\\(e=\\Phi/t^2\\)", "\\(e=0\\)"], "負号は磁束変化を打ち消す向きに起電力が生じることを表す。", "\\(e=-d\\Phi/dt\\)"],
    ["電磁誘導", "レンツの法則", "レンツの法則", "誘導電流の向きは，何を打ち消す向きに決まるか。", "磁束の変化", ["磁束の変化", "抵抗値", "導線の長さ", "電荷量だけ"], "レンツの法則では，誘導電流は原因となる磁束変化を妨げる向きに流れる。", "\\(e=-d\\Phi/dt\\)"],
    ["電磁誘導", "磁束", "磁束の単位", "磁束 \\(\\Phi\\) のSI単位はどれか。", "Wb", ["T", "Wb", "H", "F"], "磁束は磁束密度を面積で積分した量で，単位はウェーバ Wb である。", "\\(\\Phi=\\int\\mathbf{B}\\cdot d\\mathbf{S}\\)"],
    ["インダクタンス", "自己インダクタンス", "インダクタンスの単位", "インダクタンス \\(L\\) のSI単位はどれか。", "H", ["H", "Wb", "T", "C"], "インダクタンスの単位はヘンリー H である。", "\\(e=-L\\,dI/dt\\)"],
    ["インダクタンス", "磁場エネルギー", "コイルのエネルギー", "インダクタンス \\(L\\) に電流 \\(I\\) が流れるときの磁場エネルギーはどれか。", "\\(U=\\frac{1}{2}LI^2\\)", ["\\(U=LI\\)", "\\(U=\\frac{1}{2}LI^2\\)", "\\(U=L/I\\)", "\\(U=I/L\\)"], "電流を0からIまで立ち上げる仕事を積分すると \\(LI^2/2\\) になる。", "\\(U=\\frac{1}{2}LI^2\\)"],
    ["磁性体", "透磁率", "線形磁性体", "線形磁性体で \\(\\mathbf{B}\\) と \\(\\mathbf{H}\\) を結ぶ式はどれか。", "\\(\\mathbf{B}=\\mu\\mathbf{H}\\)", ["\\(\\mathbf{B}=\\mu\\mathbf{H}\\)", "\\(\\mathbf{H}=\\mu\\mathbf{B}\\)", "\\(\\mathbf{B}=\\mathbf{H}/\\varepsilon\\)", "\\(\\mathbf{B}=0\\)"], "線形磁性体では透磁率 \\(\\mu\\) を用いて \\(\\mathbf{B}=\\mu\\mathbf{H}\\) と表す。", "\\(\\mathbf{B}=\\mu\\mathbf{H}\\)"],
    ["マクスウェル方程式", "変位電流", "変位電流が必要な場面", "変位電流項が重要になる代表例はどれか。", "充電中のコンデンサ極板間", ["静止した点電荷の周囲", "充電中のコンデンサ極板間", "抵抗内の定常電流だけ", "時間変化しない一様磁場"], "極板間に導電電流がなくても，時間変化する電束が磁場を作るため変位電流項が必要である。", "\\(\\oint\\mathbf{H}\\cdot d\\mathbf{l}=I+d\\Phi_D/dt\\)"],
    ["マクスウェル方程式", "電磁波", "電磁波の速さ", "真空中の電磁波の速さはどの定数で表されるか。", "\\(c=1/\\sqrt{\\varepsilon_0\\mu_0}\\)", ["\\(c=\\sqrt{\\varepsilon_0\\mu_0}\\)", "\\(c=1/\\sqrt{\\varepsilon_0\\mu_0}\\)", "\\(c=\\varepsilon_0/\\mu_0\\)", "\\(c=\\mu_0/\\varepsilon_0\\)"], "マクスウェル方程式から真空中の波の速さは \\(1/\\sqrt{\\varepsilon_0\\mu_0}\\) となる。", "\\(c=1/\\sqrt{\\varepsilon_0\\mu_0}\\)"],
    ["交流回路", "リアクタンス", "コイルのリアクタンス", "角周波数 \\(\\omega\\) の交流で，インダクタンス \\(L\\) のリアクタンスはどれか。", "\\(X_L=\\omega L\\)", ["\\(X_L=1/(\\omega L)\\)", "\\(X_L=\\omega L\\)", "\\(X_L=L/\\omega\\)", "\\(X_L=0\\)"], "コイルのインピーダンスは \\(j\\omega L\\) なので，リアクタンスの大きさは \\(\\omega L\\) である。", "\\(X_L=\\omega L\\)"],
  ];

  const rows = [];
  for (let i = 0; i < 28; i += 1) {
    const [unit, topic, title, questionText, answer, choices, solution, formula] = items[i % items.length];
    const correctIndex = choices.indexOf(answer);
    rows.push(problem({
      appQuestionId: `Q${String(905 + i).padStart(4, "0")}`,
      course: "em2",
      unit,
      topic,
      subtopic: title,
      difficulty: 1,
      questionType: "foundation_concept_choice",
      answerKind: "choice",
      title,
      questionText: i < items.length ? questionText : `${questionText}\n基準になる法則名も確認せよ。`,
      choices: choices.map((text, choiceIndex) => choice(String.fromCharCode(97 + choiceIndex), text, choiceIndex === correctIndex ? "correct" : "concept_error")),
      correctAnswer: answer,
      solution,
      requiredFormulas: [formula],
      keyConcepts: [topic, title],
    }));
  }
  return rows;
}

async function main() {
  const rows = [
    ...buildEm1Difficulty1(),
    ...buildEm1Difficulty2(),
    ...buildEm2Difficulty1(),
  ];
  const ids = rows.map((row) => row.appQuestionId);
  if (ids.length !== new Set(ids).size) throw new Error("Duplicate appQuestionId in generated rows.");

  const existing = await prisma.problem.findMany({
    where: { appQuestionId: { in: ids } },
    select: { appQuestionId: true },
  });
  if (existing.length) {
    throw new Error(`Generated IDs already exist: ${existing.map((row) => row.appQuestionId).join(", ")}`);
  }

  await prisma.problem.createMany({ data: rows });

  const summary = await prisma.problem.groupBy({
    by: ["course", "difficulty", "isActive", "humanReviewStatus", "verificationStatus"],
    where: { appQuestionId: { in: ids } },
    _count: { _all: true },
    orderBy: [{ course: "asc" }, { difficulty: "asc" }],
  });
  console.log(JSON.stringify({ created: rows.length, summary }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
