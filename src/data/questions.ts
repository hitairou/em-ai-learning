import type { Question } from "@/types/learning";

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    topic: "field_direction",
    title: "電場の向き（正電荷）",
    questionText:
      "点電荷 +Q のまわりの電場ベクトルの向きとして正しいものはどれ？（+Q から距離 r の点）",
    choices: [
      {
        id: "a",
        text: "+Q に向かう（内向き）",
        misconceptionType: "charge_direction_confusion",
        feedbackHint: "正電荷の電場は外向き（押し出す向き）を思い出そう。",
      },
      {
        id: "b",
        text: "+Q から遠ざかる（外向き）",
        misconceptionType: "no_misconception",
        feedbackHint: "正電荷は試験電荷（+）を押し出す方向に電場が向く。",
      },
      {
        id: "c",
        text: "円周に沿う（接線方向）",
        misconceptionType: "equipotential_field_relation_confusion",
        feedbackHint: "等電位線（面）と電場の関係を整理しよう。",
      },
      {
        id: "d",
        text: "向きは定まらない",
        misconceptionType: "field_potential_confusion",
        feedbackHint: "点電荷の電場は位置で方向が定まる（放射状）。",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "+Q の電場は放射状に外向き。試験電荷（+）が受ける力の向きが電場の向き。",
    tags: ["electric_field", "direction", "vector"],
    difficulty: 1,
  },
  {
    id: "q2",
    topic: "field_vs_potential",
    title: "電場と電位の違い",
    questionText:
      "「電位 V」はどの種類の物理量として扱うのが正しい？（静電場）",
    choices: [
      {
        id: "a",
        text: "ベクトル量（向きをもつ）",
        misconceptionType: "vector_scalar_confusion",
        feedbackHint: "電位はスカラー。向きを持つのは電場 E。",
      },
      {
        id: "b",
        text: "スカラー量（向きをもたない）",
        misconceptionType: "no_misconception",
        feedbackHint: "電位はスカラー。電場はベクトル。",
      },
      {
        id: "c",
        text: "テンソル量",
        misconceptionType: "vector_scalar_confusion",
        feedbackHint: "まずはスカラー/ベクトルの区別から整理しよう。",
      },
      {
        id: "d",
        text: "状況によりベクトルにもスカラーにもなる",
        misconceptionType: "field_potential_confusion",
        feedbackHint: "電位の定義は一貫してスカラー（位置の関数）。",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "電位 V は位置に対応するスカラー。電場 E は空間の各点にベクトルとして定義される。",
    tags: ["electric_potential", "scalar", "electric_field", "vector"],
    difficulty: 1,
  },
  {
    id: "q3",
    topic: "distance_dependence",
    title: "距離依存性（点電荷）",
    questionText:
      "点電荷 Q が作る電場の大きさ |E| と電位 V の距離 r 依存性の組として正しいものはどれ？（真空中）",
    choices: [
      {
        id: "a",
        text: "|E| ∝ 1/r,  V ∝ 1/r²",
        misconceptionType: "distance_dependence_confusion",
        feedbackHint: "電場は 1/r²、電位は 1/r の関係を確認しよう。",
      },
      {
        id: "b",
        text: "|E| ∝ 1/r², V ∝ 1/r",
        misconceptionType: "no_misconception",
        feedbackHint: "正しい。V の勾配が E になる（微分で次数が変わる）。",
      },
      {
        id: "c",
        text: "|E| ∝ 1/r², V ∝ 1/r²",
        misconceptionType: "distance_dependence_confusion",
        feedbackHint: "V は 1/r。E は V を r で微分するイメージ。",
      },
      {
        id: "d",
        text: "|E| は一定, V ∝ r",
        misconceptionType: "distance_dependence_confusion",
        feedbackHint: "点電荷の影響は距離で弱まる。基本式に立ち返ろう。",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "点電荷の電場は |E| = k|Q|/r²、電位は V = kQ/r。E は −∇V なので次数が1つ増える。",
    tags: ["electric_field", "electric_potential", "distance"],
    difficulty: 2,
  },
  {
    id: "q4",
    topic: "equipotential_relation",
    title: "等電位面と電場",
    questionText:
      "静電場において、等電位面と電場ベクトルの関係として正しいものはどれ？",
    choices: [
      {
        id: "a",
        text: "電場は等電位面に接する（接線方向）",
        misconceptionType: "equipotential_field_relation_confusion",
        feedbackHint: "等電位面上では電位が変化しない → 電場はその法線方向。",
      },
      {
        id: "b",
        text: "電場は等電位面に垂直（法線方向）",
        misconceptionType: "no_misconception",
        feedbackHint: "正しい。E = −∇V なので、等電位面に垂直。",
      },
      {
        id: "c",
        text: "電場は等電位面と無関係",
        misconceptionType: "field_potential_confusion",
        feedbackHint: "電場は電位の空間変化（勾配）で決まる。",
      },
      {
        id: "d",
        text: "電場は等電位面に平行・垂直の両方になり得る",
        misconceptionType: "equipotential_field_relation_confusion",
        feedbackHint: "静電場では常に等電位面に垂直。",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "等電位面では接線方向に電位変化が0。電場は電位の減少方向（−∇V）なので法線方向になる。",
    tags: ["equipotential", "electric_field", "electric_potential", "direction"],
    difficulty: 2,
  },
  {
    id: "q5",
    topic: "vector_scalar",
    title: "ベクトル量とスカラー量",
    questionText:
      "次のうち「ベクトル量」だけをすべて含む組はどれ？（静電界）",
    choices: [
      {
        id: "a",
        text: "電位 V、電場 E",
        misconceptionType: "vector_scalar_confusion",
        feedbackHint: "V はスカラー、E はベクトル。",
      },
      {
        id: "b",
        text: "電場 E、力 F",
        misconceptionType: "no_misconception",
        feedbackHint: "正しい。E も F も向きをもつ。",
      },
      {
        id: "c",
        text: "電位 V、仕事 W",
        misconceptionType: "vector_scalar_confusion",
        feedbackHint: "V も W もスカラー。",
      },
      {
        id: "d",
        text: "電荷 Q、電位 V",
        misconceptionType: "vector_scalar_confusion",
        feedbackHint: "Q も V もスカラー（符号はあるが向きではない）。",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "電場 E と力 F はベクトル量。電位 V、仕事 W、電荷 Q はスカラー量。",
    tags: ["vector", "scalar", "electric_field"],
    difficulty: 1,
  },
];

