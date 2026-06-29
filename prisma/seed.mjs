import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const choice = (id, text, misconceptionType) => ({
  id,
  text,
  misconceptionType,
});

const diagnosticProblems = [
  {
    id: "em1-diag-1",
    course: "em1",
    unit: "静電場",
    topic: "クーロンの法則",
    title: "電場の向き",
    questionText: "正の点電荷 +Q がつくる電場の向きとして正しいものはどれですか。",
    choices: [
      choice("a", "+Qへ向かう", "vector_direction_error"),
      choice("b", "+Qから外向き", "correct"),
      choice("c", "円周の接線方向", "concept_error"),
      choice("d", "位置によらず一定方向", "concept_error"),
    ],
    correctAnswer: "b",
    explanation: "電場は正の試験電荷が受ける力の向きです。正電荷からは放射状に外向きです。",
    formula: "E = (1 / 4πε₀) Q / r²",
    mistake: "電荷の符号と電場の向きを逆にする",
  },
  {
    id: "em1-diag-2",
    course: "em1",
    unit: "ガウスの法則",
    topic: "ガウス面の選択",
    title: "ガウスの法則の使いどころ",
    questionText: "ガウスの法則から電場を簡単に求めやすい状況はどれですか。",
    choices: [
      choice("a", "任意形状の有限な電荷分布", "symmetry_error"),
      choice("b", "球対称な電荷分布", "correct"),
      choice("c", "電荷が一つもない任意の点", "concept_error"),
      choice("d", "時間変化する磁場だけがある場合", "formula_selection_error"),
    ],
    correctAnswer: "b",
    explanation: "球・円筒・平面対称ではガウス面上の電場を一定として積分から外せます。",
    formula: "∮ E·dS = Qenc / ε₀",
    mistake: "対称性を確認せずガウス面を選ぶ",
  },
  {
    id: "em1-diag-3",
    course: "em1",
    unit: "電位",
    topic: "電場と電位の関係",
    title: "電位から電場を求める",
    questionText: "x方向だけで変化する電位 V(x) と電場 Ex の関係はどれですか。",
    choices: [
      choice("a", "Ex = dV/dx", "sign_error"),
      choice("b", "Ex = -dV/dx", "correct"),
      choice("c", "Ex = Vx", "formula_selection_error"),
      choice("d", "Ex = ∫Vdx", "formula_selection_error"),
    ],
    correctAnswer: "b",
    explanation: "電場は電位が最も急に下がる向きなので E = -∇V です。",
    formula: "E = -∇V",
    mistake: "マイナス符号を落とす",
  },
  {
    id: "em1-diag-4",
    course: "em1",
    unit: "誘電体",
    topic: "コンデンサ",
    title: "誘電体を入れたコンデンサ",
    questionText: "電源から切り離した平行板コンデンサに誘電率 εr の誘電体を満たすと、電気容量はどうなりますか。",
    choices: [
      choice("a", "1/εr倍", "formula_selection_error"),
      choice("b", "変わらない", "concept_error"),
      choice("c", "εr倍", "correct"),
      choice("d", "0になる", "concept_error"),
    ],
    correctAnswer: "c",
    explanation: "形状が同じなら C = εS/d なので誘電率に比例します。",
    formula: "C = εS / d",
    mistake: "電荷・電圧・電気容量のどれが一定かを混同する",
  },
  {
    id: "em1-diag-5",
    course: "em1",
    unit: "電流",
    topic: "電流密度",
    title: "電流密度と電流",
    questionText: "断面内で一様な電流密度 J が断面積 S を垂直に流れるとき、電流 I はどれですか。",
    choices: [
      choice("a", "I = J/S", "unit_error"),
      choice("b", "I = JS", "correct"),
      choice("c", "I = J²S", "formula_selection_error"),
      choice("d", "I = S/J", "unit_error"),
    ],
    correctAnswer: "b",
    explanation: "I = ∫J·dS で、一様かつ垂直なら I = JS です。",
    formula: "I = ∫ J·dS",
    mistake: "Jの単位 A/m² を確認しない",
  },
  {
    id: "em2-diag-1",
    course: "em2",
    unit: "ビオ・サバールの法則",
    topic: "法則の使い分け",
    title: "磁場計算の法則選択",
    questionText: "有限長の曲がった導線がつくる磁束密度を求める基本的な法則はどれですか。",
    choices: [
      choice("a", "ガウスの法則", "formula_selection_error"),
      choice("b", "ビオ・サバールの法則", "correct"),
      choice("c", "レンツの法則", "formula_selection_error"),
      choice("d", "クーロンの法則", "formula_selection_error"),
    ],
    correctAnswer: "b",
    explanation: "高い対称性がない電流分布では微小電流要素を積分するビオ・サバールの法則を使います。",
    formula: "dB = μ₀ I dl × r̂ / (4πr²)",
    mistake: "対称性を確認せずアンペールの法則を選ぶ",
  },
  {
    id: "em2-diag-2",
    course: "em2",
    unit: "静磁場",
    topic: "ローレンツ力",
    title: "磁場中の正電荷",
    questionText: "正電荷が速度 v で磁束密度 B に垂直に進むとき、磁気力の向きはどれですか。",
    choices: [
      choice("a", "vと同じ向き", "vector_direction_error"),
      choice("b", "Bと同じ向き", "vector_direction_error"),
      choice("c", "v×Bの向き", "correct"),
      choice("d", "-v×Bの向き", "sign_error"),
    ],
    correctAnswer: "c",
    explanation: "正電荷には F = qv×B が働きます。負電荷なら向きが反転します。",
    formula: "F = q(v × B)",
    mistake: "右手則と電荷の符号を同時に扱えない",
  },
  {
    id: "em2-diag-3",
    course: "em2",
    unit: "電磁誘導",
    topic: "ファラデーの法則",
    title: "誘導起電力の符号",
    questionText: "コイルを貫く磁束 Φ が時間とともに増加するとき、誘導起電力の式はどれですか。",
    choices: [
      choice("a", "e = dΦ/dt", "sign_error"),
      choice("b", "e = -dΦ/dt", "correct"),
      choice("c", "e = Φt", "formula_selection_error"),
      choice("d", "e = 1/Φ", "unit_error"),
    ],
    correctAnswer: "b",
    explanation: "負号は磁束変化を打ち消す向きに誘導電流が流れるというレンツの法則を表します。",
    formula: "e = -dΦ/dt",
    mistake: "レンツの法則を式の負号に結び付けられない",
  },
  {
    id: "em2-diag-4",
    course: "em2",
    unit: "インダクタンス",
    topic: "磁場エネルギー",
    title: "コイルに蓄えられるエネルギー",
    questionText: "インダクタンス L のコイルに電流 I が流れるときの磁場エネルギーはどれですか。",
    choices: [
      choice("a", "LI", "unit_error"),
      choice("b", "LI²", "calculation_error"),
      choice("c", "(1/2)LI²", "correct"),
      choice("d", "(1/2)L²I", "formula_selection_error"),
    ],
    correctAnswer: "c",
    explanation: "電流を0からIまで立ち上げる仕事を積分すると U = LI²/2 です。",
    formula: "U = (1/2)LI²",
    mistake: "係数1/2を忘れる",
  },
  {
    id: "em2-diag-5",
    course: "em2",
    unit: "マクスウェル方程式",
    topic: "変位電流",
    title: "アンペール・マクスウェルの法則",
    questionText: "変位電流の項が必要になる代表的な状況はどれですか。",
    choices: [
      choice("a", "静止した点電荷の周囲", "concept_error"),
      choice("b", "充電中のコンデンサ極板間", "correct"),
      choice("c", "抵抗内の定常電流だけ", "concept_error"),
      choice("d", "時間変化しない一様磁場", "concept_error"),
    ],
    correctAnswer: "b",
    explanation: "極板間に導電電流がなくても時間変化する電束が磁場をつくるため、変位電流項が必要です。",
    formula: "∮ H·dl = I + d/dt ∫ D·dS",
    mistake: "導電電流だけが磁場源だと考える",
  },
];

