package com.function.clients;


import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import com.microsoft.azure.functions.ExecutionContext;

import java.time.OffsetDateTime;

public class StorageBlobClient {
    static String CONNECTION_STRING = System.getenv("STORAGE_BLOB_CONNECTION_STRING");
    static String CONTAINER_NAME = System.getenv("STORAGE_CONTAINER_NAME");

    /**
     * generate Shared access signature(SAS) token which grants Read only access to containers and blob in the Storage account
     *
     * @return String | null
     */
    public static String generateSASToken(ExecutionContext context) {
        try {
            if (CONNECTION_STRING == null || CONNECTION_STRING.isEmpty()) {
                context.getLogger().severe("Storage blob Connection String cannot be empty");
                return null;
            }
            BlobServiceClient client = new BlobServiceClientBuilder().connectionString(CONNECTION_STRING).buildClient();
            if (CONTAINER_NAME == null || CONTAINER_NAME.isEmpty()) {
                context.getLogger().severe("Storage blob Container name cannot be empty");
                return null;
            }
            // check if container exist in Storage blob or not
            boolean isContainerExist = client.listBlobContainers().stream().filter(x -> CONTAINER_NAME.equalsIgnoreCase(x.getName())).count() == 1;
            // return null if container don't exist in Storage blob
            if (!isContainerExist) {
                context.getLogger().severe(CONTAINER_NAME + " container don't exist in Storage blob");
                return null;
            }
            context.getLogger().info(CONTAINER_NAME + " container exist in Storage blob");
            BlobContainerClient blobContainerClient = client.getBlobContainerClient(CONTAINER_NAME);
            BlobSasPermission blobSasPermission = new BlobSasPermission().setReadPermission(true);
            OffsetDateTime expiryTime = OffsetDateTime.now().plusHours(1);
            BlobServiceSasSignatureValues values = new BlobServiceSasSignatureValues(expiryTime, blobSasPermission)
                    .setStartTime(OffsetDateTime.now());
            final String SAS_TOKEN = blobContainerClient.generateSas(values);
            context.getLogger().info("Generated SAS Token");
            return SAS_TOKEN;
        } catch (Exception e) {
            context.getLogger().severe("Caught exception: " + e.getMessage());
        }
        return null;
    }
}
