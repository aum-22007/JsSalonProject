/* ============================================================
   DATA MODEL (the "M" in MVC)
   Static catalogue data for the single salon: salon info,
   categories, services and seed reviews. Dynamic data
   (appointments, user, submitted reviews) lives in store.js.
   ============================================================ */

export const SALON = {
  salonId: 'velora-studio',
  name: 'Velora Studio',
  tagline: 'Unisex salon · Hair, skin & grooming',
  location: 'Shop 4, Ridhi Arcade, College Road, Nadiad, Gujarat 387001',
  area: 'College Road, Nadiad',
  phone: '+91 98765 43210',
  email: 'hello@velorastudio.in',
  description:
    'Velora Studio is a neighbourhood salon on College Road that has been serving Nadiad since 2016. ' +
    'The team of eight stylists and therapists covers everything from a quick haircut before work to ' +
    'bridal-season skin prep. Appointments run on time, prices are fixed and displayed upfront, and ' +
    'payment is taken at the counter after your service — cash, UPI or card.',
  rating: 4.7,
  reviewCount: 312,
  established: 2016,
  // index matches Date.getDay(): 0 = Sunday
  openingHours: [
    { day: 'Sunday', open: '10:00', close: '19:00' },
    { day: 'Monday', open: '10:00', close: '20:00' },
    { day: 'Tuesday', closed: true },
    { day: 'Wednesday', open: '10:00', close: '20:00' },
    { day: 'Thursday', open: '10:00', close: '20:00' },
    { day: 'Friday', open: '10:00', close: '20:00' },
    { day: 'Saturday', open: '09:30', close: '20:30' },
  ],
  amenities: [
    { icon: 'wind', label: 'Air conditioned' },
    { icon: 'wifi', label: 'Free Wi-Fi' },
    { icon: 'droplet', label: 'Sanitised tools' },
    { icon: 'card', label: 'UPI & cards accepted' },
    { icon: 'parking', label: 'Two-wheeler parking' },
    { icon: 'coffee', label: 'Complimentary tea / coffee' },
  ],
  gallery: [
    { src: 'images/hero.jpg', alt: 'Styling chairs and mirrors inside Velora Studio' },
    { src: 'images/interior.jpg', alt: 'Reception desk and product shelves at Velora Studio' },
    { src: 'images/spa.jpg', alt: 'Hair wash and spa station at Velora Studio' },
    { src: 'images/styling.jpg', alt: 'Stylist blow-drying a client\u2019s hair' },
  ],
};

export const CATEGORIES = [
  { id: 'hair', name: 'Hair', icon: 'scissors', blurb: 'Cuts, styling, colour & spa' },
  { id: 'beard', name: 'Beard & Shave', icon: 'razor', blurb: 'Trims, shaping & classic shaves' },
  { id: 'skin', name: 'Skin & Facial', icon: 'sparkle', blurb: 'Facials & clean-ups' },
  { id: 'spa', name: 'Spa & Massage', icon: 'lotus', blurb: 'Head massage & relaxation' },
  { id: 'nails', name: 'Nails', icon: 'hand', blurb: 'Manicure & pedicure' },
  { id: 'makeup', name: 'Makeup', icon: 'brush', blurb: 'Party & occasion makeup' },
];

