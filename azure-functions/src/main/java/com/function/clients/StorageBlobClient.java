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
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class StorageBlobClient {
    //    should add final key word before the System variables before commit
    final private static String DASHBOARD_APP_CLIENT_ID = System.getenv("DASHBOARD_APP_CLIENT_ID");
    final private static String DASHBOARD_APP_SECRET_ID = System.getenv("DASHBOARD_APP_SECRET_ID");
    final private static String TENANT_ID = System.getenv("TENANT_ID");
    final private static String STORAGE_ACCOUNT_NAME = System.getenv("STORAGE_ACCOUNT_NAME");
    final private static String CONTAINER_NAME = System.getenv("STORAGE_CONTAINER_NAME");
    final private static String ENCODING_TYPE = "data:image/jpg;base64,";

    private static OffsetDateTime lastModifiedDate;

    /**
     * Get the blob from Azure Storage Blob if exist and return Base64 String
     *
     * @param context:        ExecutionContext
     * @param customerName:   String
     * @param subaccountName: String
     * @param type:           String
     * @return String
     */
    public static String getBlobAsBase64(ExecutionContext context, final String customerName, final String subaccountName, final String type) {
        try {
            /**
             *  Authenticate with client secret.
             */
            ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder()
                    .clientId(DASHBOARD_APP_CLIENT_ID)
                    .clientSecret(DASHBOARD_APP_SECRET_ID)
                    .tenantId(TENANT_ID)
                    .build();
            final String ENDPOINT_URL = String.format("https://%s.blob.core.windows.net", STORAGE_ACCOUNT_NAME);
            BlobServiceClient blobServiceClient = new BlobServiceClientBuilder()
                    .endpoint(ENDPOINT_URL)
                    .credential(clientSecretCredential)
                    .buildClient();
            // Get the container
            BlobContainerClient blobContainerClient = blobServiceClient.getBlobContainerClient(CONTAINER_NAME);
            // Check if container exist or not
            if (!blobContainerClient.exists()) {
                context.getLogger().info("Container doesn't exist");
                return null;
            }
            // Form the filter string to fetch only that particular customer-subaccount images from blob
            final String filterImageString = String.format("%s/%s-%s-Image.jpg", customerName, subaccountName, type);
            Iterator<BlobItem> iterator = blobContainerClient.listBlobs().iterator();
            List<BlobItem> blobItemList = StreamSupport
                    .stream(Spliterators.spliteratorUnknownSize(iterator, Spliterator.ORDERED), false)
                    .filter(x -> x.getName().contains(filterImageString))
                    .collect(Collectors.toList());
            for (BlobItem blobItem : blobItemList) {
                BlobClient blobClient = blobContainerClient.getBlobClient(blobItem.getName());
                lastModifiedDate = blobItem.getProperties().getLastModified();
                if (blobClient != null) {
                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    blobClient.download(outputStream);
                    byte[] bytes = outputStream.toByteArray();
                    // Encode byte array to Base64 String
                    String base64Image = ENCODING_TYPE + Base64.getEncoder().encodeToString(bytes);
                    return base64Image;
                }
            }
        } catch (Exception e) {
            context.getLogger().info("Caught exception: " + e.getMessage());
        }
        return null;
    }

    public static String getLastModifiedBlobDate() {
        if (lastModifiedDate != null) {
            String pattern = "E, dd MMM yyyy HH:mm:ss z";
            SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);
            Date d = Date.from(lastModifiedDate.toInstant());
            String parsedDate = simpleDateFormat.format(d);
            return parsedDate;
        }
        return null;
    }
}
