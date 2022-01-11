queryForm = document.querySelector("form#query");
queryResults = document.querySelector("ul#results");

queryForm.onsubmit = function(event) {
    event.preventDefault();

    let queryText = document.querySelector("input#queryText").value;

    let data = { 
        "query": {
            "function_score": {
                "query": {
                "query_string": {
                    "query": queryText,
                    "fields": [
                    "name^0.5",
                    "short_description^0.1",
                    "detailed_description^0.75",
                    "about_the_game^0.2",
                    "categories^1.5",
                    "genres^1.5",
                    "developers^1",
                    "publishers^0.2"
                    ]
                }
                },
        
                "functions": [
                {
                    
                    "field_value_factor": 
                    {
                    "field": "tags.votes",
                    "factor": 0.02
                    }
                    
                }
                ], 
                "boost_mode": "multiply"
            }
        },
        "size":20, 
        "fields": [
          "name",
          "price",
          "genres",
          "categories",
          "developers",
          "publishers",
          "detailed_description",
          "tags.name"
        ],
        "_source": false
    }

    sendAjaxRequest("POST", "http://localhost:9200/games/_search", JSON.stringify(data), function() {
        if (this.status != 200)
            return;

        responseJson = JSON.parse(this.responseText);

        // no results
        let hits = responseJson["hits"]["hits"];
        if (hits.length == 0) {
            queryResults.innerHTML = "No results"
            return;
        }

        console.log(hits);
        queryResults.innerHTML = "";

        for (let i = 0; i < hits.length; ++i) {
            let listObj = document.createElement("li");
            let fields = hits[i]["fields"];
            queryResults.innerHTML += JSON.stringify(fields)
        }
        // queryResults.innerHTML = this.responseText;
    });

}


function encodeForAjax(data) {
    if (data == null) return null;
    return Object.keys(data).map(function(k){
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
    }).join('&');
}

function sendAjaxRequest(method, url, data, handler) {
    let request = new XMLHttpRequest();

    request.open(method, url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.addEventListener('load', handler);

    request.send(data);
}