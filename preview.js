// Mengambil judul, deskripsi, dan gambar preview dari sebuah link.
export default async function handler(req, res) {
  const url = String(req.query.url || '');
  let u;
  try { u = new URL(url); } catch { return res.status(400).json({ error: 'Link tidak valid' }); }
  if (!/^https?:$/.test(u.protocol) || /^(localhost|127\.|10\.|192\.168\.)/.test(u.hostname)) {
    return res.status(400).json({ error: 'Link tidak diizinkan' });
  }
  try {
    const r = await fetch(u.href, {
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'facebookexternalhit/1.1', 'Accept-Language': 'id,en;q=0.8' }
    });
    const html = (await r.text()).slice(0, 400000);
    const meta = (p) => {
      const a = html.match(new RegExp('<meta[^>]+(?:property|name)=["\']' + p + '["\'][^>]*content=["\']([^"\']*)["\']', 'i'));
      const b = html.match(new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:property|name)=["\']' + p + '["\']', 'i'));
      return (a || b || [])[1] || '';
    };
    const dec = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).json({
      title: dec(meta('og:title') || meta('twitter:title') || (t ? t[1] : '')).trim(),
      description: dec(meta('og:description') || meta('description')).trim().slice(0, 300),
      image: dec(meta('og:image') || meta('twitter:image'))
    });
  } catch (e) {
    res.status(200).json({ title: '', description: '', image: '' });
  }
}