export const SERVICES = [
  {
    serviceId: 's1', name: 'Classic Haircut', category: 'hair',
    description: 'A precise cut with clipper and scissor work, finished with a quick style. Includes a consultation so you leave with a shape that actually suits you.',
    price: 350, duration: 30, rating: 4.8, ratingCount: 96, popular: true,
    image: 'images/haircut.jpg', imageAlt: 'Stylist trimming a client\u2019s hair with scissors',
    includes: ['Consultation on cut and face shape', 'Shampoo rinse before the cut', 'Clipper + scissor cut', 'Quick blow-dry finish'],
  },
  {
    serviceId: 's2', name: 'Advanced Haircut & Finish', category: 'hair',
    description: 'For bigger changes — restyles, layers or texture work — with a wash, cut and full styled finish by a senior stylist.',
    price: 550, duration: 45, rating: 4.7, ratingCount: 61, popular: false,
    image: 'images/haircut.jpg', imageAlt: 'Senior stylist working on a restyle haircut',
    includes: ['Senior stylist consultation', 'Shampoo and conditioning', 'Restyle or layered cut', 'Styled blow-dry finish'],
  },
  {
    serviceId: 's3', name: 'Hair Styling', category: 'hair',
    description: 'Blow-dry, curls, waves or straight finish for an event or just a good hair day. Product and heat protection included.',
    price: 500, duration: 45, rating: 4.6, ratingCount: 48, popular: true,
    image: 'images/styling.jpg', imageAlt: 'Stylist blow-drying long hair with a round brush',
    includes: ['Wash and heat-protect prep', 'Blow-dry base', 'Curls, waves or sleek finish', 'Light-hold setting spray'],
  },
  {
    serviceId: 's4', name: 'Global Hair Colour', category: 'hair',
    description: 'Single-tone colour applied root to tip using ammonia-free colour. Shade matching is done before any colour touches your hair.',
    price: 1800, duration: 90, rating: 4.5, ratingCount: 34, popular: false,
    image: 'images/color.jpg', imageAlt: 'Colourist applying hair colour with a brush and foils',
    includes: ['Shade consultation and patch test', 'Ammonia-free global colour', 'Colour-safe shampoo rinse', 'Blow-dry finish'],
  },
  {
    serviceId: 's5', name: 'Hair Spa', category: 'hair',
    description: 'Deep-conditioning treatment with scalp massage and steam. Recommended for dry, coloured or heat-damaged hair.',
    price: 1200, duration: 75, rating: 4.9, ratingCount: 72, popular: true,
    image: 'images/spa.jpg', imageAlt: 'Client relaxing during a hair spa treatment',
    includes: ['Scalp analysis', 'Deep-conditioning masque', '15-minute scalp massage', 'Steam treatment and rinse'],
  },
  {
    serviceId: 's6', name: 'Beard Grooming', category: 'beard',
    description: 'Trim, shape and line-up with a hot towel finish. Your beard, but tidier and with an actual plan.',
    price: 250, duration: 20, rating: 4.8, ratingCount: 88, popular: true,
    image: 'images/beard.jpg', imageAlt: 'Barber shaping a beard with a trimmer',
    includes: ['Beard consultation', 'Trim and shape', 'Razor line-up', 'Hot towel and beard oil finish'],
  },
  {
    serviceId: 's7', name: 'Classic Shave', category: 'beard',
    description: 'Traditional single-blade shave with hot towels, pre-shave oil and a cooling balm to finish.',
    price: 300, duration: 25, rating: 4.7, ratingCount: 41, popular: false,
    image: 'images/beard.jpg', imageAlt: 'Barber preparing a classic hot-towel shave',
    includes: ['Hot towel prep', 'Pre-shave oil', 'Single-blade shave', 'Cooling after-shave balm'],
  },
  {
    serviceId: 's8', name: 'Premium Facial', category: 'skin',
    description: 'A 60-minute facial matched to your skin type — cleansing, exfoliation, massage, masque and SPF to finish.',
    price: 900, duration: 60, rating: 4.8, ratingCount: 57, popular: true,
    image: 'images/facial.jpg', imageAlt: 'Esthetician applying cream during a facial',
    includes: ['Skin-type analysis', 'Double cleanse and exfoliation', 'Face and neck massage', 'Masque + moisturiser + SPF'],
  },
  {
    serviceId: 's9', name: 'Skin Clean-up', category: 'skin',
    description: 'A shorter session for regular upkeep: cleanse, scrub, steam, blackhead removal and a hydrating masque.',
    price: 650, duration: 40, rating: 4.5, ratingCount: 29, popular: false,
    image: 'images/facial.jpg', imageAlt: 'Clean-up skincare session in progress',
    includes: ['Cleanse and scrub', 'Steam', 'Blackhead / whitehead removal', 'Hydrating masque'],
  },
  {
    serviceId: 's10', name: 'Head Massage', category: 'spa',
    description: 'A 30-minute head, neck and shoulder massage with warm oil. Good for screen-tired people, which is everyone.',
    price: 450, duration: 30, rating: 4.9, ratingCount: 64, popular: false,
    image: 'images/spa.jpg', imageAlt: 'Relaxing head massage at the wash station',
    includes: ['Choice of coconut or almond oil', 'Head and scalp massage', 'Neck and shoulder release', 'Optional hair wash after'],
  },
  {
    serviceId: 's11', name: 'Classic Manicure', category: 'nails',
    description: 'Nail shaping, cuticle care, scrub and massage, finished with a polish of your choice.',
    price: 500, duration: 45, rating: 4.6, ratingCount: 38, popular: false,
    image: 'images/nails.jpg', imageAlt: 'Technician applying polish during a manicure',
    includes: ['Soak and nail shaping', 'Cuticle care', 'Hand scrub and massage', 'Polish of your choice'],
  },
  {
    serviceId: 's12', name: 'Classic Pedicure', category: 'nails',
    description: 'A proper foot reset: soak, scrub, callus care, massage and polish.',
    price: 600, duration: 50, rating: 4.7, ratingCount: 44, popular: false,
    image: 'images/nails.jpg', imageAlt: 'Pedicure session with neutral polish',
    includes: ['Warm foot soak', 'Scrub and callus care', 'Foot and calf massage', 'Polish of your choice'],
  },
  {
    serviceId: 's13', name: 'Party Makeup', category: 'makeup',
    description: 'Occasion-ready makeup with a base matched to your skin tone, eye look of your choice and setting spray that lasts the evening.',
    price: 1500, duration: 60, rating: 4.8, ratingCount: 52, popular: true,
    image: 'images/makeup.jpg', imageAlt: 'Makeup artist applying blush with a brush',
    includes: ['Skin prep and primer', 'Shade-matched base', 'Eye look and lashes', 'Long-wear setting spray'],
  },
];

