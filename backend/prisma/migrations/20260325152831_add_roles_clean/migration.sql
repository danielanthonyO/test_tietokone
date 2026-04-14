CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'WORKER', 'TRAINEE');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole_new"
USING (
  CASE
    WHEN "role"::text = 'TECHNICIAN' THEN 'WORKER'::"UserRole_new"
    ELSE "role"::text::"UserRole_new"
  END
);

DROP TYPE "UserRole";

ALTER TYPE "UserRole_new" RENAME TO "UserRole";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'WORKER';
