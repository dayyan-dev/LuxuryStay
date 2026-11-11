require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Hotel = require('../Models/Hotel');
const Room = require('../Models/Room');
const Offer = require('../Models/Offer');
const Feedback = require('../Models/Feedback');
const HotelService = require('../Models/HotelService');

const realisticHotels = [
  {
    name: 'LuxuryStay Pearl Continental Karachi',
    slug: 'luxurystay-karachi',
    city: 'Karachi',
    address: 'Club Road, Civil Lines, Karachi, Sindh 75530',
    tagline: 'The Crown Jewel of the City of Lights',
    description: 'The iconic flagship of LuxuryStay hospitality in Pakistan’s financial metropolis. Located in the heart of Karachi, this 5-star haven provides timeless elegance, five specialty culinary restaurants, temperature-controlled outdoor pools, an elite executive club lounge, and world-class banquet facilities.',
    rating: 4.9,
    reviewCount: 384,
    startingPrice: 22000,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    ],
    facilities: [
      'Infinity Swimming Pool',
      'Executive Club Lounge',
      'Signature Spa & Wellness',
      '24/7 Fine Dining',
      'Valet Parking',
      'Grand Ballroom',
      'Airport Chauffeur',
      'High-Speed Wi-Fi',
      'Fitness & Health Club',
    ],
    contactPhone: '+92 21 111 505 505',
    contactEmail: 'karachi@theluxurystay.com',
  },
  {
    name: 'LuxuryStay Grand Lahore',
    slug: 'luxurystay-lahore',
    city: 'Lahore',
    address: 'Shahrah-e-Quaid-e-Azam, Mall Road, Lahore, Punjab 54000',
    tagline: 'Mughal Splendor Meets Contemporary Luxury',
    description: 'Immersed in the rich cultural soul of Lahore along Mall Road, LuxuryStay Grand blends heritage Mughal architecture with modern five-star opulence. Featuring regal dining pavilions, tranquil water courtyards, luxury wellness suites, and state-of-the-art conference amenities.',
    rating: 4.9,
    reviewCount: 412,
    startingPrice: 24000,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80',
    ],
    facilities: [
      'Royal Mughal Dining',
      'Temperature-Controlled Pool',
      'Executive Business Centre',
      'Ayurveda & Steam Spa',
      'Valet Parking',
      'Concierge Chauffeur',
      'Landscaped Gardens',
      'High-Speed Wi-Fi',
    ],
    contactPhone: '+92 42 111 505 505',
    contactEmail: 'lahore@theluxurystay.com',
  },
  {
    name: 'LuxuryStay Margalla Islamabad',
    slug: 'luxurystay-islamabad',
    city: 'Islamabad',
    address: 'Club Road, Shakarparian, Islamabad, ICT 44000',
    tagline: 'Serene Sanctuary in the Capital Hills',
    description: 'Set against the picturesque backdrop of the Margalla Hills and serene Rawal Lake, LuxuryStay Islamabad offers prestigious accommodations for global dignitaries, business leaders, and leisure connoisseurs seeking unmatched peace and luxury.',
    rating: 4.8,
    reviewCount: 298,
    startingPrice: 26000,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80',
    ],
    facilities: [
      'Margalla Hills Terrace',
      'Diplomatic Security Wing',
      'Heated Indoor Pool',
      'Artisan Tea & Coffee Lounge',
      'Tennis Courts',
      'State-of-the-Art Fitness Center',
      'Helipad Access',
      'High-Speed Wi-Fi',
    ],
    contactPhone: '+92 51 111 505 505',
    contactEmail: 'islamabad@theluxurystay.com',
  },
  {
    name: 'LuxuryStay Hilltop Resort Bhurban',
    slug: 'luxurystay-bhurban',
    city: 'Bhurban',
    address: 'Murree Hills, Bhurban, Khyber Pakhtunkhwa 47150',
    tagline: 'Alpine Retreat Above the Clouds',
    description: 'Perched 6,000 feet high amidst whispering pine forests, LuxuryStay Bhurban is Pakistan’s leading mountain escape. Enjoy private hillside balconies, an 9-hole alpine golf course, cozy fire pits, and breathtaking views of the Kashmir valley.',
    rating: 5.0,
    reviewCount: 520,
    startingPrice: 28000,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
    ],
    facilities: [
      'Pine Forest Balconies',
      '9-Hole Golf Course',
      'Heated Mountain Infinity Pool',
      'Bonfire & BBQ Deck',
      'Luxury Alpine Spa',
      'Horse Riding Concierge',
      'Billiards & Game Room',
      'High-Speed Wi-Fi',
    ],
    contactPhone: '+92 593 450 051',
    contactEmail: 'bhurban@theluxurystay.com',
  },
  {
    name: 'LuxuryStay Zaver Bay Gwadar',
    slug: 'luxurystay-gwadar',
    city: 'Gwadar',
    address: 'Koh-e-Batil, Gwadar Coast, Balochistan 91200',
    tagline: 'Coastal Majesty Overlooking the Arabian Sea',
    description: 'Elevated dramatically atop Koh-e-Batil cliff, LuxuryStay Gwadar provides unmatched marine panoramas. Featuring sea-facing terrace suites, fresh caught seafood delicacies, private boat charters, and warm seaside hospitality.',
    rating: 4.8,
    reviewCount: 165,
    startingPrice: 20000,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80',
    ],
    facilities: [
      'Oceanfront Cliff Terrace',
      'Fresh Seafood Grill',
      'Infinity Beach Pool',
      'Sunset Cruise Concierge',
      'Helipad Access',
      'Deep Sea Diving Center',
      'High-Speed Wi-Fi',
    ],
    contactPhone: '+92 864 211 501',
    contactEmail: 'gwadar@theluxurystay.com',
  },
  {
    name: 'LuxuryStay Mountain Resort Malam Jabba',
    slug: 'luxurystay-malam-jabba',
    city: 'Malam Jabba',
    address: 'Swat Valley, Malam Jabba, Khyber Pakhtunkhwa 19130',
    tagline: 'Pakistan’s Premier Ski and Snowboard Sanctuary',
    description: 'Located at the summit of Malam Jabba ski slopes in the Swat Valley, this resort combines exhilarating winter snow sports with year-round mountain tranquility, cedarwood interiors, and authentic valley hospitality.',
    rating: 4.9,
    reviewCount: 240,
    startingPrice: 25000,
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1200&q=80',
      'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    ],
    facilities: [
      'Direct Ski-In / Ski-Out Access',
      'Chairlift Station On-site',
      'Alpine Hot Tubs',
      'Mountain View Dining',
      'Winter Sports Gear Rental',
      'Stargazing Observatory Deck',
      'High-Speed Wi-Fi',
    ],
    contactPhone: '+92 946 755 001',
    contactEmail: 'malamjabba@theluxurystay.com',
  },
];

