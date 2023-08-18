package com.function.spotlightCharts;

import org.json.JSONArray;
import org.json.JSONObject;

public class Utils {
    // ENUMS
    private enum REGION_PARAMS {
        COUNTRY("country"),
        STATE("state"),
        CITY("city");

        private final String value;

        REGION_PARAMS(String value){
            this.value = value;
        }
    }

    public enum TEST_PLAN_NAMES {
        FEATURE_FUNCTIONALITY("LTS"),
        CALLING_RELIABILITY("STS"),
        POLQA("POLQA");

        private final String value;

        TEST_PLAN_NAMES(String value){
            this.value = value;
        }

        public String value() {
            return this.value;
        }
    }

    public enum MEDIA_STATS_METRICS {
        JITTER("Received Jitter"),
        PACKET_LOSS("Received packet loss"),
        ROUND_TRIP_TIME("Round trip time"),
        BITRATE("Sent bitrate"),
        POLQA("POLQA");

        private final String value;

        MEDIA_STATS_METRICS(String value){
            this.value = value;
        }

        public String value() {
            return this.value;
        }
    }

    public enum METRICS_THRESHOLDS {
        JITTER("30"),
        PACKET_LOSS("10"),
        ROUND_TRIP_TIME("500");

        private final String value;

        METRICS_THRESHOLDS(String value){
            this.value = value;
        }

        public String value() {
            return this.value;
        }
    }

    // CONSTANTS
    // Default values
    public static String DEFAULT_TEST_PLAN_NAMES = TEST_PLAN_NAMES.FEATURE_FUNCTIONALITY.value() + "','" + 
        TEST_PLAN_NAMES.CALLING_RELIABILITY.value() + "','" + TEST_PLAN_NAMES.POLQA.value();
    public static String DEFAULT_METRICS = MEDIA_STATS_METRICS.JITTER.value() + "', '" + 
        MEDIA_STATS_METRICS.PACKET_LOSS.value() + "', '" + MEDIA_STATS_METRICS.ROUND_TRIP_TIME.value() + "', '" + 
        MEDIA_STATS_METRICS.BITRATE.value() + "', '" + MEDIA_STATS_METRICS.POLQA.value();
    // Default query clauses 
    public static String CONSIDERED_FAILURES_SUBQUERY = "((sr.status = 'PASSED' AND (sr.failingerrortype IS NULL OR trim(sr.failingerrortype) = '')) OR sr.failingerrortype = 'Routing' OR sr.failingerrortype = 'Media Quality' OR sr.failingerrortype = 'Media Routing')"; 
    public static String CONSIDERED_STATUS_SUBQUERY = "(sr.status = 'PASSED' OR sr.status = 'FAILED')"; 
    
    // Methods
    public static StringBuilder getRegionSQLCondition(String regions){
        JSONArray regionsArray = new JSONArray(regions);
        StringBuilder regionCondition = null;
        if(regionsArray.length()>0){
            regionCondition = new StringBuilder("( ");
            for (int i=0; i<regionsArray.length();i++) {
                JSONObject regionObject = regionsArray.getJSONObject(i);
                REGION_PARAMS[] regionParams = REGION_PARAMS.values();
                regionCondition.append("(");
                for(int j=0; j<regionParams.length;j++){
                    String regionParam = regionParams[j].value;
                    if(regionObject.has(regionParam) && !regionObject.isNull(regionParam)){
                        if(j!=0)
                            regionCondition.append(" AND ");
                        String value = regionObject.getString(regionParam);
                        regionCondition.append(regionParam).append("=CAST('").append(value).append("' AS varchar)");
                    }
                }
                regionCondition.append(")");
                if(i!=regionsArray.length()-1)
                    regionCondition.append(" OR ");
            }
            regionCondition.append(" )");
            if(regionsArray.length()==1)
                regionCondition.deleteCharAt(0).deleteCharAt(regionCondition.length()-1);

        }
        return regionCondition;
    }
}
