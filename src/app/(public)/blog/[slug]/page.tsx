import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, Clock, Eye, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBlogPostBySlug } from "@/lib/blog/queries";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { CommentList, type BlogComment } from "@/components/blog/comment-list";
import { CommentForm } from "@/components/blog/comment-form";
import { ViewTracker } from "@/components/blog/view-tracker";
import { RelatedPosts } from "@/components/blog/related-posts";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBlogPostingSchema, generateBreadcrumbSchema } from "@/lib/structured-data";
import { formatThaiDate } from "@/lib/format";

export const revalidate = 600; // ISR: revalidate every 10 minutes
export const dynamicParams = true;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: { slug: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });
  return posts.map((p) => ({ slug: p.slug }));
}

function isVisible(post: { status: string; publishedAt: Date | null }) {
  return (
    post.status === "PUBLISHED" &&
    post.publishedAt != null &&
    post.publishedAt <= new Date()
  );
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || !isVisible(post)) {
    return { title: "ไม่พบบทความ" };
  }

  const title = post.metaTitle || post.titleTh || post.title;
  const description =
    post.metaDescription || post.excerptTh || post.excerpt || undefined;
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author.name ? [post.author.name] : undefined,
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
    },
  };
}

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || !isVisible(post)) {
    notFound();
  }

  const title = post.titleTh || post.title;
  const content = post.contentTh || post.content;
  const primaryCategory = post.categories[0]?.category;

  return (
    <article className="container mx-auto px-4 py-8">
      <ViewTracker slug={post.slug} />
      <JsonLd
        data={[
          generateBlogPostingSchema(post),
          generateBreadcrumbSchema([
            { name: "หน้าแรก", url: "/" },
            { name: "บทความ", url: "/blog" },
            { name: title, url: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าบทความ
          </Link>
        </nav>

        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.categories.map(({ category }) => (
              <Link key={category.slug} href={`/blog/category/${category.slug}`}>
                <Badge variant="secondary">
                  {category.nameTh || category.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>

        {/* Meta row */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={post.author.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            {post.author.name || "Sparkgo Team"}
          </span>
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {formatThaiDate(post.publishedAt, "d MMMM yyyy")}
            </span>
          )}
          {post.readingTime != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTime} นาที
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.viewCount}
          </span>
        </div>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.featuredImage}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <MarkdownContent content={content} />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map(({ tag }) => (
              <Badge key={tag.slug} variant="outline">
                #{tag.nameTh || tag.name}
              </Badge>
            ))}
          </div>
        )}

        <Separator className="my-10" />

        {/* Comments */}
        <section>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            <MessageSquare className="h-6 w-6" />
            ความคิดเห็น ({post.comments.length})
          </h2>
          <div className="mb-8">
            <CommentForm postId={post.id} />
          </div>
          <CommentList comments={post.comments as unknown as BlogComment[]} />
        </section>
      </div>

      {/* Related */}
      <div className="mx-auto max-w-5xl">
        <Suspense fallback={null}>
          <RelatedPosts postId={post.id} />
        </Suspense>
      </div>
    </article>
  );
}
