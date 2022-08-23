const CUSTOMER = {
    id: '0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848',
    name: 'Test Customer',
    status: 'Active',
    customerType: 'MSP',
    subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
    subaccountName: 'Default',
    testCustomer: true
}


export const CurrentCustomerServiceMock = {
    selectedCustomer : CUSTOMER,
    getSelectedCustomer: () =>{
        return CUSTOMER;
    }
};


    