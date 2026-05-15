-- Spark SQL / Iceberg 示例：常见维护过程
CALL prod.system.expire_snapshots(
  table => 'db.orders',
  older_than => TIMESTAMP '2026-04-01 00:00:00'
);

CALL prod.system.remove_orphan_files(
  table => 'db.orders',
  older_than => TIMESTAMP '2026-04-20 00:00:00'
);

CALL prod.system.rewrite_data_files(
  table => 'db.orders'
);

CALL prod.system.rewrite_manifests(
  table => 'db.orders'
);