--
-- PostgreSQL database data dump 
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: distributor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.distributor (id, name) FROM stdin;
f5ac1f7b-d93e-4872-bd5e-133c00d9e2bd	Test Distributor
6826a94e-c4da-46e9-8001-668df24877ec	Test Distributor2
\.

--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer (id, name, type, tombstone, distributor_id, test_customer) FROM stdin;
0856df81-8d32-4adb-941a-c0d9187f36a7	Test DeleteRealCustomer	MSP	f	\N	f
7d133fd2-8228-44ff-9636-1881f58f2dbb	Test RealCustomer	Reseller	f	f5ac1f7b-d93e-4872-bd5e-133c00d9e2bd	f
0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848	Test Customer	MSP	f	\N	t
cb1b268a-850a-4459-8033-09854d9ac015	Test NoDistributor	MSP	f	\N	t
9f6ff46a-5f19-4bcf-9f66-c5f29b800205	Test Distributor	MSP	f	6826a94e-c4da-46e9-8001-668df24877ec	t
f1b695b5-b7d9-4245-86ca-9a2a9ccbe460	DashboardFunctionalTest	MSP	f	6826a94e-c4da-46e9-8001-668df24877ec	t
b995ecaa-d64e-4067-90e5-cbc80935d1e0	SpotLight Demo-1	MSP	f	6826a94e-c4da-46e9-8001-668df24877ec	t
950f47c7-a477-455b-b65b-331ecacc88dd	Customer01	MSP	f	\N	f
\.


--
-- Data for Name: customer_admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_admin (admin_email, customer_id) FROM stdin;
test-customer-full-admin@tekvizionlabs.com	7d133fd2-8228-44ff-9636-1881f58f2dbb
test-distributor-full-admin@tekvizionlabs.com	9f6ff46a-5f19-4bcf-9f66-c5f29b800205
test-subaccount@hotmail.com	f1b695b5-b7d9-4245-86ca-9a2a9ccbe460
test1@tekvizion.com	0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848
test2@tekvizion.com	0856df81-8d32-4adb-941a-c0d9187f36a7
test-customer-subaccount-stakeholder@tekvizionlabs.com	b995ecaa-d64e-4067-90e5-cbc80935d1e0
test-customer-full-admin2@tekvizionlabs.com	950f47c7-a477-455b-b65b-331ecacc88dd
maintenance_test2@test.com	950f47c7-a477-455b-b65b-331ecacc88dd
\.


--
-- Data for Name: subaccount; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subaccount (id, name, customer_id, services) FROM stdin;
f5a609c0-8b70-4a10-9dc8-9536bdb5652c	Test RealCustomer - 360 Small	7d133fd2-8228-44ff-9636-1881f58f2dbb	tokenConsumption,spotlight
cebe6542-2032-4398-882e-ffb44ade169d	Test Subaccount2	9f6ff46a-5f19-4bcf-9f66-c5f29b800205	tokenConsumption
96234b32-32d3-45a4-af26-4c912c0d6a06	DashboardFunctionalTest	f1b695b5-b7d9-4245-86ca-9a2a9ccbe460	tokenConsumption,spotlight
ac7a78c2-d0b2-4c81-9538-321562d426c7	Default	0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848	tokenConsumption
069dc3aa-dcb1-45e6-886f-be8f2345080f	Default	0856df81-8d32-4adb-941a-c0d9187f36a7	tokenConsumption
8acb6997-4d6a-4427-ba2c-7bf463fa08ec	Test Subaccount3	b995ecaa-d64e-4067-90e5-cbc80935d1e0	tokenConsumption,spotlight
b5b91753-4c2b-43f5-afa0-feb00cefa981	SpotLight Demo-1	b995ecaa-d64e-4067-90e5-cbc80935d1e0	tokenConsumption,spotlight
b5b91753-4c2b-43f5-afa0-feb22cefa901	Test SpotLight Setup 2	950f47c7-a477-455b-b65b-331ecacc88dd	tokenConsumption,spotlight
0e2038ec-2b9b-493b-b3f2-6702e60b5b90	Test SpotLight Suites 	950f47c7-a477-455b-b65b-331ecacc88dd	tokenConsumption,spotlight
2c8e386b-d1bd-48b3-b73a-12bfa5d00805	Customer01	950f47c7-a477-455b-b65b-331ecacc88dd	tokenConsumption,spotlight
\.


--
-- Data for Name: device; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.device (id, vendor, product, version, type, granularity, tokens_to_consume, start_date, deprecated_date, subaccount_id, support_type) FROM stdin;
eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f	TestV	TestPhone1	1	PBX	week	100	2022-06-22 15:23:58.214171	2022-10-22 15:23:58.214171	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	t
\.


