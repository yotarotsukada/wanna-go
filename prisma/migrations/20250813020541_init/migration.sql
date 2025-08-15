-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "group_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "memo" TEXT,
    "address" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "visited" BOOLEAN NOT NULL DEFAULT false,
    "visited_at" DATETIME,
    "auto_title" TEXT,
    "auto_description" TEXT,
    "auto_image_url" TEXT,
    "auto_site_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bookmarks_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "bookmarks_group_id_idx" ON "bookmarks"("group_id");

-- CreateIndex
CREATE INDEX "bookmarks_category_idx" ON "bookmarks"("category");

-- CreateIndex
CREATE INDEX "bookmarks_visited_idx" ON "bookmarks"("visited");

-- CreateIndex
CREATE INDEX "bookmarks_priority_idx" ON "bookmarks"("priority");

-- CreateIndex
CREATE INDEX "bookmarks_created_at_idx" ON "bookmarks"("created_at");

-- CreateIndex
CREATE INDEX "bookmarks_url_idx" ON "bookmarks"("url");
