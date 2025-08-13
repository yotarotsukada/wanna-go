import type { Route } from "./+types/api.check-group-id";
import { checkGroupIdAvailability } from "../services/group.server";
import { json } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const groupId = url.searchParams.get("groupId");

  if (!groupId) {
    return json({ error: "Group ID is required" }, { status: 400 });
  }

  try {
    const available = await checkGroupIdAvailability(groupId);
    return json({ available, suggested_alternatives: [] });
  } catch (error) {
    return json({ error: "Failed to check group ID" }, { status: 500 });
  }
}