-- Spark SQL / Iceberg 示例：过期快照、清理 orphan、重写 manifests
CALL prod.system.expire_snapshots(
  table => 'db.orders',
  older_than => TIMESTAMP '2026-03-01 00:00:00'
);

CALL prod.system.remove_orphan_files(
  table => 'db.orders',
  older_than => TIMESTAMP '2026-04-20 00:00:00'
);

CALL prod.system.rewrite_manifests(
  table => 'db.orders'
);
