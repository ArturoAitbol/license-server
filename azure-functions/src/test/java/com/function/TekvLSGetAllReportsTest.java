import com.function.util.TekvLSTest;

public class TekvLSGetAllReportsTest extends TekvLSTest {

    private final TekvLSGetAllReports tekvLSGetAllReports = new TekvLSGetAllReports();

    @BeforeEach
    public void setup() {
        this.initTestParameters();
        this.headers.put("authorization", "Bearer " + Config.getInstance().getToken("fullAdmin"));
    }

    @Tag("acceptance")
    @Test
    public void getAllReportsTest(){
        //Given
        String id = "EMPTY";

        // When
        HttpResponseMessage response = tekvLSGetAllReports.run(this.request,id,this.context);
        this.context.getLogger().info(response.getBody().toString());

        // Then
        HttpStatusType actualStatus = response.getStatus();
        HttpStatus expectedStatus = HttpStatus.OK;
        assertEquals(expectedStatus,actualStatus,"HTTP status doesn't match with: ".concat(expectedStatus.toString()));

        String body = (String) response.getBody();
        JSONObject jsonBody = new JSONObject(body);
        assertTrue(jsonBody.has("reports"));

        JSONArray reports = jsonBody.getJSONArray("reports");
        assertTrue(reports.length() > 0);

        JSONObject report = reports.getJSONObject(0);
        assertTrue(report.has("reportType"));
        assertTrue(report.has("startTime"));
        assertTrue(report.has("endTime"));        
    }

}
