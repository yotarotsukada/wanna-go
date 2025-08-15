import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/create", "routes/create.tsx"),
  route("/group/:groupId", "routes/group.tsx"),
  route("/group/:groupId/add", "routes/add-bookmark.tsx"),
  route("/group/:groupId/edit/:bookmarkId", "routes/edit-bookmark.tsx"),
  route("/group/:groupId/settings", "routes/group-settings.tsx"),
  route("/about", "routes/about.tsx"),
  
  // API Routes
  // route("/api/groups", "routes/api.groups.ts"),
  // route("/api/groups/:groupId", "routes/api.groups.$groupId.ts"),
  // route("/api/groups/check/:groupId", "routes/api.check-group-id.ts"),
  // route("/api/groups/:groupId/bookmarks", "routes/api.groups.$groupId.bookmarks.ts"),
  // route("/api/bookmarks/:bookmarkId", "routes/api.bookmarks.$bookmarkId.ts"),
  route("/api/url-metadata", "routes/api.url-metadata.ts"),
  
  // DevTools や well-known パスを無視するためのキャッチオール
  route("/.well-known/*", "routes/well-known.tsx"),
] satisfies RouteConfig;
