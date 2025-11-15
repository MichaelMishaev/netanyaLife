api key:  
BSA757cXCF44Q-aZh2k34xl8WhwF00f

Brave Web Search API
Introduction
Brave Web Search API is a REST API to query Brave Search and get back search results from the web. The following sections describe how to curate requests, including parameters and headers, to Brave Web Search API and get a JSON response back.

To try the API on a Free plan, you’ll still need to subscribe — you simply won’t be charged. Once subscribed, you can get an API key in the API Keys section.

Endpoints
Brave Search API exposes multiple endpoints for specific types of data, based on the level of your subscription. If you don’t see the endpoint you’re interested in, you may need to change your subscription.

https://api.search.brave.com/res/v1/web/search

Example
A request has to be made to the web search endpoint. An example CURL request is given below.



curl -s --compressed "https://api.search.brave.com/res/v1/web/search?q=brave+search" \
  -H "Accept: application/json" \
  -H "Accept-Encoding: gzip" \
  -H "X-Subscription-Token: <YOUR_API_KEY>"

The response specification for Web Search API can be seen in the WebSearchApiResponse model.

Next Steps
To learn what parameters are available and what responses can be expected while querying Brave Web Search API, please review the following pages:

Query Parameters
Request Headers
Response Headers
Response Objects
Brave Local Search API
Introduction
Brave Local Search API provides enrichments for location search results.

Access to Local API is available through the Pro plans.

Endpoints
Brave Local Search API is currently available at the following endpoints and exposes an API to get extra information about a location, including pictures and related web results.

https://api.search.brave.com/res/v1/local/pois

The endpoint supports batching and retrieval of extra information of up to 20 locations with a single request.

The local API also includes an endpoint to get an AI generated description for a location.

https://api.search.brave.com/res/v1/local/descriptions

Example
An initial request has to be made to web search endpoint with a given query. An example CURL request is given below.



curl -s --compressed "https://api.search.brave.com/res/v1/web/search?q=greek+restaurants+in+san+francisco" \
  -H "Accept: application/json" \
  -H "Accept-Encoding: gzip" \
  -H "X-Subscription-Token: <YOUR_API_KEY>"

If the query returns a list of locations, as in this case, each location result has an id field, which is a temporary ID that can be used to retrieve extra information about the location. An example from the locations result is given below.

{
  "locations": {
    "results": [
      {
        "id": "1520066f3f39496780c5931d9f7b26a6",
        "title": "Pangea Banquet Mediterranean Food"
      },
      {
        "id": "d00b153c719a427ea515f9eacf4853a2",
        "title": "Park Mediterranean Grill"
      },
      {
        "id": "4b943b378725432aa29f019def0f0154",
        "title": "The Halal Mediterranean Co."
      }
    ]
  }
}

The id value can be used to further fetch extra information about the location. An example request is given below.



curl -s --compressed "https://api.search.brave.com/res/v1/local/pois?ids=1520066f3f39496780c5931d9f7b26a6&ids=d00b153c719a427ea515f9eacf4853a2" \
  -H "accept: application/json" \
  -H "Accept-Encoding: gzip" \
  -H "x-subscription-token: <YOUR_API_KEY>"

An AI generated description associated with a location can be further fetched using the example below.



curl -s --compressed "https://api.search.brave.com/res/v1/local/descriptions?ids=1520066f3f39496780c5931d9f7b26a6&ids=d00b153c719a427ea515f9eacf4853a2" \
  -H "accept: application/json" \
  -H "Accept-Encoding: gzip" \
  -H "x-subscription-token: <YOUR_API_KEY>"

The response specification for Local Search API can be seen in the LocalPoiSearchApiResponse and LocalDescriptionsSearchApiResponse models.

Next Steps
To learn what parameters are available and what responses can be expected while querying Brave Web Search API, please review the following pages:

Query Parameters
Request Headers
Response Headers
Response Objects
Brave Rich Search API
Introduction
Brave Rich Search API is a REST API to query Brave Search and get back rich search results. The following sections describe how to curate requests, including parameters and headers, to Brave Rich Search API and get a JSON response back.

Rich Search API responses provide accurate up to date information about the intent of the query. This data is sourced from 3rd party API providers and includes verticals such as sports, stocks and weather.

