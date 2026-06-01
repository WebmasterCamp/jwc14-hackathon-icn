import { JsonLd } from "@/components/seo/json-ld";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/structured-data";
import { getCategories, getFeaturedProducts } from "@/lib/queries";
import { HeroSection } from "@/components/home/hero-section";
import { ProjectExamples } from "@/components/home/project-examples";
import { RecommendedProducts } from "@/components/home/recommended-products";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <JsonLd data={[generateOrganizationSchema(), generateWebSiteSchema()]} />

      <HeroSection />

      {/* Budget CTA band */}
      <section className="bg-brand py-16 text-brand-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">ไม่มีงบประมาณหรอ?</h2>
          <p className="mt-3 text-xl font-semibold md:text-3xl">
            เปลี่ยนจากบอร์ดเป็นพัน กลายเป็นหลักร้อย
          </p>
        </div>
      </section>

      <RecommendedProducts categories={categories} products={products} />

      <ProjectExamples />
    </>
  );
}
