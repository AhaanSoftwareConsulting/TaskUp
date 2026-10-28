export const avatarUrl = (url?: string | null, size = 256) =>
  url ? url.replace("/upload/", `/upload/c_fill,g_face,w_${size},h_${size},q_auto,f_auto/`) : null;