import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AutomationEditorService } from 'src/app/services/automation-editor.service';
import { Phone } from 'src/app/model/phone';
import { Constants } from 'src/app/model/constant';

@Component({
  selector: 'app-validate-media-stats',
  templateUrl: './validate-media-stats.component.html',
  styleUrls: ['./validate-media-stats.component.css']
})
export class ValidateMediaStatsComponent implements OnInit {


  action: any;
  subscription: Subscription;
  resources: any;
  selectedPhone: any = "";
  mediaType: any = "";
  selectedMediaParam: any = "";
  selectedmediaValue: any = '';
  mediaTypeList: any[] = ["Audio", "Video"];
  public title: string = "";
  actionToEdit: any = {};
  operators: any = ["==", "<=", ">=", "<", ">", "!="];
  mediaParamList: any = []
  operator: string = "";
  resourceKeyList: string[];
  selectedResourceKey: string;
  value: string="";
  continueOnFailure: boolean = false;
  list = {
    Polycom: {
      "": {
        Audio: ["PacketsSent", "Category", "PacketsExpected", "RxPayloadSize", "OctetsSent", "PacketsReceived", "OctetsReceived", "RxMOSCQ", "PacketsLost", "Jitter", "TxMOSCQ", "RxCodec", "MaxJitter", "Latency", "TxCodec", "TxPayloadSize", "RxMOSLQ", "TxMOSLQ"],
        Video: ["TxPayloadSize", "PacketsLost", "PacketsSent", "VideoTxActBitrateKbps", "Category", "Jitter", "VideoTxConfigBitrateKbps", "OctetsSent", "OctetsReceived", "TxCodec", "PacketsReceived", "VideoTxFastUpdateReqCnt", "PacketsExpected", "VideoTxFramerate", "MaxJitter", "VideoRxFrameHeight", "VideoTxFrameWidth", "Latency", "VideoRxActBitrateKbps", "VideoRxFramerate", "RxCodec", "RxPayloadSize", "VideoTxFrameHeight", "VideoRxFrameWidth", "VideoRxFastUpdateReqCnt"]
      }
    },
    Yealink: {
      "": {
        Audio: ["jitter", "delay", "mos-lq", "mos-cq", "loss_rate", "jitter_avg", "codec", "jitter_max"],
        Video: ["codec", "bitrate", "framerate", "average_jitter", "max_jitter", "delay", "loss_rate", "package_total_loss", "width", "height"]

      }
    },
    Cisco: {
      "WEBEX-TEAMS": {
        Audio: ["max BS", "min BS", "Average BS", "PESQ", "PESQ-LQ", "PESQ-LQO", "Rec pacekts", "lostrate", "total lost", "Bybuffer", "bynetwork", "ulAverageJitter", "RealRec"],
        Video: ["loss", "jitter", "bytes", "rtp", " bitrate", "rtt", "bw", "inputRate", "adaptedFrames", "droppedFrames", "maxBufMs", "totalframes", "sendbufStat", "idrReq", "idrSent", "codecType", "rrWin", "rtxBitRate", "mari_loss", "mari_qdelay", "mari_recvrate", "mari_rtt"]

      },
      "MPP": {
        Audio: ["Loss_Rate", "Decode_Latency", "MOS-LQ", "Jitter", "Packets_Lost", "Decoder", "Gap_Duration", "Packets_Sent", "Encoder", "Burst_Duration", "Round_Trip_Delay", "Bytes_Sent", "Bytes_Received", "Mapped_RTP_Port", "Packet_Discarded", "MOS-CQ", "Discard_Rate", "Packets_Received"],
        Video: ["Video_Encoder", "Video_Decoder", "Video_Packets_Sent", "Video_Packets_Received", "Video_Jitter", "Video_Max_Jitter", "Video_Receiver_Packets_Discarded", "Video_Receiver_Packets_Lost", "Video_Sender_Resolution", "Video_Receiver_Resolution", "Video_Sender_Frames", "Video_Sender_IDR_Frames", "Video_Sender_iframes_Req", "Video_Receiver_Frames", "Video_Receiver_IDR_Frames", "Video_Receiver_iframes_Req", "Video_Sender_Frame_Rate", "Video_Receiver_Frame_Rate", "Video_Latency", "Video_Sender_Bandwidth", "Video_Receiver_Bandwidth"],

      }

    },
    Microsoft: {
      "MS-TEAMS": {
        Audio: ["Sent packets", "Round trip time", "Received Jitter", "Received packet loss", "Received packets", "Received codec"],
        Video: []

      }
    }
  }
  public vendorType: any;

