queryForm = document.querySelector("form#search");
queryResults = document.querySelector("ul#results");
queryTextMain = document.querySelector("input#queryText");

queryForm.onsubmit = function(event) {
    event.preventDefault();

    let queryText = document.querySelector("input#queryText").value;
    let minPrice = document.querySelector("input#priceMin").value;
    let maxPrice = document.querySelector("input#priceMax").value;
    let nameSearch = document.getElementById("nameSearch").value;
    let descriptionSearch = document.getElementById("descriptionSearch").value;
    let genresSearch = document.getElementById("genresSearch").value;
    let sortOption = document.getElementById("sort").value;

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
          "short_description",
          "release_date"
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
        "highlight": {
            "pre_tags": ["<strong>"],
            "post_tags": ["</strong>"],
            "fields":  {

            }
        },
        "size":20, 
        "fields": [
          "name",
          "price",
          "genres",
          "short_description",
          "release_date"
        ],
        "_source": false
    }
    let queryToSend = data;
    if(nameSearch.length != 0){
        data_new.query.bool.must.push({ "match": {"name":nameSearch}});
        data_new.highlight.fields["name"] = {};
        queryToSend = data_new;
    }
    
    if(descriptionSearch.length != 0){
        data_new.query.bool.must.push({ "match": {"short_description":descriptionSearch}})
        data_new.highlight.fields["short_description"] = {};
        queryToSend = data_new;
    }

    if(genresSearch.length != 0){
        data_new.query.bool.filter.push({"match": {"genres": genresSearch}});
        data_new.highlight.fields["genres"] = {};
        queryToSend = data_new;
    }
    if(minPrice.length != 0 || maxPrice.length != 0){
        queryToSend = data_new;
    }

    if(sortOption != "-1"){
    
        let option = sortOption.split("-");
        let sort = "";
        if(option[0] != "release_date"){
            sort = '[{"'+option[0]+'" : "'+option[1]+'" }]';  
        }
        else{
            sort = '[{"'+option[0]+'" : {"order" : "'+option[1]+'", "format": "dd/MM/yyyy"}}]';  
        }
        // console.log(sort);
        queryToSend["sort"] = JSON.parse(sort);
    }


    sendAjaxRequest("POST", "http://localhost:9200/games/_search", JSON.stringify(queryToSend), function() {
        if (this.status != 200)
            return;

        responseJson = JSON.parse(this.responseText);

        createResultsDiv();

        // no results
        let hits = responseJson["hits"]["hits"];
        if (hits.length == 0) {
            queryResults.innerHTML = "No results";
            document.getElementById("numberResults").innerHTML = 0;
            return;
        }

        // console.log(hits);
        queryResults.innerHTML = "";

        let gameElementsList = []
        for (let i = 0; i < hits.length; ++i) {
            let fields = hits[i]["fields"];
            let highlight = hits[i]["highlight"];
            let gameElements = { "name": fields["name"][0], "price": fields["price"][0], 
                                "release_date": fields["release_date"][0], "short_description": fields["short_description"][0],
                                "genres": fields["genres"]};

            for (var el in highlight) {
                gameElements[el] = highlight[el];
            }

            gameElementsList.push(gameElements);
        }

        showResults(gameElementsList);
    });

}

queryTextMain.addEventListener("keyup", function() {

    let text = queryTextMain.value;
    let data = {
        "suggest": {
            "game-suggest": {
                "prefix": text,
                "completion": {
                    "field": "name",
                    "size": 20,
                    "fuzzy": {
                        "fuzziness": 0.5
                    }
                }
            }
        }
    }

    sendAjaxRequest("POST", "http://localhost:9200/games/_search", JSON.stringify(data), function () {
        if (this.status != 200)
            return;

        let responseJson = JSON.parse(this.responseText);
        let suggestions = responseJson["suggest"]["game-suggest"][0]["options"];

        if (suggestions.length > 0)
            createResultsDiv();

        let gameElementsList = [];
        for (let i = 0; i < suggestions.length; ++i) {
            let fields = suggestions[i]["_source"];
            let gameElements = { "name": fields["name"], "price": fields["price"], 
                                "release_date": fields["release_date"], "short_description": fields["short_description"],
                                "genres": fields["genres"]};

            gameElementsList.push(gameElements);
        }

        showResults(gameElementsList);
    });
});


function sendAjaxRequest(method, url, data, handler) {
    let request = new XMLHttpRequest();

    request.open(method, url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.addEventListener('load', handler);

    request.send(data);
}

function createResultsDiv() {
    if (document.querySelector("ul#results") == null) {
        let resultsDiv = document.createElement("div");
        resultsDiv.setAttribute("class", "advance-search");
        resultsDiv.setAttribute("id", "resultsDiv");
        resultsDiv.style = "margin-top: 1em;";
        let resultsList = document.createElement("ul");
        resultsList.setAttribute("id", "results");
        resultsDiv.appendChild(resultsList);
        document.querySelector("div.inner-form").appendChild(resultsDiv);
        queryResults = resultsList;
    }
}

function showResults(gameElementsList) {

    if (gameElementsList.length == 0) {
        let resultsDiv = document.querySelector("div#resultsDiv");
        if(resultsDiv != null)
            resultsDiv.remove();
    }

    queryResults.innerHTML = "";

    for (let i = 0; i < gameElementsList.length; ++i) {
        let element = `
            <li style="margin:1em;">
                <p><strong>Name</strong>: ` + gameElementsList[i]["name"] + `</p>
                <p><strong>Price</strong>: ` + gameElementsList[i]["price"] + `</p>
                <p><strong>Release Date</strong>: ` + gameElementsList[i]["release_date"] + `</p>
                <p><strong>Description</strong>: `+ gameElementsList[i]["short_description"] + `</p>
                <div>
                    <p><strong>Genres</strong>:</p>
                    <ul>
            `;

            for (let j = 0; j < gameElementsList[i]["genres"].length; ++j) {
                element += "<p>" + gameElementsList[i]["genres"][j] + "\n";
            }

        element += `
                    </ul>
                </div>
            </li>
            <hr>
            `;
        
        queryResults.innerHTML += element;
    }

    document.getElementById("numberResults").innerHTML = gameElementsList.length;
}