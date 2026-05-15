CREATE EXTERNAL TABLE IF NOT EXISTS ods_clickstream_text (
  user_id STRING,
  event_time STRING,
  page_id STRING,
  props STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY '\t'
STORED AS TEXTFILE
LOCATION 'hdfs:///warehouse/ods/ods_clickstream_text';

CREATE TABLE IF NOT EXISTS ods_clickstream_json (
  user_id STRING,
  event_time STRING,
  page_id STRING,
  props MAP<STRING, STRING>
)
ROW FORMAT SERDE 'org.apache.hive.hcatalog.data.JsonSerDe'
STORED AS TEXTFILE;
