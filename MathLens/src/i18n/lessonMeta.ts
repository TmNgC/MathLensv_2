import type { Lang } from './index'

/**
 * Localized lesson titles/subtitles. Vietnamese lives in the content
 * files themselves; this table carries the other four languages and
 * falls back to the Vietnamese original for anything missing.
 */
type Meta = { title: string; subtitle: string }

export const lessonMeta: Record<string, Partial<Record<Lang, Meta>>> = {
  'tien-giai-tich': {
    en: { title: 'Pre-calculus', subtitle: 'Functions & the calculus mindset' },
    fr: { title: 'Précalcul', subtitle: 'Fonctions et état d’esprit du calcul' },
    zh: { title: '微积分预备', subtitle: '函数与微积分思维' },
    ja: { title: '微積分の準備', subtitle: '関数と微積分の考え方' },
  },
  'gioi-han': {
    en: { title: 'Limits', subtitle: 'As close as you like — the foundation' },
    fr: { title: 'Limites', subtitle: 'Aussi près que voulu — le socle' },
    zh: { title: '极限', subtitle: '想多近有多近 —— 微积分的基石' },
    ja: { title: '極限', subtitle: 'どこまでも近づける —— 微積分の土台' },
  },
  'gioi-han-nang-cao': {
    en: { title: 'Advanced Limits', subtitle: 'Squeeze · Weierstrass · L’Hôpital · Stolz–Cesàro' },
    fr: { title: 'Limites avancées', subtitle: 'Encadrement · Weierstrass · L’Hôpital · Stolz–Cesàro' },
    zh: { title: '进阶极限', subtitle: '夹逼 · 魏尔斯特拉斯 · 洛必达 · 斯托尔茨' },
    ja: { title: '発展的な極限', subtitle: 'サンドイッチ · ワイエルシュトラス · ロピタル · シュトルツ' },
  },
  'dao-ham': {
    en: { title: 'Derivatives', subtitle: 'Instantaneous slope & the derivative function' },
    fr: { title: 'Dérivées', subtitle: 'Pente instantanée et fonction dérivée' },
    zh: { title: '导数', subtitle: '瞬时斜率与导函数' },
    ja: { title: '導関数', subtitle: '瞬間の傾きと導関数' },
  },
  'quy-tac-dao-ham': {
    en: { title: 'Differentiation Rules', subtitle: 'Sum · product · quotient · chain' },
    fr: { title: 'Règles de dérivation', subtitle: 'Somme · produit · quotient · chaîne' },
    zh: { title: '求导法则', subtitle: '和 · 积 · 商 · 链式' },
    ja: { title: '微分法則', subtitle: '和 · 積 · 商 · 合成関数' },
  },
  'kham-sat': {
    en: { title: 'Curve Sketching', subtitle: 'The complete derivative workflow' },
    fr: { title: 'Étude de fonctions', subtitle: 'Le parcours complet de la dérivée' },
    zh: { title: '函数研究', subtitle: '导数的完整工作流' },
    ja: { title: '関数の調査', subtitle: '導関数の完全ワークフロー' },
  },
  'tich-phan': {
    en: { title: 'Integrals', subtitle: 'From thin slices to the Fundamental Theorem' },
    fr: { title: 'Intégrales', subtitle: 'Des tranches fines au théorème fondamental' },
    zh: { title: '积分', subtitle: '从薄切片到微积分基本定理' },
    ja: { title: '積分', subtitle: '薄い切片から基本定理へ' },
  },
  'khoi-tron-xoay': {
    en: { title: 'Solids of Revolution', subtitle: 'When a curve spins around an axis' },
    fr: { title: 'Solides de révolution', subtitle: 'Quand une courbe tourne autour d’un axe' },
    zh: { title: '旋转体', subtitle: '当曲线绕轴旋转' },
    ja: { title: '回転体', subtitle: '曲線が軸の周りを回るとき' },
  },
  'thiet-dien': {
    en: { title: 'Cross-sections', subtitle: 'Slicing solids & Cavalieri’s principle' },
    fr: { title: 'Sections planes', subtitle: 'Découper les solides — principe de Cavalieri' },
    zh: { title: '截面', subtitle: '切割立体与卡瓦列里原理' },
    ja: { title: '切断面', subtitle: '立体の切断とカバリエリの原理' },
  },
  lab: {
    en: { title: 'Graph Lab', subtitle: 'Plot any function, explore freely' },
    fr: { title: 'Laboratoire', subtitle: 'Tracez toute fonction, explorez' },
    zh: { title: '图形实验室', subtitle: '任意函数，自由探索' },
    ja: { title: 'グラフ研究所', subtitle: '好きな関数を自由に探検' },
  },
  'toan-ly': {
    en: { title: 'From Math to Physics', subtitle: 'Kinematics & dynamics through calculus' },
    fr: { title: 'Des maths à la physique', subtitle: 'Cinématique et dynamique par le calcul' },
    zh: { title: '从数学到物理', subtitle: '用微积分看运动与力' },
    ja: { title: '数学から物理へ', subtitle: '微積分で見る運動と力' },
  },
}