--
-- Data for Name: subaccount_admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subaccount_admin (subaccount_admin_email, subaccount_id) FROM stdin;
test-customer-full-admin@tekvizionlabs.com	f5a609c0-8b70-4a10-9dc8-9536bdb5652c
test-customer-subaccount-admin@tekvizionlabs.com	2c8e386b-d1bd-48b3-b73a-12bfa5d00805
test1@tekvizion.com	ac7a78c2-d0b2-4c81-9538-321562d426c7
test2@tekvizion.com	069dc3aa-dcb1-45e6-886f-be8f2345080f
test-customer-subaccount-stakeholder@tekvizionlabs.com	2c8e386b-d1bd-48b3-b73a-12bfa5d00805
maintenance_test@test.com	b5b91753-4c2b-43f5-afa0-feb22cefa901
\.


--
-- Data for Name: license; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license (id, subaccount_id, start_date, package_type, renewal_date, tokens, device_access_limit, status, description) FROM stdin;
1d1bf1e8-6522-4ab9-956a-864041f890e2	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-07-01 04:00:00	Basic	2022-07-31 04:00:00	55	5000	Active	License1
6524a6ab-b88b-49a8-aee5-624e86e24dcd	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-07-10 04:00:00	Small	2022-07-18 04:00:00	150	5000	Active	License2
b84852d7-0f04-4e9a-855c-7b2f01f61592	2c8e386b-d1bd-48b3-b73a-12bfa5d00805	2023-01-01 05:00:00	Small	2024-01-01 05:00:00	150	5000	Active	License1
b84852d7-0f04-4e9a-855c-7b2f01f61591	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2022-03-14 05:00:00	Small	2023-03-13 05:00:00	150	5000	Active	License3
a3475bf9-41d5-432a-ae2d-ccf7681385cf	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2022-10-04 04:00:00	Small	2022-11-04 04:00:00	150	5000	Active	License6
16f4f014-5bed-4166-b10a-808b2e6655e3	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-08-01 04:00:00	Small	2022-09-30 04:00:00	150	5000	Active	License4
986137d3-063d-4c0e-9b27-85fcf3b3272e	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-07-07 04:00:00	Small	2022-07-12 04:00:00	150	5000	Expired	Expired1
ebc71e49-4f63-44b2-9c90-7750d3ccca05	cebe6542-2032-4398-882e-ffb44ade169d	2022-07-01 04:00:00	Basic	2022-07-31 04:00:00	55	5000	Expired	Expired2
d9cb5f93-c4d0-427e-8133-77905abd8487	96234b32-32d3-45a4-af26-4c912c0d6a06	2021-12-26 04:00:00	Small	2022-01-22 04:00:00	150	5000	Expired	Expired3
16f4f014-5bed-4166-b10a-574b2e6655e3	b5b91753-4c2b-43f5-afa0-feb22cefa901	2022-08-01 04:00:00	Small	2023-09-30 04:00:00	150	5000	Active	License5
16f4f014-5bed-4166-b10a-574b2e6655e4	b5b91753-4c2b-43f5-afa0-feb00cefa981	2023-06-01 04:00:00	Small	2030-09-30 04:00:00	150	5000	Active	License1
16f4f014-5bed-4166-b10a-574b2e6655e5	96234b32-32d3-45a4-af26-4c912c0d6a06	2023-06-01 04:00:00	Small	2030-09-30 04:00:00	150	5000	Active	License1
\.


--
-- Data for Name: project; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project (id, subaccount_id, code, name, status, open_date, close_date, project_owner, license_id) FROM stdin;
f2b57afb-c389-48ec-a54b-7d8a05a51f32	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	00	app development	Open	2022-03-20 18:30:00	2022-04-20 18:30:00	powner@email.com	b84852d7-0f04-4e9a-855c-7b2f01f61591
2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	01	test 2	Open	2022-03-20 18:30:00	\N	powner@email.com	b84852d7-0f04-4e9a-855c-7b2f01f61591
7564aab0-5331-4ab5-85f7-e37acbdfd90d	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	02	test 3	Open	2022-10-04 18:30:00	\N	powner@email.com	a3475bf9-41d5-432a-ae2d-ccf7681385cf
a42edf7f-9b38-472f-afa3-10a4632acca1	cebe6542-2032-4398-882e-ffb44ade169d	0022	Project 2	Open	2022-08-01 04:00:00	\N	\N	ebc71e49-4f63-44b2-9c90-7750d3ccca05
be612704-c26e-48ea-ab9b-19312f03d644	2c8e386b-d1bd-48b3-b73a-12bfa5d00805	0011	Project 1	Open	2022-07-03 04:00:00	\N	\N	b84852d7-0f04-4e9a-855c-7b2f01f61592
\.


