import { tekVizionServices } from "src/app/helpers/tekvizion-services";

const CUSTOMER = {
    id: '0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848',
    name: 'Test Customer',
    status: 'Active',
    customerType: 'MSP',
    subaccountId: 'eea5f3b8-37eb-41fe-adad-5f94da124a5a',
    licenseId: '986137d3-063d-4c0e-9b27-85fcf3b3272e',
    subaccountName: 'Default',
    testCustomer: true,
    services: tekVizionServices.tekTokenConstumption + ',' + tekVizionServices.SpotLight
}


export const CurrentCustomerServiceMock = {
    selectedCustomer : CUSTOMER,
    getSelectedCustomer: () =>{
        return JSON.parse(JSON.stringify(CUSTOMER));
    },
    setSelectedCustomer: (customer: any) => {
    }
};


    