const realisticOffers = [
  {
    title: 'Weekend Escape — 20% Off',
    code: 'WEEKEND20',
    subtitle: 'Recharge in pure comfort across all LuxuryStay properties',
    description: 'Enjoy a 20% discount on 2-night weekend stays with complimentary buffet breakfast, early check-in, and late check-out privileges.',
    discountType: 'percentage',
    discountValue: 20,
    minNights: 2,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    badge: 'Popular',
    terms: [
      'Valid for Friday-Sunday check-ins.',
      'Minimum stay of 2 nights required.',
      'Includes complimentary breakfast for up to 2 guests.',
    ],
    isActive: true,
  },
  {
    title: 'Northern Retreat Package',
    code: 'NORTH25',
    subtitle: 'Discover Bhurban & Malam Jabba with 25% Off',
    description: 'Escape to the fresh pine breezes of Bhurban or the peaks of Malam Jabba with an exclusive 25% discount plus complimentary high tea.',
    discountType: 'percentage',
    discountValue: 25,
    minNights: 2,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
    image: 'https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&q=80',
    badge: 'Seasonal',
    terms: [
      'Valid exclusively for LuxuryStay Bhurban and Malam Jabba properties.',
      'Subject to seasonal blackout dates.',
    ],
    isActive: true,
  },
  {
    title: 'Executive Suite & Business Privilege',
    code: 'BIZFLAT5K',
    subtitle: 'Flat Rs 5,000 Off on Suites and Deluxe Stays',
    description: 'Designed for executive travelers: save flat Rs 5,000 per booking with high-speed executive lounge access and free airport transfers.',
    discountType: 'fixed',
    discountValue: 5000,
    minNights: 1,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    badge: 'Business',
    terms: [
      'Valid on Deluxe and Suite room categories.',
      'Includes boardroom usage for 2 hours upon advance reservation.',
    ],
    isActive: true,
  },
  {
    title: 'Honeymoon Bliss & Romance',
    code: 'HONEYMOON15',
    subtitle: 'Create timeless memories with romantic perks',
    description: 'Includes candlelight dinner on the terrace, room decoration, chocolate truffles, and a 15% discount on all suites.',
    discountType: 'percentage',
    discountValue: 15,
    minNights: 3,
    validFrom: new Date('2026-01-01'),
    validUntil: new Date('2026-12-31'),
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    badge: 'Romantic',
    terms: [
      'Minimum stay of 3 nights.',
      'Advance reservation of at least 48 hours required.',
    ],
    isActive: true,
  },
];