--
-- Data for Name: license_consumption; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license_consumption (id, subaccount_id, project_id, consumption_date, usage_type, device_id, tokens_consumed, modified_date, modified_by) FROM stdin;
c323f5f8-cd49-4b0b-ac74-fe2113b658b8	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	2022-07-16 00:00:00	Configuration	d41126e1-53eb-473f-b011-9bd0ac44644a	2	2022-07-18 00:00:00	conf_eng@email.com
0cba280f-06fa-47c2-9782-c16d8bf8ed05	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	7564aab0-5331-4ab5-85f7-e37acbdfd90d	2022-10-10 00:00:00	Configuration	1922a5fb-228c-4a90-b2d3-ec517d7a3f9a	3	2022-10-10 00:00:00	\N
9285ca9e-04c3-49df-9d59-085322a13319	cebe6542-2032-4398-882e-ffb44ade169d	a42edf7f-9b38-472f-afa3-10a4632acca1	2022-07-03 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-26 00:00:00	\N
9c0cc4a5-a773-46f3-b73e-a09c55080b1f	2c8e386b-d1bd-48b3-b73a-12bfa5d00805	be612704-c26e-48ea-ab9b-19312f03d644	2021-12-26 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-26 00:00:00	\N
\.


--
-- Data for Name: usage_detail; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usage_detail (id, consumption_id, usage_date, day_of_week, mac_address, serial_number, modified_date, modified_by) FROM stdin;
eea27aa4-f2b7-455a-a8ea-af85ee6ac25e	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-17	1			2022-07-18 00:00:00	conf_eng@email.com
3ad3f83e-2654-466d-b9e9-9cd8ded28110	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-18	2			2022-07-18 00:00:00	conf_eng@email.com
34859fba-9987-4a1c-b176-14569b331653	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-19	3			2022-07-18 00:00:00	conf_eng@email.com
b66edd36-ee7f-42e7-bfb4-41810ea69fe6	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-20	4			2022-07-18 00:00:00	conf_eng@email.com
7f6c9fec-978f-41a6-ba38-117611f0dfa3	0cba280f-06fa-47c2-9782-c16d8bf8ed05	2022-10-10	1			2022-10-10 00:00:00	conf_eng@email.com
866dbb8d-4e11-47c6-b26b-3ddbdc7e50e6	9285ca9e-04c3-49df-9d59-085322a13319	2022-07-03	0			\N	\N
1ba09c6f-9a2a-4181-ac1e-b7217763df96	9285ca9e-04c3-49df-9d59-085322a13319	2022-07-07	4			\N	\N
0e709699-3dab-47f1-a710-ebd2ae78d57b	9285ca9e-04c3-49df-9d59-085322a13319	2022-07-08	5			\N	\N
ea00b987-0f14-4888-a0ce-f963d1eb7592	9285ca9e-04c3-49df-9d59-085322a13319	2022-07-09	6			\N	\N
7ab51789-e767-42cc-a9ba-4ab4aef81d1f	9c0cc4a5-a773-46f3-b73e-a09c55080b1f	2021-12-27	1			\N	\N
9f53d1ae-e22d-4c3b-b05d-6bf6b13c0658	9c0cc4a5-a773-46f3-b73e-a09c55080b1f	2021-12-28	2			\N	\N
\.

