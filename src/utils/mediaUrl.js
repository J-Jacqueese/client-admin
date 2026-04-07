/** 将 /model_api/uploads/... 转为当前环境可访问的绝对 URL（用于预览） */
export function resolveAdminMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  const s = String(pathOrUrl).trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  const base = import.meta.env.VITE_API_URL || 'https://deepseek.club/model_api/';
  const origin = base.replace(/\/model_api\/?$/i, '').replace(/\/$/, '') || '';
  return s.startsWith('/') ? `${origin}${s}` : `${origin}/${s}`;
}