/* Seed reviews shown on the salon profile. User-submitted reviews
   are appended to these via the store. */
export const SEED_REVIEWS = [
  { reviewId: 'r1', name: 'Priyanka Shah', rating: 5, date: '2025-09-21', serviceName: 'Hair Spa',
    comment: 'Booked the hair spa for 11 am and was in the chair by 11:05. My hair was frizzy from a bad colour job elsewhere and it genuinely feels softer two weeks later. Worth the price.' },
  { reviewId: 'r2', name: 'Rohan Desai', rating: 5, date: '2025-09-14', serviceName: 'Classic Haircut',
    comment: 'Been coming here for a year. Jignesh bhai remembers exactly how I like the fade and never rushes it even on busy Saturdays.' },
  { reviewId: 'r3', name: 'Keya Patel', rating: 4, date: '2025-09-02', serviceName: 'Premium Facial',
    comment: 'Clean place, gentle hands, and they actually asked about my skin type instead of pushing the most expensive facial. Lost one star because parking is tight in the evening.' },
  { reviewId: 'r4', name: 'Amit Trivedi', rating: 5, date: '2025-08-25', serviceName: 'Beard Grooming',
    comment: 'In and out in 25 minutes with the best beard shape-up I\u2019ve had in Nadiad. The hot towel at the end is a nice touch.' },
  { reviewId: 'r5', name: 'Nidhi Joshi', rating: 4, date: '2025-08-10', serviceName: 'Party Makeup',
    comment: 'Did my makeup for a sangeet. Base lasted the whole night in August humidity which says a lot. Slightly heavier on the blush than I asked, but they fixed it when I pointed it out.' },
  { reviewId: 'r6', name: 'Harsh Panchal', rating: 5, date: '2025-07-28', serviceName: 'Head Massage',
    comment: 'The 30-minute head massage fixed a headache I\u2019d had all day. Quiet, no upselling, fixed prices on the board. This is how a salon should run.' },
  { reviewId: 'r7', name: 'Foram Mehta', rating: 4, date: '2025-07-12', serviceName: 'Classic Pedicure',
    comment: 'Hygienic tools, fresh liners for the foot soak, and the massage part is longer than other places give. Booking online meant zero waiting.' },
  { reviewId: 'r8', name: 'Sanjay Rathod', rating: 5, date: '2025-06-30', serviceName: 'Global Hair Colour',
    comment: 'Was nervous about covering grey for my daughter\u2019s wedding. They did a patch test first, matched the shade well, and it still looks natural a month later.' },
];

export const CITIES = [
  'Nadiad, Gujarat', 'Anand, Gujarat', 'Vadodara, Gujarat', 'Ahmedabad, Gujarat',
  'Kheda, Gujarat', 'Petlad, Gujarat', 'Mehmedabad, Gujarat', 'Vidyanagar, Gujarat',
];

export const WHY_CHOOSE_US = [
  { icon: 'clock', title: 'On-time appointments', text: 'Your slot is reserved for you. Average waiting time after check-in is under five minutes.' },
  { icon: 'tag', title: 'Fixed, upfront pricing', text: 'The price you see while booking is the price at the counter. No surprise add-ons.' },
  { icon: 'shield', title: 'Hygiene first', text: 'Sterilised tools, fresh towels for every client, and single-use razors and liners.' },
  { icon: 'users', title: 'Experienced team', text: 'Eight stylists and therapists, each with 5+ years of experience across hair, skin and grooming.' },
];

export function getService(id) {
  return SERVICES.find((s) => s.serviceId === id) || null;
}

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
