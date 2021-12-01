#!/bin/bash

precreate-core games

# Start Solr in background mode so we can use the API to upload the schema
solr start

# Schema definition via API
# curl -X POST -H 'Content-type:application/json' \
#     --data-binary @/data/simple_schema.json \
#     http://localhost:8983/solr/courses/schema

# Populate collection
bin/post -c games /data/steam.json

# Restart in foreground mode so we can access the interface
solr restart -f
