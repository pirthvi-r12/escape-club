console.error(
  "[postgres] Embedded PostgreSQL was removed for cross-platform deploys.",
);
console.error("Use TiDB/MySQL (.env.local), Docker (npm run db:up), or local MySQL.");
process.exit(1);