const exerciseTemplates = {
  em1: [
    ["静電場", "点電荷", "2つの点電荷", "距離 r 離れた +Q と -Q の中点での電位を求めてください。", "0", "電位はスカラー和です。等量異符号なので中点では相殺します。", "V = Σ qi/(4πε₀ri)"],
    ["静電場", "連続電荷分布", "線電荷の電場", "無限長線電荷の電場が距離 r に反比例する理由を説明してください。", "円筒対称", "円筒ガウス面では側面の電場が一定で、面積が2πrLだからです。", "E = λ/(2πε₀r)"],
    ["ガウスの法則", "球対称", "一様帯電球", "半径 R の一様帯電球の内部で E が r に比例する理由を説明してください。", "包有電荷がr³に比例", "包有電荷は体積に比例し、ガウス面積はr²に比例するためEはrに比例します。", "E·4πr² = ρ(4πr³/3)/ε₀"],
    ["電位", "電位差", "一様電場の電位差", "一様電場 E と同じ向きに距離 d 進むときの電位変化を答えてください。", "-Ed", "電場方向へ進むと電位は下がります。", "ΔV = -Ed"],
    ["導体", "導体内部の電場ゼロ", "静電平衡", "静電平衡にある導体内部の電場が0になる理由を説明してください。", "自由電荷が移動して内部電場を打ち消す", "電場が残ると自由電荷が動き続け、静電平衡になりません。", "Einside = 0"],
    ["導体", "接地", "接地導体", "導体を接地する物理的な意味を電位の観点から答えてください。", "電位を基準の0に固定", "大地と電荷を交換でき、導体電位が大地と同じ基準電位になります。", "V = 0"],
    ["誘電体", "分極", "誘電体の分極", "誘電体を電場中に置いたとき内部電場が弱まる理由を答えてください。", "分極電荷が逆向きの電場をつくる", "束縛電荷による電場が外部電場を一部打ち消します。", "D = ε₀E + P"],
    ["誘電体", "コンデンサ", "直列コンデンサ", "C と 2C のコンデンサを直列接続した合成容量を求めてください。", "2C/3", "直列では逆数を加えます。", "1/Ceq = 1/C + 1/(2C)"],
    ["電流", "オームの法則", "抵抗率", "長さ l、断面積 S、抵抗率 ρ の導線の抵抗を答えてください。", "ρl/S", "抵抗は長さに比例し断面積に反比例します。", "R = ρl/S"],
    ["回路", "RC過渡現象", "RC充電", "時定数 τ のRC回路でコンデンサ電圧が最終値の約63%になる時刻を答えてください。", "τ", "充電式1-e^{-t/τ}でt=τなら約0.632です。", "τ = RC"],
  ],
  em2: [
    ["静磁場", "ローレンツ力", "円運動", "磁場 B に垂直に速さ v で入った電荷 q、質量 m の円運動半径を答えてください。", "mv/(|q|B)", "磁気力を向心力に等置します。", "|q|vB = mv²/r"],
    ["ビオ・サバールの法則", "直線電流", "無限直線電流", "無限直線電流 I から距離 r の磁束密度を答えてください。", "μ₀I/(2πr)", "円筒対称性からアンペール経路上でBは一定です。", "B = μ₀I/(2πr)"],
    ["ビオ・サバールの法則", "円形電流", "円形コイル中心", "半径 R、電流 I の1巻円形コイル中心の磁束密度を答えてください。", "μ₀I/(2R)", "各微小電流要素の軸方向成分を円周全体で積分します。", "B = μ₀I/(2R)"],
    ["アンペールの法則", "ソレノイド", "長いソレノイド", "単位長さあたり巻数 n、電流 I の長いソレノイド内部のBを答えてください。", "μ₀nI", "内部の一様磁場と鎖交電流をアンペールの法則に代入します。", "B = μ₀nI"],
    ["アンペールの法則", "トロイド", "トロイド内部", "巻数 N、電流 I のトロイド内部、中心から距離 r のBを答えてください。", "μ₀NI/(2πr)", "半径rの円形アンペール経路を選びます。", "B = μ₀NI/(2πr)"],
    ["電磁誘導", "磁束変化", "動く導体棒", "長さ l の棒が磁場 B に垂直に速さ v で動くときの起電力を答えてください。", "Blv", "ローレンツ力による電荷分離で起電力が生じます。", "e = Blv"],
    ["電磁誘導", "レンツの法則", "磁束増加", "紙面奥向きの磁束が増えるとき、誘導電流がつくる磁場の向きを答えてください。", "紙面手前", "磁束の増加を打ち消す向きです。", "e = -dΦ/dt"],
    ["インダクタンス", "自己インダクタンス", "電流変化", "L=2 Hのコイルの電流が1秒で3 A増加するとき、誘導起電力の大きさを答えてください。", "6 V", "Lと電流変化率を掛けます。", "|e| = L|dI/dt|"],
    ["磁性体", "透磁率", "磁束密度", "線形磁性体で磁場Hと磁束密度Bの関係を答えてください。", "B=μH", "透磁率がHとBを結びます。", "B = μH"],
    ["マクスウェル方程式", "積分形", "電磁誘導の積分形", "ファラデーの法則の積分形を書いてください。", "∮E·dl=-d/dt∫B·dS", "閉曲線上の電場循環は磁束の時間変化の負に等しいです。", "∮ E·dl = -dΦB/dt"],
  ],
};

