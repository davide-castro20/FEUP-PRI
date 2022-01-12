queryForm = document.querySelector("form#search");
queryResults = document.querySelector("ul#results");

queryForm.onsubmit = function(event) {
    event.preventDefault();

    let queryText = document.querySelector("input#queryText").value;
    let minPrice = document.querySelector("input#priceMin").value;
    let maxPrice = document.querySelector("input#priceMax").value;
    let nameSearch = document.getElementById("nameSearch").value;
    let descriptionSearch = document.getElementById("descriptionSearch").value;
    let genresSearch = document.getElementById("genresSearch").value;

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
                    
                },
                ], 
                "boost_mode": "multiply"
            }

        },
        "size":20, 
        "fields": [
          "name",
          "price",
          "genres",
          "short_description"
        ],
        "_source": false
    }

    let data_new = { 
        "query": 
        {
            "bool": {
                "must": [
                    
                ],
                "filter": [
                    { "range": {"price" : {"gte":  minPrice.length == 0 ? 0 : minPrice }}},
                    { "range": {"price" : {"lte":  maxPrice.length == 0 ? 200 : maxPrice }}}
                ]
            }
        },
        "size":20, 
        "fields": [
          "name",
          "price",
          "genres",
          "short_description"
        ],
        "_source": false
    }
    let queryToSend = data;
    if(nameSearch.length != 0){
        data_new.query.bool.must.push({ "match": {"name":nameSearch}})
        queryToSend = data_new;
    }
    
    if(descriptionSearch.length != 0){
        data_new.query.bool.must.push({ "match": {"short_description":descriptionSearch}})
        queryToSend = data_new;
    }

    if(genresSearch.length != 0){
        data_new.query.bool.filter.push({"match": {"genres": genresSearch}})
        queryToSend = data_new;
    }
    if(minPrice.length != 0 || maxPrice.length != 0){
        queryToSend = data_new;
    }

    sendAjaxRequest("POST", "http://localhost:9200/games/_search", JSON.stringify(queryToSend), function() {
        if (this.status != 200)
            return;

        responseJson = JSON.parse(this.responseText);

        if (document.querySelector("ul#results") == null) {
            let resultsDiv = document.createElement("div");
            resultsDiv.setAttribute("class", "advance-search");
            resultsDiv.style = "margin-top: 1em;";
            let resultsList = document.createElement("ul");
            resultsList.setAttribute("id", "results");
            resultsDiv.appendChild(resultsList);
            document.querySelector("div.inner-form").appendChild(resultsDiv);
            queryResults = resultsList;
        }

        // no results
        let hits = responseJson["hits"]["hits"];
        if (hits.length == 0) {
            queryResults.innerHTML = "No results";
            document.getElementById("numberResults").innerHTML = 0;
            return;
        }

        // console.log(hits);
        queryResults.innerHTML = "";

        for (let i = 0; i < hits.length; ++i) {
            let listObj = document.createElement("li");
            let fields = hits[i]["fields"];
            let element = `
            <li style="margin:1em;">
                <p><strong>Name</strong>: ` + fields["name"][0] + `</p>
                <p><strong>Price</strong>: ` + fields["price"][0] + `</p>
                <p><strong>Description</strong>: `+ fields["short_description"][0] + `</p>
                <div>
                    <p><strong>Genres</strong>:</p>
                    <ul>
            `;

            for (let j = 0; j < fields["genres"].length; ++j) {
                element += "<p>" + fields["genres"][j] + "\n";
            }

            element += `
                    </ul>
                </div>
            </li>
            <hr>
            `;
            queryResults.innerHTML += element;
        }
        // queryResults.innerHTML = this.responseText;

        document.getElementById("numberResults").innerHTML = hits.length;
    });

}

function sendAjaxRequest(method, url, data, handler) {
    let request = new XMLHttpRequest();

    request.open(method, url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.addEventListener('load', handler);

    request.send(data);
}