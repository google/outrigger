# Outrigger

Outrigger is a thin library of cloud functions to test various aspects of
website performance and UX at scale (initial tests have been successful,
completeing > 3,000 tests in less than 10 minutes), as well as utility functions
to curry result data to disparate GCP products (Google CloudSql, Datastore,
etc.)

## Terms
*  __Test__: A single function that analyzes some facet of a website. A cloud
    function typically encapsulates a single test.
