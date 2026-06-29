import type { Course, LearningPurpose, MisconceptionType } from "@/types/learning";

export const COURSE_LABELS: Record<Course, string> = {
  em1: "電磁気1",
  em2: "電磁気2",
};

export const PURPOSE_LABELS: Record<LearningPurpose, string> = {
  foundation: "基礎からやり直す",
  assignment: "課題を解けるようにする",
  midterm: "中間試験に備える",
  final: "期末試験に備える",
  exam: "試験前に総復習する",
};

export const MISTAKE_LABELS: Record<MisconceptionType, string> = {
  concept_error: "概念の取り違え",
  formula_selection_error: "公式選択",
  symmetry_error: "対称性",
  sign_error: "符号",
  unit_error: "単位",
  calculation_error: "計算",
  boundary_condition_error: "境界条件",
  vector_direction_error: "ベクトル方向",
  graph_or_figure_reading_error: "図・グラフ読解",
  insufficient_answer: "説明不足",
  no_misconception: "誤解なし",
  correct: "正解",
};

export const COURSE_UNITS: Record<Course, Record<string, string[]>> = {
  em1: {
    "静電場": ["クーロンの法則", "電場", "電気力線", "点電荷", "連続電荷分布"],
    "ガウスの法則": ["球対称", "円筒対称", "平面対称", "ガウス面の選択", "電束"],
    "電位": ["電位差", "電場と電位の関係", "無限遠基準", "積分範囲", "符号"],
    "導体": ["静電誘導", "導体内部の電場ゼロ", "表面電荷", "接地"],
    "誘電体": ["分極", "誘電率", "電束密度", "コンデンサ"],
    "電流": ["電流密度", "抵抗率", "オームの法則", "ジュール熱"],
    "回路": ["コンデンサ回路", "RC過渡現象", "エネルギー"],
  },
  em2: {
    "静磁場": ["磁束密度", "磁場", "ローレンツ力", "右ねじの向き"],
    "ビオ・サバールの法則": ["直線電流", "円形電流", "微小電流要素", "積分"],
    "アンペールの法則": ["対称性", "無限直線電流", "ソレノイド", "トロイド"],
    "電磁誘導": ["ファラデーの法則", "レンツの法則", "誘導起電力", "磁束変化"],
    "インダクタンス": ["自己インダクタンス", "相互インダクタンス", "磁場エネルギー"],
    "磁性体": ["磁化", "透磁率", "境界条件"],
    "マクスウェル方程式": ["積分形", "微分形", "変位電流", "電磁波の基礎"],
  },
};
