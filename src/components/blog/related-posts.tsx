import { getRelatedPosts } from "@/lib/blog/queries";
import { BlogCard, type BlogCardPost } from "@/components/blog/blog-card";

export async function RelatedPosts({ postId }: { postId: string }) {
  const related = await getRelatedPosts(postId, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">บทความที่เกี่ยวข้อง</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <BlogCard key={post.slug} post={post as unknown as BlogCardPost} />
        ))}
      </div>
    </section>
  );
}
