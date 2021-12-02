FROM solr:8.10

COPY solr_datasets/steam1.json /data/steam1.json
COPY solr_datasets/steam2.json /data/steam2.json

#COPY simple_schema.json /data/simple_schema.json

COPY startup.sh /scripts/startup.sh

ENTRYPOINT ["/scripts/startup.sh"]
