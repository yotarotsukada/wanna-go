import { themeService } from "../services/theme";

export async function loader({ params }: { params: { themeId: string } }) {
  const { themeId } = params;
  
  if (!themeId) {
    throw new Response("Theme ID is required", { status: 400 });
  }

  try {
    const bookmarks = await themeService.getBookmarksByThemeId(themeId);
    return { bookmarks };
  } catch (error) {
    console.error("Error loading theme bookmarks:", error);
    throw new Response("Failed to load theme bookmarks", { status: 500 });
  }
}