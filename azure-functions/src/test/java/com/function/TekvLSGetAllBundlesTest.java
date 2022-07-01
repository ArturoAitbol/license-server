package com.function;

import com.microsoft.azure.functions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;
import uk.org.webcompere.systemstubs.jupiter.SystemStub;
import uk.org.webcompere.systemstubs.jupiter.SystemStubsExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(SystemStubsExtension.class)
class TekvLSGetAllBundlesTest {

    public ExecutionContext context = mock(ExecutionContext.class);
    final HttpRequestMessage<Optional<String>> req = mock(HttpRequestMessage.class);
    final Map<String, String> queryParams = new HashMap<>();

    @SystemStub
    private EnvironmentVariables environmentVariables = new EnvironmentVariables("POSTGRESQL_SERVER", "tekv-db-server.postgres.database.azure.com:5432",
            "POSTGRESQL_USER", "tekvdbadmin@tekv-db-server", "POSTGRESQL_PWD", "MhZJh94z9D3Db3vW");

    @BeforeEach
    public void setup(){

        doReturn(this.queryParams).when(req).getQueryParameters();

        doReturn(Logger.getGlobal()).when(this.context).getLogger();
        //        doReturn(LogManager.getLogger()).when(context).getLogger();

    }


    @Test
    public void getAllBundlesTest(){
//        final HttpRequestMessage<Optional<String>> req = mock(HttpRequestMessage.class);
//        final Map<String, String> queryParams = new HashMap<>();
//        doReturn(queryParams).when(this.req).getQueryParameters();
        String id = "EMPTY";
//        String id = "874929e5-a1b3-47dd-a683-93ad417a586f";
//        queryParams.put("name", "Medium");

        doAnswer(new Answer<HttpResponseMessage.Builder>() {
            @Override
            public HttpResponseMessage.Builder answer(InvocationOnMock invocation) {
                HttpStatus status = (HttpStatus) invocation.getArguments()[0];
                return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
            }
        }).when(this.req).createResponseBuilder(any(HttpStatus.class));

        TekvLSGetAllBundles getAllBundles = new TekvLSGetAllBundles();
        HttpResponseMessage response = getAllBundles.run(this.req, id, this.context);
        System.out.println(response.getBody());
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expected = HttpStatus.ACCEPTED;
        // Verify
        assertEquals(expected, actualStatus,"HTTP status doesn't match with: ".concat(expected.toString()));
    }
}