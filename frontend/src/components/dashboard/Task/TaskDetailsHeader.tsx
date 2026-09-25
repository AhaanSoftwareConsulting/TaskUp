import { useEffect, useRef, useState } from 'react'
import {
    X, ListChecks, UsersIcon, Folder, ArrowSquareOut, Star, CornersOut, DotsThree,
} from "@phosphor-icons/react"
import { useCurrentBoard } from '../../hooks/useCurrentBoard'
import { useAppDispatch } from '../../redux/app/hook'
import { deleteTask as deleteTaskThunk } from '../../redux/features/Task/taskSlice'
import type { Task } from '../../types/board.Types'
import { DeleteModal } from '../../modal/DeleteModal'

interface TaskDetailsHeaderProps {
    onClose: () => void
    task: Task
}

export const TaskDetailsHeader = ({ task, onClose }: TaskDetailsHeaderProps) => {
    const [openTaskId, setOpenTaskId] = useState<string | null>(null)
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handaleClickOutside = (e: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenTaskId(null)
            }
        }
        window.addEventListener("mousedown", handaleClickOutside)
        return () => window.removeEventListener("mousedown", handaleClickOutside)
    }, [])

    const board = useCurrentBoard()
const dispatch = useAppDispatch()
const deleteTask = (taskId: string) => dispatch(deleteTaskThunk({ taskId }))

    // Fallback board name if board context is missing
    const displayBoardName = board?.name || "Task View"

    return (
        <div>
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
                {/* Left Side: Breadcrumbs */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Folder size={18} />
                        <span className="hover:underline cursor-pointer">Project Board</span>
                        <span className="text-gray-300">/</span>
                        <ListChecks size={18} weight="bold" className="text-gray-500" />
                        {/* Display fallback name if board is null */}
                        <span className="text-gray-500 tracking-tight">{displayBoardName}</span>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">
                        {task.created_at ? new Date(task.created_at).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short"
                        }) : "No Date"}
                    </div>

                    <div className="flex items-center gap-1">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-md text-gray-600 text-sm font-medium">
                            <UsersIcon size={18} />
                            Share
                        </button>

                        <div className="flex items-center gap-0.5 ml-2 border-l pl-2 border-gray-200">
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    className="p-2 hover:bg-gray-100 rounded text-gray-500"
                                    onClick={() => setOpenTaskId(openTaskId === task.id ? null : task.id)}
                                >
                                    <DotsThree size={20} weight="bold" />
                                </button>
                                {openTaskId === task.id && (
                                    <div className='absolute right-0 mt-1 w-32 bg-white border rounded shadow-md z-50'>
                                        <button
                                            className='w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                                            onClick={() => {
                                                setTaskToDelete(task)
                                                setOpenTaskId(null)
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Star size={20} /></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><ArrowSquareOut size={20} /></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><CornersOut size={20} /></button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                            >
                                <X size={20} weight="bold" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
             <DeleteModal
                item={taskToDelete}
                itemLabel='task'
                getName={(task)=>task.title}
                getId={(task)=>task.id}
                onCancel={() => setTaskToDelete(null)}
                onConfirm={(id) => {
                    if (deleteTask) deleteTask(id)
                    setTaskToDelete(null)
                    onClose()
                }}
            />
        </div>
    )
}
