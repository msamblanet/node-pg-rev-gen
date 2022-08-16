# node-pg-rev-gen - README
[![npm version](https://badge.fury.io/js/@msamblanet%2Fnode-pg-rev-gen.svg)](https://badge.fury.io/js/@msamblanet%2Fnode-pg-rev-gen)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This utility takes a JSON file (may be JSON5 syntax - https://json5.org/) and uses it to generate SQL for creating
and dropping all of the necessary tables, views, and procedures for the node-pg-rev system.

Usage of these scripts and tables does not require your app to be a node.js app.  If you are using node, please look at node-pg-rev for helpful libraries to implement this system.

## Generated SQL Objects

The following objects are generated:

- Shared:
  - rev_jsonb_diff_val() - Function that calculates the difference between 2 JSONB objects
  - rev_jobs_sequence - Sequence for job numbers
  - rev_create_job() - Function to get a job number and the current server timestamp for reference
- Per Record Type:
  - xxx_default_source_id() - Function returning the default source id for the type (if one was specified)
  - xxx_raw - Table containing a single record representing the current state of the data in the source system
    - xxx_raw_load() - Procedure to load a batch of records into xxx_raw
    - xxx_raw_trim() - Procedure to trim records which are older than a given date (used after full loads to remove deleted records)
  - xxx_rev - Table containing a history of all of the changes to the raw data
    - xxx_rev_load() - Generates new revisions based on updated load data
    - xxx_rev_trim() - Removes raw data from old notes (can be recovered via the delta fields)
    - xxx_rev_view - View of _rev with all extracted columns added
  - xxx_current_all_mview - An (optionally materialized) view of all current records (including deleted records) and all materialized extracted columns
    - xxx_current_refresh() - A procedure to refresh the materialized view (created even if current is not materialized for consistency) including materialized extracted columns
    - XXX_current_all - All current records with non-materialized extracted columns added
    - XXX_current - Same as XXX_current_view but with deleted records filtered
  - xxx_updated - A table to track external updates for each record - generally used to sink webhook notifications of updates but can also be used to force updates of specific records
    - xxx_updated_load() - Procedure to load a batch of records into xxx_updated
    - xxx_updated_trim() - Procedure to delete updates older than a given date

## JSON Syntax

- createFileName - If specified, write a create SQL script to this file
- dropFileName - If specified, write a drop SQL script to this file
- dropTransientFileName - If specified, write a drop SQL script to this file which only drops transient objects (excludes raw, rev, updates)
- publicNamespace - If specified, prefix all public (non-type-related) objects with this prefix (namespace and/or table name prefix)
- viewers - String of users and roles to grant SELECT access to all types
- updaters - String of users and roles to grant SELECT and EXECUTE access to all types and procedures
- types[] - Array of type objects
  - name - Name of the type - used as the ```xxx``` prefix for the table and procedure names
  - storeSource - If true, include a source_id column in the tables
  - extIdType - If set, include an ext_id column of this type in the tables
  - defaultSourceId - If set, default the source id to this value (otherwise it becomes required in xxx_raw_load)
  - namespace - If set, prefix all type specific objects with this prefix (namespace and/or table name prefix)
  - extraUpdated[] - An array of extra type names to create updated fields for - possibly used if you have multiple webhooks with different meanings
  - materializeView - If true, the xxx_current view will be materialized
  - concurrentView - If true, then xxx_current_refresh() will refresh the view concurrently
  - viewers - String of users and roles to grant SELECT access to this type
  - updaters - String of users and roles to grant SELECT and EXECUTE access to this type
  - extractedFields - A hash of information on fields to extract into xxx_current
    - [name] - The column name in the DB
    - doNotMaterialize - If true, the column is omitted from materialized views to save space
    - definition - The SQL table definition for the column
    - index - If true, index this column (only if materialized)
    - unique - If true, make the index unique (only if materialized and index)
    - comment - String comment to add to the SQL
  - indexes[] - A hash of indexes to add to the xxx_current materialized view (only if materialized)
    - [name] - Name of the index
    - definition - SQL fefining the index
    - unique - If true, make the index unique
    - comment - String comment to add to the SQL
  - extraCreate[] - Extra SQL to add to the create script
  - extraRawTrim[] - Extra SQL to add to the xxx_raw_trim procedure
  - extraGrant[] - Extra SQL to add to the grant portion of hte script
  - extraDropPersistent[] - Extra SQL to add to the persistent drop scripts
  - extraDropTransient[] - Extra SQL to add to the transient drop scripts
  - extraRefresh[] - Extra SQL to add to the xxx_current_refresh script
