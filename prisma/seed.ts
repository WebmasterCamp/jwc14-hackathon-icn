import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'
import { calculateReadingTime, generateExcerpt } from '../src/lib/seo'
import { buildMatchKey, buildProductSlug } from '../src/lib/product-match'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const categories = [
  {
    slug: 'iot',
    name: 'IoT Devices',
    nameTh: 'อุปกรณ์ IoT',
    description: 'Internet of Things devices for STEM education',
    icon: 'Cpu',
  },
  {
    slug: 'robotics',
    name: 'Robotics',
    nameTh: 'หุ่นยนต์',
    description: 'Educational robotics kits and components',
    icon: 'Bot',
  },
  {
    slug: '3d-printer',
    name: '3D Printers',
    nameTh: 'เครื่องพิมพ์ 3D',
    description: '3D printing equipment for prototyping',
    icon: 'Printer',
  },
  {
    slug: 'laser-cutter',
    name: 'Laser Cutters',
    nameTh: 'เครื่องตัดเลเซอร์',
    description: 'Precision laser cutting machines',
    icon: 'Zap',
  },
  {
    slug: 'cnc',
    name: 'CNC Machines',
    nameTh: 'เครื่อง CNC',
    description: 'Computer numerical control machines',
    icon: 'Settings',
  },
  {
    slug: 'drone',
    name: 'Drones',
    nameTh: 'โดรน',
    description: 'Educational drones and UAV equipment',
    icon: 'Plane',
  },
]

const thaiProvinces = [
  'กรุงเทพมหานคร',
  'กระบี่',
  'กาญจนบุรี',
  'กาฬสินธุ์',
  'กำแพงเพชร',
  'ขอนแก่น',
  'จันทบุรี',
  'ฉะเชิงเทรา',
  'ชลบุรี',
  'ชัยนาท',
  'ชัยภูมิ',
  'ชุมพร',
  'เชียงราย',
  'เชียงใหม่',
  'ตรัง',
  'ตราด',
  'ตาก',
  'นครนายก',
  'นครปฐม',
  'นครพนม',
  'นครราชสีมา',
  'นครศรีธรรมราช',
  'นครสวรรค์',
  'นนทบุรี',
  'นราธิวาส',
  'น่าน',
  'บึงกาฬ',
  'บุรีรัมย์',
  'ปทุมธานี',
  'ประจวบคีรีขันธ์',
  'ปราจีนบุรี',
  'ปัตตานี',
  'พระนครศรีอยุธยา',
  'พังงา',
  'พัทลุง',
  'พิจิตร',
  'พิษณุโลก',
  'เพชรบุรี',
  'เพชรบูรณ์',
  'แพร่',
  'พะเยา',
  'ภูเก็ต',
  'มหาสารคาม',
  'มุกดาหาร',
  'แม่ฮ่องสอน',
  'ยโสธร',
  'ยะลา',
  'ร้อยเอ็ด',
  'ระนอง',
  'ระยอง',
  'ราชบุรี',
  'ลพบุรี',
  'ลำปาง',
  'ลำพูน',
  'เลย',
  'ศรีสะเกษ',
  'สกลนคร',
  'สงขลา',
  'สตูล',
  'สมุทรปราการ',
  'สมุทรสงคราม',
  'สมุทรสาคร',
  'สระแก้ว',
  'สระบุรี',
  'สิงห์บุรี',
  'สุโขทัย',
  'สุพรรณบุรี',
  'สุราษฎร์ธานี',
  'สุรินทร์',
  'หนองคาย',
  'หนองบัวลำภู',
  'อ่างทอง',
  'อุดรธานี',
  'อุทัยธานี',
  'อุตรดิตถ์',
  'อุบลราชธานี',
  'อำนาจเจริญ',
]

const blogCategories = [
  {
    slug: 'stem-education',
    name: 'STEM Education',
    nameTh: 'การศึกษา STEM',
    description: 'แนวคิดและแนวทางการจัดการเรียนรู้แบบ STEM',
    icon: 'GraduationCap',
    color: '#2563EB',
  },
  {
    slug: 'iot-guides',
    name: 'IoT Guides',
    nameTh: 'คู่มือ IoT',
    description: 'บทความและคู่มือเกี่ยวกับอุปกรณ์ IoT สำหรับห้องเรียน',
    icon: 'Cpu',
    color: '#10B981',
  },
  {
    slug: 'robotics',
    name: 'Robotics',
    nameTh: 'หุ่นยนต์',
    description: 'เรื่องราวและกิจกรรมเกี่ยวกับหุ่นยนต์เพื่อการศึกษา',
    icon: 'Bot',
    color: '#8B5CF6',
  },
]

