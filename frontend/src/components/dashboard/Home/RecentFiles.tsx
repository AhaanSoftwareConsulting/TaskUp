
import { Link } from "react-router-dom";
import {
  PaperclipIcon,
  ArrowUpRightIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { FileTypeIcon, formatBytes } from "../../utils/fileHelper";
import type { HomeData } from "./useHomeData";

export const RecentFiles = ({ data }: { data: HomeData }) => (
  <Card
    title="Recent Files"
    icon={<PaperclipIcon size={15} weight="bold" />}
  >
    {data.files.length === 0 ? (
      <Empty text="No files uploaded yet." />
    ) : (
      <div className="grid grid-cols-2 gap-3">
        {data.files.map(({ key, file, task }) => (
          <div
            key={key}
            className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg hover:shadow-gray-200/50"
          >
            {/* File Preview */}
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noreferrer"
              title={`Open ${file.fileName}`}
              className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gray-50"
            >
              {file.isImage ? (
                <img
                  src={file.previewUrl ?? file.fileUrl}
                  alt={file.fileName}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                    <FileTypeIcon
                      type={file.fileType}
                      name={file.fileName}
                      size={28}
                    />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Attachment
                  </span>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/0 transition-all duration-300 group-hover:bg-gray-900/20">
                <div className="flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-gray-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRightIcon size={19} weight="bold" />
                </div>
              </div>

              {/* File Size Badge */}
              <span className="absolute bottom-2 left-2 rounded-md border border-white/60 bg-white/90 px-2 py-1 text-[9px] font-bold text-gray-600 shadow-sm backdrop-blur-sm">
                {formatBytes(file.size)}
              </span>
            </a>

            {/* File Details */}
            <div className="p-3">
              <div className="flex items-center gap-1.5">
                <FileTextIcon
                  size={13}
                  className="shrink-0 text-blue-500"
                />

                <p
                  className="truncate text-xs font-bold text-gray-800 transition-colors group-hover:text-blue-600"
                  title={file.fileName}
                >
                  {file.fileName}
                </p>
              </div>

              {/* Related Task */}
              <Link
                to={`${data.base}/tasks/${task.id}`}
                title={task.title}
                className="mt-2 flex items-center gap-1 text-[10px] text-gray-400 transition-colors hover:text-blue-600"
              >
                <span className="truncate">
                  {task.title}
                </span>

                <ArrowUpRightIcon
                  size={11}
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
);
