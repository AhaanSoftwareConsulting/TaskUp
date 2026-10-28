import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../../api/boardApiClient";
import type { Task } from "../../../types/board.Types";

const msg = (e: any) => e.response?.data?.message || e.message;

export const closeTask = createAsyncThunk<Task, { taskId: string; note?: string }, { rejectValue: string }>(
  "tasks/close",
  async ({ taskId, note }, { rejectWithValue }) => {
    try { return (await axiosClient.post(`/api/tasks/${taskId}/close`, { note }, { withCredentials: true })).data; }
    catch (e) { return rejectWithValue(msg(e)); }
  }
);
export const reopenTask = createAsyncThunk<Task, { taskId: string }, { rejectValue: string }>(
  "tasks/reopen",
  async ({ taskId }, { rejectWithValue }) => {
    try { return (await axiosClient.post(`/api/tasks/${taskId}/reopen`, {}, { withCredentials: true })).data; }
    catch (e) { return rejectWithValue(msg(e)); }
  }
);