const blogTags = [
  { slug: 'arduino', name: 'Arduino', nameTh: 'อาร์ดูโน่' },
  { slug: 'beginner', name: 'Beginner', nameTh: 'ผู้เริ่มต้น' },
  { slug: 'classroom', name: 'Classroom', nameTh: 'ห้องเรียน' },
  { slug: 'project-based', name: 'Project-based', nameTh: 'การเรียนแบบโครงงาน' },
]

const blogPosts = [
  {
    slug: 'getting-started-with-stem-in-thai-schools',
    title: 'Getting Started with STEM in Thai Schools',
    titleTh: 'เริ่มต้นจัดการเรียนรู้ STEM ในโรงเรียนไทย',
    featuredImage: null as string | null,
    isFeatured: true,
    categorySlugs: ['stem-education'],
    tagSlugs: ['classroom', 'beginner'],
    daysAgo: 14,
    contentTh: `## STEM คืออะไร?

**STEM** คือแนวทางการจัดการเรียนรู้ที่บูรณาการ 4 สาขาเข้าด้วยกัน ได้แก่ วิทยาศาสตร์ (Science), เทคโนโลยี (Technology), วิศวกรรมศาสตร์ (Engineering) และคณิตศาสตร์ (Mathematics)

### ทำไม STEM จึงสำคัญ

การเรียนรู้แบบ STEM ช่วยให้นักเรียน:

- คิดวิเคราะห์และแก้ปัญหาอย่างเป็นระบบ
- ลงมือทำจริงผ่านโครงงาน
- เชื่อมโยงความรู้กับชีวิตจริง

### เริ่มต้นอย่างไรดี

1. เลือกอุปกรณ์ที่เหมาะกับระดับชั้น
2. ออกแบบกิจกรรมที่เปิดโอกาสให้ทดลอง
3. ประเมินผลจากกระบวนการ ไม่ใช่แค่ผลลัพธ์

> การเช่าอุปกรณ์แทนการซื้อช่วยให้โรงเรียนเริ่มต้นได้เร็วขึ้น โดยไม่ต้องลงทุนสูง

พร้อมเริ่มต้นแล้วหรือยัง? สำรวจ[อุปกรณ์ทั้งหมด](/equipment)ของเราได้เลย`,
    content: `## What is STEM?

**STEM** integrates four disciplines: Science, Technology, Engineering, and Mathematics.

### Why STEM matters

STEM learning helps students think critically, build real projects, and connect knowledge to the real world.

### How to get started

1. Pick equipment suited to the grade level
2. Design activities that encourage experimentation
3. Assess the process, not just the result

> Renting instead of buying lets schools start faster without a large upfront investment.`,
  },
  {
    slug: 'arduino-classroom-projects-for-beginners',
    title: '5 Arduino Classroom Projects for Beginners',
    titleTh: '5 โครงงาน Arduino สำหรับห้องเรียนระดับเริ่มต้น',
    featuredImage: null,
    isFeatured: true,
    categorySlugs: ['iot-guides'],
    tagSlugs: ['arduino', 'project-based', 'beginner'],
    daysAgo: 7,
    contentTh: `## เริ่มต้นกับ Arduino ในห้องเรียน

Arduino เป็นบอร์ดไมโครคอนโทรลเลอร์ที่เหมาะสำหรับการเรียนรู้ IoT เพราะใช้งานง่ายและมีชุมชนสนับสนุนขนาดใหญ่

### 5 โครงงานแนะนำ

1. **ไฟกระพริบ (Blink)** — พื้นฐานการควบคุม LED
2. **เครื่องวัดอุณหภูมิ** — ใช้เซ็นเซอร์ DHT11
3. **ไฟอัตโนมัติ** — ใช้เซ็นเซอร์แสง LDR
4. **ที่จอดรถอัจฉริยะ** — ใช้เซ็นเซอร์อัลตราโซนิก
5. **สถานีตรวจอากาศ** — รวมหลายเซ็นเซอร์เข้าด้วยกัน

| โครงงาน | ระดับความยาก | เวลาที่ใช้ |
| --- | --- | --- |
| ไฟกระพริบ | ง่าย | 1 คาบ |
| เครื่องวัดอุณหภูมิ | ปานกลาง | 2 คาบ |
| สถานีตรวจอากาศ | ยาก | 4 คาบ |

เริ่มต้นด้วย[ชุดอาร์ดูโน่เริ่มต้น](/equipment)ของเรา`,
    content: `## Getting started with Arduino

Arduino is a beginner-friendly microcontroller board, ideal for learning IoT.

### 5 recommended projects

1. **Blink** — LED control basics
2. **Thermometer** — using a DHT11 sensor
3. **Automatic light** — using an LDR
4. **Smart parking** — using an ultrasonic sensor
5. **Weather station** — combining multiple sensors`,
  },
  {
    slug: 'choosing-the-right-robotics-kit',
    title: 'How to Choose the Right Robotics Kit for Your Class',
    titleTh: 'เลือกชุดหุ่นยนต์ให้เหมาะกับห้องเรียนของคุณ',
    featuredImage: null,
    isFeatured: false,
    categorySlugs: ['robotics', 'stem-education'],
    tagSlugs: ['classroom'],
    daysAgo: 2,
    contentTh: `## ปัจจัยในการเลือกชุดหุ่นยนต์

การเลือกชุดหุ่นยนต์ที่เหมาะสมขึ้นอยู่กับหลายปัจจัย

### สิ่งที่ควรพิจารณา

- **อายุและระดับชั้น** ของนักเรียน
- **ภาษาที่ใช้เขียนโปรแกรม** เช่น Scratch หรือ Python
- **งบประมาณ** และจำนวนชุดที่ต้องการ
- **ความทนทาน** ต่อการใช้งานซ้ำ

### คำแนะนำตามระดับชั้น

- ประถม: เน้นบล็อกโปรแกรม (block-based)
- มัธยมต้น: ชุดที่ต่อยอดไปสู่ข้อความได้
- มัธยมปลาย: ชุดที่รองรับ Python และเซ็นเซอร์หลากหลาย

ดู[หุ่นยนต์เพื่อการศึกษา](/equipment?category=robotics)ทั้งหมด`,
    content: `## Factors for choosing a robotics kit

The right kit depends on age, programming language, budget, and durability.

### Recommendations by level

- Primary: block-based programming
- Lower secondary: kits that bridge to text code
- Upper secondary: kits supporting Python and varied sensors`,
  },
]