COPY public.ctaas_setup (id, azure_resource_group, tap_url, status, on_boarding_complete, subaccount_id) FROM stdin;
836c9f23-fd61-4aa5-a5b9-17a9333d6dca	az_tap_rg	https://tekvizion-ap-tap-peerless-customer1.centralindia.cloudapp.azure.com:8443/onPOINT	SETUP_READY	true	f5a609c0-8b70-4a10-9dc8-9536bdb5652c
2981256a-b5b0-4f9c-aac6-dd7c3aa61ea3	az_tap_rg	https://tekvizion-ap-spotlight-dan-env-01.eastus2.cloudapp.azure.com:8443/onPOINT	SETUP_INPROGRESS	true	ac7a78c2-d0b2-4c81-9538-321562d426c7
39b5ed3f-9ab2-4feb-a2ac-9c450db181a0	az_tap_rg	https://tekvizion-ap-spotlight-dan-env-01.eastus2.cloudapp.azure.com:8443/onPOINT	SETUP_READY	true	8acb6997-4d6a-4427-ba2c-7bf463fa08ec
78346e8a-b4bf-41f4-a7cf-47e7020bcbd0	az_tap_rg	https://tekvizion-ap-spotlight-dan-env-01.eastus2.cloudapp.azure.com:8443/onPOINT	SETUP_INPROGRESS	false	cebe6542-2032-4398-882e-ffb44ade169d
b079c3a9-66c7-424f-aa1b-fdc2565d613a	az_tap_rg	https://tekvizion-ap-tap-peerless-customer1.centralindia.cloudapp.azure.com:8443/onPOINT	SETUP_READY	true	96234b32-32d3-45a4-af26-4c912c0d6a06
b079c3a9-66c7-424f-aa1b-fdc2565d614a	az_tap_rg	https://tekvizion-ap-tap-peerless-customer1.centralindia.cloudapp.azure.com:8443/onPOINT	SETUP_INPROGRESS	false	b5b91753-4c2b-43f5-afa0-feb00cefa981
a079c3a9-66c7-424f-aa1b-fdc2565d615a	\N	\N	SETUP_INPROGRESS	false	b5b91753-4c2b-43f5-afa0-feb22cefa901
b079c3a9-66c7-424f-aa1b-fdc2565d616a	\N	\N	SETUP_INPROGRESS	false	0e2038ec-2b9b-493b-b3f2-6702e60b5b90
c079c3a9-66c7-424f-aa1b-fdc2565d617a	az_tap_rg	https://tekvizion-ap-spotlight-dan-env-01.eastus2.cloudapp.azure.com:8443/onPOINT	SETUP_READY	true	2c8e386b-d1bd-48b3-b73a-12bfa5d00805
\.

COPY public.ctaas_test_suite (id, subaccount_id, total_executions, next_execution_ts, frequency, device_type, name) FROM stdin;
a8654484-1cb2-4fec-adf4-ee7ddc17375d	2c8e386b-d1bd-48b3-b73a-12bfa5d00805	5	2022-10-03 00:00:00	Hourly	MS Teams	Execution A
6a70a31b-fc5a-443b-82d4-d306961fa533	2c8e386b-d1bd-48b3-b73a-12bfa5d00805	10	2022-10-04 00:00:00	Weekly	MS Teams	Execution B
5726d813-834e-40c4-a52e-e9ac63459e03	2c8e386b-d1bd-48b3-b73a-12bfa5d00805	15	2022-10-05 00:00:00	Monthly	MS Teams	Execution C
30ab93f1-3bde-4721-8892-1ba34a005d08	0e2038ec-2b9b-493b-b3f2-6702e60b5b90	5	2022-10-03 00:00:00	Hourly	MS Teams	Execution D
89eeb522-157f-4125-96e6-b4cc900fa9d1	0e2038ec-2b9b-493b-b3f2-6702e60b5b90	10	2022-10-04 00:00:00	Weekly	MS Teams	Execution E
5798ecd9-6db9-43a6-a521-b21f065e7879	0e2038ec-2b9b-493b-b3f2-6702e60b5b90	15	2022-10-05 00:00:00	Monthly	MS Teams	Execution F
\.


--
-- Data for Name: note; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.note (id, subaccount_id, content, status, open_date, opened_by, close_date, closed_by) FROM stdin;
f2b57afb-c389-48ec-a54b-7d8a05a51f32	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	app development	Closed	2022-10-02 18:30:00	opener@email.com	2022-11-02 18:30:00	opener@email.com
2bdaf2af-838f-4053-b3fa-ef22aaa10b0d	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	test 2	Open	2022-10-20 18:30:00	opener@email.com	\N	\N
7564aab0-5331-4ab5-85f7-e37acbdfd90d	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	test 3	Open	2022-10-04 18:30:00	opener@email.com	\N	\N
be612704-c26e-48ea-ab9b-19312f03d644	2c8e386b-d1bd-48b3-b73a-12bfa5d00805	note 1	Open	2022-10-03 04:00:00	opener@email.com	\N	\N
\.

--
-- Data for Name: historical_report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historical_report (id, subaccount_id, note_id, report_type, start_date, end_date, image) FROM stdin;
4c027686-5951-43fb-a96b-9d9ccdcbfa52	2c8e386b-d1bd-48b3-b73a-12bfa5d00805	be612704-c26e-48ea-ab9b-19312f03d644	Daily-FeatureFunctionality	230410223122	230410223122	\\x00
4c017683-5951-43ae-c45b-9f4ccfcbfa64	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2bdaf2af-838f-4053-b3fa-ef22aaa10b0d	Daily-FeatureFunctionality	230410223122	230410223122	\\x00
\.

