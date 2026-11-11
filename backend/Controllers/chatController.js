/**
 * LuxuryStay AI Concierge — Groq-backed chat
 * Falls back gracefully if API key/model fails.
 */

const SYSTEM_PROMPT = `You are the LuxuryStay AI Concierge for a luxury hotel network in Pakistan.

Brand facts (stay accurate — do not invent live room prices or availability):
- Properties: Karachi (Pearl Continental flagship), Lahore (Grand), Islamabad (Margalla), Bhurban (Hilltop), Gwadar (Zaver Bay), Malam Jabba (Mountain Resort).
- Guests book via the website: choose city/dates → hotel → room → optional promo → pay at hotel (cash/card) or demo online payment.
- Promo codes (validated server-side when booking): WEEKEND20, NORTH25, BIZFLAT5K, HONEYMOON15.
- Self check-in: available from Profile on/after check-in date (QR / Check-in Now). Early check-in is not allowed.
- Dining: restaurant menus + in-room dining after guest is checked in.
- Contact: UAN +92 21 111 505 505 · Contact page for inquiries/feedback.
- Staff portal is separate (/login) with roles (admin, manager, receptionist, housekeeping, maintenance, kitchen).

Style:
- Warm, concise, professional hospitality tone.
- Keep answers short (usually under 120 words) unless the user asks for detail.
- Formatting rules (important):
  - Use plain text. Prefer simple bullets with "• " or short numbered steps "1. 2. 3."
  - You may use **bold** sparingly for key labels.
  - Do NOT use Markdown headings (#), tables, or code fences.
  - Do NOT dump long step-by-step essays; summarize first, then 4–6 short steps max.
- If asked for live rates/availability, guide them to /hotels or /room.
- If unsure, suggest Contact or Guest Profile — never invent booking confirmations.
- Reply in the user's language when they write in Urdu/roman Urdu; otherwise English.`;

const SUGGESTED_LINKS = [
  { label: 'View hotels', to: '/hotels' },
  { label: 'Rooms & Suites', to: '/room' },
  { label: 'Offers', to: '/offers' },
  { label: 'Restaurant', to: '/restaurant' },
  { label: 'Contact', to: '/contact' },
  { label: 'My profile', to: '/profile' },
];

function pickLinks(userText = '', botText = '') {
  const hay = `${userText} ${botText}`.toLowerCase();
  const picked = [];
  const add = (to) => {
    const link = SUGGESTED_LINKS.find((l) => l.to === to);
    if (link && !picked.some((p) => p.to === to)) picked.push(link);
  };

  if (/hotel|destination|karachi|lahore|islamabad|bhurban|gwadar|malam/.test(hay)) add('/hotels');
  if (/room|suite|book|reserv|rate|price/.test(hay)) add('/room');
  if (/promo|offer|discount|coupon|code/.test(hay)) add('/offers');
  if (/dine|dining|restaurant|food|menu/.test(hay)) add('/restaurant');
  if (/contact|phone|help|support|inquiry/.test(hay)) add('/contact');
  if (/check.?in|profile|booking|qr|loyalty/.test(hay)) add('/profile');

  if (picked.length === 0) {
    add('/hotels');
    add('/contact');
  }
  return picked.slice(0, 3);
}

const chatWithGroq = async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'AI concierge is not configured (missing GROQ_API_KEY).',
        fallback: true,
      });
    }

    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ success: false, message: 'Message is too long (max 1000 characters).' });
    }

    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : [];
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .map((m) => ({
          role: m.role,
          content: String(m.content).slice(0, 1500),
        })),
      { role: 'user', content: message },
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_tokens: 500,
      }),
    });

    const data = await groqRes.json().catch(() => ({}));

    if (!groqRes.ok) {
      console.error('[chat] Groq error:', groqRes.status, data?.error || data);
      return res.status(502).json({
        success: false,
        message: data?.error?.message || 'Groq request failed.',
        fallback: true,
      });
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return res.status(502).json({
        success: false,
        message: 'Empty response from AI.',
        fallback: true,
      });
    }

    return res.status(200).json({
      success: true,
      text,
      links: pickLinks(message, text),
      model,
    });
  } catch (err) {
    console.error('[chat] Server error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Chat service error.',
      fallback: true,
    });
  }
};

module.exports = { chatWithGroq };