async function seedBlog(authorId: string) {
  const categoryBySlug = new Map<string, string>()
  for (const category of blogCategories) {
    const created = await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    categoryBySlug.set(category.slug, created.id)
  }

  const tagBySlug = new Map<string, string>()
  for (const tag of blogTags) {
    const created = await prisma.blogTag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    })
    tagBySlug.set(tag.slug, created.id)
  }

  for (const post of blogPosts) {
    const publishedAt = new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000)
    const excerpt = generateExcerpt(post.content)
    const excerptTh = generateExcerpt(post.contentTh)
    const readingTime = calculateReadingTime(post.contentTh)

    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        titleTh: post.titleTh,
        content: post.content,
        contentTh: post.contentTh,
        excerpt,
        excerptTh,
        featuredImage: post.featuredImage,
        authorId,
        authorType: 'USER',
        status: 'PUBLISHED',
        isFeatured: post.isFeatured,
        readingTime,
        publishedAt,
        metaTitle: post.titleTh,
        metaDescription: excerptTh,
        categories: {
          create: post.categorySlugs.map((slug) => ({
            categoryId: categoryBySlug.get(slug)!,
          })),
        },
        tags: {
          create: post.tagSlugs.map((slug) => ({
            tagId: tagBySlug.get(slug)!,
          })),
        },
      },
    })
  }
}

