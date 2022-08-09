package com.function.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.impl.DefaultClaims;
import io.jsonwebtoken.impl.DefaultJwsHeader;
import org.junit.jupiter.api.Test;

import java.security.Key;

import static org.junit.jupiter.api.Assertions.*;

class SigningKeyResolverTest {

    SigningKeyResolver signingKeyResolver = SigningKeyResolver.getInstance();

    @Test
    public void lookupVerificationKeyTest(){
        JwsHeader<?> jwsHeader = new DefaultJwsHeader().setKeyId("000-000");
        Claims claims = new DefaultClaims();
        Key key = signingKeyResolver.resolveSigningKey(jwsHeader,claims);
        assertNull(key);
    }
}