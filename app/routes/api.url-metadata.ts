import type { Route } from "./+types/api.url-metadata";
import { fetchUrlMetadata } from "../services/url-metadata.server";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url")?.toString();

  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return Response.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const metadata = await fetchUrlMetadata(url);
  return Response.json(metadata);
}