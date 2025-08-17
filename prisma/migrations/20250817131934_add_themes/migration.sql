-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "group_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "themes_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookmark_themes" (
    "bookmark_id" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("bookmark_id", "theme_id"),
    CONSTRAINT "bookmark_themes_bookmark_id_fkey" FOREIGN KEY ("bookmark_id") REFERENCES "bookmarks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookmark_themes_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "themes_group_id_idx" ON "themes"("group_id");

-- CreateIndex
CREATE INDEX "themes_created_at_idx" ON "themes"("created_at");

-- CreateIndex
CREATE INDEX "bookmark_themes_bookmark_id_idx" ON "bookmark_themes"("bookmark_id");

-- CreateIndex
CREATE INDEX "bookmark_themes_theme_id_idx" ON "bookmark_themes"("theme_id");
