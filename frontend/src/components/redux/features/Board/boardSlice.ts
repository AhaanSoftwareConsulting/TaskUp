import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "../../../api/boardApiClient";
import type { Board } from "../../../types/board.Types";
import type { ProjectPayload } from "../../../types/project.Types";

export type CreateBoardArgs = ProjectPayload & { members: string[] };

interface BoardState {
  boards: Board[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialBoardState: BoardState = { boards: [], loading: "idle", error: "" };

const errMsg = (err: any) => err.response?.data?.message || err.message;

export const createBoard = createAsyncThunk<Board, CreateBoardArgs, { rejectValue: string }>(
  "board/createBoard",
  async (data, { rejectWithValue }) => {
    try {
      return (await axiosClient.post("/api/boards", data)).data as Board;
    } catch (err: any) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const fetchBoard = createAsyncThunk<Board[], void, { rejectValue: string }>(
  "board/fetchBoard",
  async (_, { rejectWithValue }) => {
    try {
      return (await axiosClient.get("/api/boards")).data as Board[];
    } catch (err: any) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const addMember = createAsyncThunk<Board, { boardId: string; memberId: string }, { rejectValue: string }>(
  "board/addMember",
  async ({ boardId, memberId }, { rejectWithValue }) => {
    try {
      return (await axiosClient.patch(`/api/boards/${boardId}/add-member`, { memberId })).data as Board;
    } catch (err: any) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const fetchBoardById = createAsyncThunk<Board, string, { rejectValue: string }>(
  "board/fetchBoardById",
  async (boardId, { rejectWithValue }) => {
    try {
      return (await axiosClient.get(`/api/boards/${boardId}`)).data as Board;
    } catch (err: any) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const deleteBoard = createAsyncThunk<{ boardId: string }, { boardId: string }, { rejectValue: string }>(
  "board/deleteBoard",
  async ({ boardId }, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/api/boards/${boardId}`, { withCredentials: true });
      return { boardId };
    } catch (err: any) {
      return rejectWithValue(errMsg(err));
    }
  }
);

/** Edit any project field. Send the full form; the server only updates fields that are present. */
export const editBoard = createAsyncThunk<Board, { boardId: string; data: ProjectPayload }, { rejectValue: string }>(
  "board/editBoard",
  async ({ boardId, data }, { rejectWithValue }) => {
    try {
      return (await axiosClient.put(`/api/boards/${boardId}`, data, { withCredentials: true })).data as Board;
    } catch (err: any) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const archiveBoard = createAsyncThunk<
  { boardId: string; archived: boolean },
  { boardId: string; archived?: boolean },
  { rejectValue: string }
>("board/archiveBoard", async ({ boardId, archived = true }, { rejectWithValue }) => {
  try {
    await axiosClient.patch(`/api/boards/${boardId}/archive`, { archived }, { withCredentials: true });
    return { boardId, archived };
  } catch (err: any) {
    return rejectWithValue(errMsg(err));
  }
});

export const removeMember = createAsyncThunk<Board, { boardId: string; memberId: string }, { rejectValue: string }>(
  "board/removeMember",
  async ({ boardId, memberId }, { rejectWithValue }) => {
    try {
      return (await axiosClient.delete(`/api/boards/${boardId}/members/${memberId}`)).data;
    } catch (err: any) {
      return rejectWithValue(errMsg(err));
    }
  }
);

const boardSlice = createSlice({
  name: "board",
  initialState: initialBoardState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBoard.pending, (s) => { s.loading = "pending"; s.error = null; })
      .addCase(createBoard.fulfilled, (s, a: PayloadAction<Board>) => {
        s.loading = "succeeded"; s.boards.push(a.payload); s.error = null;
      })
      .addCase(createBoard.rejected, (s, a) => { s.loading = "failed"; s.error = a.payload as string; })

      .addCase(fetchBoard.pending, (s) => { s.loading = "pending"; s.error = null; })
      .addCase(fetchBoard.fulfilled, (s, a: PayloadAction<Board[]>) => {
        s.loading = "succeeded"; s.boards = a.payload; s.error = null;
      })
      .addCase(fetchBoard.rejected, (s, a) => { s.loading = "failed"; s.error = a.payload as string; })

      .addCase(addMember.pending, (s) => { s.loading = "pending"; })
      .addCase(addMember.fulfilled, (s, a: PayloadAction<Board>) => {
        s.loading = "succeeded";
        s.boards = s.boards.map((b) => (b.id === a.payload.id ? a.payload : b));
        s.error = null;
      })
      .addCase(addMember.rejected, (s, a) => { s.loading = "failed"; s.error = a.payload as string; })

      .addCase(fetchBoardById.fulfilled, (s, a: PayloadAction<Board>) => {
        s.loading = "succeeded";
        const i = s.boards.findIndex((b) => b.id === a.payload.id);
        if (i !== -1) s.boards[i] = a.payload; else s.boards.push(a.payload);
      })

      .addCase(deleteBoard.pending, (s) => { s.loading = "pending"; })
      .addCase(deleteBoard.fulfilled, (s, a) => {
        s.loading = "succeeded";
        s.boards = s.boards.filter((b) => b.id !== a.payload.boardId);
      })
      .addCase(deleteBoard.rejected, (s, a) => { s.loading = "failed"; s.error = a.payload as string; })

      .addCase(editBoard.pending, (s) => { s.loading = "pending"; s.error = null; })
      .addCase(editBoard.fulfilled, (s, a) => {
        s.loading = "succeeded";
        const i = s.boards.findIndex((b) => b.id === a.payload.id);
        if (i !== -1) s.boards[i] = a.payload;
        s.error = null;
      })
      .addCase(editBoard.rejected, (s, a) => { s.loading = "failed"; s.error = a.payload as string; })

      .addCase(archiveBoard.fulfilled, (s, a) => {
        s.loading = "succeeded";
        if (a.payload.archived) s.boards = s.boards.filter((b) => b.id !== a.payload.boardId);
      })
      .addCase(archiveBoard.rejected, (s, a) => { s.loading = "failed"; s.error = a.payload as string; });
  },
});

export default boardSlice.reducer;
