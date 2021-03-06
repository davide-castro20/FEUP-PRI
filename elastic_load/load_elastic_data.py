import json
from xml.sax.handler import property_interning_dict
from elasticsearch import Elasticsearch


f1 = open("../elastic_datasets/steam.json", "r")
steam_json = json.load(f1)

es = Elasticsearch()

print("Uploading documents...")
i = 1
c = 1000
data_send = []
for doc in steam_json:
    doc["name_completion"] = doc["name"]
    data_send.append({"index" : { "_index" : "games", "_id" : str(i)} })
    data_send.append(doc)
    i = i + 1
    if(c == 0):
        response = es.bulk(index='games', body=data_send)
        c = 1000
        data_send = []
    c -= 1

if len(data_send) > 0:
    response = es.bulk(index='games', body=data_send)

print("Completed.")