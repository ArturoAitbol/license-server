package com.function.clients;


import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobItem;
import com.microsoft.azure.functions.ExecutionContext;

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
         *  Authenticate with client secret.
         */
        //    should add final key word before the System variables before commit
        String DASHBOARD_APP_CLIENT_ID = System.getenv("DASHBOARD_APP_CLIENT_ID");
        String DASHBOARD_APP_SECRET_ID = System.getenv("DASHBOARD_APP_SECRET_ID");
        String TENANT_ID = System.getenv("TENANT_ID");
        final ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder()
                .clientId(DASHBOARD_APP_CLIENT_ID)
                .clientSecret(DASHBOARD_APP_SECRET_ID)
                .tenantId(TENANT_ID)
                .build();

        String STORAGE_ACCOUNT_NAME = System.getenv("STORAGE_ACCOUNT_NAME");
        String ENDPOINT_URL = String.format("https://%s.blob.core.windows.net", STORAGE_ACCOUNT_NAME);
        final BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                .endpoint(ENDPOINT_URL)
                .credential(clientSecretCredential)
                .buildClient();

        // Get the container
        String CONTAINER_NAME = System.getenv("STORAGE_CONTAINER_NAME");
        blobContainerClient = blobServiceClient.getBlobContainerClient(CONTAINER_NAME);
    }

    /**
     * Get the blob from Azure Storage Blob if exist and return Base64 String
     *
     * @param context:        ExecutionContext
     * @param customerName:   String
     * @param subaccountName: String
     * @param type:           String
     * @return Map<String,String>
     */
    public Map<String,String> getBlobAsBase64(ExecutionContext context, final String customerName, final String subaccountName, final String type) {
        return getBlobAsBase64(context,customerName,subaccountName,type,"");
    }


    /**
     * Get the blob from Azure Storage Blob if exist and return Base64 String
     *
     * @param context:        ExecutionContext
     * @param customerName:   String
     * @param subaccountName: String
     * @param type:           String
     * @param timestamp:      String
     * @return Map<String,String>
     */
    public Map<String,String> getBlobAsBase64(ExecutionContext context, final String customerName, final String subaccountName, final String type, final String timestamp) {
        try {
            // Check if container exist or not
            if (!blobContainerClient.exists()) {
                context.getLogger().info("Container doesn't exist");
                return null;
            }
            // Form the filter string to fetch only that particular customer-subaccount images from blob
            final String filterImageString = timestamp.isEmpty() ? String.format("%s/%s-%s-Image", customerName, subaccountName, type) :
                                                            String.format("%s/%s-%s-Image %s.jpg", customerName, subaccountName, type, timestamp);
            Iterator<BlobItem> iterator = blobContainerClient.listBlobs().iterator();
            List<BlobItem> blobItemList = StreamSupport
                    .stream(Spliterators.spliteratorUnknownSize(iterator, Spliterator.ORDERED), false)
                    .filter(x -> x.getName().contains(filterImageString))
                    .collect(Collectors.toList());

            int blobItemListSize = blobItemList.size();
            blobItemList = blobItemList.subList(Math.max(blobItemListSize-2,0),blobItemListSize);

            Map<String,String> base64Image = new HashMap<>();
            if(!timestamp.isEmpty())
                base64Image.put("timestampId",timestamp);

            for (BlobItem blobItem : blobItemList) {

                String blobItemName = blobItem.getName();

                if(timestamp.isEmpty()){
                    String timestampID = getTimestampFromBlobName(blobItemName);
                    if(timestampID!=null){
                        base64Image.put("timestampId",timestampID);
                        continue;
                    }
                }

                BlobClient blobClient = blobContainerClient.getBlobClient(blobItemName);
                OffsetDateTime lastModifiedDate = blobItem.getProperties().getLastModified();
                base64Image.put("lastModifiedDate",getLastModifiedBlobDateStr(lastModifiedDate));
                if (blobClient != null) {
                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    blobClient.download(outputStream);
                    byte[] bytes = outputStream.toByteArray();
                    // Encode byte array to Base64 String
                    String ENCODING_TYPE = "data:image/jpg;base64,";
                    base64Image.put("base64String", ENCODING_TYPE + Base64.getEncoder().encodeToString(bytes));
                    return base64Image;
                }
            }
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
        }
        return null;
    }

    public String getTimestampFromBlobName(String blobName){
        Pattern pattern = Pattern.compile("\\d{12}");
        Matcher matcher = pattern.matcher(blobName);
        if(matcher.find())
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
}