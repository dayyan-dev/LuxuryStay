/**
 * LuxuryStay AI Concierge — local knowledge engine (no API key required).
 * Presentation-safe: deterministic, fast, on-brand answers.
 */

const QUICK_PROMPTS = [
  'Our hotels',
  'How to book',
  'Promo codes',
  'Check-in & QR',
  'Dining',
  'Contact',
];

const INTENTS = [
  {
    id: 'greeting',
    patterns: [/^(hi|hello|hey|salam|assalam|aoa|good\s*(morning|evening|afternoon))\b/i],
    answer: () =>
      "Welcome to LuxuryStay Hospitality. I'm your AI concierge — ask me about hotels, booking, offers, dining, or check-in.",
  },
  {
    id: 'hotels',
    patterns: [
      /hotel|destination|propert|location|city|karachi|lahore|islamabad|bhurban|gwadar|malam/i,
      /our hotels/i,
      /where.*(stay|book)/i,
    ],
    answer: () =>
      'We operate 6 luxury properties across Pakistan:\n• Karachi — Pearl Continental flagship\n• Lahore — Grand heritage stay\n• Islamabad — Margalla sanctuary\n• Bhurban — Alpine hill resort\n• Gwadar — Zaver Bay coastal\n• Malam Jabba — Ski & mountain resort\n\nOpen Destinations to explore rooms and rates.',
    links: [{ label: 'View hotels', to: '/hotels' }],
  },
  {
    id: 'book',
    patterns: [
      /book|reserv|availability|how to book|room rate|price|pkr|night/i,
      /check.?in date|check.?out/i,
    ],
    answer: () =>
      'Booking is simple:\n1) Choose destination & dates on the homepage search\n2) Pick a room suite\n3) Apply a promo if you have one\n4) Pay at hotel or use demo online payment\n\nTransparent pricing includes GST breakdown in PKR.',
    links: [
      { label: 'Browse rooms', to: '/room' },
      { label: 'Start booking', to: '/hotels' },
    ],
  },
  {
    id: 'offers',
    patterns: [/promo|offer|discount|coupon|code|weekend|honeymoon|deal/i],
    answer: () =>
      'Active promo codes:\n• WEEKEND20 — 20% off weekend stays\n• NORTH25 — 25% off northern resorts\n• BIZFLAT5K — flat PKR 5,000 off\n• HONEYMOON15 — 15% honeymoon package\n\nCodes are validated on the server when you book.',
    links: [{ label: 'See offers', to: '/offers' }],
  },
  {
    id: 'checkin',
    patterns: [/check.?in|check.?out|qr|self.?check|arrival|reception/i],
    answer: () =>
      'Express arrival: after booking you get a QR check-in code in your guest profile. Reception can also scan it at /qr-checkin. Checkout updates room status and billing automatically.',
    links: [
      { label: 'My profile', to: '/profile' },
      { label: 'QR check-in', to: '/qr-checkin' },
    ],
  },
  {
    id: 'dining',
    patterns: [/dine|dining|restaurant|food|menu|kitchen|room service|breakfast/i],
    answer: () =>
      'Signature dining includes Dum Pukht (royal Mughlai), Sakura (Pan-Asian), and Terrace Lounge. Guests can browse menus and place orders; kitchen staff track the live order queue.',
    links: [{ label: 'Restaurant', to: '/restaurant' }],
  },
  {
    id: 'services',
    patterns: [/service|amenit|spa|laundry|transport|wake.?up|concierge|wifi/i],
    answer: () =>
      'Request extras anytime: room service, laundry, wake-up calls, transportation, and concierge. Complimentary high-speed Wi-Fi is included at all properties.',
    links: [{ label: 'Guest services', to: '/services' }],
  },
  {
    id: 'loyalty',
    patterns: [/loyalty|privilege|membership|points|vip|club/i],
    answer: () =>
      'Privilege Club rewards stays with tier benefits and points. Register a guest account to start accumulating loyalty perks across the LuxuryStay network.',
    links: [{ label: 'Create account', to: '/register' }],
  },
  {
    id: 'contact',
    patterns: [/contact|phone|email|help|support|uan|call|location map/i],
    answer: () =>
      'Concierge desk: UAN +92 21 111 505 505\nUse the Contact page for messages, or ask me about booking and destinations anytime.',
    links: [{ label: 'Contact us', to: '/contact' }],
  },
  {
    id: 'staff',
    patterns: [/admin|staff|login|dashboard|housekeeping|receptionist/i],
    answer: () =>
      'Staff and admin portals use a separate secure login with role-based access (admin, manager, receptionist, housekeeping, maintenance, kitchen) plus optional 2FA.',
    links: [{ label: 'Staff login', to: '/login' }],
  },
  {
    id: 'thanks',
    patterns: [/thank|shukriya|thx|appreciate/i],
    answer: () =>
      "You're most welcome. Enjoy your LuxuryStay — I'm here if you need anything else.",
  },
];

function normalize(text) {
  return (text || '').trim().toLowerCase();
}

export function getQuickPrompts() {
  return QUICK_PROMPTS;
}

export function getBotReply(userText) {
  const text = normalize(userText);
  if (!text) {
    return {
      text: 'Please type a short question — for example “Our hotels” or “Promo codes”.',
      links: [],
    };
  }

  for (const intent of INTENTS) {
    if (intent.patterns.some((re) => re.test(text))) {
      return {
        text: intent.answer(),
        links: intent.links || [],
      };
    }
  }

  return {
    text:
      "I'm LuxuryStay's AI concierge. I can help with hotels, booking steps, promo codes, QR check-in, dining, services, and contact info. Try a quick prompt below.",
    links: [
      { label: 'Browse hotels', to: '/hotels' },
      { label: 'Offers', to: '/offers' },
    ],
  };
}

export function getWelcomeMessage() {
  return {
    text:
      "Assalam-o-Alaikum — I'm the LuxuryStay AI Concierge. Ask me anything about our Pakistan hotels, booking, offers, or check-in.",
    links: [],
  };
}
