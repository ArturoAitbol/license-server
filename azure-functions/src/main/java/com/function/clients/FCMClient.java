package com.function.clients;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;

public class FCMClient {

    /**
     * Send a push notification to one or multiple devices
     *
     * @param title: String
     * @param body: String
     * @param deviceTokens: JSONArray
     * @return: JSONObject
     */
    public static JSONObject sendPushNotification(String title,String body, JSONArray deviceTokens) throws IOException {
        String NOTIFICATIONS_ENDPOINT = System.getenv("NOTIFICATIONS_ENDPOINT");
        String NOTIFICATIONS_AUTH_KEY = System.getenv("NOTIFICATIONS_AUTH_KEY");

        JSONObject requestBody = new JSONObject();
        requestBody.put("registration_ids", deviceTokens);

        JSONObject notification = new JSONObject();
        notification.put("title",title);
        notification.put("body",body);
        notification.put("sound","default");
        notification.put("color","#D83539");
        notification.put("android_channel_id","notes-notifications");
        requestBody.put("notification", notification);

        String bodyString = requestBody.toString();

        HashMap<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Authorization", NOTIFICATIONS_AUTH_KEY);

        return HttpClient.post(NOTIFICATIONS_ENDPOINT, bodyString, headers);
    }
}
