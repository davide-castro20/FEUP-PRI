FROM docker.elastic.co/elasticsearch/elasticsearch:7.15.2

COPY elastic_datasets /elastic_datasets
COPY docker_load.sh /
COPY load_elastic_data.py /

USER elasticsearch:root

ENTRYPOINT [ "/docker_load.sh" ]