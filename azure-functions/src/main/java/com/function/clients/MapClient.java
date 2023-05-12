package com.function.clients;

import com.function.exceptions.ADException;
import com.microsoft.azure.functions.ExecutionContext;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.util.HashMap;

public class MapClient {
    private static final String findAddressCandidatesURL = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";
    private static final String apikey = System.getenv("GEO_CODE_API_KEY");

    static public JSONObject getMapCoordinates( String city, String region,String country, ExecutionContext context) throws Exception {
        try {
            String url = findAddressCandidatesURL + String.format("?city=%s&region=%s&countryCode=%s&maxLocations=1&f=json&token=%s", city, region, country, apikey);
            url = url.replace(" ", "%20");
            context.getLogger().info("geocode endpoint: " + url);
            HashMap<String, String> headers = new HashMap<>();
            JSONObject response = HttpClient.get(url, headers);
            if (response.has("error")) {
                throw new Exception(response.get("error").toString());
            }
            context.getLogger().fine("Received info from the geoCode API");
            if (!response.getJSONArray("candidates").isEmpty()) {
                return response.getJSONArray("candidates").getJSONObject(0).getJSONObject("location");
            }
            else return null;
        } catch (Exception e) {
            throw new Exception("An error ocurred while consuming the geocode API - " + e.getMessage());
        }
    }

}
