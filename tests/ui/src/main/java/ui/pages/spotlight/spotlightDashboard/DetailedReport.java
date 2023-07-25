package ui.pages.spotlight.spotlightDashboard;

import org.openqa.selenium.By;
 import org.openqa.selenium.WebElement;
 import ui.core.AbstractPageObject;

 public class DetailedReport extends AbstractPageObject {

     public String getTableValue(String table, String field, int fieldNumber){
         WebElement dataTable = driver.findElement(By.id(table));
         WebElement row = dataTable.findElement(By.xpath("//tr["+fieldNumber+"]"));
         WebElement element = row.findElement(By.id(field));
         String value = element.getText();
         return value;
     }

     public String getTableValueByTitle(String table, String fieldTitle){
         By fieldSelector = By.xpath(String.format("//div[@id='%s']/descendant::td[@title='%s']", table, fieldTitle));
         return this.action.getText(fieldSelector);
     }

     public String getColumnValue(String table, String column){
         WebElement matCardContent = driver.findElement(By.id(table));
         WebElement matPanelTitle = matCardContent.findElement(By.xpath(".//mat-panel-title[@id='" + column + "']"));
         String value = matPanelTitle.getText();
         return value;
     }

     public String getMatSpanValue(String table, String field){
         WebElement matCardContent = driver.findElement(By.id(table));
         WebElement matPanelTitle = matCardContent.findElement(By.xpath(".//span[@title='" + field + "']"));
         String value = matPanelTitle.getText();
         return value;
     }

     public String getMatPanelValue(String table, String field){
         WebElement matCardContent = driver.findElement(By.id(table));
         WebElement matPanelTitle = matCardContent.findElement(By.xpath(".//mat-panel-title[@title='" + field + "']"));
         String value = matPanelTitle.getText();
         return value;
     }

     public String getDIDValue(String table, String did, String param){
         By fieldSelector = By.xpath(String.format("//div[@id='%s']/descendant::mat-panel-title[@id='%s']/descendant::li[@title='%s']", table, did, param));
         return this.action.getText(fieldSelector);
     }

     public String getDIDTableData(String table, String title){
         By fieldSelector = By.xpath(String.format("//div[@id='DIDdetail']/descendant::table[@id='%s']/descendant::td[@title='%s']", table, title));
         return this.action.getText(fieldSelector);
     }
 }