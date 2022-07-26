# node-pg-rev-gen - Revision History

- 2022-07-26: v0.1.2
  - Fix data type of raw_data in updated to be JSONB
  - Generate default_source_id for all types and extra updated
  - Fix updated_load to use default source id

- 2022-07-24: v0.1.1
  - Add package version to SQL header
  - Correct dropping of extra updated tables
  - Add missing ::text typecast for ext_uid in xxx_updated_load
  - Minor HSB cleanup, SQL bug fixes

- 2022-07-23: v0.1.0 - Initial release
