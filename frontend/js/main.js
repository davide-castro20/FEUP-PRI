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
        "highlight": {
            "pre_tags": ["<strong>"],
            "post_tags": ["</strong>"],
            "number_of_fragments": 0,
            "fields":  {
                "*": {
                }
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
            "number_of_fragments":0,
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
        else {
            sort = '[{"'+option[0]+'" : {"order" : "'+option[1]+'", "format": "dd/MM/yyyy"}}]';  
        }

        queryToSend["sort"] = JSON.parse(sort);
    }

    sendAjaxRequest("POST", "http://localhost:9200/games/_search", JSON.stringify(queryToSend), function() {
        if (this.status != 200)
            return;

        responseJson = JSON.parse(this.responseText);

        createResultsDiv();

        let hits = responseJson["hits"]["hits"];

        parseHitsAndShowResults(hits);
    });

}

queryTextMain.addEventListener("keyup", function(event) {

    // ENTER key
    if (event.keyCode === 13) {
        return;
    }

    let text = queryTextMain.value;
    let data = {
        "suggest": {
            "game-suggest": {
                "prefix": text,
                "completion": {
                    "field": "name_completion",
                    "size": 20,
                    "fuzzy": {
                        "fuzziness": 2
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
            createResultsDiv(true);

        let gamesNames = []
        for (let i = 0; i < suggestions.length; ++i) {
            gamesNames.push(suggestions[i]["_source"]["name"])
        }

        showSuggestions(gamesNames);
    });
});


function sendAjaxRequest(method, url, data, handler) {
    let request = new XMLHttpRequest();

    request.open(method, url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.addEventListener('load', handler);

    request.send(data);
}

function createResultsDiv(suggestions=false, likeThisName="") {
    
    let resultsDiv = document.querySelector("div#resultsDiv");
    if (resultsDiv == null || suggestions || likeThisName != "") {

        if (resultsDiv != null)
            resultsDiv.remove();

        resultsDiv = document.createElement("div");
        resultsDiv.setAttribute("class", "advance-search");
        resultsDiv.setAttribute("id", "resultsDiv");
        resultsDiv.style = "margin-top: 1em;";

        if (suggestions) {
            let sugHeader = document.createElement("h2");
            sugHeader.setAttribute("id", "suggestionHeader")
            sugHeader.innerHTML = "Name Suggestions";
            resultsDiv.appendChild(sugHeader);

        } 
        
        if (likeThisName != "") {
            let moreLikeHeader = document.createElement("h2");
            moreLikeHeader.setAttribute("id", "moreLikeThisHeader")
            moreLikeHeader.innerHTML = "More like \"" + likeThisName + "\"";
            resultsDiv.appendChild(moreLikeHeader);
        }

        let resultsList = document.createElement("ul");
        resultsList.setAttribute("id", "results");
        resultsDiv.appendChild(resultsList);
        document.querySelector("div.inner-form").appendChild(resultsDiv);
        queryResults = resultsList;
    }
}

function parseHitsAndShowResults(hits, mlt=false) {

    if (hits.length == 0) {
        queryResults.innerHTML = "No results";
        document.getElementById("numberResults").innerHTML = 0;
        return;
    }

    queryResults.innerHTML = "";

    let gameElementsList = []
    for (let i = 0; i < hits.length; ++i) {

        let gameElements = {}
        let gameId = hits[i]["_id"];

        if(!mlt) {
            let fields = hits[i]["fields"];
            let highlight = hits[i]["highlight"];
            gameElements = { "_id": gameId, "name": fields["name"][0], "price": fields["price"][0], 
                                "release_date": fields["release_date"][0], "short_description": fields["short_description"][0],
                                "genres": fields["genres"]};

            for (var el in highlight) {
                let highlightedEl = highlight[el];
                gameElements[el] = highlightedEl;
                // if (highlightedEl.length < gameElements)
                // gameElements[el] = highlight[el] + gameElements[el].substring(highlight[el].length, gameElements.length - 1);
            }

        } else {
            let fields = hits[i]["_source"];
            let highlight = hits[i]["highlight"];
            gameElements = { "_id": gameId, "name": fields["name"], "price": fields["price"], 
                                "release_date": fields["release_date"], "short_description": fields["short_description"],
                                "genres": fields["genres"]};
        }

        gameElementsList.push(gameElements);
    }

    for (let i = 0; i < gameElementsList.length; ++i) {
        let listEl = document.createElement("li");
        listEl.style = "margin:1em;";
        listEl.innerHTML = `
                <p><strong>Name</strong>: ` + gameElementsList[i]["name"] + `</p>
                <p><strong>Price</strong>: ` + gameElementsList[i]["price"] + `</p>
                <p><strong>Release Date</strong>: ` + gameElementsList[i]["release_date"] + `</p>
                <p><strong>Description</strong>: `+ gameElementsList[i]["short_description"] + `</p>
                <div>
                    <p><strong>Genres</strong>:</p>
                    <ul>
            `;

            for (let j = 0; j < gameElementsList[i]["genres"].length; ++j) {
                listEl.innerHTML += "<p>" + gameElementsList[i]["genres"][j] + "\n";
            }

        listEl.innerHTML += `
                    </ul>
                </div>
            `;
        
        let moreLikeThisBtn = document.createElement("button");
        moreLikeThisBtn.setAttribute("data-id", gameElementsList[i]["_id"])
        moreLikeThisBtn.setAttribute("data-value", gameElementsList[i]["name"])
        moreLikeThisBtn.innerHTML = "More like this";
        listEl.appendChild(moreLikeThisBtn);

        moreLikeThisBtn.addEventListener("click", moreLikeThis);
        queryResults.appendChild(listEl);
        queryResults.appendChild(document.createElement("hr"));
        
    }

    document.getElementById("listType").innerHTML = "results";
    document.getElementById("numberResults").innerHTML = gameElementsList.length;
}

function showSuggestions(gamesNamesList) {
    if (gamesNamesList.length == 0) {
        let resultsDiv = document.querySelector("div#resultsDiv");
        if(resultsDiv != null)
            resultsDiv.remove();
    }

    queryResults.innerHTML = "";

    for (let i = 0; i < gamesNamesList.length; ++i) {
        let listEl = document.createElement("li");
        listEl.style = "margin:1em;";
        let suggButton = document.createElement("button");
        suggButton.innerHTML = gamesNamesList[i];
        listEl.appendChild(suggButton);

        suggButton.addEventListener("click", selectNameSuggestion);

        queryResults.appendChild(listEl);
        queryResults.appendChild(document.createElement("hr"));
    }

    document.getElementById("listType").innerHTML = "suggestions";
    document.getElementById("numberResults").innerHTML = gamesNamesList.length;
}

function selectNameSuggestion(event) {
    event.preventDefault();
    let name = this.innerHTML;

    let resultsDiv = document.querySelector("div#resultsDiv");

    if(document.querySelector("#suggestionHeader") != null && resultsDiv != null) {
        resultsDiv.remove();
    }

    document.getElementById("nameSearch").value = name;
    document.getElementById("listType").innerHTML = "results";
    document.getElementById("numberResults").innerHTML = 0;
}

function moreLikeThis(event) {
    event.preventDefault();
    let gameId = this.getAttribute("data-id");
    let gameName = this.getAttribute("data-value");

    let data = {
        "query": {
          "more_like_this": {
            "fields": [ "name", "about_the_game", "genres" ],
            "like": [
              {
                "_index": "games",
                "_id": gameId
              }
            ],
            "min_term_freq": 1,
            "max_query_terms": 10,
            "max_doc_freq": 15000
          }
        }
    }

    sendAjaxRequest("POST", "http://localhost:9200/games/_search", JSON.stringify(data), function() {
        if(this.status != 200)
            return;

        let responseJson = JSON.parse(this.responseText);

        let hits = responseJson["hits"]["hits"];

        if (hits.length > 0)
            createResultsDiv(false, gameName);
        
        parseHitsAndShowResults(hits, true); 
    });
}