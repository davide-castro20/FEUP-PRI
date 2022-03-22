# FEUP-PRI
Project for **Information Processing and Retrieval** Course at FEUP 

Dataset used: https://www.kaggle.com/nikdavis/steam-store-games

**Final grade**: 17.28

## Instructions

To run this project, **Docker** and **Python 3.8.x** is required.

In the root of the project, start the Docker containers.
```properties
docker-compose up
```

After the ElasticSearch container is operational, load the mappings and documents
```properties 
python elastic_load/load_elastic_data_and_schema.py
```

ElasticSearch will be available through the port 9200 and the GUI in the port 8080 in localhost.

## Group 2132
| Name             | Number    | E-Mail                   |
| ---------------- | --------- | ------------------------ |
| Davide Castro    | 201806512 | up201806512@edu.fe.up.pt |
| Diogo Rosário    | 201806582 | up201806582@edu.fe.up.pt |
| Henrique Ribeiro | 201806529 | up201806529@edu.fe.up.pt |

