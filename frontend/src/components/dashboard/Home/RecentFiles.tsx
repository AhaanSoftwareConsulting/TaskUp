import { Link } from "react-router-dom";
import { PaperclipIcon } from "@phosphor-icons/react";
import { Card, Empty } from "./Card";
import { FileTypeIcon, formatBytes } from "../../utils/fileHelper";
import type { HomeData } from "./useHomeData";

export const RecentFiles = ({ data }: { data: HomeData }) => (
  <Card title="Recent files" icon={<PaperclipIcon size={14} weight="bold" />}>
    {data.files.length === 0 ? <Empty text="No files uploaded yet." /> : (
      <div className="grid grid-cols-2 gap-3">
        {data.files.map(({ key, file, task }) => (
          <div key={key} className="overflow-hidden rounded-xl border border-gray-100 transition hover:shadow-md">
            <a href={file.fileUrl} target="_blank" rel="noreferrer" className="flex h-20 items-center justify-center bg-gray-50">
              {file.isImage ? <img src={file.previewUrl ?? file.fileUrl} alt={file.fileName} loading="lazy" className="h-full w-full object-cover" /> : <FileTypeIcon type={file.fileType} name={file.fileName} size={30} />}
            </a>
            <div className="p-2">
              <p className="truncate text-xs font-semibold text-gray-700" title={file.fileName}>{file.fileName}</p>
              <Link to={`${data.base}/tasks/${task.id}`} className="block truncate text-[10px] text-gray-400 hover:text-blue-600">{formatBytes(file.size)} · {task.title}</Link>
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
);