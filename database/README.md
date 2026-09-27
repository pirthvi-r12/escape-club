# Database

| File | Purpose |
|------|---------|
| `escape-club.sql` | Full PostgreSQL setup: schema + destination data |

```bash
npm run db:apply-sql   # apply escape-club.sql
npm run db:reset       # drop all tables, then re-apply escape-club.sql
npm run db:seed        # booking feed + destination sync (Prisma)
npm run db:setup       # start Postgres + apply SQL + seed
```

Docker Compose mounts `escape-club.sql` on first container init.