function toProblem(problem, index = 0, sourceType = "diagnostic") {
  return {
    id: problem.id ?? `${problem.course}-exercise-${index + 1}`,
    course: problem.course,
    unit: problem.unit,
    topic: problem.topic,
    subtopic: problem.topic,
    difficulty: sourceType === "diagnostic" ? 2 : Math.min(5, 1 + Math.floor(index / 3)),
    sourceType,
    title: problem.title,
    questionText: problem.questionText,
    choicesJson: problem.choices ? JSON.stringify(problem.choices) : null,
    correctAnswer: problem.correctAnswer,
    solution: problem.explanation,
    explanation: problem.explanation,
    keyConceptsJson: JSON.stringify([problem.topic]),
    requiredFormulasJson: JSON.stringify([problem.formula]),
    commonMistakesJson: JSON.stringify([problem.mistake]),
    figureUrlsJson: "[]",
  };
}

async function main() {
  if (process.env.SEED_TEST_USERS !== "false") {
    const adminPassword = await bcrypt.hash("Admin123!", 12);
    const studentPassword = await bcrypt.hash("Student123!", 12);

    await prisma.user.upsert({
      where: { email: "admin@em-study.local" },
      update: { role: "admin" },
      create: {
        name: "管理者",
        email: "admin@em-study.local",
        passwordHash: adminPassword,
        role: "admin",
        selectedCourse: "em1",
        learningPurpose: "exam",
        onboardingCompleted: true,
        diagnosticCompleted: true,
      },
    });

    await prisma.user.upsert({
      where: { email: "student@em-study.local" },
      update: {},
      create: {
        name: "テスト学生",
        email: "student@em-study.local",
        passwordHash: studentPassword,
        role: "user",
        selectedCourse: "em1",
        learningPurpose: "foundation",
        onboardingCompleted: true,
        diagnosticCompleted: true,
      },
    });
  }

  const allProblems = diagnosticProblems.map((problem) => toProblem(problem));
  for (const course of ["em1", "em2"]) {
    exerciseTemplates[course].forEach((entry, index) => {
      const [unit, topic, title, questionText, correctAnswer, explanation, formula] = entry;
      allProblems.push(
        toProblem(
          {
            course,
            unit,
            topic,
            title,
            questionText,
            correctAnswer,
            explanation,
            formula,
            mistake: "式だけでなく、法則・向き・単位を順に確認する",
          },
          index,
          "exercise",
        ),
      );
    });
  }

  for (const problem of allProblems) {
    await prisma.problem.upsert({
      where: { id: problem.id },
      update: problem,
      create: problem,
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
