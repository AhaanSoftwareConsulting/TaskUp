import { useEffect, useMemo, useRef, useState, memo } from "react";
import { CaretDownIcon, CaretUpIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { useAppSelector } from "../../redux/app/hook";
import type { Attachment, Comment, CommentBlock } from "../../types/board.Types";
import { Avatar, CommentComposer } from "./CommentComposer";
import { FileTypeIcon, formatBytes } from "../../utils/fileHelpers";

interface ActivityDetailsProps {
  taskId: string | undefined;
}

const MENTION_RE = /@\[([^\]]+)\]\(([0-9a-f-]{36})\)/gi;

const getRelativeTime = (date: string | Date) => {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
};

/** Plain React nodes only (no innerHTML), so comment text can't inject markup. */
function renderText(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(MENTION_RE)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    parts.push(
      <span key={i} className="text-blue-600 bg-blue-50 font-semibold rounded px-1">@{m[1]}</span>
    );
    last = i + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const AttachmentBlock = ({ a }: { a?: Attachment }) => {
  if (!a) return null;
  if (a.isImage) {
    return (
      <a href={a.fileUrl} target="_blank" rel="noreferrer" className="block w-fit max-w-full">
        <img
          src={a.previewUrl ?? a.fileUrl}
          alt={a.fileName}
          loading="lazy"
          className="max-h-64 max-w-full rounded-lg border border-gray-200 object-cover hover:opacity-90 transition"
        />
      </a>
    );
  }
  return (
    <div className="flex items-center gap-3 w-fit max-w-full pl-3 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg">
      <FileTypeIcon type={a.fileType} name={a.fileName} size={24} />
      <div className="min-w-0">
        <a href={a.fileUrl} target="_blank" rel="noreferrer" className="block text-xs font-semibold text-gray-700 hover:text-blue-600 truncate max-w-[200px]">
          {a.fileName}
        </a>
        <p className="text-[10px] text-gray-400">{formatBytes(a.size)}</p>
      </div>
      <a href={a.downloadUrl} title="Download" className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md">
        <DownloadSimpleIcon size={16} weight="bold" />
      </a>
    </div>
  );
};

const CommentItem = ({ comment, mine }: { comment: Comment; mine: boolean }) => {
  const name = comment.user?.full_name ?? "Unknown";
  const byId = new Map(comment.attachments.map((a) => [a.id, a]));
  const blocks: CommentBlock[] = comment.blocks?.length
    ? comment.blocks
    : [ // comments written before blocks existed: text, then files
        ...(comment.text ? [{ type: "text", text: comment.text } as CommentBlock] : []),
        ...comment.attachments.map((a) => ({ type: "file", attachment_id: a.id }) as CommentBlock),
      ];

  return (
    <div className="flex gap-3">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-gray-800">{mine ? "You" : name}</span>
          <span className="text-[10px] text-gray-400">{getRelativeTime(comment.created_at)}</span>
        </div>
        <div className="mt-1 space-y-2">
          {blocks.map((b, i) =>
            b.type === "text" ? (
              <p key={i} className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                {renderText(b.text)}
              </p>
            ) : (
              <AttachmentBlock key={i} a={byId.get(b.attachment_id)} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export const ActivityDetails = memo(({ taskId }: ActivityDetailsProps) => {
  const [showAllActivity, setShowAllActivity] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const tasks = useAppSelector((s) => s.task.task);
  const boards = useAppSelector((s) => s.board.boards);
  const me = useAppSelector((s) => s.login.user);

  const taskData = useMemo(() => tasks.find((t) => t.id === taskId), [tasks, taskId]);
  // Read the board by the task's own board_id: this also works on /tasks/:taskId pages,
  // where there is no board slug in the URL.
  const members = useMemo(
    () => boards.find((b) => b.id === taskData?.board_id)?.members ?? [],
    [boards, taskData?.board_id]
  );

  const activities = taskData?.activityLog ?? [];
  const comments = taskData?.comments ?? [];
  const displayedActivities = showAllActivity ? activities : activities.slice(-3); // latest, not oldest

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight; // stay at the newest comment
  }, [comments.length]);

  if (!taskData) return null;

  return (
    <div className="bg-white border-l border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      <h3 className="font-medium text-gray-600 p-4 border-b border-gray-100 uppercase text-xs tracking-widest shrink-0">
        Update Feed
      </h3>

      <div className="flex-grow min-h-0 flex flex-col overflow-hidden">
        {/* ACTIVITY */}
        <div className="flex flex-col border-b border-gray-100 max-h-[35%] p-4 overflow-hidden shrink-0">
          <div className="flex justify-between items-center mb-3 shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Recent Activity</span>
            {activities.length > 3 && (
              <button onClick={() => setShowAllActivity(!showAllActivity)} className="text-[10px] text-blue-500 font-bold flex items-center gap-0.5">
                {showAllActivity ? "Hide" : `Show All (${activities.length})`}
                {showAllActivity ? <CaretUpIcon /> : <CaretDownIcon />}
              </button>
            )}
          </div>
          <div className="overflow-y-auto space-y-4 pr-1">
            {displayedActivities.map((item, i) => (
              <div key={item.id || i} className="flex flex-col gap-1">
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <p>
                    <span className="font-bold text-gray-700">{item.user?.id === me?.id ? "You" : item.user?.full_name}</span>{" "}
                    {item.action}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 ml-3">{getRelativeTime(item.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COMMENTS */}
        <div className="flex flex-col flex-grow min-h-0 p-4 bg-gray-50/20">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-3 shrink-0">
            Comments ({comments.length})
          </span>
          <div ref={listRef} className="flex-grow min-h-0 overflow-y-auto space-y-5 pr-1">
            {comments.length === 0 && <p className="text-xs text-gray-400 italic">No comments yet. Start the conversation.</p>}
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} mine={c.user?.id === me?.id} />
            ))}
          </div>
        </div>
      </div>

      <CommentComposer taskId={taskData.id} members={members} currentUserId={me?.id} />
    </div>
  );
});