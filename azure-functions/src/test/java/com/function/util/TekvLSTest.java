package com.function.util;

import com.function.TekvLSGetAllBundlesTest;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;
import uk.org.webcompere.systemstubs.jupiter.SystemStub;
import uk.org.webcompere.systemstubs.jupiter.SystemStubsExtension;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.logging.LogManager;
import java.util.logging.Logger;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(SystemStubsExtension.class)
public class TekvLSTest {
    @SuppressWarnings("unchecked")
    public final HttpRequestMessage<Optional<String>> request = mock(HttpRequestMessage.class);
    public ExecutionContext context = mock(ExecutionContext.class);

    public final Map<String, String> headers = new HashMap<>();
    public final Map<String, String> queryParams = new HashMap<>();

    public static Logger logger = Logger.getLogger(TekvLSGetAllBundlesTest.class.getName());

    @SystemStub
    private final EnvironmentVariables environmentVariables = new EnvironmentVariables(
            "POSTGRESQL_SERVER", Config.getInstance().getServer(),
            "POSTGRESQL_USER", Config.getInstance().getUser(),
            "POSTGRESQL_PWD", Config.getInstance().getPassword(),
            "POSTGRESQL_SECURITY_MODE", Config.getInstance().getSecurityMode(),
            "ENVIRONMENT_NAME", Config.getInstance().getEnvironmentName(),
            "TENANT_ID", Config.getInstance().getTenantId(),
            "EMAIL_INVITE_CLIENT_ID", Config.getInstance().getEmailInviteClientId(),
            "EMAIL_INVITE_CLIENT_SECRET", Config.getInstance().getEmailInviteClientSecret(),
            "DASHBOARD_APP_CLIENT_ID", Config.getInstance().getDashboardAppClientId(),
            "DASHBOARD_APP_SECRET_ID", Config.getInstance().getDashboardAppClientSecret(),
            "STORAGE_ACCOUNT_NAME", Config.getInstance().getStorageAccountName(),
            "STORAGE_CONTAINER_NAME", Config.getInstance().getStorageContainerName(),
            "TAP_USERNAME", Config.getInstance().getTapUsername(),
            "TAP_PASSWORD", Config.getInstance().getTapPassword()
    );

    public void initTestParameters() {
        doReturn(this.headers).when(request).getHeaders();
        doReturn(this.queryParams).when(request).getQueryParameters();
        doAnswer(new Answer<HttpResponseMessage.Builder>() {
            @Override
            public HttpResponseMessage.Builder answer(InvocationOnMock invocation) {
                HttpStatus status = (HttpStatus) invocation.getArguments()[0];
                return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
            }
        }).when(this.request).createResponseBuilder(any(HttpStatus.class));

        doReturn(logger).when(this.context).getLogger();
        try {
            LogManager.getLogManager().readConfiguration(new FileInputStream("src/test/resources/logging.properties"));
        } catch (SecurityException | IOException e1) {
            e1.printStackTrace();
        }
    }
}