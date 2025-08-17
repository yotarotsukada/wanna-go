import { db } from "~/services/db.server";
import { ThemeRepository } from "./repository";
import { ThemeService } from "./service";

const themeRepository = new ThemeRepository(db);
export const themeService = new ThemeService(themeRepository);

export * from "./service";
export * from "./repository";