package com.function.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.zip.DeflaterOutputStream;
import java.util.zip.InflaterOutputStream;

public class Base64ImageHandler {

    public static final String ENCODING_TYPE = "data:image/jpg;base64,";

    public static byte[] convertToBytes(String base64Image) throws Exception {
        // Decode the Base64 String representation of the image into bytes and compress them.
        byte[] bytes = Base64.getDecoder().decode(base64Image.substring(base64Image.indexOf(",")+1));
        return compress(bytes);
    }

    public static String convertToBase64String(byte[] bytesImage) throws IOException {
        // Decompress the bytes representation of the image and encode them to a Base64 String
        byte[] decompressedBytes = decompress(bytesImage);
        return ENCODING_TYPE + Base64.getEncoder().encodeToString(decompressedBytes);
    }
    public static byte[] compress(byte[] data) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        DeflaterOutputStream deflater = new DeflaterOutputStream(out);
        deflater.write(data);
        deflater.finish();
        return out.toByteArray();
    }

    public static byte[] decompress(byte[] compressedData) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        InflaterOutputStream inflater = new InflaterOutputStream(out);
        inflater.write(compressedData);
        inflater.finish();
        return out.toByteArray();
    }
}
