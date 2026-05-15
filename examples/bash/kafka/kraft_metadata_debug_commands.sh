#!/usr/bin/env bash

# Inspect KRaft quorum status
bin/kafka-metadata-quorum.sh --bootstrap-server localhost:9092 describe --status

# Dump metadata log segments / snapshots
bin/kafka-dump-log.sh --cluster-metadata-decoder --files /var/lib/kafka/__cluster_metadata-0/00000000000000000000.log

# Open a valid metadata snapshot with the metadata shell
bin/kafka-metadata-shell.sh --snapshot /var/lib/kafka/__cluster_metadata-0/00000000000000012345.snapshot