import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userApiClient from "../../../api/userApiClient";
import { logout } from "../User/login/loginSlice";

export interface Profile {
  id: string | null; location: string | null; experience: string | null; description: string | null;
  contact_phone: string | null; contact_email: string | null; profile_image: string | null; exists: boolean;
}
export interface ProfileInput { location?: string; experience?: string; description?: string; contactPhone?: string; contactEmail?: string }

const msg = (e: any) => e.response?.data?.message || e.message;

export const fetchMyProfile = createAsyncThunk<Profile, void, { rejectValue: string }>("profile/fetchMe",
  async (_, { rejectWithValue }) => { try { return (await userApiClient.get("/profile/me")).data; } catch (e) { return rejectWithValue(msg(e)); } });

export const saveMyProfile = createAsyncThunk<Profile, ProfileInput, { rejectValue: string }>("profile/save",
  async (body, { rejectWithValue }) => { try { return (await userApiClient.patch("/profile/me", body)).data; } catch (e) { return rejectWithValue(msg(e)); } });

export const uploadAvatar = createAsyncThunk<Profile, File, { rejectValue: string }>("profile/avatar",
  async (file, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("avatar", file);
      return (await userApiClient.post("/profile/me/avatar", form)).data;
    } catch (e) { return rejectWithValue(msg(e)); }
  });

interface State { data: Profile | null; loading: boolean; error: string | null }
const initialState: State = { data: null, loading: false, error: null };

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyProfile.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMyProfile.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchMyProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload ?? "Failed to load profile"; })
      .addCase(saveMyProfile.fulfilled, (s, a) => { s.data = a.payload; })
      .addCase(uploadAvatar.fulfilled, (s, a) => { s.data = a.payload; })
      .addCase(logout, () => initialState);
  },
});
export default profileSlice.reducer;