async function main() {
  console.log('Starting seed...')

  // Create categories
  console.log('Creating categories...')
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  // Create admin user
  console.log('Creating admin user...')
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sparkgo.co.th' },
    update: {},
    create: {
      email: 'admin@sparkgo.co.th',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  // Create demo provider
  console.log('Creating demo provider...')
  const providerPassword = await bcrypt.hash('provider123', 12)
  const providerUser = await prisma.user.upsert({
    where: { email: 'provider@sparkgo.co.th' },
    update: {},
    create: {
      email: 'provider@sparkgo.co.th',
      password: providerPassword,
      name: 'สมชาย เทคโนโลยี',
      role: 'PROVIDER',
      phone: '081-234-5678',
      emailVerified: new Date(),
    },
  })

  const provider = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      companyName: 'เทคสตาร์ท เอ็ดดูเคชั่น จำกัด',
      taxId: '0123456789012',
      address: '123 ถนนสุขุมวิท แขวงคลองเตย',
      province: 'กรุงเทพมหานคร',
      bankAccount: '123-456-7890',
      bankName: 'ธนาคารกสิกรไทย',
      description: 'ผู้จัดจำหน่ายอุปกรณ์ STEM และ IoT ชั้นนำ',
      verified: true,
      verifiedAt: new Date(),
      rating: 4.8,
    },
  })

  // Create a second demo provider so the same product can be offered by more
  // than one shop (demonstrates the multi-provider / shop-comparison feature).
  console.log('Creating second demo provider...')
  const provider2Password = await bcrypt.hash('provider123', 12)
  const provider2User = await prisma.user.upsert({
    where: { email: 'provider2@sparkgo.co.th' },
    update: {},
    create: {
      email: 'provider2@sparkgo.co.th',
      password: provider2Password,
      name: 'วิภา อิเล็กทรอนิกส์',
      role: 'PROVIDER',
      phone: '082-345-6789',
      emailVerified: new Date(),
    },
  })

  const provider2 = await prisma.provider.upsert({
    where: { userId: provider2User.id },
    update: {},
    create: {
      userId: provider2User.id,
      companyName: 'เมกเกอร์สเปซ ซัพพลาย จำกัด',
      taxId: '0987654321098',
      address: '99 ถนนนิมมานเหมินท์ ตำบลสุเทพ',
      province: 'เชียงใหม่',
      bankAccount: '987-654-3210',
      bankName: 'ธนาคารไทยพาณิชย์',
      description: 'ร้านอุปกรณ์ STEM และ IoT ภาคเหนือ ราคาเป็นกันเอง',
      verified: true,
      verifiedAt: new Date(),
      rating: 4.5,
    },
  })

  // Create demo customer
  console.log('Creating demo customer...')
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@sparkgo.co.th' },
    update: {},
    create: {
      email: 'customer@sparkgo.co.th',
      password: customerPassword,
      name: 'ครูสมหญิง ใจดี',
      role: 'CUSTOMER',
      phone: '089-876-5432',
      emailVerified: new Date(),
    },
  })

  const customer = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      schoolName: 'โรงเรียนสาธิตนวัตกรรม',
      schoolType: 'HIGH_SCHOOL',
      address: '456 ถนนพหลโยธิน แขวงจตุจักร',
      province: 'กรุงเทพมหานคร',
      studentCount: 1500,
      budget: 500000,
    },
  })

  // Get category IDs
  const iotCategory = await prisma.category.findUnique({ where: { slug: 'iot' } })
  const roboticsCategory = await prisma.category.findUnique({ where: { slug: 'robotics' } })
  const printerCategory = await prisma.category.findUnique({ where: { slug: '3d-printer' } })
  const droneCategory = await prisma.category.findUnique({ where: { slug: 'drone' } })

  // Create demo catalog products + per-provider offerings.
  //
  // A Product is the shared identity (name/specs/images); an Equipment row is
  // one shop's offering of it (price, warranty, conditions). The Arduino kit is
  // offered by BOTH providers to demonstrate the shop-comparison UI.
  console.log('Creating demo products & offerings...')

  const productCatalog = [
    {
      key: 'arduino',
      categoryId: iotCategory!.id,
      name: 'Arduino Starter Kit',
      nameTh: 'ชุดอาร์ดูโน่เริ่มต้น',
      description: 'Complete Arduino kit for beginners with sensors and components',
      descriptionTh: 'ชุดอาร์ดูโน่สำหรับผู้เริ่มต้น พร้อมเซ็นเซอร์และอุปกรณ์ครบครัน',
      brand: 'Arduino',
      model: 'Starter Kit',
      images: ['/images/arduino-kit.jpg'],
      specs: {
        board: 'Arduino Uno R3',
        sensors: 'Temperature, Light, Motion, Ultrasonic',
        components: '50+ pieces',
        language: 'C/C++',
      },
      curriculum: ['วิทยาศาสตร์', 'เทคโนโลยี', 'วิศวกรรม'],
    },
    {
      key: 'spike',
      categoryId: roboticsCategory!.id,
      name: 'LEGO Education SPIKE Prime',
      nameTh: 'เลโก้เอ็ดดูเคชั่น สไปค์ไพรม์',
      description: 'Advanced STEM robotics kit for middle school students',
      descriptionTh: 'ชุดหุ่นยนต์ STEM ขั้นสูงสำหรับนักเรียนมัธยม',
      brand: 'LEGO Education',
      model: 'SPIKE Prime',
      images: ['/images/spike-prime.jpg'],
      specs: {
        hub: 'Programmable Hub with 6 ports',
        motors: '2 Large, 1 Medium',
        sensors: 'Color, Distance, Force',
        pieces: '528 pieces',
      },
      curriculum: ['หุ่นยนต์', 'โปรแกรมมิ่ง', 'วิทยาศาสตร์'],
    },
    {
      key: 'ender',
      categoryId: printerCategory!.id,
      name: 'Creality Ender-3 V3',
      nameTh: 'เครื่องพิมพ์ 3D Creality Ender-3 V3',
      description: 'Reliable FDM 3D printer for educational prototyping',
      descriptionTh: 'เครื่องพิมพ์ 3D แบบ FDM สำหรับการเรียนรู้และสร้างต้นแบบ',
      brand: 'Creality',
      model: 'Ender-3 V3',
      images: ['/images/ender-3.jpg'],
      specs: {
        buildVolume: '220x220x250mm',
        layerResolution: '0.1-0.4mm',
        printSpeed: '180mm/s',
        filament: 'PLA, ABS, PETG',
      },
      curriculum: ['ออกแบบ', 'เทคโนโลยี', 'นวัตกรรม'],
    },
    {
      key: 'tello',
      categoryId: droneCategory!.id,
      name: 'DJI Tello EDU',
      nameTh: 'โดรนเพื่อการศึกษา DJI Tello EDU',
      description: 'Programmable mini drone for learning coding and flight',
      descriptionTh: 'โดรนขนาดเล็กที่สามารถเขียนโปรแกรมได้สำหรับเรียนรู้การบินและโค้ดดิ้ง',
      brand: 'DJI',
      model: 'Tello EDU',
      images: ['/images/tello-edu.jpg'],
      specs: {
        flightTime: '13 minutes',
        maxSpeed: '8 m/s',
        camera: '5MP (720p)',
        programming: 'Scratch, Python, Swift',
      },
      curriculum: ['โปรแกรมมิ่ง', 'ฟิสิกส์', 'เทคโนโลยี'],
    },
  ]

  const productByKey = new Map<string, { id: string }>()
  for (const p of productCatalog) {
    const matchKey = buildMatchKey({ brand: p.brand, model: p.model, name: p.name })
    const created = await prisma.product.upsert({
      where: { matchKey },
      update: {
        name: p.name,
        nameTh: p.nameTh,
        description: p.description,
        descriptionTh: p.descriptionTh,
        brand: p.brand,
        model: p.model,
        images: p.images,
        specs: p.specs,
        curriculum: p.curriculum,
        categoryId: p.categoryId,
      },
      create: {
        categoryId: p.categoryId,
        slug: buildProductSlug(p.name, p.key),
        matchKey,
        name: p.name,
        nameTh: p.nameTh,
        description: p.description,
        descriptionTh: p.descriptionTh,
        brand: p.brand,
        model: p.model,
        images: p.images,
        specs: p.specs,
        curriculum: p.curriculum,
      },
    })
    productByKey.set(p.key, created)
  }

  // Offerings: (provider, product) is unique, so upsert keeps this idempotent.
  const offerings = [
    // Provider 1 — Bangkok shop, offers everything.
    {
      provider,
      productKey: 'arduino',
      rentPriceMonthly: 1500,
      leaseToOwnPrice: 25000,
      leaseDuration: 24,
      depositAmount: 3000,
      stock: 20,
      availableStock: 18,
      condition: 'NEW' as const,
      insuranceMonths: 12,
      conditions: 'รับประกันเฉพาะความเสียหายจากการผลิต ไม่รวมการตกหล่น ส่งฟรีในกรุงเทพฯ',
    },
    {
      provider,
      productKey: 'spike',
      rentPriceMonthly: 3500,
      leaseToOwnPrice: 55000,
      leaseDuration: 24,
      depositAmount: 7000,
      stock: 15,
      availableStock: 12,
      condition: 'NEW' as const,
      insuranceMonths: 12,
      conditions: 'รับประกันชิ้นส่วนอิเล็กทรอนิกส์ 1 ปี ผู้เช่ารับผิดชอบชิ้นส่วนที่สูญหาย',
    },
    {
      provider,
      productKey: 'ender',
      rentPriceMonthly: 2500,
      leaseToOwnPrice: 35000,
      leaseDuration: 18,
      depositAmount: 5000,
      stock: 10,
      availableStock: 8,
      condition: 'NEW' as const,
      insuranceMonths: 6,
      conditions: 'รวมการบำรุงรักษาเบื้องต้น ผู้เช่าจัดหาเส้นฟิลาเมนต์เอง',
    },
    {
      provider,
      productKey: 'tello',
      rentPriceMonthly: 1800,
      leaseToOwnPrice: 28000,
      leaseDuration: 18,
      depositAmount: 4000,
      stock: 25,
      availableStock: 22,
      condition: 'NEW' as const,
      insuranceMonths: 6,
      conditions: 'ประกันรวมการชน 1 ครั้ง เปลี่ยนใบพัดฟรีตลอดสัญญา',
    },
    // Provider 2 — Chiang Mai shop, also offers the Arduino kit (shared!) + Tello.
    {
      provider: provider2,
      productKey: 'arduino',
      rentPriceMonthly: 1350,
      leaseToOwnPrice: 24000,
      leaseDuration: 24,
      depositAmount: 2500,
      stock: 12,
      availableStock: 12,
      condition: 'EXCELLENT' as const,
      insuranceMonths: 18,
      conditions: 'รับประกันยาว 18 เดือน เปลี่ยนเครื่องใหม่ใน 7 วันแรกหากชำรุด ส่งฟรีทั่วภาคเหนือ',
    },
    {
      provider: provider2,
      productKey: 'tello',
      rentPriceMonthly: 1950,
      leaseToOwnPrice: 27500,
      leaseDuration: 12,
      depositAmount: 3500,
      stock: 8,
      availableStock: 8,
      condition: 'NEW' as const,
      insuranceMonths: 12,
      conditions: 'อบรมการใช้งานฟรี 1 ชั่วโมง รับประกันอุบัติเหตุ 2 ครั้ง',
    },
  ]

  for (const o of offerings) {
    const product = productByKey.get(o.productKey)!
    const p = productCatalog.find((c) => c.key === o.productKey)!
    await prisma.equipment.upsert({
      where: {
        providerId_productId: { providerId: o.provider.id, productId: product.id },
      },
      update: {
        rentPriceMonthly: o.rentPriceMonthly,
        leaseToOwnPrice: o.leaseToOwnPrice,
        leaseDuration: o.leaseDuration,
        depositAmount: o.depositAmount,
        condition: o.condition,
        insuranceMonths: o.insuranceMonths,
        conditions: o.conditions,
      },
      create: {
        providerId: o.provider.id,
        productId: product.id,
        categoryId: p.categoryId,
        name: p.name,
        nameTh: p.nameTh,
        description: p.description,
        descriptionTh: p.descriptionTh,
        images: p.images,
        specs: p.specs,
        curriculum: p.curriculum,
        rentPriceMonthly: o.rentPriceMonthly,
        leaseToOwnPrice: o.leaseToOwnPrice,
        leaseDuration: o.leaseDuration,
        depositAmount: o.depositAmount,
        stock: o.stock,
        availableStock: o.availableStock,
        condition: o.condition,
        insuranceMonths: o.insuranceMonths,
        conditions: o.conditions,
      },
    })
  }

  // Create blog categories, tags, and posts
  console.log('Creating blog content...')
  await seedBlog(admin.id)

  console.log('Seed completed successfully!')
  console.log(`
Demo accounts:
- Admin: admin@sparkgo.co.th / admin123
- Provider: provider@sparkgo.co.th / provider123
- Customer: customer@sparkgo.co.th / customer123
  `)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