--
-- Data for Name: subaccount_admin_device; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subaccount_admin_device (subaccount_admin_email, device_token) FROM stdin;
test-customer-subaccount-admin@tekvizionlabs.com	" "
test-customer-subaccount-admin@tekvizionlabs.com	cKUMnpi7QDeoMplcjK_Xj_:APA91bFdl5ST1y6dwel2ZsLk-tK7OoEx1PbbN7C6kDxUKzY9ZpHtjWszGWUEDOEn4H7zZfd_xw3MM9VFzN6d1ygpi94YxUecRnKRJL4Mu9aopBjUHYb3RpH4Q-jLasqOKe03C-BN8Te_
\.

--
-- Data for Name: device; Type: TABLE DATA; Schema: public; Owner: -
--
COPY public.device (id, vendor, product, version, type, granularity, tokens_to_consume, start_date, deprecated_date, subaccount_id, support_type) FROM stdin;
7564aab0-5331-4ab5-85f7-e37acbdfd90d	Test	Poly VVX 500	1.0	Device/Phone/ATA	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
be612704-c26e-48ea-ab9b-19312f03d644	Test	Cisco Webex  Windows Client	1.0	Soft Client/UC Client	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
eea27aa4-f2b7-455a-a8ea-af85ee6ac25e	Test	HylaFAX Enterprise	6.2	BYOC	static	0	2022-06-17 15:42:48.550405	infinity	\N	f
3ad3f83e-2654-466d-b9e9-9cd8ded28110	Test	Multitech FAX Finder IP FAX server	5.0	Application	static	0	2022-06-17 15:42:48.550405	infinity	\N	f
34859fba-9987-4a1c-b176-14569b331653	Test	OpenText-Right FAX	20.2	Headset	static	0	2022-06-17 15:42:48.550405	infinity	\N	f
b66edd36-ee7f-42e7-bfb4-41810ea69fe6	Test	Xmedius FAX server	9.0	Video Collab Device (ROW)	static	0	2022-06-17 15:42:48.550405	infinity	\N	f
7f6c9fec-978f-41a6-ba38-117611f0dfa3	Test	Genesys Pure Cloud	1.0.0.10206	Contact Center	static	0	2022-06-17 15:42:48.550405	infinity	\N	f
1ba09c6f-9a2a-4181-ac1e-b7217763df96	Test	Adtran NetVanta Series (7100)	11.10.3	UCaaS	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
0e709699-3dab-47f1-a710-ebd2ae78d57b	Test	Alcatel Lucent OmniPCX/OpenTouch.OXE	12.4	CCaaS	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
ea00b987-0f14-4888-a0ce-f963d1eb7592	Test	Alcatel Lucent OXO	v032/021.001	CPaaS	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
866dbb8d-4e11-47c6-b26b-3ddbdc7e50e6	Test	3CX	18.0.1880	Sandbox	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
\.

--
-- Data for Name: feature_toggle; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feature_toggle (id, status, author, description, name) FROM stdin;
34859fba-9987-4a1c-b176-14569b331653	f	pfernandez@tekvizionlabs.com	Subaccount User Creation For License Service	ad-license-service-user-creation
950f47c7-a477-455b-b65b-331ecacc88dd	f	ogonzalez@tekvizionlabs.com	Customer User Creation	ad-customer-user-creation
d43815a7-8927-4c8d-a75f-49e080493827	f	\N	Notification feature	notificationFeature
df6f5bc2-2687-49df-8dc0-beff88012235	t	\N	Test FT	testFT
e83e94d8-563f-4a06-8aa8-b7bfbaeb7f15	t	vtorrico@tekvizionlabs.com	map 	mapFeature
866dbb8d-4e11-47c6-b26b-3ddbdc7e50e6	t	\N	Historical Native Dashboard for Notes	spotlight-historical-dashboard
be612704-c26e-48ea-ab9b-19312f03d644	t	pfernandez@tekvizionlabs.com	Send Welcome Email to SpotLight customers	welcomeEmail
eea27aa4-f2b7-455a-a8ea-af85ee6ac25e	t	pfernandez@tekvizionlabs.com	Multitenant demo subaccount for UCaaS CT	multitenant-demo-subaccount
\.

--
-- Data for Name: feature_toggle_exception; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.feature_toggle_exception (feature_toggle_id, subaccount_id, status) FROM stdin;
950f47c7-a477-455b-b65b-331ecacc88dd	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	f
df6f5bc2-2687-49df-8dc0-beff88012235	96234b32-32d3-45a4-af26-4c912c0d6a06	f
\.
