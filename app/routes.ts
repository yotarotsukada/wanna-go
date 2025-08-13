import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/create", "routes/create.tsx"),
  route("/group/:groupId", "routes/group.tsx"),
  route("/group/:groupId/add", "routes/add-bookmark.tsx"),
  route("/group/:groupId/edit/:bookmarkId", "routes/edit-bookmark.tsx"),
  route("/group/:groupId/settings", "routes/group-settings.tsx"),
  route("/about", "routes/about.tsx"),
] satisfies RouteConfig;
