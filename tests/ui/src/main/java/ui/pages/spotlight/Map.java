package ui.pages.spotlight;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ui.core.AbstractPageObject;

import static org.junit.Assert.assertEquals;

public class Map extends AbstractPageObject {
    @FindBy(css = "[title='Chicago']")
    WebElement node;
    @FindBy(css = "[title='Tampa']")
    WebElement tampa;
    //Chicago San Antonio
    @FindBy(css = "[class*='Chicago San Antonio']")
    WebElement link;
    @FindBy(css = "[id='cancel-button']")
    WebElement cancelButton;
    @FindBy(css = "[title='originatedPOLQA']")
    WebElement originatedPOLQA;
    @FindBy(css = "[title='originatedJitter']")
    WebElement originatedJitter;
    @FindBy(css = "[title='originatedRoundTripTime']")
    WebElement originatedRoundTripTime;
    @FindBy(css = "[title='originatedPacketLoss']")
    WebElement originatedPacketLoss;
    @FindBy(css = "[title='originatedBitrate']")
    WebElement originatedBitrate;
    @FindBy(css = "[title='terminatedPOLQA']")
    WebElement terminatedPOLQA;
    @FindBy(css = "[title='terminatedJitter']")
    WebElement terminatedJitter;
    @FindBy(css = "[title='terminatedRoundTripTime']")
    WebElement terminatedRoundTripTime;
    @FindBy(css = "[title='terminatedPacketLoss']")
    WebElement terminatedPacketLoss;
    @FindBy(css = "[title='terminatedBitrate']")
    WebElement terminatedBitrate;

    public void openNodeAndValidateData() {
        String oPOLQA = "Min: 3.2, Avg: 4.06";
        String oJitter= "Max: 13.51, Avg: 6.37";
        String oRoundTripTime= "Max: 231, Avg: 87.21";
        String oPacketLoss= "Max: 0, Avg: 0";
        String oBitrate= "Avg: 37.57";
        String tPOLQA = "Min: 3.2, Avg: 4.07";
        String tJitter= "Max: 11.66, Avg: 6.09";
        String tRoundTripTime= "Max: 236, Avg: 105.38";
        String tPacketLoss= "Max: 1.1, Avg: 0.06";
        String tBitrate= "Avg: 37.51";
        waitData();
        this.action.click(this.node);
        this.action.click(this.node);
        assertEquals("originated POLQA isn't the same: ".concat(this.action.getText(originatedPOLQA)),oPOLQA,this.action.getText(originatedPOLQA));
        assertEquals("originated Jitter isn't the same: ".concat(this.action.getText(originatedJitter)),oJitter,this.action.getText(originatedJitter));
        assertEquals("originated Round Trip Time isn't the same: ".concat(this.action.getText(originatedRoundTripTime)),oRoundTripTime,this.action.getText(originatedRoundTripTime));
        assertEquals("originated Packet Loss isn't the same: ".concat(this.action.getText(originatedPacketLoss)),oPacketLoss,this.action.getText(originatedPacketLoss));
        assertEquals("originated Bitrate isn't the same: ".concat(this.action.getText(originatedBitrate)),oBitrate,this.action.getText(originatedBitrate));
        assertEquals("terminated POLQA isn't the same: ".concat(this.action.getText(terminatedPOLQA)),tPOLQA,this.action.getText(terminatedPOLQA));
        assertEquals("terminated Jitter isn't the same: ".concat(this.action.getText(terminatedJitter)),tJitter,this.action.getText(terminatedJitter));
        assertEquals("terminated Round Trip Time isn't the same: ".concat(this.action.getText(terminatedRoundTripTime)),tRoundTripTime,this.action.getText(terminatedRoundTripTime));
        assertEquals("terminated Packet Loss isn't the same: ".concat(this.action.getText(terminatedPacketLoss)),tPacketLoss,this.action.getText(terminatedPacketLoss));
        assertEquals("terminated Bitrate isn't the same: ".concat(this.action.getText(terminatedBitrate)),tBitrate,this.action.getText(terminatedBitrate));
        this.action.click(cancelButton);
    }

    public void validatePOLQAValues() {
        String oPOLQA = "Avg: 3.89";
        String tPOLQA = "Avg: 3.91";
        waitData();
        this.action.click(this.tampa);
        this.action.click(this.tampa);
        String[] avgOriginatedPOLQA = this.action.getText(originatedPOLQA).split(", ");
        String[] avgTerminatedPOLQA = this.action.getText(terminatedPOLQA).split(", ");
        assertEquals("originated POLQA isn't the same: ".concat(avgOriginatedPOLQA[1]),oPOLQA,avgOriginatedPOLQA[1]);
        assertEquals("terminated POLQA isn't the same: ".concat(avgTerminatedPOLQA[1]),tPOLQA,avgTerminatedPOLQA[1]);
        this.action.click(cancelButton);
    }

    public void validateLinkData() {
        String POLQA = "Min: 1.49, Avg: 4.04";
        String Jitter= "Max: 13.18, Avg: 6.17";
        String RoundTripTime= "Max: 141, Avg: 66.87";
        String PacketLoss= "Max: 22.07, Avg: 0.21";
        String Bitrate= "Avg: 37.92";
        this.action.click(this.link);
        this.action.click(this.link);
        this.action.click(cancelButton);
    }
    public void waitData(){
        By spinnerSelector = By.cssSelector("svg[preserveAspectRatio]");
        this.action.waitSpinner(spinnerSelector);
    }
}
