-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- Add workspace ownership to Metric while preserving existing data.
ALTER TABLE "Metric" ADD COLUMN "workspaceId" TEXT;

-- Backfill a default workspace for every existing user.
INSERT INTO "Workspace" ("id", "name", "ownerId", "createdAt", "updatedAt")
SELECT
    "id",
    CONCAT(
        COALESCE(
            NULLIF(TRIM(COALESCE("name", '')), ''),
            SPLIT_PART("email", '@', 1)
        ),
        '''s Workspace'
    ),
    "id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User";

-- Backfill an owner membership for each default workspace.
INSERT INTO "Membership" ("id", "role", "userId", "workspaceId", "createdAt")
SELECT
    CONCAT("id", '_membership'),
    'OWNER'::"WorkspaceRole",
    "id",
    "id",
    CURRENT_TIMESTAMP
FROM "User";

-- Move existing metrics from user ownership to workspace ownership.
UPDATE "Metric"
SET "workspaceId" = "userId"
WHERE "workspaceId" IS NULL;

ALTER TABLE "Metric" ALTER COLUMN "workspaceId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_workspaceId_key" ON "Membership"("userId", "workspaceId");

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Membership_workspaceId_idx" ON "Membership"("workspaceId");

-- CreateIndex
CREATE INDEX "Metric_workspaceId_idx" ON "Metric"("workspaceId");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the old single-user ownership column after migration.
ALTER TABLE "Metric" DROP CONSTRAINT "Metric_userId_fkey";
ALTER TABLE "Metric" DROP COLUMN "userId";
