const dotenv = require("dotenv");
dotenv.config({ path: "backend/.env" });
const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  schema: "backend/prisma/schema.prisma",
  migrations: { path: "backend/prisma/migrations" },
  engine: "classic",
  datasource: { url: "postgresql://postgres:postgres@localhost:5432/tietokonelepuski" },
});
