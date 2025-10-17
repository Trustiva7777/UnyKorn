-- CreateTable
CREATE TABLE "TxLog" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "ledgerIndex" INTEGER,
    "type" TEXT NOT NULL,
    "payloadUuid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TxLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TxLog_txHash_key" ON "TxLog"("txHash");
