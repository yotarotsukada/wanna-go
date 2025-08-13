import type { Route } from "./+types/api.url-metadata";
import { fetchUrlMetadata } from "../services/url-metadata.server";
import { json } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = formData.get("url")?.toString();

  if (!url) {
    return json({ error: "URL is required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return json({ error: "Invalid URL format" }, { status: 400 });
  }

  const metadata = await fetchUrlMetadata(url);
  return json(metadata);
}