  constructor(private aeService: AutomationEditorService) { }

  ngOnInit() {
    this.resources = this.aeService.getFilteredResources(["Phone", "Server", "Router"]).filter((e: Phone) => e.vendor.toLowerCase() !== Constants.GS.toLowerCase());
    this.mediaTypeList = ["Audio", "Video"];
    this.resourceKeyList = this.aeService.getCallQltyResourceKeys();
    this.actionToEdit = JSON.parse(localStorage.getItem('current-action'));
    if (this.actionToEdit) {
      this.selectedPhone = this.actionToEdit.phone;
      this.mediaType = this.actionToEdit.calltype;
      this.operator = this.actionToEdit.operator;
      this.selectedmediaValue = this.actionToEdit.value;
      this.selectedResourceKey = this.actionToEdit.resultIn;
      if (!this.resourceKeyList.some(e => e == this.actionToEdit.resultIn)) {
        this.selectedResourceKey = '';
      }
      this.continueOnFailure = (this.actionToEdit.continueonfailure == true || this.actionToEdit.continueonfailure == 'true');
      this.onSelectPhone();
      this. onSelectMediaType();
      this.selectedMediaParam = this.actionToEdit.tagParam;
    }
    this.subscription = this.aeService.generateAction.subscribe((res: any) => {
      this.insertAction();
    });
  }

  insertAction() {
    this.createAction();
    this.aeService.insertAction.emit(this.action);
  }

  cancel() {
    this.aeService.cancelAction.emit();
  }

  createAction() {
    let item = {
      action: "validate_media_stats",
      phone: this.selectedPhone,
      calltype: this.mediaType,
      tagParam: this.selectedMediaParam,
      operator: this.operator,
      resultIn: this.selectedResourceKey,
      value: this.selectedmediaValue,
      continueonfailure: this.continueOnFailure

    };
    let query = `${this.selectedPhone}.validateMediaStats(ResultKey =="${this.selectedResourceKey}",MediaType == "${this.mediaType}",MediaParam == "${this.selectedMediaParam}",Operator == "${this.operator}",MediaValue == "${this.selectedmediaValue}","${this.continueOnFailure}")`;
    this.action = { action: item, query: query };
  }
  onSelectmediaValue() {

  }
  onSelectPhone() {
    this.selectedMediaParam = '';
    if (this.selectedPhone && this.mediaType) {
      const resourcesItem = JSON.parse(JSON.stringify(this.resources.find((item) => item.name == this.selectedPhone)));
      this.mediaParamList = JSON.parse(JSON.stringify(this.list[resourcesItem.vendor][resourcesItem.model][this.mediaType]));
    } else {
      this.mediaParamList = [];
    }
    if (this.selectedPhone) {
      const resourcesItem = JSON.parse(JSON.stringify(this.resources.find((item) => item.name == this.selectedPhone)));
      this.vendorType = resourcesItem.vendor;
    }
    if (this.vendorType === 'Microsoft') {
      this.mediaTypeList = ["Audio"];
      this.mediaType = "Audio";
      this.onSelectMediaType();
    }
    else
      this.mediaTypeList = ["Audio", "Video"];
  }
  onSelectMediaType() {
    this.selectedMediaParam = '';
    if (this.selectedPhone && this.mediaType) {
      const resourcesItem = JSON.parse(JSON.stringify(this.resources.find((item) => item.name == this.selectedPhone)));
      this.mediaParamList = JSON.parse(JSON.stringify(this.list[resourcesItem.vendor][resourcesItem.model][this.mediaType]));
    } else {
      this.mediaParamList = [];
    }
    
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }


}


