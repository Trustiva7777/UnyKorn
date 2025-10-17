-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "route" TEXT,
    "account" TEXT,
    "destination" TEXT,
    "tokenId" TEXT,
    "issuerCold" TEXT,
    "currency" TEXT,
    "value" TEXT,
    "hash" TEXT,
    "engineResult" TEXT,
    "memos" JSONB,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_type_createdAt_idx" ON "Event"("type", "createdAt");

-- CreateIndex
CREATE INDEX "Event_account_createdAt_idx" ON "Event"("account", "createdAt");

-- CreateIndex
CREATE INDEX "Event_tokenId_createdAt_idx" ON "Event"("tokenId", "createdAt");
