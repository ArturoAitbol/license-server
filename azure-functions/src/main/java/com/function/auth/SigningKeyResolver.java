package com.function.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.SigningKeyResolverAdapter;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.Key;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;

public class SigningKeyResolver extends SigningKeyResolverAdapter {

    private JSONArray keysSet = null;

    private static class InstanceProvider{
        private static final SigningKeyResolver INSTANCE = new SigningKeyResolver();
    }

    public static SigningKeyResolver getInstance(){
        return InstanceProvider.INSTANCE;
    }

    @Override
    @SuppressWarnings("rawtypes")
    public Key resolveSigningKey(JwsHeader jwsHeader, Claims claims) {
        String keyId = jwsHeader.getKeyId();
        return lookupVerificationKey(keyId);
    }

    private Key lookupVerificationKey(String keyId){
        try{
            if(keysSet == null){
                synchronized (this){
                    if(keysSet == null)
                        keysSet =  getKeysFromAzure();
                }
            }
            JSONObject key = searchKey(keyId);
            if(key==null){
                synchronized (this) {
                    keysSet = getKeysFromAzure();
                }
                key = searchKey(keyId);
            }
            return generatePublicKey(key);

        } catch (Exception exception){
            exception.printStackTrace();
        }
        return null;
    }

    private JSONObject searchKey(String keyId){
        JSONObject key = null;
        boolean keyFound = false;
        for (int i = 0; i < keysSet.length();i++){
            key = keysSet.getJSONObject(i);
            if(key.getString("kid").equals(keyId)){
                keyFound = true;
                break;
            }
        }
        return keyFound ? key : null ;
    }

    private PublicKey generatePublicKey(JSONObject key) throws Exception {
        try {
            BigInteger modulus = new BigInteger(1, Base64.getUrlDecoder().decode(key.getString("n")));
            BigInteger exponent = new BigInteger(1, Base64.getUrlDecoder().decode(key.getString("e")));

            RSAPublicKeySpec publicSpec = new RSAPublicKeySpec(modulus, exponent);
            KeyFactory factory = KeyFactory.getInstance("RSA");
            return factory.generatePublic(publicSpec);
        } catch(Exception e){
            throw new Exception("Key generation failed", e);
        }
    }

     private JSONArray getKeysFromAzure() throws Exception {
        String openIdConfigURL = "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration";
        JSONObject openIdConfiguration = httpGet(openIdConfigURL);
        String jwksUri = openIdConfiguration.getString("jwks_uri");
        JSONObject keysSet = httpGet(jwksUri);
        return keysSet.getJSONArray("keys");
    }

    private JSONObject httpGet(String endpoint) throws Exception {
        URL url = new URL(endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Content-Type", "application/json");
        InputStream responseStream = connection.getInputStream();
        BufferedReader in = new BufferedReader(new InputStreamReader(responseStream));
        String inputLine = in.readLine();
        return new JSONObject(inputLine);
    }
}