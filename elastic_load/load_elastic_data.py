import json
from xml.sax.handler import property_interning_dict
from elasticsearch import Elasticsearch
import requests

mapping = {
  "settings": {
    "analysis": {
      "filter": 
      {
        "my_synonyms": {
          "type": "synonym",
          "synonyms_path": "synonyms.txt"
        }
      }, 
      "analyzer": {
        "descriptions_analyzer": {
          "tokenizer": "pattern_tokenizer",
          "char_filter": [
            "html_strip"
          ],
          "filter": [
            "lowercase",
            "asciifolding",
            "stop"
          ],
          "stopwords": "_english_"
        },
        "achievements_analyzer": {
          "tokenizer": "achievements_tokenizer",
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        },
        "tags_analyzer": {
          "tokenizer": "tags_tokenizer"
        },
        "names_analyzer": {
          "tokenizer": "names_tokenizer",
          "filter": [
            "lowercase",
            "asciifolding",
            "my_synonyms"
          ]
        }
      },
      "tokenizer": {
        "achievements_tokenizer": {
          "type": "char_group",
          "tokenize_on_chars": [
            "whitespace",
            "-",
            "_"
          ]
        },
        "pattern_tokenizer": {
          "type": "pattern",
          "pattern": "((free to play)|(first person shooter)|([a-zA-Z]+))",
          "group":1
        },
        "tags_tokenizer": {
          "type": "pattern",
          "pattern": "(ACHIEVEMENT|ACH)?_"
        },
        "names_tokenizer": {
          "type": "char_group",
          "tokenize_on_chars": [
            "whitespace",
            "-",
            "_",
            "®",
            "™",
            "©"
          ]
        }
      }
    }
  }, 
  "mappings": {
    "properties": {
      "name": {
        "type": "completion",
        "analyzer": "names_analyzer"
      },
      
      "release_date": {
        "type": "date",
        "format": "dd/MM/yyyy"
      },
      
      "owners_range": {
        "type": "integer_range"
      },
      
      "detailed_description": {
        "type": "text",
        "analyzer": "descriptions_analyzer"
      },
      
      "short_description": {
        "type": "text",
        "analyzer": "descriptions_analyzer"
      },
      
      "about_the_game": {
        "type": "text",
        "analyzer": "descriptions_analyzer"
      },
      
      "achievements": {
        "properties": {
          "name": {
            "type": "text",
            "analyzer": "achievements_analyzer"
          }
        }
      },
      
      "tags": {
        "properties": {
          "name": {
            "type": "text",
            "analyzer": "tags_analyzer"
          }
        }
      },

      "windows": {
        "type": "boolean", 
        "index": "false"
      },
      
      "linux": {
        "type": "boolean", 
        "index": "false"
      },
      
      "mac": {
        "type": "boolean", 
        "index": "false"
      },
      
      "website": {
        "type": "text", 
        "index": "false"
      },
      
      "support_url": {
        "type": "text", 
        "index": "false"
      },
      
      "support_email": {
        "type": "text", 
        "index": "false"
      }
    }
  }
}


f1 = open("elastic_datasets/steam.json", "r")
steam_json = json.load(f1)

es = Elasticsearch()

if es.indices.exists("games"):
  print("Deleted 'games'")
  es.indices.delete("games")

es.indices.create(index='games', ignore=400, body=mapping)
print("Created 'games'")

print("Uploading documents...")
i = 1
c = 1000
data_send = []
for doc in steam_json:
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