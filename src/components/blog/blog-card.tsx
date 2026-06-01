import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatThaiDate } from "@/lib/format";

export interface BlogCardPost {
  slug: string;
  title: string;
  titleTh?: string | null;
  excerpt?: string | null;
  excerptTh?: string | null;
  featuredImage?: string | null;
  readingTime?: number | null;
  publishedAt?: Date | null;
  author: {
    name?: string | null;
    avatar?: string | null;
  };
  categories: {
    category: { slug: string; name: string; nameTh?: string | null };
  }[];
  _count?: { comments: number };
}

export function BlogCard({ post }: { post: BlogCardPost }) {
  const title = post.titleTh || post.title;
  const excerpt = post.excerptTh || post.excerpt;
  const primaryCategory = post.categories[0]?.category;

  return (
    <Card className="group flex h-full flex-col overflow-hidden pt-0 transition-shadow hover:shadow-lg">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10" />
          )}
          {primaryCategory && (
            <Badge variant="secondary" className="absolute left-3 top-3">
              {primaryCategory.nameTh || primaryCategory.name}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col px-4">
        <Link href={`/blog/${post.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{excerpt}</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 text-xs text-muted-foreground">
        {post.publishedAt && (
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatThaiDate(post.publishedAt, "d MMM yyyy")}
          </span>
        )}
        {post.readingTime != null && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} นาที
          </span>
        )}
        {post._count && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {post._count.comments}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