Access to Rich Search API is available through the Pro plans.

Example
A request has to be made to the web search endpoint first with an extra query parameter enable_rich_callback=1. An example CURL request for the query weather in munich is given below.


curl -s --compressed "https://api.search.brave.com/res/v1/web/search?q=weather+in+munich&enable_rich_callback=1" \
  -H "Accept: application/json" \
  -H "Accept-Encoding: gzip" \
  -H "X-Subscription-Token: <YOUR_API_KEY>"

The response specification for Web Search API can be seen in the WebSearchApiResponse model.

The Web Search API response contains a rich field if the query is expected to return rich results. An example of the rich field is given below.

{
  "rich": {
    "type": "rich",
    "hint": {
      "vertical": "weather",
      "callback_key": "86d06abffc884e9ea281a40f62e0a5a6"
    }
  }
}

The response contains a callback_key field which can be used to fetch the rich results. An example CURL request to fetch the rich results is given below.


curl -s --compressed "https://api.search.brave.com/res/v1/web/rich?callback_key=86d06abffc884e9ea281a40f62e0a5a6" \
  -H "Accept: application/json" \
  -H "Accept-Encoding: gzip" \
  -H "X-Subscription-Token: <YOUR_API_KEY>"

The response specification for Rich Search API can be seen in the RichSearchApiResponse model.

Brave Rich Search API
Introduction
Brave Rich Search API is a REST API to query Brave Search and get back rich search results. The following sections describe how to curate requests, including parameters and headers, to Brave Rich Search API and get a JSON response back.

Rich Search API responses provide accurate up to date information about the intent of the query. This data is sourced from 3rd party API providers and includes verticals such as sports, stocks and weather.

To try the API, you’ll still need to subscribe. Once subscribed, you can get an API key in the API Keys section.

Supported verticals
Brave Rich Search API supports the following verticals. See responses documentation what each result looks like.

Vertical	Provider	Website
Calculator	Brave	-
Cryptocurrency	CoinGecko	Website
Currency	Fixer	Website
Definitions	Wordnik	Website
Package tracker	Brave	-
Stocks	FMP	Website
Unit converter	Brave	-
Unit timestamp	Brave	-
Weather	OpenWeatherMap	Website
Football	API-Sports	Website
Ice-hockey	API-Sports	Website
Baseball	API-Sports	Website
Basketball	API-Sports	Website
Cricket	Stats Perform	Website
American football	Stats Perform	Website
Notice: Some of these providers will require attribution for showing this data.

Endpoints
Brave Rich Search API exposes multiple endpoints for specific types of data, based on the level of your subscription. You will need a Pro level subscription to access this data.

https://api.search.brave.com/res/v1/web/search
https://api.search.brave.com/res/v1/web/rich

To enable the rich answer intent detection you need to call the web search endpoint with enable_rich_callback=1 parameter.

If the intent for rich answer was detected, the web response will contain rich field with callback_key that can be used to retrieve the data from the /res/v1/web/rich endpoint.

Example
A request has to be made to the web search endpoint first with an extra query parameter enable_rich_callback=1. An example CURL request for the query weather in munich is given below.


curl -s --compressed "https://api.search.brave.com/res/v1/web/search?q=weather+in+munich&enable_rich_callback=1" \
  -H "Accept: application/json" \
  -H "Accept-Encoding: gzip" \
  -H "X-Subscription-Token: <YOUR_API_KEY>"

The response specification for Web Search API can be seen in the WebSearchApiResponse model.

The Web Search API response contains a rich field if the query is expected to return rich results. An example of the rich field is given below.

{
  "rich": {
    "type": "rich",
    "hint": {
      "vertical": "weather",
      "callback_key": "86d06abffc884e9ea281a40f62e0a5a6"
    }
  }
}

The response contains a callback_key field which can be used to fetch the rich results. An example CURL request to fetch the rich results is given below.


curl -s --compressed "https://api.search.brave.com/res/v1/web/rich?callback_key=86d06abffc884e9ea281a40f62e0a5a6" \
  -H "Accept: application/json" \
  -H "Accept-Encoding: gzip" \
  -H "X-Subscription-Token: <YOUR_API_KEY>"

The response specification for Rich Search API can be seen in the RichSearchApiResponse model.