-- CreateTable
CREATE TABLE "Action" (
    "id" SERIAL NOT NULL,
    "roomID" TEXT NOT NULL,
    "serializedJSON" TEXT NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);
