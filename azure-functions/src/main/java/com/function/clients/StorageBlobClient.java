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

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.time.OffsetDateTime;
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
            String str = (type.contains("Daily")) ? "-" : "";
            final String filterImageString = timestamp.isEmpty()
                    ? String.format("%s/%s-%s-Image" + str, customerName, subaccountName, type)
                    : String.format("%s/%s-%s-Image %s.jpg", customerName, subaccountName, type, timestamp);
            Iterator<BlobItem> iterator = blobContainerClient.listBlobs().iterator();
            List<BlobItem> blobItemList = StreamSupport
                    .stream(Spliterators.spliteratorUnknownSize(iterator, Spliterator.ORDERED), false)
                    .filter(x -> x.getName().contains(filterImageString))
                    .collect(Collectors.toList());
            int BLOB_LIST_SIZE = blobItemList.size();
            int MAX_VALUE = Math.max(BLOB_LIST_SIZE - 1, 0);
            context.getLogger()
                    .info("Type: " + type + " | Max value: " + MAX_VALUE + " | Blob List size: " + BLOB_LIST_SIZE);
            // sort the list by ascending order with file name
            Collections.sort(blobItemList,
                    (blobItem1, blobItem2) -> blobItem1.getName().compareTo(blobItem2.getName()));
            blobItemList = blobItemList.subList(MAX_VALUE, BLOB_LIST_SIZE);
            Map<String, String> blobMap = new HashMap<>();
            if (!timestamp.isEmpty())
                blobMap.put("timestampId", timestamp);

            for (BlobItem blobItem : blobItemList) {

                String blobItemName = blobItem.getName();
                context.getLogger().info("File name: " + blobItemName);
                if (timestamp.isEmpty()) {
                    //e.g: Daily file name {customer_name}/{subaccount_name}-{report_type}-Image-{start_date}-{end_date}.jpg
                    //e.g: Weekly file name {customer_name}/{subaccount_name}-{report_type}-Image {timestamp}.jpg
                    // split the string
                    String[] splittedStr = blobItemName.replace(".jpg", "").split("-");
                    String start_date = null;
                    String end_date = null;
                    if (splittedStr.length == 6) {
                        start_date = splittedStr[4];
                        end_date = splittedStr[5];
                        if (start_date != null && end_date != null) {
                            blobMap.put("startDate", start_date);
                            blobMap.put("endDate", end_date);
                        }
                    } else {
                        SimpleDateFormat sDateFormat = new SimpleDateFormat("yyMMddHHmmss");
                        Date date = new Date();
                        start_date = sDateFormat.format(date);
                        end_date = sDateFormat.format(date);
                    }
                    context.getLogger().info("Start date " + start_date + " | End date " + end_date);
                    String timestampID = getTimestampFromBlobName(blobItemName);
                    if (timestampID != null) {
                        blobMap.put("timestampId", timestampID);
//                        continue;
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
     * Get the blob from Azure Storage Blob if exist and return JSONObject
     *
     * @param context:        ExecutionContext
     * @param customerName:   String
     * @param subAccountName: String
     * @param type:           String
     * @return: JSONObject
     */
    public JSONObject fetchJsonFileFromBlob(ExecutionContext context, final String customerName,
                                            final String subAccountName, final String type) {
        try {
            // Check if container exist or not
            if (!blobContainerClient.exists()) {
                context.getLogger().info("Container doesn't exist");
            }
            // eg: Customer01/Customer01-Daily-CallingReliability-Detailed-Report
            final String filterFileString = String.format("%s/%s-%s-Detailed-Report", customerName, subAccountName,
                    type);
            context.getLogger().info("Search for File name " + filterFileString);
            Iterator<BlobItem> iterator = blobContainerClient.listBlobs().iterator();
            List<BlobItem> blobItemList = StreamSupport
                    .stream(Spliterators.spliteratorUnknownSize(iterator, Spliterator.ORDERED), false)
                    .filter(x -> x.getName().contains(filterFileString))
                    .collect(Collectors.toList());
            for (BlobItem blobItem : blobItemList) {
                context.getLogger().info("blobItem " + blobItem.getName());
                String blobItemName = blobItem.getName();
                BlobClient blobClient = blobContainerClient.getBlobClient(blobItemName);
                if (blobClient.exists()) {
                    context.getLogger().info("Blob exists: " + blobItem.getName());
                    // creating an object of output stream to receive the file's content from azure
                    // blob.
                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    blobClient.download(outputStream);
                    // converting it to the inputStream to return
                    final byte[] bytes = outputStream.toByteArray();
                    if ((bytes != null) && (bytes.length > 0)) {
                        String str = new String(bytes);
                        JSONObject jsonObj = new JSONObject(str);
                        return jsonObj;
                    }
                }
            }
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
        }
        return null;
    }
}
