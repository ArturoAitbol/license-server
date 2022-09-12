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
f1b695b5-b7d9-4245-86ca-9a2a9ccbe460	Test Subaccount	MSP	f	6826a94e-c4da-46e9-8001-668df24877ec	t
b995ecaa-d64e-4067-90e5-cbc80935d1e0	Test_Subaccount2	MSP	f	6826a94e-c4da-46e9-8001-668df24877ec	t
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
\.


--
-- Data for Name: subaccount; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subaccount (id, name, customer_id) FROM stdin;
f5a609c0-8b70-4a10-9dc8-9536bdb5652c	Test RealCustomer - 360 Small	7d133fd2-8228-44ff-9636-1881f58f2dbb
cebe6542-2032-4398-882e-ffb44ade169d	Test Subaccount2	9f6ff46a-5f19-4bcf-9f66-c5f29b800205
96234b32-32d3-45a4-af26-4c912c0d6a06	Test Subaccount	f1b695b5-b7d9-4245-86ca-9a2a9ccbe460
ac7a78c2-d0b2-4c81-9538-321562d426c7	Default	0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848
069dc3aa-dcb1-45e6-886f-be8f2345080f	Default	0856df81-8d32-4adb-941a-c0d9187f36a7
8acb6997-4d6a-4427-ba2c-7bf463fa08ec	Test Subaccount3	b995ecaa-d64e-4067-90e5-cbc80935d1e0
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
test-customer-subaccount-admin@tekvizionlabs.com	96234b32-32d3-45a4-af26-4c912c0d6a06
test1@tekvizion.com	ac7a78c2-d0b2-4c81-9538-321562d426c7
test2@tekvizion.com	069dc3aa-dcb1-45e6-886f-be8f2345080f
test-customer-subaccount-stakeholder@tekvizionlabs.com	8acb6997-4d6a-4427-ba2c-7bf463fa08ec
\.


--
-- Data for Name: license; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license (id, subaccount_id, start_date, package_type, renewal_date, tokens, device_access_limit, status, description) FROM stdin;
1d1bf1e8-6522-4ab9-956a-864041f890e2	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-07-01 04:00:00	Basic	2022-07-31 04:00:00	55	5000	Active	License1
6524a6ab-b88b-49a8-aee5-624e86e24dcd	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-07-10 04:00:00	Small	2022-07-18 04:00:00	150	5000	Active	License2
b84852d7-0f04-4e9a-855c-7b2f01f61591	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2022-03-14 05:00:00	Small	2023-03-13 05:00:00	150	5000	Active	License3
16f4f014-5bed-4166-b10a-808b2e6655e3	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-08-01 04:00:00	Small	2022-09-30 04:00:00	150	5000	Active	License4
986137d3-063d-4c0e-9b27-85fcf3b3272e	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-07-07 04:00:00	Small	2022-07-12 04:00:00	150	5000	Expired	Expired1
ebc71e49-4f63-44b2-9c90-7750d3ccca05	cebe6542-2032-4398-882e-ffb44ade169d	2022-07-01 04:00:00	Basic	2022-07-31 04:00:00	55	5000	Expired	Expired2
d9cb5f93-c4d0-427e-8133-77905abd8487	96234b32-32d3-45a4-af26-4c912c0d6a06	2021-12-26 04:00:00	Small	2022-01-22 04:00:00	150	5000	Expired	Expired3
\.


--
-- Data for Name: project; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project (id, subaccount_id, code, name, status, open_date, close_date, project_owner, license_id) FROM stdin;
f2b57afb-c389-48ec-a54b-7d8a05a51f32	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	00	app development	Open	2022-03-20 18:30:00	2022-04-20 18:30:00	powner@email.com	b84852d7-0f04-4e9a-855c-7b2f01f61591
2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	01	test 2	Open	2022-03-20 18:30:00	\N	powner@email.com	b84852d7-0f04-4e9a-855c-7b2f01f61591
a42edf7f-9b38-472f-afa3-10a4632acca1	cebe6542-2032-4398-882e-ffb44ade169d	0022	Project 2	Open	2022-08-01 04:00:00	\N	\N	ebc71e49-4f63-44b2-9c90-7750d3ccca05
be612704-c26e-48ea-ab9b-19312f03d644	96234b32-32d3-45a4-af26-4c912c0d6a06	0011	Project 1	Open	2022-07-03 04:00:00	\N	\N	d9cb5f93-c4d0-427e-8133-77905abd8487
\.


--
-- Data for Name: license_consumption; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license_consumption (id, subaccount_id, project_id, consumption_date, usage_type, device_id, tokens_consumed, modified_date, modified_by) FROM stdin;
c323f5f8-cd49-4b0b-ac74-fe2113b658b8	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	2022-07-16 00:00:00	Configuration	d41126e1-53eb-473f-b011-9bd0ac44644a	2	2022-07-18 00:00:00	conf_eng@email.com
9285ca9e-04c3-49df-9d59-085322a13319	cebe6542-2032-4398-882e-ffb44ade169d	a42edf7f-9b38-472f-afa3-10a4632acca1	2022-07-03 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-26 00:00:00	\N
9c0cc4a5-a773-46f3-b73e-a09c55080b1f	96234b32-32d3-45a4-af26-4c912c0d6a06	be612704-c26e-48ea-ab9b-19312f03d644	2021-12-26 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-26 00:00:00	\N
\.


--
-- Data for Name: usage_detail; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usage_detail (id, consumption_id, usage_date, day_of_week, mac_address, serial_number, modified_date, modified_by) FROM stdin;
eea27aa4-f2b7-455a-a8ea-af85ee6ac25e	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-17	1			2022-07-18 00:00:00	conf_eng@email.com
3ad3f83e-2654-466d-b9e9-9cd8ded28110	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-18	2			2022-07-18 00:00:00	conf_eng@email.com
34859fba-9987-4a1c-b176-14569b331653	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-19	3			2022-07-18 00:00:00	conf_eng@email.com
b66edd36-ee7f-42e7-bfb4-41810ea69fe6	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-20	4			2022-07-18 00:00:00	conf_eng@email.com
866dbb8d-4e11-47c6-b26b-3ddbdc7e50e6	9285ca9e-04c3-49df-9d59-085322a13319	2022-07-03	0			\N	\N
1ba09c6f-9a2a-4181-ac1e-b7217763df96	9285ca9e-04c3-49df-9d59-085322a13319	2022-07-07	4			\N	\N
0e709699-3dab-47f1-a710-ebd2ae78d57b	9285ca9e-04c3-49df-9d59-085322a13319	2022-07-08	5			\N	\N
ea00b987-0f14-4888-a0ce-f963d1eb7592	9285ca9e-04c3-49df-9d59-085322a13319	2022-07-09	6			\N	\N
7ab51789-e767-42cc-a9ba-4ab4aef81d1f	9c0cc4a5-a773-46f3-b73e-a09c55080b1f	2021-12-27	1			\N	\N
9f53d1ae-e22d-4c3b-b05d-6bf6b13c0658	9c0cc4a5-a773-46f3-b73e-a09c55080b1f	2021-12-28	2			\N	\N
\.
