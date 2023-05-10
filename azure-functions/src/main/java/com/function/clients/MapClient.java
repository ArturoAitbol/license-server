package com.function.clients;

import com.function.exceptions.ADException;
import com.function.util.Constants;
import com.microsoft.azure.functions.ExecutionContext;
import org.json.JSONObject;

import java.util.HashMap;

public class MapClient {
    private static final String geoCoderURL = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?";
    private static final String apikey = "AAPK9a825082c90049619a88880a1ef411c8VPBfmElvpxTEHaVZljmH4iSxttFkqZKNa361AOU5WwoVIxf0d2oZQ6e9-_GwiISt";

    static public JSONObject getMapCoordinates( String city, String region, ExecutionContext context) throws Exception {
        final String url = String.format("%scity=%s&region=%s&maxLocations=1&f=json&token=%s",geoCoderURL , city, region, apikey);
        context.getLogger().info("TAP detailed report endpoint: " + url);
        HashMap<String, String> headers = new HashMap<>();
        // disable SSL host verification
        // TAPClient.disableSslVerification(context);
        JSONObject response = HttpClient.get(url, headers);
        if (response != null && (response.has("error"))) {
            context.getLogger()
                    .severe("Error while retrieving detailed test report from Automation Platform: " + response);
            throw new ADException("Error retrieving " + region + " detailed report from Automation Platform");
        }
        context.getLogger().info("Received detailed test report response from Automation Platform");
        return response;
    }
}