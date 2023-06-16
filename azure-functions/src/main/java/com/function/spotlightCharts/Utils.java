package com.function.spotlightCharts;

import org.json.JSONArray;
import org.json.JSONObject;

public class Utils {
    public static String DEFAULT_TEST_PLAN_NAMES = "LTS','STS','POLQA"; // Feature Functionality, Calling Reliability and Voice Quality (POLQA)
    public static String CONSIDERED_FAILURES_SUBQUERY = "(sr.failingerrortype IS NULL OR trim(sr.failingerrortype) = '' OR sr.failingerrortype = 'Routing' OR sr.failingerrortype = 'Teams Client' OR sr.failingerrortype = 'Media Quality' OR sr.failingerrortype = 'Media Routing')"; 
    public static String CONSIDERED_STATUS_SUBQUERY = "(sr.status = 'PASSED' OR sr.status = 'FAILED')"; 
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

    private enum REGION_PARAMS {
        COUNTRY("country"),
        STATE("state"),
        CITY("city");

        private final String value;

        REGION_PARAMS(String value){
            this.value = value;
        }
    }

    public enum MetricsThresholds {
        received_jitter("30"),
        round_trip_time("500"),
        packet_loss("10");

        private final String value;

        MetricsThresholds(String value){
            this.value = value;
        }

        public String value() {
            return this.value;
        }
    }
}