async function seedRealisticData() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('Connected to Atlas successfully!');

    // 1. Seed Hotels with upsert
    console.log('Seeding LuxuryStay Hotels & Resorts...');
    const hotelDocs = [];
    for (const h of realisticHotels) {
      const doc = await Hotel.findOneAndUpdate(
        { slug: h.slug },
        { $set: h },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      hotelDocs.push(doc);
      console.log(` - Upserted: ${doc.name} (${doc.city})`);
    }

    // 2. Ensure each property has its own dedicated rooms (no shared inventory)
    console.log('\nSeeding dedicated rooms per hotel property...');
    const propertyRoomTemplates = [
      { suffix: '101', type: 'single', price: 18000, capacity: 1, floor: 'ground', images: ['single-room.jpg'] },
      { suffix: '102', type: 'double', price: 22000, capacity: 2, floor: 'ground', images: ['double-room.jpg'] },
      { suffix: '201', type: 'deluxe', price: 28000, capacity: 3, floor: 'first', images: ['deluxe-room.jpg'] },
      { suffix: '202', type: 'suite', price: 35000, capacity: 4, floor: 'first', images: ['suite-room.jpg'] },
    ];
    const cityCodes = {
      Karachi: 'KHI',
      Lahore: 'LHE',
      Islamabad: 'ISB',
      Bhurban: 'BHB',
      Gwadar: 'GWD',
      'Malam Jabba': 'MLJ',
    };
    let roomUpserts = 0;
    for (const hotel of hotelDocs) {
      const code = cityCodes[hotel.city] || hotel.city.slice(0, 3).toUpperCase();
      for (const tmpl of propertyRoomTemplates) {
        const roomNumber = `${code}-${tmpl.suffix}`;
        const priceBump =
          hotel.city === 'Bhurban' || hotel.city === 'Malam Jabba'
            ? 2000
            : hotel.city === 'Gwadar'
              ? 1500
              : 0;
        await Room.findOneAndUpdate(
          { roomNumber },
          {
            $set: {
              roomNumber,
              type: tmpl.type,
              price: tmpl.price + priceBump,
              capacity: tmpl.capacity,
              floor: tmpl.floor,
              images: tmpl.images,
              hotelId: hotel._id,
              status: 'available',
              description: `${tmpl.type.charAt(0).toUpperCase() + tmpl.type.slice(1)} room at ${hotel.name} — property-exclusive inventory.`,
              amenities: ['WiFi', 'AC', 'TV', 'Room Service'],
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        roomUpserts += 1;
      }
      console.log(` - ${hotel.city}: 4 dedicated rooms (${code}-101 … ${code}-202)`);
    }
    console.log(`Upserted ${roomUpserts} property-specific rooms.`);

    // Remove legacy shared / unprefixed inventory so each hotel only keeps CODE-### rooms
    const orphanDelete = await Room.deleteMany({
      $or: [{ hotelId: null }, { hotelId: { $exists: false } }],
    });
    if (orphanDelete.deletedCount) {
      console.log(`Removed ${orphanDelete.deletedCount} legacy rooms without hotelId.`);
    }
    let legacyPrefixedRemoved = 0;
    for (const hotel of hotelDocs) {
      const code = cityCodes[hotel.city] || hotel.city.slice(0, 3).toUpperCase();
      const legacy = await Room.deleteMany({
        hotelId: hotel._id,
        roomNumber: { $not: new RegExp(`^${code}-`, 'i') },
      });
      legacyPrefixedRemoved += legacy.deletedCount || 0;
    }
    if (legacyPrefixedRemoved) {
      console.log(`Removed ${legacyPrefixedRemoved} legacy rooms that were not property-prefixed.`);
    }

    // 3. Seed Offers
    console.log('\nSeeding LuxuryStay Offers & Packages...');
    for (const o of realisticOffers) {
      const doc = await Offer.findOneAndUpdate(
        { code: o.code },
        { $set: o },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(` - Upserted Offer: ${doc.title} [Code: ${doc.code}]`);
    }

    // 4. Ensure Admin user exists with verified credentials
    console.log('\nVerifying Executive Admin Account...');
    const User = require('../Models/User');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@hotel.com' },
      {
        $set: {
          name: 'Super Admin',
          role: 'admin',
          password: hashedPassword,
          twoFactorEnabled: false,
          isEmailVerified: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(` - Admin account ready: ${adminUser.email} (Password: admin123)`);

    // 5. Ensure core staff accounts exist for HK / maintenance / front desk
    console.log('\nVerifying Staff Accounts...');
    const staffAccounts = [
      { name: 'Reception Desk', email: 'reception@hotel.com', phone: '03001110001', role: 'receptionist', password: 'Staff123!' },
      { name: 'Housekeeping Lead', email: 'housekeeping@hotel.com', phone: '03001110002', role: 'housekeeping', password: 'Staff123!' },
      { name: 'Maintenance Lead', email: 'maintenance@hotel.com', phone: '03001110003', role: 'maintenance', password: 'Staff123!' },
      { name: 'Kitchen Lead', email: 'kitchen@hotel.com', phone: '03001110004', role: 'kitchen', password: 'Staff123!' },
      { name: 'Hotel Manager', email: 'manager@hotel.com', phone: '03001110005', role: 'manager', password: 'Staff123!' },
    ];
    for (const staff of staffAccounts) {
      const hashed = await bcrypt.hash(staff.password, 10);
      const doc = await User.findOneAndUpdate(
        { email: staff.email },
        {
          $set: {
            name: staff.name,
            phone: staff.phone,
            role: staff.role,
            password: hashed,
            isEmailVerified: true,
            twoFactorEnabled: false,
            status: 'active',
            consentAccepted: true,
            consentAcceptedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(` - Staff ready: ${doc.email} (${doc.role}) / ${staff.password}`);
    }

    // 6. Seed sample guest reviews for homepage testimonials
    console.log('\nSeeding guest reviews...');
    const sampleReviews = [
      {
        name: 'Ayesha Khan',
        email: 'ayesha.guest@example.com',
        phone: '03001234567',
        rating: 5,
        review:
          'Booking was seamless and the Karachi suite exceeded our expectations — warm service from arrival to checkout.',
      },
      {
        name: 'Hamza Ali',
        email: 'hamza.guest@example.com',
        phone: '03007654321',
        rating: 5,
        review:
          'We celebrated our anniversary at LuxuryStay Grand Lahore. The team handled every detail flawlessly.',
      },
      {
        name: 'Sara Ahmed',
        email: 'sara.guest@example.com',
        phone: '03111222333',
        rating: 4,
        review:
          'Bhurban mountain views and the spa made our weekend unwind perfect. Would book again for family trips.',
      },
      {
        name: 'Omar Farooq',
        email: 'omar.guest@example.com',
        phone: '03219876543',
        rating: 5,
        review:
          'Business trip to Islamabad — fast check-in, reliable Wi-Fi, and excellent breakfast. Highly recommended.',
      },
    ];
    for (const rev of sampleReviews) {
      const existing = await Feedback.findOne({ email: rev.email, review: rev.review });
      if (!existing) {
        await Feedback.create(rev);
        console.log(` - Review added: ${rev.name}`);
      } else {
        console.log(` - Review already present: ${rev.name}`);
      }
    }

    console.log('\n--- Seeding Hotel Services ---');
    const defaultServices = [
      {
        name: 'Royal Grand Banquets & Executive Conventions',
        description: 'Opulent crystal-chandelier ballrooms and executive boardroom suites equipped with 4K projection, simultaneous interpretation, and bespoke five-star catering.',
        category: 'business',
        icon: 'fa-solid fa-briefcase',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
        timing: '24/7 By Reservation',
        price: 'Starting from PKR 120,000',
        isActive: true,
        order: 1,
      },
      {
        name: 'The Oasis Heated Infinity Pool & Wellness Spa',
        description: 'Temperature-controlled panoramic outdoor infinity pool overlooking skyline vistas, Himalayan salt therapy chambers, and organic herbal rejuvenation spas.',
        category: 'wellness',
        icon: 'fa-solid fa-spa',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
        timing: '06:00 AM - 11:00 PM',
        price: 'Complimentary for In-House Guests',
        isActive: true,
        order: 2,
      },
      {
        name: 'Le Ciel Gourmet Dining & Skyline Lounge',
        description: 'Award-winning master chefs curate contemporary Mediterranean, authentic Pakistani Mughlai, and artisanal continental gastronomic degustation menus.',
        category: 'dining',
        icon: 'fa-solid fa-utensils',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
        timing: '12:00 PM - 01:00 AM',
        price: 'A La Carte & Chef Specials',
        isActive: true,
        order: 3,
      },
      {
        name: 'Chauffeured VIP Luxury Fleet & Airport Transfer',
        description: 'VIP door-to-door luxury transfers in pristine Mercedes S-Class and Cadillac Escalade vehicles with dedicated protocol security and baggage handling.',
        category: 'transport',
        icon: 'fa-solid fa-car',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80',
        timing: '24 Hours On-Demand',
        price: 'From PKR 8,500 / trip',
        isActive: true,
        order: 4,
      },
      {
        name: '24/7 Bespoke Butler & In-Suite Silver Service',
        description: 'Private butler service trained in British hospitality etiquette, providing unpackaging, garment pressing, personalized itinerary curation, and silver-service suite dining.',
        category: 'other',
        icon: 'fa-solid fa-bell-concierge',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
        timing: '24/7 Around the Clock',
        price: 'Included with Executive Suites',
        isActive: true,
        order: 5,
      },
      {
        name: 'State-of-the-Art Technogym Fitness Club',
        description: 'Equipped with cutting-edge cardiovascular and Olympic strength training stations, certified personal trainers, and private steam/sauna detox suites.',
        category: 'recreation',
        icon: 'fa-solid fa-dumbbell',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
        timing: 'Open 24/7',
        price: 'Complimentary for All Guests',
        isActive: true,
        order: 6,
      },
    ];

    for (const srv of defaultServices) {
      const existing = await HotelService.findOne({ name: srv.name });
      if (!existing) {
        await HotelService.create(srv);
        console.log(` - Service added: ${srv.name}`);
      } else {
        console.log(` - Service already present: ${srv.name}`);
      }
    }

    console.log('\nSeeding completed safely without duplicating records!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedRealisticData();

