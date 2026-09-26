// Initial mock and persistent database for Shane's Tattoo Shop

export const INITIAL_ARTISTS = [
  {
    id: 'shane',
    name: 'Shane Vance',
    role: 'Owner & Master Artist',
    experience: '18+ Years',
    specialties: ['Dark Realism', 'Japanese Irezumi', 'Full Sleeves & Backpieces', 'Biomechanical'],
    hourlyRate: 220,
    minPrice: 200,
    bio: 'Founder of Shane\'s Tattoo Shop. World-renowned for large-scale Japanese traditional sleeves and high-contrast dark realism. Former guest artist at Tokyo & Berlin tattoo conventions.',
    image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    instagram: '@shane_vance_ink',
    rating: 5.0,
    reviewCount: 482,
    awards: ['Best in Show - NY Tattoo Expo 2024', '1st Place Large Black & Grey - West Coast Ink 2025'],
    availableDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    status: 'Bookings Open for 2026'
  },
  {
    id: 'elena',
    name: 'Elena "Viper" Ramos',
    role: 'Resident Artist',
    experience: '8 Years',
    specialties: ['Fine Line Botanical', 'Micro-Realism', 'Chicano Lettering', 'Single Needle'],
    hourlyRate: 175,
    minPrice: 150,
    bio: 'Specializing in delicate botanical flora, ultra-fine needle animal portraits, and ethereal single-needle composition. Famous for surgical precision and gentle needle touch.',
    image: 'https://images.unsplash.com/photo-1590246814883-578336ff3360?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    instagram: '@viper_fineline',
    rating: 4.96,
    reviewCount: 310,
    awards: ['Best Fine Line Artist - Golden Needle 2025'],
    availableDays: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'Limited Flash Slots'
  },
  {
    id: 'jax',
    name: 'Jax "Kross" Mercer',
    role: 'Resident Artist',
    experience: '10 Years',
    specialties: ['Neo-Traditional', 'Vibrant Color Saturation', 'Pop Culture & Anime', 'Horror'],
    hourlyRate: 180,
    minPrice: 160,
    bio: 'Heavy line weights, electric color blending, and bold neo-traditional flash. Jax creates art that pops off the skin from across the room and heals like iron.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    instagram: '@jax_kross_tattoos',
    rating: 4.94,
    reviewCount: 275,
    awards: ['Best Neo-Traditional - Chicago Ink Fest 2024'],
    availableDays: ['Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    status: 'Walk-ins Welcome Today'
  },
  {
    id: 'maya',
    name: 'Maya Lin',
    role: 'Resident Artist',
    experience: '6 Years',
    specialties: ['Sacred Geometry', 'Dotwork / Mandalas', 'Ornamental Blackwork', 'Cyberpunk'],
    hourlyRate: 165,
    minPrice: 140,
    bio: 'Architectural dotwork, hypnotic sacred mandalas, and futuristic cyberpunk ornamental sleeves. Maya utilizes rhythmic stippling and anatomical flow.',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    instagram: '@mayalin_geometry',
    rating: 4.98,
    reviewCount: 220,
    awards: ['Best Ornamental & Dotwork - Montreal Tattoo Convention 2025'],
    availableDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    status: 'Accepting Custom Designs'
  }
];

export const INITIAL_FLASH_DESIGNS = [
  {
    id: 'flash-01',
    title: 'Hannya Dagger & Peony',
    artistId: 'shane',
    artistName: 'Shane Vance',
    category: 'Japanese Irezumi',
    price: 380,
    deposit: 100,
    size: '7" x 4"',
    estTime: '3.5 hrs',
    image: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=800&q=80',
    claimed: false,
    placement: 'Forearm / Calf / Thigh',
    description: 'Traditional Japanese Hannya mask pierced with a gilded ceremonial dagger wrapped in blooming wind peonies.'
  },
  {
    id: 'flash-02',
    title: 'Celestial Moth & Moon Phase',
    artistId: 'elena',
    artistName: 'Elena Ramos',
    category: 'Fine Line Botanical',
    price: 260,
    deposit: 75,
    size: '5" x 3"',
    estTime: '2.0 hrs',
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80',
    claimed: false,
    placement: 'Sternum / Forearm / Spine',
    description: 'Micro-detailed death-head hawk moth surrounded by lunar cycles and fine stippling stars.'
  },
  {
    id: 'flash-03',
    title: 'Crimson Cyber Samurai',
    artistId: 'jax',
    artistName: 'Jax Mercer',
    category: 'Neo-Traditional',
    price: 450,
    deposit: 120,
    size: '8" x 5"',
    estTime: '4.0 hrs',
    image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    claimed: false,
    placement: 'Bicep / Shoulder / Outer Thigh',
    description: 'Vibrant neon red and cyan cyberpunk ronin warrior with glowing visor and cherry blossom kanji.'
  },
  {
    id: 'flash-04',
    title: 'Metatron Sacred Cube & Mandala',
    artistId: 'maya',
    artistName: 'Maya Lin',
    category: 'Sacred Geometry',
    price: 320,
    deposit: 80,
    size: '6" x 6"',
    estTime: '3.0 hrs',
    image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
    claimed: false,
    placement: 'Upper Back / Forearm / Chest',
    description: 'Precision 3RL dotwork sacred geometric mandala centered with the Cube of Metatron.'
  },
  {
    id: 'flash-05',
    title: 'Ouroboros Serpent & Black Sun',
    artistId: 'shane',
    artistName: 'Shane Vance',
    category: 'Dark Realism',
    price: 420,
    deposit: 100,
    size: '7" x 5"',
    estTime: '3.5 hrs',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    claimed: false,
    placement: 'Chest / Ribs / Bicep',
    description: 'Deep textured serpent devouring its own tail, shadowed with charcoal dark realism gradients.'
  },
  {
    id: 'flash-06',
    title: 'Gilded Baroque Rose & Key',
    artistId: 'elena',
    artistName: 'Elena Ramos',
    category: 'Fine Line Botanical',
    price: 290,
    deposit: 75,
    size: '5" x 3.5"',
    estTime: '2.5 hrs',
    image: 'https://images.unsplash.com/photo-1590246814883-578336ff3360?auto=format&fit=crop&w=800&q=80',
    claimed: false,
    placement: 'Collarbone / Wrist / Ribcage',
    description: 'Antique skeleton key intertwined with climbing heirloom roses and micro thorn accents.'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-01',
    name: 'Shane\'s Signature Hustle Butter & Healing Balm',
    price: 24.99,
    category: 'Aftercare',
    rating: 4.9,
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    description: 'All-natural vegan mango butter, shea butter, and vitamin E. Accelerates healing by 40% and keeps colors razor-sharp.',
    badge: 'Best Seller'
  },
  {
    id: 'prod-02',
    name: 'Heavyweight Studio Dagger Hoodie (Vintage Black)',
    price: 68.00,
    category: 'Apparel',
    rating: 5.0,
    reviews: 140,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    description: '450 GSM French terry cotton. Screen printed with Shane\'s iconic Japanese dragon crest on back and dagger on sleeves.',
    badge: 'Limited Drop'
  },
  {
    id: 'prod-03',
    name: 'Antibacterial Foaming Cleanser (8oz)',
    price: 18.50,
    category: 'Aftercare',
    rating: 4.8,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    description: 'pH-balanced sterile cleansing foam with soothing chamomile and aloe vera. Safe for freshly tattooed open skin.'
  },
  {
    id: 'prod-04',
    name: 'Shane\'s Tattoo Studio Gift Card ($100 - $500)',
    price: 150.00,
    category: 'Gift Card',
    rating: 5.0,
    reviews: 62,
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    description: 'The ultimate gift for tattoo collectors. Valid for any resident artist or custom flash pieces. Never expires.',
    badge: 'Instant Digital Delivery'
  }
];

export const INITIAL_PAY_STUBS = [
  {
    id: 'PAY-2026-0924-01',
    artistId: 'elena',
    artistName: 'Elena Ramos',
    role: 'Resident Artist',
    payPeriodStart: '2026-09-08',
    payPeriodEnd: '2026-09-22',
    paymentDate: '2026-09-24',
    status: 'Paid',
    grossTattooRevenue: 6450.00,
    commissionRate: 0.65, // 65% artist / 35% shop
    artistTattooShare: 4192.50,
    totalTips: 840.00,
    hoursWorked: 48.5,
    boothFee: 0, // Commission model
    deductions: {
      suppliesDisposables: 140.00,
      ccProcessingShare: 89.20,
      medicalSanitaryPouch: 45.00
    },
    totalDeductions: 274.20,
    taxWithholding: 0, // 1099 Independent Contractor
    netPayout: 4758.30,
    payoutMethod: 'Direct Deposit (Chase ****4912)',
    notes: 'Bi-weekly pay. Incredible fine-line project completions!'
  },
  {
    id: 'PAY-2026-0924-02',
    artistId: 'jax',
    artistName: 'Jax Mercer',
    role: 'Resident Artist',
    payPeriodStart: '2026-09-08',
    payPeriodEnd: '2026-09-22',
    paymentDate: '2026-09-24',
    status: 'Paid',
    grossTattooRevenue: 7200.00,
    commissionRate: 0.65,
    artistTattooShare: 4680.00,
    totalTips: 960.00,
    hoursWorked: 52.0,
    boothFee: 0,
    deductions: {
      suppliesDisposables: 165.00,
      ccProcessingShare: 98.40,
      medicalSanitaryPouch: 45.00
    },
    totalDeductions: 308.40,
    taxWithholding: 0,
    netPayout: 5331.60,
    payoutMethod: 'Direct Deposit (Wells Fargo ****8821)',
    notes: 'Completed 2 large anime color back sessions. Top performer this cycle.'
  },
  {
    id: 'PAY-2026-0924-03',
    artistId: 'maya',
    artistName: 'Maya Lin',
    role: 'Resident Artist',
    payPeriodStart: '2026-09-08',
    payPeriodEnd: '2026-09-22',
    paymentDate: '2026-09-24',
    status: 'Paid',
    grossTattooRevenue: 5800.00,
    commissionRate: 0.65,
    artistTattooShare: 3770.00,
    totalTips: 720.00,
    hoursWorked: 44.0,
    boothFee: 0,
    deductions: {
      suppliesDisposables: 120.00,
      ccProcessingShare: 79.50,
      medicalSanitaryPouch: 45.00
    },
    totalDeductions: 244.50,
    taxWithholding: 0,
    netPayout: 4245.50,
    payoutMethod: 'Direct Deposit (Bank of America ****3190)',
    notes: 'Sacred geometry master sessions. Seamless client care.'
  },
  {
    id: 'PAY-2026-0924-04',
    artistId: 'shane',
    artistName: 'Shane Vance',
    role: 'Owner & Master Artist',
    payPeriodStart: '2026-09-08',
    payPeriodEnd: '2026-09-22',
    paymentDate: '2026-09-24',
    status: 'Paid',
    grossTattooRevenue: 11400.00,
    commissionRate: 1.00, // Owner retains full client revenue (shop profit accounted separately)
    artistTattooShare: 11400.00,
    totalTips: 1650.00,
    hoursWorked: 60.0,
    boothFee: 0,
    deductions: {
      suppliesDisposables: 210.00,
      ccProcessingShare: 154.00,
      medicalSanitaryPouch: 60.00
    },
    totalDeductions: 424.00,
    taxWithholding: 0, // Owner Draw / Pass-through
    netPayout: 12626.00,
    payoutMethod: 'Owner Draw / Wire (Business Checking ****1099)',
    notes: 'Master Japanese backpiece session + 3 realism portraits.'
  },
  {
    id: 'PAY-2026-0910-01',
    artistId: 'elena',
    artistName: 'Elena Ramos',
    role: 'Resident Artist',
    payPeriodStart: '2026-08-25',
    payPeriodEnd: '2026-09-07',
    paymentDate: '2026-09-10',
    status: 'Paid',
    grossTattooRevenue: 6100.00,
    commissionRate: 0.65,
    artistTattooShare: 3965.00,
    totalTips: 790.00,
    hoursWorked: 46.0,
    boothFee: 0,
    deductions: {
      suppliesDisposables: 130.00,
      ccProcessingShare: 82.00,
      medicalSanitaryPouch: 45.00
    },
    totalDeductions: 257.00,
    taxWithholding: 0,
    netPayout: 4498.00,
    payoutMethod: 'Direct Deposit (Chase ****4912)',
    notes: 'Regular bi-weekly payout.'
  }
];

export const INITIAL_YEARLY_TAX_DATA = {
  currentYear: 2026,
  businessLegalName: "Shane's Tattoo Studio LLC",
  ein: "XX-XXX8492",
  taxEntity: "Single Member LLC / S-Corp Election (Form 1120-S / Schedule C)",
  fiscalYear: "Jan 1, 2026 - Dec 31, 2026 (YTD)",
  
  monthlyRevenue2026: [
    { month: 'Jan', grossRevenue: 42800, artistPayouts: 22100, shopExpenses: 6800, netShopProfit: 13900 },
    { month: 'Feb', grossRevenue: 44500, artistPayouts: 23400, shopExpenses: 7100, netShopProfit: 14000 },
    { month: 'Mar', grossRevenue: 49200, artistPayouts: 25800, shopExpenses: 7600, netShopProfit: 15800 },
    { month: 'Apr', grossRevenue: 47100, artistPayouts: 24700, shopExpenses: 7300, netShopProfit: 15100 },
    { month: 'May', grossRevenue: 52400, artistPayouts: 27500, shopExpenses: 8100, netShopProfit: 16800 },
    { month: 'Jun', grossRevenue: 56800, artistPayouts: 29800, shopExpenses: 8900, netShopProfit: 18100 },
    { month: 'Jul', grossRevenue: 58900, artistPayouts: 31000, shopExpenses: 9200, netShopProfit: 18700 },
    { month: 'Aug', grossRevenue: 54600, artistPayouts: 28700, shopExpenses: 8500, netShopProfit: 17400 },
    { month: 'Sep (YTD)', grossRevenue: 48400, artistPayouts: 25400, shopExpenses: 7800, netShopProfit: 15200 },
  ],

  summaryTotals: {
    grossReceiptsYTD: 454700.00,
    merchandiseGrossYTD: 28400.00,
    totalGrossRevenue: 483100.00,
    returnsAndRefunds: 1850.00,
    costOfGoodsSold: 34200.00, // Inks, Cartridges, Saniderm, PPE
    grossProfit: 447050.00,
    
    // Schedule C Itemized Deductions
    deductions: {
      contractLabor1099: 238400.00, // Elena, Jax, Maya + Guest artists
      studioLeaseRent: 42000.00,
      utilitiesPowerWifiWater: 6400.00,
      businessInsuranceLiability: 8200.00,
      advertisingSocialMarketing: 9600.00,
      depreciationMachinesAutoclave: 11500.00,
      legalLicensingBiohazardFees: 4800.00,
      merchantProcessingFees: 13200.00,
      travelGuestConventions: 7400.00,
      studioMaintenanceSanitation: 5900.00
    },
    totalItemizedDeductions: 347400.00,
    netTaxableBusinessIncome: 99650.00,
    projectedAnnualTaxLiability: 27900.00
  },

  quarterlyTaxes1040ES: [
    { quarter: 'Q1 (Due Apr 15)', estimatedAmount: 6975.00, paidAmount: 6975.00, datePaid: '2026-04-12', status: 'Paid in Full', confirmationNum: 'EFTPS-9481023' },
    { quarter: 'Q2 (Due Jun 15)', estimatedAmount: 6975.00, paidAmount: 6975.00, datePaid: '2026-06-14', status: 'Paid in Full', confirmationNum: 'EFTPS-9921405' },
    { quarter: 'Q3 (Due Sep 15)', estimatedAmount: 6975.00, paidAmount: 6975.00, datePaid: '2026-09-12', status: 'Paid in Full', confirmationNum: 'EFTPS-1049281' },
    { quarter: 'Q4 (Due Jan 15, 2027)', estimatedAmount: 6975.00, paidAmount: 0, datePaid: null, status: 'Upcoming', confirmationNum: null }
  ],

  contractor1099List: [
    {
      id: '1099-01',
      contractorName: 'Elena Ramos',
      taxId: '***-**-4912',
      address: '1420 Art District Blvd, Apt 4B',
      compensationYTD: 52400.00,
      w9OnFile: true,
      form1099Status: 'Ready to Generate'
    },
    {
      id: '1099-02',
      contractorName: 'Jax Mercer',
      taxId: '***-**-8821',
      address: '774 Neon Ave, Suite 12',
      compensationYTD: 58600.00,
      w9OnFile: true,
      form1099Status: 'Ready to Generate'
    },
    {
      id: '1099-03',
      contractorName: 'Maya Lin',
      taxId: '***-**-3190',
      address: '302 Sacred Way, Loft 2',
      compensationYTD: 46800.00,
      w9OnFile: true,
      form1099Status: 'Ready to Generate'
    },
    {
      id: '1099-04',
      contractorName: 'Marco "Skull" Silva (Guest Artist)',
      taxId: '***-**-1104',
      address: '890 Sunset Blvd',
      compensationYTD: 14200.00,
      w9OnFile: true,
      form1099Status: 'Ready to Generate'
    }
  ]
};

export const INITIAL_CUSTOM_PAGES = [
  {
    id: 'page-01',
    title: 'International Guest Spot Tour 2026',
    slug: 'events/guest-spot-2026',
    metaDescription: 'World-famous international tattoo artists visiting Shane\'s Tattoo Shop this season. Extremely limited appointments.',
    status: 'Published',
    publishedAt: '2026-08-15',
    blocks: [
      {
        id: 'b1',
        type: 'hero',
        heading: 'World Masters Guest Residency',
        subheading: 'Featuring Tokyo Irezumi Legend Kenjiro & Berlin Dark Blackwork Master Sarah Vogel.',
        badge: 'Limited Engagement October - December 2026',
        bgImage: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80',
        ctaText: 'Reserve Guest Spot Slot',
        ctaLink: '#book'
      },
      {
        id: 'b2',
        type: 'text',
        title: 'An Unprecedented Tattoo Gathering in our Private Studio',
        content: `Every year, Shane invites master tattooers from Japan, Germany, and Brazil to work alongside our resident team.

All guest artists are fully licensed with hospital-grade sterile autoclave certification. Booking requires a $200 non-refundable project deposit which is deducted from your final tattoo price.`
      },
      {
        id: 'b3',
        type: 'pricing_table',
        title: 'Guest Artist Rates & Availability',
        tiers: [
          { name: 'Kenjiro Sato (Tokyo)', specialty: 'Authentic Tebori & Machine Dragon Sleeves', rate: '$260/hr (Min 4 hrs)', dates: 'Oct 12 - Oct 28' },
          { name: 'Sarah Vogel (Berlin)', specialty: 'Brutalist Blackwork & Heavy Saturated Abstraction', rate: '$230/hr (Min 3 hrs)', dates: 'Nov 04 - Nov 20' }
        ]
      }
    ]
  },
  {
    id: 'page-02',
    title: 'Sterile Piercing & Body Modification Lounge',
    slug: 'piercings-body-mod',
    metaDescription: 'Implant-grade titanium and 14K solid gold piercing services by certified APP master piercers at Shane\'s.',
    status: 'Published',
    publishedAt: '2026-07-10',
    blocks: [
      {
        id: 'b1',
        type: 'hero',
        heading: 'Luxury Body Piercing Lounge',
        subheading: 'Implant-Grade ASTM F-136 Titanium & Solid 14K Gold Curated Fine Jewelry.',
        badge: 'Association of Professional Piercers (APP) Certified',
        bgImage: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1200&q=80',
        ctaText: 'Book Piercing Appointment',
        ctaLink: '#book'
      },
      {
        id: 'b2',
        type: 'text',
        title: 'Zero Pressure. Maximum Sterility. Timeless Curation.',
        content: `At Shane's Studio, we believe piercing is an art form. We use statIM autoclaves to sterilize all jewelry immediately in front of you. 

We NEVER use piercing guns. All procedures utilize surgical tri-beveled single-use needles for painless, rapid healing.`
      },
      {
        id: 'b3',
        type: 'pricing_table',
        title: 'Curated Piercing Menu',
        tiers: [
          { name: 'Lobe Curation (Pair)', specialty: 'Includes Titanium flat-backs', rate: '$65 + Jewelry', dates: 'Daily 12pm - 8pm' },
          { name: 'Helix / Flat / Conch', specialty: 'Anatomical ear styling', rate: '$50 + Jewelry', dates: 'Daily 12pm - 8pm' },
          { name: 'Nostril / Septum', specialty: 'Precision placement with gold seam rings', rate: '$55 + Jewelry', dates: 'Daily 12pm - 8pm' },
          { name: 'Navel & Surface Bar', specialty: 'Mirror-finish high polish titanium', rate: '$65 + Jewelry', dates: 'Daily 12pm - 8pm' }
        ]
      }
    ]
  },
  {
    id: 'page-03',
    title: 'Midnight Halloween Flash Marathon',
    slug: 'promos/halloween-flash-night',
    metaDescription: 'Our legendary annual Halloween Flash Marathon. 100+ exclusive spooky flash designs starting at $100.',
    status: 'Published',
    publishedAt: '2026-09-01',
    blocks: [
      {
        id: 'b1',
        type: 'hero',
        heading: 'Midnight Halloween Flash Marathon',
        subheading: 'October 31st | 12:00 PM until 2:00 AM | First Come, First Inked.',
        badge: '🎃 13th Annual Studio Tradition',
        bgImage: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=80',
        ctaText: 'View Flash Preview Sheet',
        ctaLink: '#gallery'
      },
      {
        id: 'b2',
        type: 'text',
        title: 'Rules of the Night',
        content: `1. Flash designs are AS-IS. No resizing or customization during the marathon.
2. Arms & Legs placement only.
3. First 25 people in line receive a free Shane's Heavyweight studio beanie & aftercare kit.
4. Refreshments, live DJ, and flash giveaway raffles all night long.`
      }
    ]
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: 'APT-8401',
    clientName: 'Marcus Vance',
    clientEmail: 'marcus.v@example.com',
    clientPhone: '(555) 392-1084',
    artistId: 'shane',
    artistName: 'Shane Vance',
    service: 'Custom Sleeve (Session 3/5)',
    placement: 'Full Right Arm Sleeve',
    date: '2026-09-28',
    time: '1:00 PM',
    durationHours: 5,
    depositPaid: 200,
    estimatedTotal: 1100,
    status: 'Confirmed',
    notes: 'Continuing Japanese Ryu Dragon scales and cloud shading.'
  },
  {
    id: 'APT-8402',
    clientName: 'Sophia Chen',
    clientEmail: 'sophia.c@example.com',
    clientPhone: '(555) 841-3920',
    artistId: 'elena',
    artistName: 'Elena Ramos',
    service: 'Flash Claim - Celestial Moth',
    placement: 'Sternum',
    date: '2026-09-29',
    time: '3:30 PM',
    durationHours: 2.5,
    depositPaid: 75,
    estimatedTotal: 260,
    status: 'Confirmed',
    notes: 'First tattoo. Requested numbing cream consultation.'
  },
  {
    id: 'APT-8403',
    clientName: 'Derek Taylor',
    clientEmail: 'derek.t@example.com',
    clientPhone: '(555) 203-9182',
    artistId: 'jax',
    artistName: 'Jax Mercer',
    service: 'Cover-Up Piece',
    placement: 'Left Shoulder',
    date: '2026-09-30',
    time: '12:00 PM',
    durationHours: 4,
    depositPaid: 120,
    estimatedTotal: 720,
    status: 'Confirmed',
    notes: 'Covering up an old 2014 tribal piece with Neo-Traditional Panther head.'
  },
  {
    id: 'APT-8404',
    clientName: 'Aria Thorne',
    clientEmail: 'aria.t@example.com',
    clientPhone: '(555) 771-4920',
    artistId: 'maya',
    artistName: 'Maya Lin',
    service: 'Sacred Mandala Dotwork',
    placement: 'Upper Spine / Nape',
    date: '2026-10-02',
    time: '2:00 PM',
    durationHours: 3.5,
    depositPaid: 80,
    estimatedTotal: 560,
    status: 'Pending Deposit',
    notes: 'Reference files uploaded.'
  }
];

export const INITIAL_INVENTORY = [
  { id: 'inv-01', item: 'Kwadron Cartridge Needles 3RL', category: 'Needles', stock: 140, minThreshold: 50, unit: 'pcs', unitCost: 1.45, supplier: 'Kwadron EU' },
  { id: 'inv-02', item: 'Kwadron Cartridge Needles 9M1 Mag', category: 'Needles', stock: 85, minThreshold: 40, unit: 'pcs', unitCost: 1.65, supplier: 'Kwadron EU' },
  { id: 'inv-03', item: 'Dynamic Triple Black Ink (8oz)', category: 'Inks', stock: 12, minThreshold: 6, unit: 'bottles', unitCost: 28.00, supplier: 'Dynamic Color Co' },
  { id: 'inv-04', item: 'Eternal Ink Primary 16 Color Set', category: 'Inks', stock: 4, minThreshold: 3, unit: 'kits', unitCost: 165.00, supplier: 'Eternal Ink' },
  { id: 'inv-05', item: 'Saniderm Protective Film Rolls (8in x 8yd)', category: 'Medical/PPE', stock: 8, minThreshold: 5, unit: 'rolls', unitCost: 42.00, supplier: 'Saniderm' },
  { id: 'inv-06', item: 'Black Nitrile Gloves (Medium - Box of 100)', category: 'Medical/PPE', stock: 24, minThreshold: 10, unit: 'boxes', unitCost: 14.50, supplier: 'MedSupply Direct' },
  { id: 'inv-07', item: 'Cavicide Hospital Surface Disinfectant (Gallon)', category: 'Sanitation', stock: 6, minThreshold: 3, unit: 'gallons', unitCost: 36.00, supplier: 'Metrex' },
  { id: 'inv-08', item: 'Autoclave Sterilization Pouches (Box of 200)', category: 'Sanitation', stock: 9, minThreshold: 4, unit: 'boxes', unitCost: 22.50, supplier: 'Propper' }
];

export const INITIAL_REVIEWS = [
  {
    id: 'rev-01',
    author: 'Gabriel Santos',
    rating: 5,
    date: 'September 18, 2026',
    artist: 'Shane Vance',
    title: 'Absolute Masterpiece - True Living Art',
    text: 'Shane is not just a tattooer; he is a master fine artist. He took my rough concept for a full Japanese sleeve and turned it into an anatomically perfect work of art. The shop is cleaner than a surgical room, the vibe is chill, and the healing was effortless with his custom saniderm protocol. Worth every single dollar.',
    image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=400&q=80',
    verified: true
  },
  {
    id: 'rev-02',
    author: 'Chloe Davenport',
    rating: 5,
    date: 'September 14, 2026',
    artist: 'Elena "Viper" Ramos',
    title: 'Finest Lines in the Entire Country',
    text: 'Elena did a 4-inch fine line wild poppy and swallow on my ribs. Her touch is so gentle I barely felt any pain! Two weeks later it is fully healed with zero ink blowout. The digital aftercare guide they send you is so helpful.',
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=400&q=80',
    verified: true
  },
  {
    id: 'rev-03',
    author: 'Trevor McKnight',
    rating: 5,
    date: 'September 02, 2026',
    artist: 'Jax Mercer',
    title: 'Incredible Cover-up Job!',
    text: 'I had an embarrassing faded tattoo from 10 years ago. Jax designed an insane neo-traditional colored panther that completely obliterated the old ink. You cannot see even a trace of the original tattoo. Absolute wizard.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80',
    verified: true
  }
];
