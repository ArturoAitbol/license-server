import {Observable} from 'rxjs';

export const LicenseServiceMock = {
    getLicenseList: () => {
        return new Observable( (observer) => {
            observer.next(
                {
                    licenses: [
                        {
                            subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
                            id: '16f4f014-5bed-4166-b10a-808b2e6655e3',
                            status: 'Active'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: '31d82e5c-b911-460c-cdbe-6860f8464233',
                            status: 'Active'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: '527b5c03-c0d6-4f41-8866-7255487aab48',
                            status: 'Active'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: '273a38b7-20a1-487e-82fb-8861d96280fe',
                            status: 'Active'
                        },
                        {
                            subaccountId: '3819dc98-0e34-4237-ad0f-e79895b887e9',
                            id: '37c6ac96-dbf0-4195-a070-3eec4598183c',
                            status: 'Expired'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: 'af7669e4-ed08-44c2-b405-547d81b10fa7',
                            status: 'Active'
                        },
                        {
                            subaccountId: '3819dc98-0e34-4237-ad0f-e79895b887e9',
                            id: '2c0345a7-89de-440b-998c-c85a3f31c63c',
                            status: 'Expired'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: 'af7789e4-ef08-45c2-b405-547d81b10fa7',
                            status: 'Active'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: '989c0ed3-a8ba-4c81-bf87-19ab91790c93',
                            status: 'Expired'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: 'c3b1bc60-5405-40b9-88c5-e9437972d5c6',
                            status: 'Active'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: '0e2f8b82-6dea-44e0-934a-0434b01d8d90',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'c428b1f2-0322-4686-a5cf-66eb4e74a0f5',
                            id: '955aaf36-d628-46fa-b00a-ab01645b76df',
                            status: 'Expired'
                        },
                        {
                            subaccountId: 'c428b1f2-0322-4686-a5cf-66eb4e74a0f5',
                            id: '236a90dd-d841-4b2c-8d36-360dc6b4214d',
                            status: 'Active'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: '31d82e5c-a911-460b-ccbe-6860f8464233',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'd45db408-6ceb-4218-bd36-6355e0e21bfb',
                            id: '0e5903a4-f810-4f3e-a76f-f12825e642de',
                            status: 'Expired'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: '31b92e5c-b811-460b-ccbe-6860f8464233',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
                            id: '6524a6ab-b88b-49a8-aee5-624e86e24dcd',
                            status: 'Expired'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: 'd7259fad-1c19-4560-ae93-17efef77144f',
                            status: 'Expired'
                        },
                        {
                            subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
                            id: '986137d3-063d-4c0e-9b27-85fcf3b3272e',
                            status: 'Expired'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: '899f4fa6-dd25-43f9-8517-fe17d91a9226',
                            status: 'Active'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: '978b935a-4571-425e-ae68-fa77f471f242',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'ac7a78c2-d0b2-4c81-9538-321562d426c7',
                            id: '1d1bf1e8-6522-4ab9-956a-864041f890e2',
                            status: 'Active'
                        },
                        {
                            subaccountId: '0cde8c0e-9eab-4fa9-9dda-a38c0c514b3a',
                            id: 'f0a284f4-a5dc-4cbc-8b3d-567007e98e3e',
                            status: 'Active'
                        },
                        {
                            subaccountId: '31d81e5c-a916-470b-aabe-6860f8464211',
                            id: 'fda82feb-d408-4d96-aae9-86865c04620d',
                            status: 'Active'
                        },
                        {
                            subaccountId: '99ffe734-dccc-4020-b6b2-cc48216bdcca',
                            id: '76b8a807-72b8-4c52-b9a1-0ef1a9777aad',
                            status: 'Active'
                        },
                        {
                            subaccountId: '87283654-cb92-4355-ac0d-88dcafc778ad',
                            id: 'f587880a-5b9f-4468-94a5-0fc427e7ffd1',
                            status: 'Active'
                        },
                        {
                            subaccountId: '82e579e9-4444-46c9-aaf7-5b365c92524a',
                            id: 'c240a16e-cadf-41c8-8bfe-4e5ead2f7be4',
                            status: 'Active'
                        },
                        {
                            subaccountId: '845881b4-3584-4ae0-bf8a-0c12f7892095',
                            id: '0c6369d0-6fed-461e-bea8-a7e5bd9131ad',
                            status: 'Active'
                        },
                        {
                            subaccountId: '31c142a6-b735-4bce-bfb4-9fba6b539116',
                            id: '78e4ac61-e27a-4533-9764-3ccdb27b2736',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'e5e293a7-1cab-4d95-86f0-c758541fd957',
                            id: '419d29a2-7e17-4aaf-a712-c54359f3ac32',
                            status: 'Active'
                        },
                        {
                            subaccountId: '0454e724-f26f-4b64-a757-7d99a02f6464',
                            id: '16e20c33-99d4-4883-a732-a26b214471be',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'ca0338ac-4ebc-4108-a92a-b1d253e05b31',
                            id: 'aa510ca7-d055-465c-8447-a028b4fa1869',
                            status: 'Expired'
                        },
                        {
                            subaccountId: '637b5502-cf56-4113-8354-cd7098442f97',
                            id: '4c4480af-2f0a-49da-abff-f8a3cc7ec704',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'a6278e6c-8e45-421f-97f0-de60fce06608',
                            id: 'e726e3b9-cde2-4692-ae3f-cf1c4d796995',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'f5a609c0-8b70-4a10-9dc8-9536bdb5652c',
                            id: 'b84852d7-0f04-4e9a-855c-7b2f01f61591',
                            status: 'Active'
                        },
                        {
                            subaccountId: '86ed6072-069c-4712-92d7-a258e354b798',
                            id: '1a9a1709-e073-4f03-b08e-7e8fbc47970f',
                            status: 'Active'
                        },
                        {
                            subaccountId: '37d5b2a8-63ac-4112-85ed-a2a2256fb4ba',
                            id: '10662f07-09eb-48c3-b0df-3db7f88e9022',
                            status: 'Active'
                        },
                        {
                            subaccountId: '0aefbe26-e929-4a04-922e-0aee390c0d89',
                            id: '07249fe4-92e2-4fda-8e34-1b42d58ad6f2',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'a8c40b4c-6eaf-4efd-bfd9-fa73bac4b2f2',
                            id: 'cc0e62d2-75bf-4f1b-9e7d-834ac75b3bba',
                            status: 'Active'
                        },
                        {
                            subaccountId: '3242e5b8-7a7f-4050-9b50-eadaa7bcd048',
                            id: 'fe469708-f4cf-4718-88f4-48914ee574bb',
                            status: 'Expired'
                        },
                        {
                            subaccountId: 'cae19a1a-c9b5-4a55-8cdd-811dfea3770c',
                            id: '7aa8b765-16a2-43c9-a610-fcba1ae75141',
                            status: 'Active'
                        },
                        {
                            subaccountId: '0f49e2e2-546e-4acf-a051-f5fcac1a3ae0',
                            id: '8b60fa68-208b-4d8e-b245-008af267cad8',
                            status: 'Active'
                        },
                        {
                            subaccountId: '48a8f94a-35ab-461c-9e8e-585692f087f5',
                            id: 'cda49150-f760-4cc1-b0e1-62099ba6615a',
                            status: 'Active'
                        },
                        {
                            subaccountId: '1730bb3f-1f13-4401-a366-a5dccdd620e0',
                            id: '7377fec4-5508-472c-a496-d3b601a52275',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'd9ff3754-5adc-41f0-a23d-21fb33c0323d',
                            id: 'f1b50059-2aff-4232-bec2-64c948a36269',
                            status: 'Active'
                        },
                        {
                            subaccountId: '0d916dcc-515f-47b5-b8c3-4f7884d274f5',
                            id: 'd8ffd316-b8a3-41ae-a88f-2ed75beb0867',
                            status: 'Active'
                        },
                        {
                            subaccountId: '3f87fff9-200c-4f1b-af9e-5ab9ade5e3e3',
                            id: '181c0baa-c80a-46d1-9ddd-6964d593aec6',
                            status: 'Active'
                        },
                        {
                            subaccountId: '01442bce-d452-4742-bcb5-27b93a44314f',
                            id: 'd554ec62-24f4-47de-ba85-9c063bfe74e1',
                            status: 'Active'
                        },
                        {
                            subaccountId: '67e0b7a0-523f-439e-898a-3ed9c2f941f0',
                            id: '9cef28c9-2a2e-4e0b-aeed-b56f4b005607',
                            status: 'Active'
                        },
                        {
                            subaccountId: '8d81e306-bbdb-409f-b0e8-0ece1bc489ee',
                            id: '9a30fa75-a6db-44f8-9cfe-7de5e0c7f6c8',
                            status: 'Active'
                        },
                        {
                            subaccountId: '66eb20c9-e65c-4aa6-b20f-eb42de96a0f5',
                            id: 'a7e213c1-662c-4be5-81e3-8724aff3246c',
                            status: 'Active'
                        },
                        {
                            subaccountId: '9599c5bd-f702-4965-b655-29b0fed00e23',
                            id: '24d00e27-fd58-44fe-894f-2df776e17bd7',
                            status: 'Active'
                        },
                        {
                            subaccountId: 'a9f2c313-7d80-4c1f-bda5-91f2767b3716',
                            id: '8d57a5fa-8ad4-4102-8276-6aa75f8a9870',
                            status: 'Active'
                        },
                        {
                            subaccountId: '22cc6133-6888-45ce-89ee-71f8571208a0',
                            id: 'cce93417-5c76-4df0-abfb-41bcfd315d54',
                            status: 'Active'
                        },
                        {
                            subaccountId: '04dfda26-98f4-42e5-889a-3edccf4b799c',
                            id: '25e913de-5282-4231-b685-87dc40fa4856',
                            status: 'Active'
                        },
                        {
                            subaccountId: '3e3eb864-689d-40a6-816e-340a8def68dd',
                            id: '69d0597f-7995-49ee-b365-e7cff9af5933',
                            status: 'Active'
                        },
                        {
                            subaccountId: '173c00ea-6e5c-462c-9295-ae5e14adc14f',
                            id: '117694f7-1578-4078-94dc-64d5286ed0e4',
                            status: 'Expired'
                        },
                        {
                            subaccountId: 'e8fc6a86-884f-4cfe-b220-73b4e5e97577',
                            id: '7f4f802c-387f-4c01-90b4-da8a4f0459be',
                            status: 'Expired'
                        },
                        {
                            subaccountId: '565e134e-62ef-4820-b077-2d8a6f628702',
                            id: 'e295a0c6-1cd0-4e54-b617-3c5ffa28aa0f',
                            status: 'Expired'
                        }
                    ]
                }
            );
            observer.complete();
            return {
                unsubscribe() { }
            };
        });
    }
};
