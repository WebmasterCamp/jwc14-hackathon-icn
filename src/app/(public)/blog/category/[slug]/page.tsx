import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBlogPosts } from "@/lib/blog/queries";
import { BlogCard, type BlogCardPost } from "@/components/blog/blog-card";
import { BlogListSkeleton } from "@/components/blog/blog-list-skeleton";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/structured-data";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.blogCategory.findUnique({ where: { slug } });
  if (!category) return { title: "ไม่พบหมวดหมู่" };

  const name = category.nameTh || category.name;
  return {
    title: `บทความหมวด ${name}`,
    description: category.description || `บทความทั้งหมดในหมวด ${name}`,
    alternates: { canonical: `${SITE_URL}/blog/category/${slug}` },
  };
}

async function CategoryPosts({
  categoryId,
  slug,
  page,
}: {
  categoryId: string;
  slug: string;
  page: number;
}) {
  const { posts, pagination } = await getBlogPosts({ categoryId, page, limit: 12 });

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">ยังไม่มีบทความในหมวดนี้</p>
      </div>
    );
  }

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
                  href={`/blog/category/${slug}?page=${p}`}
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

export default async function BlogCategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);

  const category = await prisma.blogCategory.findUnique({ where: { slug } });
  if (!category) notFound();

  const name = category.nameTh || category.name;

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "หน้าแรก", url: "/" },
          { name: "บทความ", url: "/blog" },
          { name, url: `/blog/category/${slug}` },
        ])}
      />

      <nav className="mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปหน้าบทความ
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">หมวด: {name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      <Suspense key={currentPage} fallback={<BlogListSkeleton />}>
        <CategoryPosts categoryId={category.id} slug={slug} page={currentPage} />
      </Suspense>
    </div>
  );
}
