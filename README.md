# ฟังก์ชันหลักในระบบ

## หน้าเพจและเลย์เอาต์

- **AdminContractDetailPage** - หน้ารายละเอียดสัญญาสำหรับแอดมิน
- **AdminContractsPage** - หน้าจัดการสัญญาทั้งหมดสำหรับแอดมิน
- **AdminCustomersPage** - หน้าจัดการลูกค้าสำหรับแอดมิน
- **AdminDashboardLayout** - เลย์เอาต์แดชบอร์ดแอดมิน
- **AdminDashboardLoading** - หน้าโหลดแดชบอร์ดแอดมิน
- **AdminDashboardPage** - หน้าแดชบอร์ดหลักของแอดมิน
- **AdminProvidersPage** - หน้าจัดการผู้ให้บริการสำหรับแอดมิน
- **AuthLayout** - เลย์เอาต์สำหรับหน้าเข้าสู่ระบบ
- **CustomerContractsPage** - หน้าสัญญาของลูกค้า
- **CustomerDashboardLayout** - เลย์เอาต์แดชบอร์ดลูกค้า
- **CustomerDashboardLoading** - หน้าโหลดแดชบอร์ดลูกค้า
- **CustomerDashboardPage** - หน้าแดชบอร์ดหลักของลูกค้า
- **CustomerMaintenancePage** - หน้าจัดการการบำรุงรักษาของลูกค้า
- **CustomerPaymentsPage** - หน้าการชำระเงินของลูกค้า
- **CustomerSignUpPage** - หน้าสมัครสมาชิกสำหรับลูกค้า
- **EditEquipmentPage** - หน้าแก้ไขอุปกรณ์
- **EquipmentDetailLoading** - หน้าโหลดรายละเอียดอุปกรณ์
- **EquipmentDetailPage** - หน้ารายละเอียดอุปกรณ์
- **EquipmentPage** - หน้ารายการอุปกรณ์
- **HomePage** - หน้าแรกของเว็บไซต์
- **NewEquipmentPage** - หน้าเพิ่มอุปกรณ์ใหม่
- **NewMaintenanceRequestPage** - หน้าสร้างคำขอบำรุงรักษาใหม่
- **ProviderContractsPage** - หน้าสัญญาของผู้ให้บริการ
- **ProviderDashboardLayout** - เลย์เอาต์แดชบอร์ดผู้ให้บริการ
- **ProviderDashboardLoading** - หน้าโหลดแดชบอร์ดผู้ให้บริการ
- **ProviderDashboardPage** - หน้าแดชบอร์ดหลักของผู้ให้บริการ
- **ProviderEquipmentPage** - หน้าจัดการอุปกรณ์ของผู้ให้บริการ
- **ProviderPaymentsPage** - หน้าการชำระเงินของผู้ให้บริการ
- **ProviderSignUpPage** - หน้าสมัครสมาชิกสำหรับผู้ให้บริการ
- **ProvidersPage** - หน้ารายการผู้ให้บริการ
- **PublicLayout** - เลย์เอาต์สำหรับหน้าสาธารณะ
- **RootLayout** - เลย์เอาต์หลักของแอปพลิเคชัน
- **SignInPage** - หน้าเข้าสู่ระบบ
- **SignUpPage** - หน้าสมัครสมาชิก

## คอมโพเนนต์

- **CardSkeleton** - โครงร่างการ์ดสำหรับโหลด
- **ChartSkeleton** - โครงร่างกราฟสำหรับโหลด
- **EquipmentCard** - การ์ดแสดงอุปกรณ์
- **EquipmentCardSkeleton** - โครงร่างการ์ดอุปกรณ์สำหรับโหลด
- **EquipmentFilters** - ตัวกรองอุปกรณ์
- **EquipmentForm** - ฟอร์มจัดการอุปกรณ์
- **Footer** - ส่วนท้ายของเว็บไซต์
- **Header** - ส่วนหัวของเว็บไซต์
- **MaintenanceRequestForm** - ฟอร์มคำขอบำรุงรักษา
- **PayButton** - ปุ่มชำระเงิน
- **PriceCalculator** - เครื่องคำนวณราคา
- **ProviderActions** - การดำเนินการของผู้ให้บริการ
- **RevenueChart** - กราฟรายได้
- **SessionProvider** - ผู้ให้บริการเซสชัน
- **Sidebar** - แถบด้านข้าง
- **StatCard** - การ์ดแสดงสถิติ
- **StatCardSkeleton** - โครงร่างการ์ดสถิติสำหรับโหลด
- **TableSkeleton** - โครงร่างตารางสำหรับโหลด
- **ThemeProvider** - ผู้ให้บริการธีม

## API Routes

- **DELETE** - ลบข้อมูล
- **GET** - ดึงข้อมูล
- **PATCH** - อัปเดตข้อมูลบางส่วน
- **POST** - สร้างข้อมูลใหม่
- **PUT** - อัปเดตข้อมูลทั้งหมด

## ฟังก์ชันคำนวณและสถิติ

- **calculateAdminRevenue** - คำนวณรายได้ของแอดมิน
- **calculateCustomerSpending** - คำนวณค่าใช้จ่ายของลูกค้า
- **calculateProviderRevenue** - คำนวณรายได้ของผู้ให้บริการ
- **calculateReadingTime** - คำนวณเวลาในการอ่าน
- **getPlatformStats** - ดึงสถิติของแพลตฟอร์ม
- **getProviderStats** - ดึงสถิติของผู้ให้บริการ

## ฟังก์ชันจัดรูปแบบ

