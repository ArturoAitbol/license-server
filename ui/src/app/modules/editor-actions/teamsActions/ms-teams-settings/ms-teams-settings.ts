import { Action } from 'src/app/model/action';

export class MsTeamsSettings {
  public static generateQuery(data: Action | any): string {
    const $commented = (data.comment) ? '//' : '';
    let query = '';
    data.parameters.forEach((element: { parameter: string, value: string }) => {
      if (element.parameter === 'timer') {
        data.selectedTime = element.value;
      } else if (element.parameter === 'state') {
        data.selectedState = element.value;
      } else if (element.parameter === 'callForwardingType') {
        data.selectedcallForwardType = element.value;
      } else if ((element.parameter === 'forwardToPhone' || element.parameter === 'forwardToNumber') && element.value != '') {
        data.forwardValue = element.value;
      } else if (element.parameter === 'ringType') {
        data.selectedRingType = element.value;
      }
    });
    if (data.resourceGroup) {
      query = `${data.phone}.settings(config=="${data.configurationParameter}",destinationType=="${data.callVia}",group=="${data.resourceGroup}",ringType=="${data.selectedRingType}",state=="${data.selectedState}"`;
    } else if (data.configurationParameter === 'Simultaneous Ring') {
      query = `${data.phone}.settings(config=="${data.configurationParameter}",state=="${data.selectedState}"`;
    } else if (data.configurationParameter === 'Hide Caller ID') {
      query = `${data.phone}.settings(config=="${data.configurationParameter}",state=="${data.selectedState}"`;
    } else {
      query = `${data.phone}.settings(config=="${data.configurationParameter}",forwardingtype=="${data.selectedcallForwardType}",state=="${data.selectedState}"`;
    }
    query += `,"${data.continueonfailure}")`;
    return $commented + query;
  }
}