// components/dashboard/TaskPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/app/hook";
import { TaskDetails } from "../Task/details/TaskDetails";
import { getTasks } from "../../redux/features/Task/taskSlice";


export const TaskPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((s) => s.task.task);


  const task = tasks.find((t) => t.id === taskId);

  useEffect(() => {
    if (!task) dispatch(getTasks());
  }, [dispatch, task]);

  if (!task) return <div className="p-10 text-center text-gray-400">Loading task...</div>;



  return (
    <TaskDetails
      task={task}
      
      onClose={() => navigate(-1)}
      variant="page"
    />
  );
};