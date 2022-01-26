import { Component, OnInit, ViewChild } from '@angular/core';
import { TdCodeEditorComponent } from '@covalent/code-editor';
import { PhoneConfigurationService } from 'src/app/services/phone-configuration.service';
import { PhoneService } from 'src/app/services/phone.service';
import { ToastrService } from 'ngx-toastr';

declare var difflib: any;
declare var diffview: any;

@Component({
  selector: 'app-phone-conf',
  templateUrl: './phone-conf.component.html',
  styleUrls: ['./phone-conf.component.css']
})
export class PhoneConfComponent implements OnInit {
  singleView: boolean = true;
  phone: any;
  original: any = "";
  latest: any = "";
  xml: any = "";
  xml_1: any = "";
  xml_2: any = "";
  date_old: any = "09/17/2019";
  date_new: any = "09/17/2019";
  date_conv_old: any = "";
  date_conv_new: any = "";

  constructor(private phoneConfigurationService: PhoneConfigurationService,
    private phoneService: PhoneService, private toastr: ToastrService) { }

  ngOnInit() {
    this.phone = this.phoneConfigurationService.getPhone();
    this.singleView = this.phoneConfigurationService.getViewType();
    document.getElementById('textpanes').style.visibility = 'hidden';
    this.phoneConfig();
  }

  hideModal() {
    this.phoneConfigurationService.hideConfModal.emit();
  }

  diffUsingJS(viewType) {
    let context = this;
    "use strict";

    document.getElementById('textpanes').style.visibility = 'visible';
    this.xml_1 = this.xml_1.toString().replace(/>,</g, ">\n<");
    this.xml_2 = this.xml_2.toString().replace(/>,</g, ">\n<");
    if (!context.xml_1) {
      this.original = "Not available.";
      var sar = 1;
    }

    else if (true) {
      this.original = this.xml_1;
      var sar = 10;
      if (this.original === "Not available.") {
        var sar = 1;
      }
    }

    if (!context.xml_2) {
      this.latest = "Not available.";
      var las = 1;
    }
    else if (true) {
      this.latest = this.xml_2;
      var las = 10;
      if (this.latest === "Not available.") {
        var las = 1;
      }
    }

    this.date_conv_old = new Date(this.date_old);
    this.date_conv_old = this.date_conv_old.toLocaleString("en-US");
    this.date_conv_new = new Date(this.date_new);
    this.date_conv_new = this.date_conv_new.toLocaleString("en-US");

    if (!this.singleView) {
      if (this.date_old === "09/17/2019")
        document.getElementById("head_old").innerHTML = "Previous Configuration";
      else
        document.getElementById("head_old").innerHTML = "Previous Configuration [ " + this.date_conv_old + " ]";
    }

    if (this.date_new === "09/17/2019")
      document.getElementById("head_new").innerHTML = "Current Configuration";
    else
      document.getElementById("head_new").innerHTML = "Current Configuration [ " + this.date_conv_new + " ]";

    if (sar !== 1 && las !== 1 && !this.singleView) {
      var list = document.getElementById("screenHeight");
      list.removeChild(list.childNodes[0]);
      var byId = function (id) {
        return document.getElementById(id);
      },
        base = (<HTMLInputElement>difflib.stringAsLines(context.latest)),
        newtxt = (<HTMLInputElement>difflib.stringAsLines(context.original)),
        sm = new difflib.SequenceMatcher(base, newtxt),
        opcodes = sm.get_opcodes(),
        diffoutputdiv = byId("diffoutput");

      diffoutputdiv.innerHTML = "";

      diffoutputdiv.appendChild(diffview.buildView({
        baseTextLines: base,
        newTextLines: newtxt,
        opcodes: opcodes,
        baseTextName: "Current Configuration [" + this.date_conv_new + "]",
        newTextName: "Previous Configuration [" + this.date_conv_old + "]",
        viewType: viewType
      }));
    }
  }

  getWidth() {
    if (this.singleView)
      return "70%";
    return "auto";
  }

  getHeight() {
    if (this.singleView)
      return "44vh";
    return "auto";
  }

  getFloat() {
    if (this.singleView)
      return "none";
    return "left";
  }

  phoneConfig() {
    this.phoneService.phoneConfigDetails(this.phone).subscribe((response: any) => {
      if (!response.success)
        this.toastr.error("Error getting phone config: " + response.response.message, "Error");
      else {
        this.toastr.success(response.response.message, "Success");
        try {
          this.xml = response.response;
        }
        catch (err) {
          this.xml = "Config files are not available.";
        }

        if (response.response.phoneConfigurations.length > 1) {
          if (response.response.phoneConfigurations[1].createDate < response.response.phoneConfigurations[0].createDate) {
            try {
              this.xml_1 = response.response.phoneConfigurations[1].configurationDetails;  //Previous config
              this.date_old = response.response.phoneConfigurations[1].createDate;
            }
            catch (err) {
              this.xml_1 = "Not available.";

            }
            try {
              this.xml_2 = response.response.phoneConfigurations[0].configurationDetails;   //Current config
              this.date_new = response.response.phoneConfigurations[0].createDate;
            }
            catch (err) {
              this.xml_2 = "Not available.";
            }
          }
          else if (response.response.phoneConfigurations[1].createDate > response.response.phoneConfigurations[0].createDate) {
            try {
              this.xml_1 = response.response.phoneConfigurations[0].configurationDetails;   //Previous config
              this.date_old = response.response.phoneConfigurations[0].createDate;
            }
            catch (err) {
              this.xml_1 = "Not available.";
            }
            try {
              this.xml_2 = response.response.phoneConfigurations[1].configurationDetails;     //Current config
              this.date_new = response.response.phoneConfigurations[1].createDate;
            }
            catch (err) {
              this.xml_2 = "Not available.";
            }
          }
        } else {
          try {
            this.xml_2 = response.response.phoneConfigurations[0].configurationDetails;   //Current config
            this.date_new = response.response.phoneConfigurations[0].createDate;
          }
          catch (err) {
            this.xml_2 = "Not available.";
          }
        }
        this.diffUsingJS(0);
      }
    });
  }
}