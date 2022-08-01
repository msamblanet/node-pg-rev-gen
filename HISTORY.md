# node-pg-rev-gen - Revision History

- 2022-08-01: v0.2.1
  - Fix typo in _rev_load template

- 2022-08-01: v0.2.0
  - Added ext_create_date to _rev and _current_with_rev
  - Modify view chain to materialize _current_all and provide parallel _current/_current_all chains (to allow access to deleted items)
  - Add create_date to _current_with_rev views

- 2022-07-26: v0.1.2
  - Fix data type of raw_data in updated to be JSONB
  - Generate default_source_id for all types and extra updated
  - Fix updated_load to use default source id
  - Remove unique from ext_id indexes on _raw and _current due to it causing upsert issues

- 2022-07-24: v0.1.1
  - Add package version to SQL header
  - Correct dropping of extra updated tables
  - Add missing ::text typecast for ext_uid in xxx_updated_load
  - Minor HSB cleanup, SQL bug fixes

- 2022-07-23: v0.1.0 - Initial release
