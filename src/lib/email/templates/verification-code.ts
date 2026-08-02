import "server-only";

function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }

export function verificationEmail(input: { code: string; ttlMinutes: number; replyTo: string }) {
  const code = escapeHtml(input.code);
  const text = `EM PASSのアカウント登録を受け付けました。\n\n確認コード：\n${input.code}\n\n有効期限：\n${input.ttlMinutes}分\n\nこのメールに心当たりがない場合は、操作する必要はありません。\n\nお問い合わせ：\n${input.replyTo}`;
  const html = `<p>EM PASSのアカウント登録を受け付けました。</p><p>確認コード：</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>有効期限：${input.ttlMinutes}分</p><p>このメールに心当たりがない場合は、操作する必要はありません。</p><p>お問い合わせ：<a href="mailto:${escapeHtml(input.replyTo)}">${escapeHtml(input.replyTo)}</a></p>`;
  return { subject: "【EM PASS】メールアドレス確認コード", text, html };
}
