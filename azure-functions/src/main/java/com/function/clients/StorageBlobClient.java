package com.function.clients;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobItem;
import com.microsoft.azure.functions.ExecutionContext;
import org.json.JSONObject;
import org.json.JSONArray;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class StorageBlobClient {

    private final BlobContainerClient blobContainerClient;

    private static final StorageBlobClient instance = new StorageBlobClient();

    public static StorageBlobClient getInstance() {
        return instance;
    }

    private StorageBlobClient() {
        /**
         * Authenticate with client secret.
         */
        final String DASHBOARD_APP_CLIENT_ID = System.getenv("DASHBOARD_APP_CLIENT_ID");
        final String DASHBOARD_APP_SECRET_ID = System.getenv("DASHBOARD_APP_SECRET_ID");
        final String TENANT_ID = System.getenv("TENANT_ID");
        final ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder()
                .clientId(DASHBOARD_APP_CLIENT_ID)
                .clientSecret(DASHBOARD_APP_SECRET_ID)
                .tenantId(TENANT_ID)
                .build();

        final String STORAGE_ACCOUNT_NAME = System.getenv("STORAGE_ACCOUNT_NAME");
        String ENDPOINT_URL = String.format("https://%s.blob.core.windows.net", STORAGE_ACCOUNT_NAME);
        final BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint(ENDPOINT_URL)
                .credential(clientSecretCredential)
                .buildClient();

        // Get the container
        final String CONTAINER_NAME = System.getenv("STORAGE_CONTAINER_NAME");
        blobContainerClient = blobServiceClient.getBlobContainerClient(CONTAINER_NAME);
    }

    /**
     * Get the blob from Azure Storage Blob if exist and return Base64 String
     *
     * @param context:        ExecutionContext
     * @param customerName:   String
     * @param subaccountName: String
     * @param type:           String
     * @return Map<String, String>
     */
    public Map<String, String> getBlobAsBase64(ExecutionContext context, final String customerName,
                                               final String subaccountName, final String type) {
        return getBlobAsBase64(context, customerName, subaccountName, type, "");
    }

    /**
     * Get the blob from Azure Storage Blob if exist and return Base64 String
     *
     * @param context:        ExecutionContext
     * @param customerName:   String
     * @param subaccountName: String
     * @param type:           String
     * @param timestamp:      String
     * @return Map<String, String>
     */
    public Map<String, String> getBlobAsBase64(ExecutionContext context, final String customerName,
                                               final String subaccountName, final String type, final String timestamp) {
        try {
            // Check if container exist or not
            if (!blobContainerClient.exists()) {
                context.getLogger().info("Container doesn't exist");
                return null;
            }
            // Form the filter string to fetch only that particular customer-subaccount
            // images from blob
            String filterImageString = timestamp.isEmpty()
                        ? String.format("%s/%s-%s-Image-", customerName, subaccountName, type)
                        : String.format("%s/%s-%s-Image-%s", customerName, subaccountName, type, timestamp);
            Iterator<BlobItem> iterator = blobContainerClient.listBlobs().iterator();
            List<BlobItem> blobItemList = StreamSupport
                    .stream(Spliterators.spliteratorUnknownSize(iterator, Spliterator.ORDERED), false)
                    .filter(x -> x.getName().contains(filterImageString))
                    .collect(Collectors.toList());
            int BLOB_LIST_SIZE = blobItemList.size();
            int MAX_VALUE = Math.max(BLOB_LIST_SIZE - 1, 0);
            context.getLogger().info("Type: " + type + " | Max value: " + MAX_VALUE + " | Blob List size: " + BLOB_LIST_SIZE);
            context.getLogger().info("Filtered files path: " + filterImageString);
            // sort the list by ascending order with file name
            Collections.sort(blobItemList,
                    (blobItem1, blobItem2) -> blobItem1.getName().compareTo(blobItem2.getName()));
                    
            BlobItem blobItem = blobItemList.subList(MAX_VALUE, BLOB_LIST_SIZE).get(0);

            Map<String, String> blobMap = new HashMap<>();

            String blobItemName = blobItem.getName();
            context.getLogger().info("File name: " + blobItemName);
            // e.g: Daily file name {customer_name}/{subaccount_name}-{report_type}-Image-{start_date}-{end_date}.jpg
            // e.g: Weekly file name  {customer_name}/{subaccount_name}-{report_type}-Image-{timestamp}.jpg
            // set start date and end date from the blob file name
            this.getStartDateAndEndDateFromBlobItem(context, blobMap, blobItemName);

            if (!timestamp.isEmpty())
                blobMap.put("timestampId", timestamp);
            else{
                String timestampID = getTimestampFromBlobName(blobItemName);
                if (timestampID != null) {
                    blobMap.put("timestampId", timestampID);
                }
            }

            BlobClient blobClient = blobContainerClient.getBlobClient(blobItemName);
            OffsetDateTime lastModifiedDate = blobItem.getProperties().getLastModified();
            blobMap.put("lastModifiedDate", getLastModifiedBlobDateStr(lastModifiedDate));
            if (blobClient != null) {
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                blobClient.download(outputStream);
                byte[] bytes = outputStream.toByteArray();
                // Encode byte array to Base64 String
                String ENCODING_TYPE = "data:image/jpg;base64,";
                blobMap.put("base64String", ENCODING_TYPE + Base64.getEncoder().encodeToString(bytes));
                return blobMap;
            }
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public String getTimestampFromBlobName(String blobName) {
        Pattern pattern = Pattern.compile("\\d{12}");
        Matcher matcher = pattern.matcher(blobName);
        if (matcher.find())
            return matcher.group();
        return null;
    }

    public String getLastModifiedBlobDateStr(OffsetDateTime lastModifiedDate) {
        if (lastModifiedDate != null) {
            String pattern = "E, dd MMM yyyy HH:mm:ss z";
            SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);
            Date d = Date.from(lastModifiedDate.toInstant());
            return simpleDateFormat.format(d);
        }
        return null;
    }

    /**
     * get start date and end date from blob item name
     *
     * @param context:      ExecutionContext
     * @param blobMap:      Map<String, String>
     * @param blobItemName: String
     */
    public void getStartDateAndEndDateFromBlobItem(
            ExecutionContext context,
            Map<String, String> blobMap,
            String blobItemName) {
        String[] splittedStr = blobItemName.replace(".jpg", "").split("Image");
        String date_time_str = splittedStr.length == 2 ? splittedStr[1] : "";
        String start_date = null;
        String end_date = null;
        // if string is empty then set start date and end date
        if (date_time_str.isEmpty()) {
            SimpleDateFormat sDateFormat = new SimpleDateFormat("yyMMddHHmmss");
            Date date = new Date();
            start_date = sDateFormat.format(date);
            end_date = sDateFormat.format(date);
        } else {
            String[] splitted_by_minus = date_time_str.split("-");
            if (splitted_by_minus.length > 1) {
                start_date = splitted_by_minus[splitted_by_minus.length - 2];
                end_date = splitted_by_minus[splitted_by_minus.length - 1];
            } else if (splitted_by_minus.length == 1) {
                start_date = splitted_by_minus[splitted_by_minus.length - 1];
                end_date = splitted_by_minus[splitted_by_minus.length - 1];
            } else {
                SimpleDateFormat sDateFormat = new SimpleDateFormat("yyMMddHHmmss");
                Date date = new Date();
                start_date = sDateFormat.format(date);
                end_date = sDateFormat.format(date);
            }
        }
        context.getLogger().info("Start date " + start_date + " | End date " + end_date);
        if (start_date != null && end_date != null) {
            blobMap.put("startDate", start_date);
            blobMap.put("endDate", end_date);
        }
    }

    /**
     * Get the blob list for a customer from Azure Storage Blob return JSONArray
     * 
     * @param context:        ExecutionContext
     * @param customerName:   String
     * @param subAccountName: String
     * @param frequency:      String
     * @param type:           String
     * @param timestamp:      String
     * @return: JSONArray
     */
    public JSONArray fetchReportsPerCustomer(ExecutionContext context, final String customerName,
            final String subAccountName, final String frequency, final String type, final String timestamp)
            throws Exception {
        JSONArray reports = new JSONArray();
        try {
            // Check if container exist or not
            if (!blobContainerClient.exists()) {
                context.getLogger().info("Container doesn't exist");
            }

            // Form the filter string to fetch only customer-subaccount reports
            String filterFileString = String.format("%s/%s-%s-", customerName, subAccountName, frequency);

            if (!type.isEmpty())
                filterFileString += String.format("%s-Image-", type);

            final String filter = filterFileString;
            context.getLogger().info("Search for Files like " + filterFileString);
            Iterator<BlobItem> iterator = blobContainerClient.listBlobs().iterator();
            List<BlobItem> blobItemList = StreamSupport
                    .stream(Spliterators.spliteratorUnknownSize(iterator, Spliterator.ORDERED), false)
                    .filter(x -> x.getName().contains(filter))
                    .collect(Collectors.toList());

            for (BlobItem blobItem : blobItemList) {
                String blobItemName = blobItem.getName();
                if (blobItemName.contains("-Image-")) {
                    String reportType = blobItemName.substring(
                            blobItemName.indexOf(subAccountName + "-") + subAccountName.length() + 1,
                            blobItemName.indexOf("-Image"));
                    String[] range = blobItemName
                            .substring(blobItemName.indexOf("Image-") + 6, blobItemName.indexOf(".jpg")).split("-");
                    String startTimestamp = range[0];
                    String endTimestamp = range[1];

                    JSONObject jsonObj = new JSONObject();
                    jsonObj.put("reportType", reportType);
                    jsonObj.put("startTime", startTimestamp);
                    jsonObj.put("endTime", endTimestamp);

                    boolean insert = false;
                    // Check filters
                    if (type.isEmpty() && timestamp.isEmpty())
                        insert = true;
                    else if (!type.isEmpty() && (frequency + "-" + type).equals(reportType) && timestamp.isEmpty())

                        insert = true;
                    else if (!timestamp.isEmpty()
                            && isTimestampInRange(timestamp, startTimestamp, endTimestamp, context)
                            && type.isEmpty())
                        insert = true;
                    else if (!timestamp.isEmpty()
                            && isTimestampInRange(timestamp, startTimestamp, endTimestamp, context)
                            && !type.isEmpty() && (frequency + "-" + type).equals(reportType))

                        insert = true;

                    if (insert)
                        reports.put(jsonObj);
                }
            }
            return reports;

        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
        }
        return null;
    }

    /**
     * Verify if a timestamp is between two timestamps
     *
     * @param timestamp: String
     * @param start:     String
     * @param end:       String
     * @return: boolean
     */
    public boolean isTimestampInRange(String timestamp, String start, String end, ExecutionContext context)
            throws Exception {
        TemporalAccessor ta = DateTimeFormatter.ISO_INSTANT.parse(timestamp);
        Instant i = Instant.from(ta);
        Date filterDate = Date.from(i);
        Date startDate = new SimpleDateFormat("yyMMddHHmmss").parse(start);
        Date endDate = new SimpleDateFormat("yyMMddHHmmss").parse(end);
        return startDate.compareTo(filterDate) * filterDate.compareTo(endDate) >= 0;
    }
}
