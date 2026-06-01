import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPostBySlug, getBlogCategories, getBlogTags } from "@/lib/blog/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostForm, type PostFormInitialData } from "@/components/blog-admin/post-form";

export const dynamic = "force-dynamic";

const BASE = "/dashboard/admin/blog";

export default async function AdminEditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, categories, tags] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogCategories(),
    getBlogTags(),
  ]);

  if (!post) notFound();

  const initialData: PostFormInitialData = {
    title: post.title,
    titleTh: post.titleTh ?? "",
    content: post.content,
    contentTh: post.contentTh ?? "",
    excerpt: post.excerpt ?? "",
    excerptTh: post.excerptTh ?? "",
    featuredImage: post.featuredImage ?? undefined,
    status: post.status,
    isFeatured: post.isFeatured,
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    categoryIds: post.categories.map((c) => c.category.id),
    tagIds: post.tags.map((t) => t.tag.id),
    scheduledFor: post.scheduledFor
      ? new Date(post.scheduledFor).toISOString().slice(0, 16)
      : "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={BASE}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">แก้ไขบทความ</h1>
          <p className="text-muted-foreground">{post.titleTh || post.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลบทความ</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm
            mode="edit"
            basePath={BASE}
            currentSlug={post.slug}
            categories={categories}
            tags={tags}
            initialData={initialData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