- **cn** - รวมคลาส CSS
- **formatContractDuration** - จัดรูปแบบระยะเวลาสัญญา
- **formatNumber** - จัดรูปแบบตัวเลข
- **formatPhoneNumber** - จัดรูปแบบเบอร์โทรศัพท์
- **formatPrice** - จัดรูปแบบราคา
- **formatRelativeDate** - จัดรูปแบบวันที่แบบสัมพัทธ์
- **formatShortDate** - จัดรูปแบบวันที่แบบสั้น
- **formatThaiCurrency** - จัดรูปแบบสกุลเงินไทย
- **formatThaiDate** - จัดรูปแบบวันที่แบบไทย

## ฟังก์ชันบล็อก

- **createBlogPost** - สร้างโพสต์บล็อก
- **deleteBlogPost** - ลบโพสต์บล็อก
- **getBlogCategories** - ดึงหมวดหมู่บล็อก
- **getBlogPostBySlug** - ดึงโพสต์บล็อกจาก slug
- **getBlogPosts** - ดึงรายการโพสต์บล็อก
- **getBlogTags** - ดึงแท็กบล็อก
- **getCategories** - ดึงหมวดหมู่
- **getFeaturedPosts** - ดึงโพสต์แนะนำ
- **getRelatedPosts** - ดึงโพสต์ที่เกี่ยวข้อง
- **incrementViewCount** - เพิ่มจำนวนการดู
- **updateBlogPost** - อัปเดตโพสต์บล็อก

## ฟังก์ชันอุปกรณ์

- **generateEquipmentImageAlt** - สร้างข้อความ alt สำหรับรูปอุปกรณ์
- **getEquipmentById** - ดึงอุปกรณ์จาก ID
- **getEquipmentCountByCategory** - นับจำนวนอุปกรณ์ตามหมวดหมู่
- **getEquipmentList** - ดึงรายการอุปกรณ์

## ฟังก์ชันผู้ใช้และผู้ให้บริการ

- **getUserWithRole** - ดึงข้อมูลผู้ใช้พร้อมบทบาท
- **getVerifiedProviders** - ดึงผู้ให้บริการที่ยืนยันแล้ว

## ฟังก์ชันการชำระเงิน

- **createDemoCheckoutSession** - สร้างเซสชันชำระเงินทดสอบ
- **paymentGateway** - เกตเวย์การชำระเงิน
- **processDemoPayment** - ประมวลผลการชำระเงินทดสอบ

## ฟังก์ชันอีเมล

- **sendContractApprovedEmail** - ส่งอีเมลแจ้งอนุมัติสัญญา
- **sendEmail** - ส่งอีเมล
- **sendPaymentOverdueEmail** - ส่งอีเมลแจ้งการชำระเงินเกินกำหนด
- **sendPaymentReminderEmail** - ส่งอีเมลเตือนการชำระเงิน
- **sendWelcomeEmail** - ส่งอีเมลต้อนรับ

## ฟังก์ชันไฟล์และการอัปโหลด

- **deleteFile** - ลบไฟล์
- **generateFileKey** - สร้างคีย์ไฟล์
- **getPresignedDownloadUrl** - ดึง URL สำหรับดาวน์โหลดแบบมีลายเซ็น
- **getPresignedUploadUrl** - ดึง URL สำหรับอัปโหลดแบบมีลายเซ็น
- **r2Client** - ไคลเอนต์ R2
- **uploadFile** - อัปโหลดไฟล์

## ฟังก์ชัน SEO และ Metadata

- **generateBlogPostingSchema** - สร้างสคีมาโพสต์บล็อก
- **generateBreadcrumbList** - สร้างรายการเส้นทาง
- **generateBreadcrumbSchema** - สร้างสคีมาเส้นทาง
- **generateCanonicalUrl** - สร้าง URL หลัก
- **generateExcerpt** - สร้างข้อความย่อ
- **generateFAQSchema** - สร้างสคีมาคำถามที่พบบ่อย
- **generateItemListSchema** - สร้างสคีมารายการสินค้า
- **generateLocalBusinessSchema** - สร้างสคีมาธุรกิจท้องถิ่น
- **generateMetadata** - สร้างเมทาดาทา
- **generateOrganizationSchema** - สร้างสคีมาองค์กร
- **generateProductSchema** - สร้างสคีมาสินค้า
- **generateSEOMetadata** - สร้างเมทาดาทา SEO
- **generateSlug** - สร้าง slug
- **generateStaticParams** - สร้างพารามิเตอร์แบบคงที่
- **generateWebSiteSchema** - สร้างสคีมาเว็บไซต์

## ฟังก์ชันตรวจสอบความถูกต้อง (Validation Schemas)

- **blogCategorySchema** - สคีมาหมวดหมู่บล็อก
- **blogCommentSchema** - สคีมาความคิดเห็นบล็อก
- **blogPostSchema** - สคีมาโพสต์บล็อก
- **blogSearchSchema** - สคีมาการค้นหาบล็อก
- **blogTagSchema** - สคีมาแท็กบล็อก
- **customerRegistrationSchema** - สคีมาการลงทะเบียนลูกค้า
- **notificationDataSchema** - สคีมาข้อมูลการแจ้งเตือน
- **providerRegistrationSchema** - สคีมาการลงทะเบียนผู้ให้บริการ

## ฟังก์ชันอื่นๆ

- **middleware** - มิดเดิลแวร์
- **prisma** - ไคลเอนต์ Prisma
- **PrismaClient** - คลาส Prisma Client
- **getPrismaClientClass** - ดึงคลาส Prisma Client
- **robots** - ไฟล์ robots.txt
- **sitemap** - แผนผังเว็บไซต์
- **TransactionIsolationLevel** - ระดับการแยกธุรกรรม
