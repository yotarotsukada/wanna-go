-- AlterTable
ALTER TABLE "bookmarks" ADD COLUMN "place_id" TEXT;

-- CreateIndex
CREATE INDEX "bookmarks_place_id_idx" ON "bookmarks"("place_id");
