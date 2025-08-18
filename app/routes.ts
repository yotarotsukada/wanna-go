import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/create", "routes/create.tsx"),
  route("/group/:groupId", "routes/group.tsx"),
  route("/group/:groupId/add", "routes/add-bookmark.tsx"),
  route("/group/:groupId/edit/:bookmarkId", "routes/edit-bookmark.tsx"),
  route("/group/:groupId/settings", "routes/group-settings.tsx"),
  route("/group/:groupId/themes", "routes/themes.tsx"),
  route("/group/:groupId/themes/create", "routes/theme-create.tsx"),
  route("/group/:groupId/themes/edit/:themeId", "routes/theme-edit.tsx"),
  
  // API Routes
  route("/api/theme/:themeId/bookmarks", "routes/api.theme.$themeId.bookmarks.ts"),
  route("/api/url-metadata", "routes/api.url-metadata.ts"),
  
  // DevTools や well-known パスを無視するためのキャッチオール
  route("/.well-known/*", "routes/well-known.tsx"),
] satisfies RouteConfig;
