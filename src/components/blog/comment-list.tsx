import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatThaiDate } from "@/lib/format";

interface CommentAuthor {
  name?: string | null;
  avatar?: string | null;
}

export interface BlogComment {
  id: string;
  content: string;
  createdAt: Date;
  author: CommentAuthor;
  replies?: BlogComment[];
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

function CommentItem({ comment, isReply }: { comment: BlogComment; isReply?: boolean }) {
  return (
    <div className={isReply ? "ml-8 mt-4 border-l pl-4" : ""}>
      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={comment.author.avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-sm text-primary">
            {getInitials(comment.author.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {comment.author.name || "ผู้ใช้"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatThaiDate(comment.createdAt, "d MMM yyyy")}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
            {comment.content}
          </p>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} isReply />
      ))}
    </div>
  );
}

export function CommentList({ comments }: { comments: BlogComment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
