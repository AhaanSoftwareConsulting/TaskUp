import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { getTasks } from "../../redux/features/Task/taskSlice";
import { fetchColumn } from "../../redux/features/Column/columnSlice";
import { useHomeData } from "./useHomeData";
import { HeroBanner } from "./HeroBanner";
import { KpiStrip } from "./KpiStrip";
import { FocusList } from "./FocusList";
import { ProjectsGrid } from "./ProjectsGrid";
import { StatusDonut } from "./StatusDonut";
import { DeadlineStrip } from "./DeadlineStrip";
import { ActivityFeed } from "./ActivityFeed";
import { RecentFiles } from "./RecentFiles";
import { TeamWorkload } from "./TeamWorkload";
import { FavoriteTasks } from "./FavoriteTasks";
import { ClosedTasks } from "./ClosedTasks";

export const HomeTab = () => {
  const dispatch = useAppDispatch();
  const boards = useAppSelector((s) => s.board.boards);
  const columns = useAppSelector((s) => s.column.columns);
  const data = useHomeData();

  useEffect(() => { dispatch(getTasks()); }, [dispatch]);
  useEffect(() => {
    boards.forEach((b) => { if (b?.id && !columns[b.id]) dispatch(fetchColumn(b.id)); }); // only what's missing
  }, [dispatch, boards, columns]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-10">
      <HeroBanner data={data} />
     
      <KpiStrip data={data} />
       <ClosedTasks data={data} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <FocusList data={data} />
          <ProjectsGrid data={data} />
        </div>
        <div className="space-y-6">
          <StatusDonut data={data} />
          <DeadlineStrip data={data} />
         
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <ActivityFeed data={data} />
        <RecentFiles data={data} />
        {data.isStaff ? <TeamWorkload data={data} /> : <FavoriteTasks data={data} />}
         
      </div>
    </div>
  );
};