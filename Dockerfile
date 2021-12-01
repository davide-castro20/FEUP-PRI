FROM solr:8.10

COPY solr_datasets/steam.json /data/steam.json

#COPY simple_schema.json /data/simple_schema.json

COPY startup.sh /scripts/startup.sh

ENTRYPOINT ["/scripts/startup.sh"]
