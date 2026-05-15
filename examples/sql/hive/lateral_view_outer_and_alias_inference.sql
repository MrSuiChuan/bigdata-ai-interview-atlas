SELECT
  page_id,
  adid
FROM page_ads
LATERAL VIEW OUTER explode(adid_list) ad_tbl AS adid;

SELECT
  seed,
  id,
  name
FROM (SELECT 1 AS seed) s
LATERAL VIEW inline(array(named_struct('id', 101, 'name', 'alpha'))) lv;
