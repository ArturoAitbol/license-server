package com.function.clients;

import com.microsoft.azure.functions.ExecutionContext;
import org.json.JSONObject;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class HttpClient {

    /**
     * Creates a get request with default headers
     * @param endpoint request url
     */
    static public JSONObject get(String endpoint) throws Exception {
        return get(endpoint,null);
    }

    /**
     * Creates a get request
     * @param endpoint request url
     * @param headers custom headers
     */
    static public JSONObject get(String endpoint,HashMap<String,String> headers) throws Exception {
        URL url = new URL(endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Accept", "*/*");
        connection.setRequestProperty("Content-Type", "application/json");
        
        if(headers!=null){
            for (String headerKey : headers.keySet()) {
                connection.setRequestProperty(headerKey,headers.get(headerKey));
            }
        }

        InputStream responseStream = connection.getResponseCode() == HttpURLConnection.HTTP_OK ?
                                    connection.getInputStream() :
                                    connection.getErrorStream();

        BufferedReader in = new BufferedReader(new InputStreamReader(responseStream));
        String responseLine;
        StringBuilder response = new StringBuilder();
        while ((responseLine = in.readLine()) != null) {
            response.append(responseLine.trim());
        }
        return new JSONObject(response.toString());
    }
    
    static public JSONObject get(String endpoint, String body, HashMap<String,String> headers) throws Exception {
        URL url = new URL(endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Accept", "*/*");
        connection.setRequestProperty("Content-Type", "application/json");
        if(headers!=null){
            for (String headerKey : headers.keySet()) {
                connection.setRequestProperty(headerKey,headers.get(headerKey));
            }
        }

        byte[] input = body.getBytes(StandardCharsets.UTF_8);
        connection.setRequestProperty("Content-Length", Integer.toString(input.length));
        DataOutputStream wr = new DataOutputStream(connection.getOutputStream());
        wr.write(input);
        
        InputStream responseStream = connection.getResponseCode() == HttpURLConnection.HTTP_OK ?
                                    connection.getInputStream() :
                                    connection.getErrorStream();

        BufferedReader in = new BufferedReader(new InputStreamReader(responseStream));
        String responseLine;
        StringBuilder response = new StringBuilder();
        while ((responseLine = in.readLine()) != null) {
            response.append(responseLine.trim());
        }
        return new JSONObject(response.toString());
    }

    /**
     * Creates a post request
     * @param endpoint request url
     * @param body request body
     * @param headers custom headers
     */
    static public JSONObject post(String endpoint, String body, HashMap<String,String> headers) throws IOException {
        URL urlObject = new URL(endpoint);
        HttpURLConnection con = (HttpURLConnection) urlObject.openConnection();
        con.setDoOutput(true);
        con.setRequestMethod("POST");
        con.setRequestProperty("Accept", "application/json");
        con.setRequestProperty("Content-Type", "application/json");
        byte[] input = body.getBytes(StandardCharsets.UTF_8);
        con.setRequestProperty("Content-Length", Integer.toString(input.length));

        if(headers!=null){
            for (String headerKey : headers.keySet()) {
                con.setRequestProperty(headerKey,headers.get(headerKey));
            }
        }

        DataOutputStream wr = new DataOutputStream(con.getOutputStream());
        wr.write(input);

        InputStream inputStream;
        int responseCode = con.getResponseCode();
        switch (responseCode){
            case HttpURLConnection.HTTP_OK:
            case HttpURLConnection.HTTP_CREATED:
                inputStream = con.getInputStream();
                break;
            default:
                inputStream = con.getErrorStream();
                break;
        }

        String responseLine;
        StringBuilder response = new StringBuilder();
        BufferedReader br = new BufferedReader(new InputStreamReader(inputStream,StandardCharsets.UTF_8));
        while ((responseLine = br.readLine()) != null) {
            response.append(responseLine.trim());
        }
        br.close();
        return new JSONObject(response.toString());
    }

    /**
     * Creates a delete request
     * @param endpoint request url
     * @param headers custom headers
     */
    static public boolean delete(String endpoint, HashMap<String,String> headers) throws IOException {
        URL url = new URL(endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("DELETE");
        connection.setRequestProperty("Accept", "*/*");

        if(headers!=null){
            for (String headerKey : headers.keySet()) {
                connection.setRequestProperty(headerKey,headers.get(headerKey));
            }
        }

        return connection.getResponseCode() == HttpURLConnection.HTTP_NO_CONTENT;
    }

    static public String getDataString(ExecutionContext context, Map<String, String> params){
        StringBuilder result = new StringBuilder();
        try {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                result.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
                result.append("=");
                result.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
                result.append("&");
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            context.getLogger().severe(e.getMessage());
        }
        String resultString = result.toString();
        return resultString.length() > 0
                ? resultString.substring(0, resultString.length() - 1)
                : resultString;
    }
}
