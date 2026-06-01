import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts, getBlogCategories, getFeaturedPosts } from "@/lib/blog/queries";
import { BlogCard, type BlogCardPost } from "@/components/blog/blog-card";
import { BlogListSkeleton } from "@/components/blog/blog-list-skeleton";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { generateWebSiteSchema, generateBreadcrumbSchema } from "@/lib/structured-data";

export const revalidate = 300; // ISR: revalidate every 5 minutes

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

export const metadata: Metadata = {
  title: "บทความ",
  description:
    "บทความและความรู้เกี่ยวกับ IoT, STEM, หุ่นยนต์ และเทคโนโลยีการศึกษาสำหรับโรงเรียนไทย",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "บทความ | Sparkgo",
    description:
      "บทความและความรู้เกี่ยวกับ IoT, STEM และเทคโนโลยีการศึกษาสำหรับโรงเรียนไทย",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}

async function BlogList({
  page,
  categorySlug,
  search,
}: {
  page: number;
  categorySlug?: string;
  search?: string;
}) {
  const categories = await getBlogCategories();
  const categoryId = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.id
    : undefined;

  const { posts, pagination } = await getBlogPosts({
    page,
    categoryId,
    search,
    limit: 12,
  });

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">ยังไม่มีบทความที่ตรงกับเงื่อนไข</p>
      </div>
    );
  }

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (categorySlug) sp.set("category", categorySlug);
    if (search) sp.set("search", search);
    sp.set("page", String(p));
    return `/blog?${sp.toString()}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post as unknown as BlogCardPost} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <Link
                  key={p}
                  href={buildHref(p)}
                  className={`rounded-lg px-4 py-2 ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {p}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </>
  );
}

async function FeaturedStrip() {
  const featured = await getFeaturedPosts(3);
  if (featured.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">บทความแนะนำ</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {featured.map((post) => (
          <BlogCard key={post.slug} post={post as unknown as BlogCardPost} />
        ))}
      </div>
    </section>
  );
}

async function CategoryChips({ active }: { active?: string }) {
  const categories = await getBlogCategories();
  if (categories.length === 0) return null;

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Link href="/blog">
        <Badge variant={active ? "secondary" : "default"}>ทั้งหมด</Badge>
      </Link>
      {categories.map((cat) => (
        <Link key={cat.slug} href={`/blog/category/${cat.slug}`}>
          <Badge variant={active === cat.slug ? "default" : "secondary"}>
            {cat.nameTh || cat.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page, category, search } = await searchParams;
  const currentPage = parseInt(page || "1", 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd
        data={[
          generateWebSiteSchema(),
          generateBreadcrumbSchema([
            { name: "หน้าแรก", url: "/" },
            { name: "บทความ", url: "/blog" },
          ]),
        ]}
      />

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">บทความ</h1>
        <p className="text-muted-foreground">
          ความรู้และแรงบันดาลใจเกี่ยวกับ IoT, STEM และเทคโนโลยีการศึกษา
        </p>
      </div>

      <Suspense fallback={null}>
        <CategoryChips active={category} />
      </Suspense>

      {!category && !search && currentPage === 1 && (
        <Suspense fallback={<BlogListSkeleton count={3} />}>
          <FeaturedStrip />
        </Suspense>
      )}

      <Suspense
        key={`${category}-${search}-${currentPage}`}
        fallback={<BlogListSkeleton />}
      >
        <BlogList page={currentPage} categorySlug={category} search={search} />
      </Suspense>
    </div>
  );
}
