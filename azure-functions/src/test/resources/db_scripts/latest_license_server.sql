--
-- PostgreSQL database dump
--

-- Dumped from database version 11.16
-- Dumped by pg_dump version 14.4

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

DROP DATABASE IF EXISTS licenses;
--
-- Name: licenses; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE licenses WITH TEMPLATE = template0 ENCODING = 'UTF8' ;


\connect licenses

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: consumption_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consumption_type_enum AS ENUM (
    'Configuration',
    'AutomationPlatform'
);


--
-- Name: device_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.device_type_enum AS ENUM (
    'PBX',
    'SBC',
    'GATEWAY',
    'PHONE',
    'TRUNK',
    'FAX',
    'CC',
    'UCAAS',
    'CLIENT',
    'CERT',
    'OTHER'
);


--
-- Name: granularity_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.granularity_type_enum AS ENUM (
    'day',
    'week',
    'month',
    'static'
);


--
-- Name: package_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.package_type_enum AS ENUM (
    'Large',
    'Medium',
    'Small',
    'AddOn',
    'Basic',
    'Custom',
    'Trial'
);


--
-- Name: product_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_type_enum AS ENUM (
    'PBX',
    'SBC',
    'Gateway',
    'Phone',
    'trunk',
    'Other'
);


--
-- Name: project_status_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_status_type_enum AS ENUM (
    'Open',
    'Closed'
);


--
-- Name: status_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_type_enum AS ENUM (
    'Active',
    'Inactive',
    'Expired'
);


--
-- Name: usage_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.usage_type_enum AS ENUM (
    'Configuration',
    'AutomationPlatform'
);


SET default_tablespace = '';

--
-- Name: bundle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bundle (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    tokens integer,
    device_access_tokens integer
);


--
-- Name: customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    type character varying,
    tombstone boolean DEFAULT false,
    distributor_id uuid,
    test_customer boolean
);


--
-- Name: customer_admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_admin (
    admin_email character varying NOT NULL,
    customer_id uuid NOT NULL
);


--
-- Name: device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    vendor character varying NOT NULL,
    product character varying NOT NULL,
    version character varying NOT NULL,
    type public.device_type_enum DEFAULT 'OTHER'::public.device_type_enum NOT NULL,
    granularity public.granularity_type_enum DEFAULT 'week'::public.granularity_type_enum NOT NULL,
    tokens_to_consume integer NOT NULL,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deprecated_date timestamp without time zone DEFAULT 'infinity'::timestamp without time zone,
    subaccount_id uuid,
    support_type boolean DEFAULT false
);


--
-- Name: distributor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.distributor (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL
);


--
-- Name: license; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.license (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subaccount_id uuid,
    start_date timestamp without time zone,
    package_type public.package_type_enum DEFAULT 'Small'::public.package_type_enum NOT NULL,
    renewal_date timestamp without time zone,
    tokens integer DEFAULT 0,
    device_access_limit integer DEFAULT 0,
    status public.status_type_enum DEFAULT 'Active'::public.status_type_enum NOT NULL
);


--
-- Name: license_consumption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.license_consumption (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subaccount_id uuid,
    project_id uuid,
    consumption_date timestamp without time zone,
    usage_type public.usage_type_enum DEFAULT 'Configuration'::public.usage_type_enum NOT NULL,
    device_id uuid,
    tokens_consumed integer DEFAULT 0 NOT NULL,
    modified_date timestamp without time zone
);


--
-- Name: project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subaccount_id uuid,
    code character varying DEFAULT 0,
    name character varying NOT NULL,
    status public.project_status_type_enum DEFAULT 'Open'::public.project_status_type_enum NOT NULL,
    open_date timestamp without time zone,
    close_date timestamp without time zone
);


--
-- Name: subaccount; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subaccount (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    customer_id uuid
);


--
-- Name: subaccount_admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subaccount_admin (
    subaccount_admin_email character varying NOT NULL,
    subaccount_id uuid NOT NULL
);


--
-- Name: usage_detail; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_detail (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    consumption_id uuid NOT NULL,
    usage_date date NOT NULL,
    day_of_week smallint,
    mac_address character varying,
    serial_number character varying
);


--
-- Data for Name: bundle; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bundle (id, name, tokens, device_access_tokens) FROM stdin;
bf219b3a-5bb9-417d-bc02-7b8cb659059d	Basic	55	5000
96b57c0b-ebbf-4e1a-8881-3052a28c0827	Small	150	5000
874929e5-a1b3-47dd-a683-93ad417a586f	Medium	300	10000
a0273d73-eff5-42d3-a5b0-28b2c2fcc264	Large	500	20000
26fbe6a2-fe72-4c1e-9728-b1777038b9c8	Custom	\N	\N
fe6999a0-e235-4b0e-b2cb-092589d03f46	AddOn	20	0
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer (id, name, type, tombstone, distributor_id, test_customer) FROM stdin;
467aee0e-0cc8-4822-9789-fc90acea0a04	TestV3	MSP	f	\N	t
aa85399d-1ce9-425d-9df7-d6e8a8baaec2	Amazon	MSP	f	\N	f
10382e3e-ab62-475a-ab52-c0bdce40a628	BNSF	MSP	f	\N	f
1afd856d-003e-4bdc-b214-78d0a7b927f2	test-0017	MSP	f	\N	t
5cc24582-343c-4687-9af8-be25859afe45	new test customer s	Reseller	f	\N	t
b5ce9ce7-9532-4671-9491-61a234311b70	Cisco	MSP	f	\N	f
0856df81-8d32-4adb-941a-c0d9187f36a7	Delete test customer	MSP	f	\N	t
c4716775-bad0-4eee-8f77-e14f878c0320	Crestron	MSP	f	\N	f
6b5f9f5e-f33e-48a4-9345-f76e2c463550	Grandstream	MSP	f	\N	f
ce3619a6-7af2-4967-8c7b-dd605939ef60	IPC	MSP	f	\N	f
e01441a8-6589-4a10-a71e-fa6aeb0a98e3	ISI	MSP	f	\N	f
ae0a4bcb-1a40-445d-9be1-56baaf8e6ae1	Lifesize	MSP	f	\N	f
368b487c-bdd8-491c-8a1c-00a688a80da5	Lumen	MSP	f	\N	f
7d133fd2-8228-44ff-9636-1881f58f2dbb	Martello	MSP	f	\N	f
958b4b42-02de-40a2-ae35-cd343c0a0df5	Masergy	MSP	f	\N	f
7d0c7b21-faad-4925-9844-77c06b78b8d6	MetTel	MSP	f	\N	f
9b401d46-4e03-4a5f-9729-71adac5bd1a7	Neustar	MSP	f	\N	f
4d460c28-eeee-402b-9a8c-6be8f86daac8	Nexon	MSP	f	\N	f
0ecea4ac-1322-46b0-bc98-1d215c86f5a3	NFON	MSP	f	\N	f
1d7492f7-6626-47c1-9d43-621f2bc820ee	Nokia Siemens Networks	MSP	f	\N	f
82a5c1f0-cd88-437f-880d-0e22a70edf8c	PCCW	MSP	f	\N	f
8a5ece98-41ca-433f-bd8c-4f5f7c253707	Peerless	MSP	f	\N	f
7ebd6e00-a59a-4704-858c-d889cb698761	Poly	MSP	f	\N	f
875f3b42-1e49-412b-9c68-014b1294ee2d	Ribbon	MSP	f	\N	f
d74b9e6f-63f2-456f-ab1c-3d993c93161c	Tele2	MSP	f	\N	f
20a00e47-464f-4ff3-ba01-5269170d38ac	T-Mobile / Sprint	MSP	f	\N	f
07c35ff3-f418-41f7-918a-f90c18052baa	VodafoneZiggo	MSP	f	\N	f
821f079f-be9f-4b11-b364-4f9652c581ce	Vonage	MSP	f	\N	f
19660f52-4f35-489d-ae44-80161cbb7bd4	Customer Test S	Reseller	f	\N	t
054ff4d5-efee-4987-8695-30e1d2cbd070	Bell Canada	MSP	f	\N	f
7749f42c-8c75-4c5e-b0c1-d937dae7c009	British Telecom	MSP	f	\N	f
926cc793-3526-4879-8966-3aa55ffb724f	Charter	MSP	f	\N	f
19dd9b4b-a1f0-4f29-b9c3-37de53f57ff5	Integrated Research (IR)	MSP	f	\N	f
8123b86f-7147-411c-b2ba-5967f75ce913	EvolveIP	MSP	f	\N	f
7a0d26a4-93c5-4c4d-b1f6-5574ea13a5ff	EPOS Group A/S	MSP	f	\N	f
91d70b2f-d201-4177-8704-2a03a37d2e46	Cox Communications	MSP	f	\N	f
7ef34527-4b22-47e5-ae82-ec75aef3fb75	Consolidated	MSP	f	\N	f
aed14150-7807-425e-b858-50e1b5f15e9e	Cloud9 Technologies	MSP	f	\N	f
38e2e282-c33d-4fa6-991a-38dcbb7eb080	AVCtechnologies (Kandy)	MSP	f	\N	f
f3959479-8ad1-4847-9d4b-77eae2d1e58c	Customer S new	MSP	f	\N	t
371c89cd-5ac2-4118-86c8-f5c15fa28358	Avaya	MSP	f	\N	f
fdadbc12-268e-4aa9-bfb8-1fe3d093cebc	AudioCodes	MSP	f	\N	f
3bd6ed9a-8b7b-4946-87b5-1cd9f51cc1c1	Alianza	MSP	f	\N	f
26898de8-7305-471f-9f11-01ca725ac20b	testCustomerDemo	MSP	f	\N	t
64434b64-0f13-41a8-8c03-9ecd723e0d12	Mutare	MSP	f	\N	f
55bfa01c-b790-473f-8c24-960f251912b9	CBTS	MSP	f	\N	f
0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848	Test Customer	MSP	f	\N	t
740162ed-3abe-4f89-89ef-452e3c0787e2	Rodrigo Test	MSP	f	\N	t
b5ed914e-98f4-4102-8ce7-a73e1990dff0	TestV5	MSP	t	\N	t
c30ba7a8-03bf-45d2-a795-b739acb469f8	ZDelete this customer	MSP	t	\N	f
06f808dd-0ecc-40dd-b98a-c6a1c5dda4fa	TestV6	MSP	t	\N	t
0ed27fc6-16f7-441e-9a2c-93e6eb5a7d10	DEMO Real Customer	MSP	t	\N	f
24f63557-5a4e-46ae-8ef7-d5c0b1767a8a	testdemo	MSP	f	\N	f
4a095621-5dea-4c68-91dd-705012e92a53	Logitech	MSP	f	\N	f
79f4f8b5-d9e9-e611-8101-3863bb3c7738	Access4	MSP	f	\N	t
58223065-c200-4f6b-be1a-1579b4eb4971	2Degrees	MSP	f	\N	t
27c7c1a3-c68b-e811-816b-e0071b72c711	Developer Account	MSP	f	\N	t
4862fa5a-d8da-49f5-800a-b72ea0ae2d95	Test Customer v1	MSP	f	\N	t
157fdef0-c28e-4764-9023-75c06daad09d	testV2	MSP	f	\N	t
\.


--
-- Data for Name: customer_admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_admin (admin_email, customer_id) FROM stdin;
rajkamal@tekvizion.com	19dd9b4b-a1f0-4f29-b9c3-37de53f57ff5
samuelvs667+8@gmail.com	c30ba7a8-03bf-45d2-a795-b739acb469f8
skanniyappan@tekvizion.com	64434b64-0f13-41a8-8c03-9ecd723e0d12
kmukkamala@tekvizion.com	371c89cd-5ac2-4118-86c8-f5c15fa28358
skumar@tekvizion.com	3bd6ed9a-8b7b-4946-87b5-1cd9f51cc1c1
simmanuel@tekvizion.com	aa85399d-1ce9-425d-9df7-d6e8a8baaec2
jalphin@tekvizion.com	fdadbc12-268e-4aa9-bfb8-1fe3d093cebc
dmeredith@tekvizion.com	054ff4d5-efee-4987-8695-30e1d2cbd070
jalphin+1@tekvizion.com	38e2e282-c33d-4fa6-991a-38dcbb7eb080
dmeredith+1@tekvizion.com	10382e3e-ab62-475a-ab52-c0bdce40a628
dmeredith+2@tekvizion.com	7749f42c-8c75-4c5e-b0c1-d937dae7c009
dmeredith+3@tekvizion.com	55bfa01c-b790-473f-8c24-960f251912b9
svalayanantham@tekvizion.com	926cc793-3526-4879-8966-3aa55ffb724f
skumar+1@tekvizion.com	b5ce9ce7-9532-4671-9491-61a234311b70
skumar+2@tekvizion.com	aed14150-7807-425e-b858-50e1b5f15e9e
skumar+3@tekvizion.com	7ef34527-4b22-47e5-ae82-ec75aef3fb75
dmadiyan@tekvizion.com	91d70b2f-d201-4177-8704-2a03a37d2e46
skadiyala@tekvizion.com	c4716775-bad0-4eee-8f77-e14f878c0320
rviswanathan+1@tekvizion.com	7a0d26a4-93c5-4c4d-b1f6-5574ea13a5ff
skumar+4@tekvizion.com	8123b86f-7147-411c-b2ba-5967f75ce913
skanniyappan+1@tekvizion.com	6b5f9f5e-f33e-48a4-9345-f76e2c463550
rweber@tekvizion.com	ce3619a6-7af2-4967-8c7b-dd605939ef60
svalayanantham+1@tekvizion.com	e01441a8-6589-4a10-a71e-fa6aeb0a98e3
jalphin+2@tekvizion.com	ae0a4bcb-1a40-445d-9be1-56baaf8e6ae1
skadiyala+2@tekvizion.com	4a095621-5dea-4c68-91dd-705012e92a53
skadiyala+3@tekvizion.com	368b487c-bdd8-491c-8a1c-00a688a80da5
rajkamal+2@tekvizion.com	7d133fd2-8228-44ff-9636-1881f58f2dbb
aguajardo@tekvizion.com	958b4b42-02de-40a2-ae35-cd343c0a0df5
dmeredith+4@tekvizion.com	7d0c7b21-faad-4925-9844-77c06b78b8d6
simmanuel+1@tekvizion.com	9b401d46-4e03-4a5f-9729-71adac5bd1a7
cpoornachandran@tekvizion.com	4d460c28-eeee-402b-9a8c-6be8f86daac8
cpoornachandran+1@tekvizion.com	0ecea4ac-1322-46b0-bc98-1d215c86f5a3
dmadiyan+1@tekvizion.com	1d7492f7-6626-47c1-9d43-621f2bc820ee
cpoornachandran+2@tekvizion.com	82a5c1f0-cd88-437f-880d-0e22a70edf8c
dmeredith+5@tekvizion.com	8a5ece98-41ca-433f-bd8c-4f5f7c253707
skadiyala+4@tekvizion.com	7ebd6e00-a59a-4704-858c-d889cb698761
jalphin+4@tekvizion.com	875f3b42-1e49-412b-9c68-014b1294ee2d
cpoornachandran+3@tekvizion.com	d74b9e6f-63f2-456f-ab1c-3d993c93161c
dmadiyan+2@tekvizion.com	20a00e47-464f-4ff3-ba01-5269170d38ac
skanniyappan+2@tekvizion.com	07c35ff3-f418-41f7-918a-f90c18052baa
dmeredith+6@tekvizion.com	821f079f-be9f-4b11-b364-4f9652c581ce
TestDemoR@gmail.com	24f63557-5a4e-46ae-8ef7-d5c0b1767a8a
samuelvs667@gmail.com	19660f52-4f35-489d-ae44-80161cbb7bd4
samuel-vs6+1@hotmail.com	f3959479-8ad1-4847-9d4b-77eae2d1e58c
test-customer-full-admin@tekvizionlabs.com	0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848
sravraksh@outlook.com	27c7c1a3-c68b-e811-816b-e0071b72c711
Nic.Romaniuk @2degrees.nz	58223065-c200-4f6b-be1a-1579b4eb4971
testCostumerv1@example.com	4862fa5a-d8da-49f5-800a-b72ea0ae2d95
victor@tekv.com	467aee0e-0cc8-4822-9789-fc90acea0a04
v2@test.com	b5ed914e-98f4-4102-8ce7-a73e1990dff0
testv2@h.com	157fdef0-c28e-4764-9023-75c06daad09d
samuelvs667+3@gmail.com	5cc24582-343c-4687-9af8-be25859afe45
samuel-vs6+5@hotmail.com	0856df81-8d32-4adb-941a-c0d9187f36a7
TestCustomerDemo@gmail.com	26898de8-7305-471f-9f11-01ca725ac20b
samuelvs667+4@gmail.com	0ed27fc6-16f7-441e-9a2c-93e6eb5a7d10
test-0017@test.com	1afd856d-003e-4bdc-b214-78d0a7b927f2
rodrigotest@test.com	740162ed-3abe-4f89-89ef-452e3c0787e2
vtest4@tek.com	06f808dd-0ecc-40dd-b98a-c6a1c5dda4fa
stan.chizhevskiy@access4.com.au	79f4f8b5-d9e9-e611-8101-3863bb3c7738
\.


--
-- Data for Name: device; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.device (id, vendor, product, version, type, granularity, tokens_to_consume, start_date, deprecated_date, subaccount_id, support_type) FROM stdin;
c49a3148-1e74-4090-9876-d062011d9bcb	HylaFAX	HylaFAX Enterprise	6.2	FAX	static	0	2022-06-17 15:42:48.550405	infinity	\N	t
936662a7-febd-4cbf-bc58-477e5d5a9d10	Multitech	Multitech FAX Finder IP FAX server	5.0	FAX	static	0	2022-06-17 15:42:48.550405	infinity	\N	t
9ba1f445-28da-4e36-907c-6864c98b6928	Opentext	OpenText--Right FAX	20.2	FAX	static	0	2022-06-17 15:42:48.550405	infinity	\N	t
59525742-7133-4be5-9399-a111be7664cb	Xmedius	Xmedius FAX server	9.0	FAX	static	0	2022-06-17 15:42:48.550405	infinity	\N	t
422c2998-4553-4d5c-81f3-6e29b66c8788	Genesys	Genesys Pure Cloud	1.0.0.10206	CC	static	0	2022-06-17 15:42:48.550405	infinity	\N	t
ef7a4bcd-fc3f-4f87-bf87-ae934799690b	3CX	3CX	18.0.1880	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
f6bded44-d753-4035-85d6-064dfd096471	Adtran	Adtran NetVanta Series (7100)	11.10.3	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
06e9720c-b7b7-4124-b67a-5332dfe116f8	Alcatel Lucent	Alcatel Lucent OmniPCX/OpenTouch.OXE	12.4	PBX	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
389ef7a2-ca9e-44de-ac6f-61bb00034b87	Alcatel Lucent	Alcatel Lucent OXO	v032/021.001	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
51fc2c47-b066-46f2-a613-93c350da9869	Allworx	Connect 530	9.0.4.7	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
430db5b6-fed1-4d27-91f8-09387e4852e8	Allworx	Allworx	6x (12x, 24x, 48x)	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
31301ccd-bcdc-42b5-bb09-ecf56a5eb83a	Altigen	Altigen	9	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
198c4a3c-8e17-4c3b-a99c-92a8ea3fa74d	Asterisk	Asterisk (CLI)	16.13.0	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
040c8ab8-fa9d-4f0b-9695-bb42df4dd92a	Asterisk	Asterisk FreePBX GUI	17.9.1	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
78027528-725b-4a14-a69d-dbbdbce43500	Avaya	CS1000/CS1K	7.6	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
bf1493e4-90df-47ed-9bba-fbc72f9eb981	Avaya	Avaya Aura with Avaya ESBC	7.1.3.1	PBX	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
b250dfb3-76b1-4851-87d8-9f2daf56c4fd	Avaya	Avaya Aura with Avaya ESBC	8.1.3.2.813207	PBX	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
cd66ec04-ad2e-413f-bec3-a3560a477102	Avaya	Avaya Aura with Avaya ESBC	10.1	PBX	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
4c66a5a9-3321-4f06-af8d-6874aa0d0d2f	Avaya	IP Office v2	11.1.0 Build 95	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
051f24c7-1a38-4ba7-9f30-40ff4b79141b	Avaya	IP Office v1	9	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
f500558a-d6d5-4518-9869-63b7f7fd2eff	Broadsoft	Broadsoft	22	PBX	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
5d371899-3557-4f4a-b7ab-a4fd7c6a8851	Broadsoft	Broadsoft	23	PBX	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
10544264-fce2-4d7f-9d0b-ba7049ffe882	Broadsoft	Broadsoft	24	PBX	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
1922a5fb-228c-4a90-b2d3-ec517d7a3f9a	Cisco	Unified Call Manager System	12.5	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
21a8e70d-bfe7-4080-8540-4535ed0708ad	Cisco	Unified Call Manager System	14	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
758cb7e6-9924-4042-a393-f9d056a9f71c	Cisco	Unified Call Manager System	14.0.1.11900-132	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
d41126e1-53eb-473f-b011-9bd0ac44644a	Cisco	Call Manager Express	14.1	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
44abfe81-595b-4ebe-9835-4dc841fb31b9	Cisco	Contact Center Enterprise (UCCE)	12.6	CC	week	7	2022-06-17 15:42:48.550405	infinity	\N	f
f59825ce-8949-4e33-aba9-6eaa27a9de73	Cisco	Contact Center Express (UCCX)	12.5	CC	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
0d9e7ef9-53d1-4c33-a52b-b4c7ecad206e	Elastix	Elastix	2.5.0	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
70f3e917-4553-445a-89fd-45bca45ae075	Epygi	QX50	6.3.39	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
3c515e47-f724-4115-be31-55a6e67c44db	Ericcson LG	eMG80	2.2.18	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
416e91f1-5c02-489c-b971-48c305751cfc	ESI	Communications Server 50/100/200/600/1000	12.5.55.30	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
4256dda3-6ceb-4e7d-9bbf-76509b19be42	Fonality	Business Phone System	14	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
df960781-3e91-4395-98b3-6fcb5b8931aa	Fortinet	FortiVoice FVE	20E2 5.3.3	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
d0fd50bd-8000-43a2-9aa8-b0fb5ead7116	FreePBX	FreePBX	15.0.17.34	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
68829841-1a6a-40db-91f4-262e496e1b08	Grandstream	UCM 6510 (61xx,62xx,6510)	1.0.19.27	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
5d01b0e3-aa05-4163-98e6-2bb76d53ca22	Grandstream	UCM 6208 (61xx,62xx,6510)	1.0.19.21	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
3680544b-f3b5-411f-87a1-e22b9ffd5373	Grandstream	UCM 6308	1.0.15.10	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
12a3ce3f-3e58-4233-9e0a-f859558ec819	Genesys	Pure Cloud	1.0.0.10206	PBX	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
ac4600ac-27d0-4e1e-8af6-99121e55a2d1	Genesys	Pure Connect 2019	R1	PBX	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
2864d6c9-4752-4887-a35a-28c84ad6dc1f	Genesys	Pure Connect 2020	R3	PBX	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
72a37d08-2415-4113-928f-e035b43924f0	Genesys	Pure Engage	8.5	CC	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
c8018652-85e1-492b-8f5c-11d43a3e1c28	Innova	Innovaphone	13r1 sr21 (13.2678)	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
7997ca23-288e-4e38-ac2a-4f4be6255759	IPC Systems	Unigy	5.2	PBX	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
e427697c-ba19-44dc-8c91-6b41dcf1d73c	IPC Systems	Unigy	04.03.00.02.0018	PBX	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
cc56dffb-50ed-4b8b-9c0d-757e71c28069	Ipitomy	IP1200	5.1.1	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
c676902a-59b1-49db-9c0a-1cf3514a7dd7	Microsoft	Skype for Business 2015	6.0.9319.562	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
7da90420-95ba-4fe9-9572-4a7ade186ddf	Microsoft	Skype for Business 2019	7.0.2046.123	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
13937da3-98ec-48c1-a970-36dc335d566c	Microsoft	Teams	1.4.00.35564 (64-bit)	UCAAS	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
3baa5c29-f94d-4281-83b0-d705c2e2f5ad	Mitel	MiVoice Business (MiVB)	9.3  SP2(9.3.0.19)	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
eb788769-3bbd-471b-9b90-d14e61658731	Mitel	MiVoice Business (MiVB)	8.0 SP3 PR3	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
6d05cf7b-fc29-4bd6-8cb0-0b3222d97925	Mitel	MiVoice Business ISS	9.1 SP1 PR1	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
e0661dde-4149-486e-9fd6-3bc3465a4586	Mitel	MiVoice Business Virtual	9.1 SP1 PR2	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
f2cd6098-be9e-4d6e-a059-e9070c1222ca	Mitel	MiVoice Office 250 Phone System	6.3 SP2	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
7daa94c7-4a9e-4626-b187-7009c4708be9	Mitel	MiVoice Office 250 Phone System	6.3 SP4	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
fd2b9b81-5a40-4138-91cf-726d286108f4	Mitel	MX-ONE	7.3	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
8db87069-4c56-4613-9617-b79abb92edcb	Mitel	MiVoice Office 400	6.2	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
c757df36-6436-4b43-9a53-bbfa5a6e7e0e	NEC	Univerge 3C	10.0.0.14	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
30f53bfd-fe18-4d65-97f7-d7c8fa292290	NEC	SL1100	7	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
cf6a9efe-14a9-4a3f-a5bc-62279faf246e	NEC	SL2100	2.00.00	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
696c7bb9-6b30-430f-afc1-3e8c0005eda3	NEC	SV9100 (EMEA)	11.00.52	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
a1c18609-c6d9-4103-b0b6-e43a7fc8a4c9	NEC	SV9100 (US)	10.50.52	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
fb097454-2103-4998-818e-8dee0b8c83da	CICDTest	CICDTest1658153467	1.0	OTHER	week	1	2022-07-18 14:11:06.675	infinity	\N	t
8cefdb4e-2f5d-4f4d-af35-9c0c4a76a3bc	NEC	SV9300	6.1.3	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
5d60af1b-3508-4fed-ab2b-53ee81b7582a	NEC	SV9500	5.01.00	PBX	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
755955b7-4100-4328-9f6e-7038b92e4a02	Panasonic	KX-NS700	v007.00138	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
800c5b76-a6dd-424f-b46a-3b9273867572	Panasonic	KX-NS1000	v8.00055	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
faf781f0-5c43-48fd-9d93-5b1f2e2cf0e0	Panasonic	TDE	8.0.1.21	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
4119fcd9-b40f-40a1-9d72-0d6f84db04b2	Samsung	OfficeServ 7100	5.0.3	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
dab969fe-2af9-40f9-92e5-8868e9e9a615	Mitel	(ShoreTel) Director 14.2 with Ingate SIParator	19.50.1000	PBX	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
a17f273b-3b0e-47ac-b489-c3a2729e93c3	Mitel	(ShoreTel) Connect ONSITE	22.11.9300	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
acd2d83f-b0c4-4a58-8854-8112170e629b	Mitel	(Toshiba) IPedge EP	1.7.4.110	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
4ae11b75-a3c9-463e-82e4-b0953dc7a72b	Mitel	(Toshiba) CIX200	AR5.20 MT078.00	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
dbf8dd2d-8001-4551-ad7f-bde0110a8993	Sangoma	Switchvox SMB (Asterisk Business Edition)	7.7	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
256d270e-c036-4504-a9d0-1a45320d0e60	Sangoma	Switchvox	7.5.1	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
68a91704-2194-4486-89d5-ca7fac897f39	Unify	OpenScape Business	v 3.0 R0.0.0_157	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
41740b2c-46c8-48bb-b1aa-75c06fe6e622	Unify	OpenScape Voice/OpenScape SBC	v10.R14.0	PBX	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
9b9e79f7-fb62-47de-aa9f-5d4d9616604d	Vertical	Summit	4.0.14	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
a1dd5a7f-58b4-442f-ba8e-3b1b927c4826	Vertical	Wave IP 500/2500	ISM 7.0.0 (6336)	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
40ccfa3d-95dc-4f3b-9d8e-651a8602b862	YeaStar	S20	30.14.0.127	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
b93b5634-4f2f-4b81-8e25-36f712eb507b	Zultys	MX250	17.0.6	PBX	week	2	2022-06-17 15:42:48.550405	infinity	\N	f
d28cf7d0-d5a8-4f8f-9002-ea40e8d2964a	Zoom	Zoom	5.9.3 (3169)	UCAAS	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
6caa7a2b-2d73-43f7-ad50-1df1fca3c768	tekVizion	Additional Virtual Machine	1.0	OTHER	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
5a6fbb8b-f524-4cc8-9c45-3efcc9b0cde0	tekVizion	SIP Trunk Testing Engagement	1.0	OTHER	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
eeff2eac-c1cc-47a1-a628-eb1a59dd5897	tekVizion	Generic Device Test	1.0	OTHER	week	3	2022-06-17 15:42:48.550405	infinity	\N	f
f36b9ca3-21cd-4ce6-b6ad-de9346d9e2e6	tekVizion	Automation Platform Buildout	1.0	OTHER	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
c00c9330-78af-420b-a46a-c760888dac0f	tekVizion	Automation Platform - Poly VVX 500	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
a2c7a5f3-0a41-42c9-9e91-4eedf83d05d8	tekVizion	Automation Platform - Poly VVX 501	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
170993e7-c20d-4287-a692-5edeacfafb66	tekVizion	Automation Platform - Poly VVX 600	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
37bbe10b-6d59-4a7e-9256-8533e96548c0	tekVizion	Automation Platform - Poly VVX 601	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
3fa35211-a786-4a19-b8d2-338cbd6c5a34	tekVizion	Automation Platform - Poly VVX 150	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
3491d1d9-9c4c-43af-80d3-07a39c726bef	tekVizion	Automation Platform - Poly VVX 250	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
06951165-3104-4030-8313-7dd84b6cf44e	tekVizion	Automation Platform - Poly VVX 301	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
3a5305a3-bea5-4d96-aad1-700a830a35cf	tekVizion	Automation Platform - Poly VVX 311	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
82842657-2083-495f-a2b9-b3112bba99c6	tekVizion	Automation Platform - Poly VVX 310	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
60859e7d-a5b5-4287-bfcd-a68933a69dd2	tekVizion	Automation Platform - Poly VVX 350	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
c23acc9d-fa4f-4b00-b280-1f6875b5d25c	tekVizion	Automation Platform - Poly VVX 401	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
49b75ed9-dc88-4896-b13d-7cecb8db3cc8	tekVizion	Automation Platform - Poly VVX 410	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
6a163fed-29ad-4bd6-b39c-0ea5ad685c32	tekVizion	Automation Platform - Poly VVX 411	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
2724e023-0771-46fd-9877-df8031bcc943	tekVizion	Automation Platform - Poly VVX 450	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
cf5d7697-acbe-4151-82fe-0f023cba4c02	tekVizion	Automation Platform - Poly CCX 400	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
a5d88d28-0a5b-4c63-abc7-406b8954aa2e	tekVizion	Automation Platform - Poly CCX 500	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
f1eb11e4-716a-43b7-ba12-44911ed2761d	tekVizion	Automation Platform - Poly CCX 600	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
e0b8d726-f29f-4f7d-9094-5332abf69154	tekVizion	Automation Platform - Poly CCX 700	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
99416e12-6397-4854-9621-66fb8cbe9b1a	tekVizion	Automation Platform - Yealink T41S	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
02003f23-172f-4342-b408-1d51f6244138	tekVizion	Automation Platform - Yealink T42S	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
87bcb645-f0bc-4d14-9dab-8f9571b6066d	tekVizion	Automation Platform - Yealink T46S	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
e7c14435-aa6a-43f7-acae-6a38949be464	tekVizion	Automation Platform - Yealink T48S	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
c89fd8fb-d052-458f-876e-657c420d2da2	tekVizion	Automation Platform - Yealink T53	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
56e1dc8f-0b83-4a54-85c3-9667f14446e5	tekVizion	Automation Platform - Yealink T53W	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
96797bc4-836e-4014-b47b-2a23ef324090	tekVizion	Automation Platform - Yealink T54W	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
d73ebb72-d743-4f00-b4be-5e530abbaa52	tekVizion	Automation Platform - Yealink T57W	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
0e5b27e9-ac1d-4e6d-8229-ce7584d23071	tekVizion	Automation Platform - Yealink T58V	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
e3f108c1-99ef-4591-a67f-4e8339985232	tekVizion	Automation Platform - Yealink T56A	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
d89c0674-d86c-4ff4-b26a-c6bc0c9a4a76	tekVizion	Automation Platform - Yealink VP59	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
db0b90f3-eba3-4ba3-baf5-6026790ab351	tekVizion	Automation Platform - Yealink TX3P	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
7d34296e-6cfb-44a7-97f5-56f28f866952	tekVizion	Automation Platform - Yealink T3XG	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
f87b1602-45bf-4768-8020-2540ed8117be	tekVizion	Automation Platform - Yealink T4XU	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
c2143d34-e1f5-4a30-823e-c3bc1e3bc492	tekVizion	Automation Platform - Cisco MPP 68XX Series	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
c4981c1a-7b14-4480-bb31-b714aaf0da1d	tekVizion	Automation Platform - Cisco MPP 78XX Series	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
334e8efc-5a47-4d15-88c3-94382200bcee	tekVizion	Automation Platform - Cisco MPP 88XX Series	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
d7a9d0c9-4e61-42a1-8878-6b37507b16ca	tekVizion	Automation Platform - Grandstream Device	1.0	PHONE	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
07d3a9d9-29bb-4e97-a707-73629e1b3878	tekVizion	Automation Platform - Cisco Webex  Windows Client	1.0	CLIENT	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
7941eb1f-e6be-42d3-b7f3-6cb4c2adf630	tekVizion	Automation Platform - Cisco Webex MacOS Client	1.0	CLIENT	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
c4d2ad1f-edb6-45cc-8a36-554d7befc387	tekVizion	Automation Platform - Cisco Webex Android Client	1.0	CLIENT	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
a93cce41-060f-42ad-b26b-e5fe785f1aba	tekVizion	Automation Platform - Cisco Webex iOS Client	1.0	CLIENT	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
fcd53f06-d0e0-458c-84d2-8d24c44be05e	tekVizion	Automation Platform - Microsoft Teams Windows Client	1.0	CLIENT	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
25184968-a1fd-40c5-aec4-39926ac32ed4	tekVizion	Automation Platform - Microsoft Teams MacOS Client	1.0	CLIENT	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
70686919-4dc9-4e47-a77d-d08a2fd0686c	tekVizion	Automation Platform - Microsoft Teams Android Client	1.0	CLIENT	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
91fef618-d5ed-4f65-b0d9-8abba48d7d84	tekVizion	Automation Platform - Microsoft Teams iOS Client	1.0	CLIENT	static	15	2022-06-17 15:42:48.550405	infinity	\N	f
6890a1e1-91d0-4206-a83f-1462f59dd022	tekVizion	BroadWorks R22 Sandbox - US	R22	OTHER	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
1029ab70-585d-4a18-95fd-ba4eff3513a4	tekVizion	BroadWorks R23 Sandbox - US	R23	OTHER	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
59b4ed63-b12d-405b-96b7-bb20b8ae3ef3	tekVizion	BroadWorks R24 Sandbox - US	R24	OTHER	week	4	2022-06-17 15:42:48.550405	infinity	\N	f
d9776f8c-4104-404f-8b87-94e3c2231703	tekVizion	BroadWorks R22 Sandbox - ROW	R22	OTHER	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
d43dbc32-0e45-442d-83fa-ec4f5f612276	tekVizion	BroadWorks R23 Sandbox - ROW	R23	OTHER	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
1baf474f-6148-4358-8fd5-5c99ff453dcd	tekVizion	BroadWorks R24 Sandbox - ROW	R24	OTHER	week	5	2022-06-17 15:42:48.550405	infinity	\N	f
13f9c9ca-081a-428a-96b7-d95e4721b59e	tekVizion	Amazon Chime - Bluetooth Headset Certification  (MAC OS X / Windows / IOS / Android)	1.0	CERT	static	8	2022-06-17 15:42:48.550405	infinity	\N	f
a9d16e85-f422-4608-878f-81858766ea22	tekVizion	Amazon Chime - USB Headset Certification (MAC OS X / Windows)	1.0	CERT	static	4	2022-06-17 15:42:48.550405	infinity	\N	f
257255ce-0dd1-4753-8964-e2b146f99249	tekVizion	Amazon Chime -Web Camera	1.0	CERT	static	6	2022-06-17 15:42:48.550405	infinity	\N	f
a8f17078-39f4-44d1-8262-7c667be5ad61	tekVizion	Cisco WebEx Calling SBC	1.0	CERT	static	19	2022-06-17 15:42:48.550405	infinity	\N	f
d248bb60-426f-4566-aac5-b30f88dc57f8	tekVizion	Cisco BroadWorks PCG Revision: Administration Fee	1.0	CERT	static	2	2022-06-17 15:42:48.550405	infinity	\N	f
737411a0-9b6c-4eb8-aa3f-e20ee3a4ad71	tekVizion	Cisco BroadWorks - Concierge - Application	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
e42cabf9-112e-4074-b7bd-a1ec0dbedca6	tekVizion	Cisco BroadWorks - Concierge - GS/SBC	1.0	CERT	static	12	2022-06-17 15:42:48.550405	infinity	\N	f
c8f1f6c7-d2f2-4d5b-9dfc-645a0c7c8a6f	tekVizion	Cisco BroadWorks - Concierge - Phone/EP	1.0	CERT	static	17	2022-06-17 15:42:48.550405	infinity	\N	f
cebdac9d-9a06-412e-a605-0527874cef4e	tekVizion	Cisco BroadWorks - Self Test Review	1.0	CERT	static	6	2022-06-17 15:42:48.550405	infinity	\N	f
6072f1cf-39e0-455d-8e6a-9a3f7dce661e	tekVizion	Cisco CMS Certification - Any Application	1.0	CERT	static	14	2022-06-17 15:42:48.550405	infinity	\N	f
fe46a845-3d71-478b-8d28-8adff077ae69	tekVizion	Cisco CUCM - Agent Desktop Application	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
7bf5504f-ffd8-44dd-bf9a-20514630e4c3	tekVizion	Cisco CUCM - Attendant Console	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
acd1b888-2ed0-4f33-b385-337b3fb373b8	tekVizion	Cisco CUCM - Call Accounting and Billing	1.0	CERT	static	8	2022-06-17 15:42:48.550405	infinity	\N	f
170937a1-7bc5-4ec9-ab7d-19012c1ad891	tekVizion	Cisco CUCM - Call Recording	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
79ee6685-2e81-47fe-8779-433edb6984c8	tekVizion	Cisco CUCM - Device Interop	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
416ffd9f-e152-44bd-8f24-cd40b198691a	tekVizion	Cisco CUCM - E911 Applications	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
627304b2-a2bd-46af-87e4-ecfe019f33e8	tekVizion	Cisco CUCM - FAX	1.0	CERT	static	7	2022-06-17 15:42:48.550405	infinity	\N	f
be01e578-5882-453d-8f69-d60fac780e08	tekVizion	Cisco CUCM - Hospitality Application	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
0e8b3d17-6e6b-4b13-94eb-dc7dce205a5f	tekVizion	Cisco CUCM - IVR Voice	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
88bf136d-5945-4a9a-a3f6-a42aaedf0bcf	tekVizion	Cisco CUCM - Monitoring	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
4cdfc3c5-7553-4857-82a4-913f1433853e	tekVizion	Cisco CUCM - Partner Contact Center	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
2c042670-4585-4d35-a82d-5627c39f41f8	tekVizion	Cisco CUCM - Phone Application	1.0	CERT	static	7	2022-06-17 15:42:48.550405	infinity	\N	f
b70547e3-a863-4d47-96dc-1331d6555d59	tekVizion	Cisco CUCM - Provisioning and Management	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
bbceec2a-ba4b-4fd5-9de2-460eda39199b	tekVizion	Cisco CVP Certification - Any Application	1.0	CERT	static	17	2022-06-17 15:42:48.550405	infinity	\N	f
19eff8d5-cd38-49b3-8b54-84fcebe07ab6	tekVizion	Cisco End Point - DECT Phone	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
4c336c44-cd79-467b-9812-d775834d7732	tekVizion	Cisco End Point - Hard Phone (Desk Phone)	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
aa6e0a91-ae66-4dde-bd2a-ea3086f71488	tekVizion	Cisco End Point - Jabber Integration	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
5dea168f-d236-4b12-865b-15fc7636aa30	tekVizion	Cisco End Point - Soft Phone	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
009f99a0-3581-4b46-9c1e-e716ffa2eccb	tekVizion	Cisco Head Set - Any (One Model)	1.0	CERT	static	3	2022-06-17 15:42:48.550405	infinity	\N	f
08b7ce3a-ebbc-4a3e-b28a-2f59bec34d94	tekVizion	Cisco Finesse Certification - Any Application	1.0	CERT	static	17	2022-06-17 15:42:48.550405	infinity	\N	f
fa3f3f90-cc18-481c-b423-68f4cb78479a	tekVizion	Cisco Jabber - Bluetooth (Windows/Mac)	1.0	CERT	static	6	2022-06-17 15:42:48.550405	infinity	\N	f
a978a8e4-7a8e-49e2-91ca-b0e1c8df3b96	tekVizion	Cisco Jabber - USB (Windows/Mac)	1.0	CERT	static	6	2022-06-17 15:42:48.550405	infinity	\N	f
9bf1878a-c28e-4b65-bcf3-2a5e56fa1029	tekVizion	Cisco Jabber - Desk phone (any interface)	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
38a6f329-90ea-4678-bbcc-0de92236dd7b	tekVizion	Cisco UC One - Bluetooth (Windows/Mac)	1.0	CERT	static	6	2022-06-17 15:42:48.550405	infinity	\N	f
f6834e94-18eb-4293-8c53-183fcc7a1a32	tekVizion	Cisco UC One - USB (Windows/Mac)	1.0	CERT	static	6	2022-06-17 15:42:48.550405	infinity	\N	f
8f575839-bac1-493c-a51d-bc411b31725f	tekVizion	Cisco UCCE Certification - Any Application	1.0	CERT	static	17	2022-06-17 15:42:48.550405	infinity	\N	f
bda591d4-d9ae-41fd-969c-fb6fe1f2d961	tekVizion	Cisco UCCX Certification - Any Application	1.0	CERT	static	17	2022-06-17 15:42:48.550405	infinity	\N	f
2c982705-b48c-43e9-af10-97f0c6d94596	tekVizion	Microsoft ACS – SBC Certification	1.0	CERT	static	10	2022-06-17 15:42:48.550405	infinity	\N	f
df62f253-04f3-46b6-b73e-1f47b2ff86f5	tekVizion	Microsoft Certification - Teams Console	1.0	CERT	static	18	2022-06-17 15:42:48.550405	infinity	\N	f
e4c8af1f-4e9a-4837-ad11-8739bfe786c1	tekVizion	Microsoft Certification - Teams Sidecar	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
75c02ea9-f117-4a6a-a5b6-d08bbd4daf03	tekVizion	Microsoft SIP Trunk Validation	1.0	CERT	static	19	2022-06-17 15:42:48.550405	infinity	\N	f
dfd155a6-1d7b-4981-9353-81607a4ef6ed	tekVizion	Microsoft TEAMS - DR SBC Certification	1.0	CERT	static	46	2022-06-17 15:42:48.550405	infinity	\N	f
c0c77f37-cfc0-49a4-a777-e0a5c94df434	tekVizion	Microsoft TEAMS Analog Device Certification	1.0	CERT	static	17	2022-06-17 15:42:48.550405	infinity	\N	f
34a4603a-97d0-4198-919a-9dead87c6d52	tekVizion	Microsoft TEAMS Contact Center: API	1.0	CERT	static	10	2022-06-17 15:42:48.550405	infinity	\N	f
7981a5fa-d48f-4f46-bbba-fb3ed30748b3	tekVizion	Microsoft Teams: Contact Center Certification with Direct Routing	1.0	CERT	static	19	2022-06-17 15:42:48.550405	infinity	\N	f
a93f441a-0506-4a1c-9735-df1470b0d091	tekVizion	Microsoft TEAMS: DR SBC Single Strike	1.0	CERT	static	19	2022-06-17 15:42:48.550405	infinity	\N	f
04da5402-6c74-404d-abd3-15a3db315154	tekVizion	Microsoft TEAMS E911	1.0	CERT	static	11	2022-06-17 15:42:48.550405	infinity	\N	f
0ba6dcbd-b698-4496-b89a-e215cf947f66	tekVizion	Microsoft Teams Endpoint - Collaboration Bar	1.0	CERT	static	21	2022-06-17 15:42:48.550405	infinity	\N	f
74dd53ce-7d81-4fc2-ba15-04e1ca2be1fa	tekVizion	Microsoft Teams Endpoint - Conference Phone Certification	1.0	CERT	static	16	2022-06-17 15:42:48.550405	infinity	\N	f
5d8c3a1c-6f52-4462-b459-64eb929fbb1a	tekVizion	Microsoft Teams EP - LCP (Low Cost Phone)	1.0	CERT	static	16	2022-06-17 15:42:48.550405	infinity	\N	f
25a7daae-c902-45c6-93fd-1aa6098a0883	tekVizion	Microsoft Teams EP - Teams Display	1.0	CERT	static	16	2022-06-17 15:42:48.550405	infinity	\N	f
c4296177-0ff7-4a11-a986-c820686b2bd1	tekVizion	Microsoft Teams EP - Teams Video Phones	1.0	CERT	static	16	2022-06-17 15:42:48.550405	infinity	\N	f
ece9df56-8d6e-45e8-946b-d95c3b193a18	tekVizion	Microsoft Teams Panels (touchscreens) Certification	1.0	CERT	static	17	2022-06-17 15:42:48.550405	infinity	\N	f
824594f6-25ba-4ba8-b0ac-937bd56e3a78	tekVizion	Microsoft Teams: Compliance Recording	1.0	CERT	static	16	2022-06-17 15:42:48.550405	infinity	\N	f
a1b181b6-01e3-460a-9e3d-9d41a563c7f5	tekVizion	Microsoft Operator Connect Onboarding Verification Standard engagement	1.0	CERT	static	17	2022-06-17 15:42:48.550405	infinity	\N	f
b1a808fb-40a5-45cd-ba1c-2d69289cef2f	tekVizion	Microsoft Operator Connect Onboarding Verification Premium Engagement	1.0	CERT	static	40	2022-06-17 15:42:48.550405	infinity	\N	f
7b2bc6d7-e52a-4fc2-9dd1-8f7d46dcb05e	tekVizion	Microsoft OCO Verification engagement 1 Extra Month	1.0	CERT	static	10	2022-06-17 15:42:48.550405	infinity	\N	f
f0cd3010-2834-46fa-bffb-5cca0b84eba4	tekVizion	Zoom Certification - SBC Concierge Test	1.0	CERT	static	19	2022-06-17 15:42:48.550405	infinity	\N	f
512e2b2e-3bb9-4c13-bec4-bb3a0aea9f1a	tekVizion	Zoom Generic SIP End Point Certification	1.0	CERT	static	16	2022-06-17 15:42:48.550405	infinity	\N	f
a0d0e863-240e-4822-bd42-e4344b61d809	tekVizion	Google SIP Link - SBC	1.0	CERT	static	19	2022-06-17 15:42:48.550405	infinity	\N	f
1368461d-19fa-4528-bac3-98fe3703eb4c	tekVizion	Kandy SIP End Point Certification	1.0	CERT	static	16	2022-06-17 15:42:48.550405	infinity	\N	f
9dee6376-31a1-4c51-82c5-8563799727ba	tekVizion	Kandy Self-Test	1.0	CERT	static	6	2022-06-17 15:42:48.550405	infinity	\N	f
aa0cce5d-e8b6-45f7-abc5-ecdd419fcde7	tekVizion	RingCentral Basic SIP Device Certification	1.0	CERT	static	7	2022-06-17 15:42:48.550405	infinity	\N	f
226d53e2-c888-4a42-a640-56dcba6f442d	tekVizion	Remote Field Support	1.0	OTHER	week	10	2022-06-17 15:42:48.550405	infinity	\N	f
c30e381e-100e-4d3b-b4bd-32503c2505d3	tekVizion	tekVizion360 Microsoft Ready	1.0	OTHER	static	55	2022-06-17 15:42:48.550405	infinity	\N	f
70863c13-3429-41c8-bcc5-cb705c5b5afb	tekVizion	Generic charge of 1 token	1.0	OTHER	static	1	2022-06-17 15:42:48.550405	infinity	\N	f
abe61d80-cacf-4786-8fbc-319dd9482b91	tekVizion	Generic charge of 2 tokens	1.0	OTHER	static	2	2022-06-17 15:42:48.550405	infinity	\N	f
ff53ac9f-3eed-4605-98e9-6a06a2579e11	tekVizion	Generic charge of 3 tokens	1.0	OTHER	static	3	2022-06-17 15:42:48.550405	infinity	\N	f
c2328ea2-4a10-4bf7-9742-5bcc26d66314	tekVizion	Generic charge of 4 tokens	1.0	OTHER	static	4	2022-06-17 15:42:48.550405	infinity	\N	f
2aa09daa-3b38-4bee-ab53-3a85537e1918	tekVizion	Generic charge of 5 tokens	1.0	OTHER	static	5	2022-06-17 15:42:48.550405	infinity	\N	f
4b3e20d3-4635-4b4d-8e28-537c0bed2b9f	tekVizion	Generic charge of 6 tokens	1.0	OTHER	static	6	2022-06-17 15:42:48.550405	infinity	\N	f
00a0a523-fdbd-42a8-8adb-a4174792ef56	tekVizion	Generic charge of 7 tokens	1.0	OTHER	static	7	2022-06-17 15:42:48.550405	infinity	\N	f
2dac82a6-ecb9-4220-b1f3-d37790752918	tekVizion	Generic charge of 8 tokens	1.0	OTHER	static	8	2022-06-17 15:42:48.550405	infinity	\N	f
682df299-baa8-4afd-a273-4d844a97d3cf	tekVizion	Generic charge of 9 tokens	1.0	OTHER	static	9	2022-06-17 15:42:48.550405	infinity	\N	f
df25f455-6b4a-4471-92ae-baa475edce96	tekVizion	Generic charge of 10 tokens	1.0	OTHER	static	10	2022-06-17 15:42:48.550405	infinity	\N	f
0afd3d14-6473-4e0e-af40-4e51793d3e49	tekVizion	Generic charge of 20 tokens	1.0	OTHER	static	20	2022-06-17 15:42:48.550405	infinity	\N	f
0823355a-99c6-4dd2-ae94-aeddb526df35	tekVizion	Generic charge of 30 tokens	1.0	OTHER	static	30	2022-06-17 15:42:48.550405	infinity	\N	f
4befb1be-79bb-472f-af48-414664f19336	tekVizion	Generic charge of 40 tokens	1.0	OTHER	static	40	2022-06-17 15:42:48.550405	infinity	\N	f
27c98f47-d85c-4148-9b66-b6f7e4309f92	tekVizion	Generic charge of 50 tokens	1.0	OTHER	static	50	2022-06-17 15:42:48.550405	infinity	\N	f
001ee852-4ab5-4642-85e1-58f5a477fbb3	tekVizion	Generic refund of 1 token	1.0	OTHER	static	-1	2022-06-17 15:42:48.550405	infinity	\N	f
58351acf-e505-4a98-9ac2-f3c69d162e6c	tekVizion	Generic refund of 2 tokens	1.0	OTHER	static	-2	2022-06-17 15:42:48.550405	infinity	\N	f
a085aa11-7ac8-4d4a-a342-9ac5d4bbaabc	tekVizion	Generic refund of 3 tokens	1.0	OTHER	static	-3	2022-06-17 15:42:48.550405	infinity	\N	f
f35275cc-2177-4759-9462-89c27e9b2d18	tekVizion	Generic refund of 4 tokens	1.0	OTHER	static	-4	2022-06-17 15:42:48.550405	infinity	\N	f
b427f8af-fc6a-45a8-9971-b09d04114ed1	tekVizion	Generic refund of 5 tokens	1.0	OTHER	static	-5	2022-06-17 15:42:48.550405	infinity	\N	f
2cac9867-214f-4521-8ad1-b039051cd4d4	tekVizion	Generic refund of 6 tokens	1.0	OTHER	static	-6	2022-06-17 15:42:48.550405	infinity	\N	f
ba927329-a973-4e5a-9bc4-a539c75de053	tekVizion	Generic refund of 7 tokens	1.0	OTHER	static	-7	2022-06-17 15:42:48.550405	infinity	\N	f
e68667b3-ebfe-4073-8892-aa890dbe6717	tekVizion	Generic refund of 8 tokens	1.0	OTHER	static	-8	2022-06-17 15:42:48.550405	infinity	\N	f
a529753f-d148-4e4a-959d-adbcf8dba7a8	tekVizion	Generic refund of 9 tokens	1.0	OTHER	static	-9	2022-06-17 15:42:48.550405	infinity	\N	f
228db061-d655-48a4-acc5-abcbb10a813d	tekVizion	Generic refund of 10 tokens	1.0	OTHER	static	-10	2022-06-17 15:42:48.550405	infinity	\N	f
422918fb-aa31-4202-b351-de3c533bb64b	tekVizion	Generic refund of 20 tokens	1.0	OTHER	static	-20	2022-06-17 15:42:48.550405	infinity	\N	f
ed20a961-22e2-473f-b9fc-0016db548916	tekVizion	Generic refund of 30 tokens	1.0	OTHER	static	-30	2022-06-17 15:42:48.550405	infinity	\N	f
54f979f7-fc4c-4ee9-9c39-d7ceb7ad54aa	tekVizion	Generic refund of 40 tokens	1.0	OTHER	static	-40	2022-06-17 15:42:48.550405	infinity	\N	f
63fb5dd4-7a72-4217-a709-a8746a3bd1f6	tekVizion	Generic refund of 50 tokens	1.0	OTHER	static	-50	2022-06-17 15:42:48.550405	infinity	\N	f
8ce2f5c0-203c-48c2-a747-b9c5632a9027	Adtran	908E	R13.3.0.E	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
d63dfddb-4e1f-44d9-b2b5-4c89648355d8	Adtran	Netventa 3430	R12.0	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
6d5d0317-d8dd-4ce7-80f2-ed2da1a37562	AudioCodes	Mediant 1000	7.20A	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
fa4157f1-782f-43b1-a298-ce9d401dd1d0	AudioCodes	Mediant 2000	7.20A	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
5949dd0d-5e49-4cb2-b93d-bafd1c1ee17a	AudioCodes	Mediant 2600	7.20A.200.055	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
94a4ee16-9e8c-4b60-9b42-b1cfbbba7287	AudioCodes	Mediant 4000B	7.20A.202.112	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
3adae03d-cc93-4e13-bab6-73f16aa90d9a	AudioCodes	Mediant 800	7.20A	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
abb706be-7174-4093-a5a8-9834481ef630	AudioCodes	Mediant 800B MSBR	7.20A	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
f83f06ff-1b2c-433a-818e-b852b3825433	AudioCodes	Virtual Edition	7.40A	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
9a44a1b0-c595-4d4a-8577-e91ca9d863ca	Cisco	892	15.8.3M0a	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
3c53701a-a083-40fb-bc83-0e4d2faad134	Cisco	1100	16.9.1	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
ae698185-fb17-4923-aa50-5f0866ebae3e	Cisco	881	15.5.3M8	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
9271a209-f215-40bc-9e23-f0df460b5a9b	Cisco	ASR 1K	3.13.2S	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
e5a2e35d-97da-4378-9e93-e949704b52ec	Cisco	ISR 4k	17.3.3	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
70fd4047-768c-47c6-acf5-5f299cccbbcd	Cisco	ISR G2	15.7.3M3	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
a232062c-c31a-4075-a81f-3b0dc4683fff	Edgemarc	4808	15.8.1	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
cf28fdb3-9113-448c-924e-bd2ddd4d07f1	Edgemarc	2900 A	16.1.0	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
1f6d24d4-c8dc-4512-852d-6c0cd6de9d64	Ingate	SIParator	6.3.3	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
5b8f1bec-580c-4f9b-9b8c-29ab3fbc69f5	Oracle	Acme Packet 3820	ECZ730 P2	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
c2bf0f43-0222-4204-8aa9-7cfaf88d578e	Oracle	Acme Packet 3900	8.4	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
eb2e8d89-b5a0-4e6c-8b11-83aad2674d7f	TestV	TestPhone1	1	PBX	week	100	2022-06-22 15:23:58.214171	2022-10-22 15:23:58.214171	5f1fa1f7-92e3-4c92-b18b-d30f26ef4f73	t
3c76f3bf-0305-40d7-8627-b1a3a3d34272	Oracle	Acme Packet 4600	SCZ 8.4.0	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
8fd219bd-cdbc-4234-a43e-46f6a3e1b6bc	Ribbon	(GENBAND) Q21	9.3.1	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
0f0c1a17-be98-4cb9-9ca7-3c0d8d18090a	Ribbon	(GENBAND) SPIDR	4.1 MR2	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
1e74b6f7-9520-4c6d-9b81-05006cf79761	Ribbon	(Sonus) 1000	9.0.6	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
d1371cc3-8871-452a-b6f1-7c70c52cdea1	Ribbon	(Sonus) 2000	8.0.3	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
0f68912a-1ae6-40b2-9bc2-039724455dd0	Ribbon	(Sonus) 5210	9.02	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
3d865630-f0b8-4455-a87c-ece437707b5b	Ribbon	SWE Edge	9.2	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
960e8942-4aad-4510-8747-5400fa49ba15	Ribbon	SWE Core	9.2	SBC	week	1	2022-06-17 15:42:48.550405	infinity	\N	f
4b00da64-c65f-410d-a13c-08a52d8f555c	CICDTest	CICDTest1657917624	1.0	OTHER	week	1	2022-07-15 20:40:24.284	infinity	\N	t
c4c5c8c9-e399-4fdc-a210-4aa5e3bc57a2	CICDTest	CICDTest1658150055	2.0	OTHER	week	1	2022-07-18 13:14:14.948	infinity	\N	t
cdd0e8af-1ba4-4a20-b354-bf7c6c121dc3	Dialogic	Brooktrout SR140	X6.13--GFI FAX Maker	FAX	static	0	2022-06-17 15:42:48.550405	infinity	\N	t
\.


--
-- Data for Name: distributor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.distributor (id, name) FROM stdin;
6826a94e-c4da-46e9-8001-668df24877ec	Test
f5ac1f7b-d93e-4872-bd5e-133c00d9e2bd	Test Distributor
\.


--
-- Data for Name: license; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license (id, subaccount_id, start_date, package_type, renewal_date, tokens, device_access_limit, status) FROM stdin;
25e913de-5282-4231-b685-87dc40fa4856	04dfda26-98f4-42e5-889a-3edccf4b799c	2021-09-01 05:00:00	Small	2022-08-31 05:00:00	150	5000	Active
273a38b7-20a1-487e-82fb-8861d96280fe	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-20 15:42:48.550405	Large	2022-07-26 04:00:00	500	20000	Active
31d82e5c-b911-460c-cdbe-6860f8464233	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-26 15:42:48.550405	Large	2022-07-27 04:00:00	500	20000	Active
0e5903a4-f810-4f3e-a76f-f12825e642de	d45db408-6ceb-4218-bd36-6355e0e21bfb	2022-07-11 04:00:00	Large	2022-07-18 04:00:00	500	20000	Active
aa510ca7-d055-465c-8447-a028b4fa1869	ca0338ac-4ebc-4108-a92a-b1d253e05b31	2022-03-30 05:00:00	Custom	2023-03-29 05:00:00	225	5000	Expired
07249fe4-92e2-4fda-8e34-1b42d58ad6f2	0aefbe26-e929-4a04-922e-0aee390c0d89	2022-02-08 06:00:00	Small	2023-02-07 06:00:00	150	5000	Active
9a30fa75-a6db-44f8-9cfe-7de5e0c7f6c8	8d81e306-bbdb-409f-b0e8-0ece1bc489ee	2021-12-01 06:00:00	Custom	2022-11-30 06:00:00	125	5000	Active
236a90dd-d841-4b2c-8d36-360dc6b4214d	c428b1f2-0322-4686-a5cf-66eb4e74a0f5	2022-07-12 06:47:44.928	Basic	2023-06-10 04:00:00	55	5000	Active
1d1bf1e8-6522-4ab9-956a-864041f890e2	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-07-01 04:00:00	Basic	2022-07-31 04:00:00	55	5000	Active
419d29a2-7e17-4aaf-a712-c54359f3ac32	e5e293a7-1cab-4d95-86f0-c758541fd957	2022-04-21 05:00:00	Medium	2023-04-30 05:00:00	300	10000	Active
16e20c33-99d4-4883-a732-a26b214471be	0454e724-f26f-4b64-a757-7d99a02f6464	2022-04-21 05:00:00	Basic	2023-04-20 05:00:00	55	5000	Active
7aa8b765-16a2-43c9-a610-fcba1ae75141	cae19a1a-c9b5-4a55-8cdd-811dfea3770c	2022-02-01 06:00:00	Small	2023-01-31 06:00:00	150	5000	Active
a7e213c1-662c-4be5-81e3-8724aff3246c	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	2021-10-01 05:00:00	Medium	2022-09-30 05:00:00	300	10000	Active
c240a16e-cadf-41c8-8bfe-4e5ead2f7be4	82e579e9-4444-46c9-aaf7-5b365c92524a	2022-05-01 05:00:00	Basic	2023-04-30 05:00:00	55	5000	Active
989c0ed3-a8ba-4c81-bf87-19ab91790c93	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-15 04:00:00	Medium	2022-07-20 04:00:00	300	10000	Active
978b935a-4571-425e-ae68-fa77f471f242	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-04 04:00:00	Large	2022-07-31 04:00:00	500	20000	Active
cc0e62d2-75bf-4f1b-9e7d-834ac75b3bba	a8c40b4c-6eaf-4efd-bfd9-fa73bac4b2f2	2022-02-04 06:00:00	Small	2023-02-03 06:00:00	150	5000	Active
d554ec62-24f4-47de-ba85-9c063bfe74e1	01442bce-d452-4742-bcb5-27b93a44314f	2022-01-01 06:00:00	Custom	2022-12-31 06:00:00	545	20000	Active
10662f07-09eb-48c3-b0df-3db7f88e9022	37d5b2a8-63ac-4112-85ed-a2a2256fb4ba	2022-03-01 06:00:00	Basic	2023-02-28 06:00:00	55	5000	Active
1a9a1709-e073-4f03-b08e-7e8fbc47970f	86ed6072-069c-4712-92d7-a258e354b798	2022-03-01 06:00:00	Medium	2023-02-28 06:00:00	300	10000	Active
af7669e4-ed08-44c2-b405-547d81b10fa7	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-17 15:42:48.550405	Large	2022-07-26 04:00:00	500	20000	Active
cda49150-f760-4cc1-b0e1-62099ba6615a	48a8f94a-35ab-461c-9e8e-585692f087f5	2022-01-27 06:00:00	Basic	2023-01-26 06:00:00	55	5000	Active
cce93417-5c76-4df0-abfb-41bcfd315d54	22cc6133-6888-45ce-89ee-71f8571208a0	2021-09-01 05:00:00	Small	2022-08-31 05:00:00	150	5000	Active
e726e3b9-cde2-4692-ae3f-cf1c4d796995	a6278e6c-8e45-421f-97f0-de60fce06608	2022-03-22 05:00:00	Basic	2023-03-21 05:00:00	55	5000	Active
af7789e4-ef08-45c2-b405-547d81b10fa7	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-15 15:42:48.550405	Large	2022-07-26 04:00:00	500	20000	Active
d8ffd316-b8a3-41ae-a88f-2ed75beb0867	0d916dcc-515f-47b5-b8c3-4f7884d274f5	2022-01-01 06:00:00	Small	2022-12-31 06:00:00	150	5000	Active
0c6369d0-6fed-461e-bea8-a7e5bd9131ad	845881b4-3584-4ae0-bf8a-0c12f7892095	2022-05-01 05:00:00	Basic	2023-04-30 05:00:00	55	5000	Active
9cef28c9-2a2e-4e0b-aeed-b56f4b005607	67e0b7a0-523f-439e-898a-3ed9c2f941f0	2021-12-31 06:00:00	Custom	2022-12-30 06:00:00	70	10000	Active
4c4480af-2f0a-49da-abff-f8a3cc7ec704	637b5502-cf56-4113-8354-cd7098442f97	2022-03-25 05:00:00	Basic	2023-03-24 05:00:00	55	5000	Active
6524a6ab-b88b-49a8-aee5-624e86e24dcd	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-07-10 04:00:00	Small	2022-07-18 04:00:00	150	5000	Active
d7259fad-1c19-4560-ae93-17efef77144f	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-09 04:00:00	Medium	2022-07-20 04:00:00	300	10000	Active
7377fec4-5508-472c-a496-d3b601a52275	1730bb3f-1f13-4401-a366-a5dccdd620e0	2022-01-20 06:00:00	Basic	2023-01-19 06:00:00	55	5000	Active
181c0baa-c80a-46d1-9ddd-6964d593aec6	3f87fff9-200c-4f1b-af9e-5ab9ade5e3e3	2022-01-01 06:00:00	Basic	2022-12-31 06:00:00	55	5000	Active
24d00e27-fd58-44fe-894f-2df776e17bd7	9599c5bd-f702-4965-b655-29b0fed00e23	2021-10-01 05:00:00	Medium	2022-09-30 05:00:00	300	10000	Active
f587880a-5b9f-4468-94a5-0fc427e7ffd1	87283654-cb92-4355-ac0d-88dcafc778ad	2022-05-09 05:00:00	Basic	2023-05-08 05:00:00	55	5000	Active
8d57a5fa-8ad4-4102-8276-6aa75f8a9870	a9f2c313-7d80-4c1f-bda5-91f2767b3716	2021-09-06 05:00:00	Custom	2022-12-31 06:00:00	200	5000	Active
78e4ac61-e27a-4533-9764-3ccdb27b2736	31c142a6-b735-4bce-bfb4-9fba6b539116	2022-04-25 05:00:00	Large	2023-04-24 05:00:00	500	20000	Active
f1b50059-2aff-4232-bec2-64c948a36269	d9ff3754-5adc-41f0-a23d-21fb33c0323d	2022-01-02 06:00:00	Small	2023-01-01 06:00:00	150	5000	Active
69d0597f-7995-49ee-b365-e7cff9af5933	3e3eb864-689d-40a6-816e-340a8def68dd	2021-07-31 18:30:00	Small	2022-07-30 18:30:00	150	5000	Active
76b8a807-72b8-4c52-b9a1-0ef1a9777aad	99ffe734-dccc-4020-b6b2-cc48216bdcca	2022-06-16 05:00:00	Small	2023-06-15 05:00:00	150	5000	Active
b84852d7-0f04-4e9a-855c-7b2f01f61591	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2022-03-14 05:00:00	Small	2023-03-13 05:00:00	150	5000	Active
31d82e5c-a911-460b-ccbe-6860f8464233	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-11 15:42:48.550405	Large	2022-07-26 04:00:00	500	20000	Active
8b60fa68-208b-4d8e-b245-008af267cad8	0f49e2e2-546e-4acf-a051-f5fcac1a3ae0	2022-01-27 06:00:00	Small	2023-01-26 06:00:00	150	5000	Active
fe469708-f4cf-4718-88f4-48914ee574bb	3242e5b8-7a7f-4050-9b50-eadaa7bcd048	2022-02-03 18:30:00	Small	2023-02-02 18:30:00	150	5000	Expired
0e2f8b82-6dea-44e0-934a-0434b01d8d90	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-13 04:00:00	Medium	2022-07-26 04:00:00	300	10000	Active
899f4fa6-dd25-43f9-8517-fe17d91a9226	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-05 04:00:00	Small	2022-07-31 04:00:00	150	5000	Active
37c6ac96-dbf0-4195-a070-3eec4598183c	3819dc98-0e34-4237-ad0f-e79895b887e9	2022-07-18 14:32:09.674215	Small	2022-07-18 14:32:09.674215	250	5000	Active
31b92e5c-b811-460b-ccbe-6860f8464233	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-10 15:42:48.550405	Large	2022-07-26 04:00:00	500	20000	Active
fda82feb-d408-4d96-aae9-86865c04620d	31d81e5c-a916-470b-aabe-6860f8464211	2022-06-17 15:42:48.550405	Small	2022-07-26 04:00:00	150	5000	Active
16f4f014-5bed-4166-b10a-808b2e6655e3	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-08-01 04:00:00	Small	2022-09-30 04:00:00	150	5000	Active
2c0345a7-89de-440b-998c-c85a3f31c63c	3819dc98-0e34-4237-ad0f-e79895b887e9	2022-07-17 06:01:57.421814	Small	2022-07-17 06:01:57.421814	250	5000	Expired
7f4f802c-387f-4c01-90b4-da8a4f0459be	e8fc6a86-884f-4cfe-b220-73b4e5e97577	2021-06-30 05:00:00	Custom	2022-06-29 05:00:00	37	5000	Expired
986137d3-063d-4c0e-9b27-85fcf3b3272e	ac7a78c2-d0b2-4c81-9538-321562d426c7	2022-07-07 04:00:00	Small	2022-07-12 04:00:00	150	5000	Expired
e295a0c6-1cd0-4e54-b617-3c5ffa28aa0f	565e134e-62ef-4820-b077-2d8a6f628702	2021-05-19 05:00:00	Small	2022-05-18 05:00:00	150	5000	Expired
117694f7-1578-4078-94dc-64d5286ed0e4	173c00ea-6e5c-462c-9295-ae5e14adc14f	2021-07-01 05:00:00	Small	2022-06-30 05:00:00	150	5000	Expired
527b5c03-c0d6-4f41-8866-7255487aab48	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-25 15:42:48.550405	Basic	2023-06-10 04:00:00	55	5000	Active
c3b1bc60-5405-40b9-88c5-e9437972d5c6	31d81e5c-a916-470b-aabe-6860f8464211	2022-07-14 15:42:48.550405	Large	2022-07-26 04:00:00	500	20000	Active
955aaf36-d628-46fa-b00a-ab01645b76df	c428b1f2-0322-4686-a5cf-66eb4e74a0f5	2022-07-13 04:00:00	Medium	2022-07-21 04:00:00	300	10000	Active
\.


--
-- Data for Name: license_consumption; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license_consumption (id, subaccount_id, project_id, consumption_date, usage_type, device_id, tokens_consumed, modified_date) FROM stdin;
58abb2a2-0763-445c-9b1d-5bfe8993b6b2	31c142a6-b735-4bce-bfb4-9fba6b539116	b7b16e7e-5c1d-4e18-99b5-bd983d043915	2022-06-19 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-06-24 00:00:00
b2e9ab91-2a2b-46db-b80e-0f9b49351e35	31c142a6-b735-4bce-bfb4-9fba6b539116	b7b16e7e-5c1d-4e18-99b5-bd983d043915	2022-06-19 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-06-24 00:00:00
bd7c38c7-1c18-453a-991a-1b32fc971972	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-28 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
3f3507da-d4c5-462d-abd0-b8b37997651d	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	9b809c33-7db8-42e4-9dd8-4f4ae710d135	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-24 00:00:00
f960a45d-d269-4ce4-ada9-7be5876fe923	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	9b809c33-7db8-42e4-9dd8-4f4ae710d135	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-24 00:00:00
01412e5e-8377-4101-811d-2553b7cad83e	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	9b809c33-7db8-42e4-9dd8-4f4ae710d135	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-24 00:00:00
40df3055-8117-4bc3-9178-8efee8d30bb6	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	9b809c33-7db8-42e4-9dd8-4f4ae710d135	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-24 00:00:00
07d95831-cdc0-4435-bd4e-75eba16d5dc3	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	9b809c33-7db8-42e4-9dd8-4f4ae710d135	2022-06-12 00:00:00	Configuration	0afd3d14-6473-4e0e-af40-4e51793d3e49	20	2022-06-24 00:00:00
13afe7ef-262e-4ec0-a9c3-2778285a7475	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	9b809c33-7db8-42e4-9dd8-4f4ae710d135	2022-06-12 00:00:00	Configuration	ff53ac9f-3eed-4605-98e9-6a06a2579e11	3	2022-06-24 00:00:00
615afc15-4b01-4e78-b7d7-65767a2c27e0	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	9b809c33-7db8-42e4-9dd8-4f4ae710d135	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-24 00:00:00
4a04dd4f-7bf1-4acd-b8ab-88ea91cbad2e	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-07 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
f8f314a9-e0e5-40cb-8469-51df50aa348d	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-07-03 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
5262ca4a-9bf4-4b48-a985-890a9dc32418	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-07-03 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
c0dcf7aa-efc9-4d47-8db1-6f34ac5083fa	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-07-07 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
227a11f7-6a92-4c9d-a0fb-97293d5bcf6c	31c142a6-b735-4bce-bfb4-9fba6b539116	b7b16e7e-5c1d-4e18-99b5-bd983d043915	2022-06-26 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-07-01 00:00:00
ff034a3a-c166-4f08-847c-1a1190e8f1fa	31c142a6-b735-4bce-bfb4-9fba6b539116	b7b16e7e-5c1d-4e18-99b5-bd983d043915	2022-06-26 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-07-01 00:00:00
6e2e46a5-f3e3-469b-895d-f71d2857fb26	31c142a6-b735-4bce-bfb4-9fba6b539116	b7b16e7e-5c1d-4e18-99b5-bd983d043915	2022-06-26 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-07-01 00:00:00
94f427c8-2fbb-49c2-958c-ec07924664e9	9599c5bd-f702-4965-b655-29b0fed00e23	56be8ded-5b5d-4528-99d5-acdbf6f7ed3f	2022-06-26 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-07-01 00:00:00
8a31b4d3-a4b2-4d9f-9012-2eaaafa450b0	9599c5bd-f702-4965-b655-29b0fed00e23	56be8ded-5b5d-4528-99d5-acdbf6f7ed3f	2022-06-26 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-07-01 00:00:00
89a7ed09-a5ec-4380-a52e-6b232a328196	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
ee41d801-bac2-497c-b001-7e9be8782461	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-21 00:00:00	Configuration	51fc2c47-b066-46f2-a613-93c350da9869	2	2022-07-08 00:00:00
399f5bac-6256-4968-8119-6d101f4d5707	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-28 00:00:00	Configuration	1922a5fb-228c-4a90-b2d3-ec517d7a3f9a	3	2022-07-08 00:00:00
13efb7b2-a7bd-4679-8dd0-4dfbb72756b1	31d81e5c-a916-470b-aabe-6860f8464211	459cf3ca-7365-47a1-8d9b-1abee381545c	2022-07-24 00:00:00	Configuration	8ce2f5c0-203c-48c2-a747-b9c5632a9027	3	2022-07-04 00:00:00
90f3b141-b149-493d-a5c3-f7bf52e81d1c	31c142a6-b735-4bce-bfb4-9fba6b539116	b7b16e7e-5c1d-4e18-99b5-bd983d043915	2022-06-19 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-06-24 00:00:00
bb6d5442-d147-403d-920b-36bc31a0abe2	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	3c515e47-f724-4115-be31-55a6e67c44db	2	2022-07-11 00:00:00
ab423f2e-26d6-4e9d-9e97-5aadba0ab522	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-28 00:00:00	Configuration	f6bded44-d753-4035-85d6-064dfd096471	2	2022-07-08 00:00:00
3a545eed-7830-459f-843e-8f3a8466e986	a9f2c313-7d80-4c1f-bda5-91f2767b3716	94c37443-9caa-4b6d-a03d-e2f602ad0145	2021-08-30 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-22 00:00:00
6d433c0b-9ba2-413f-89ee-b606a3262c7d	31d81e5c-a916-470b-aabe-6860f8464211	459cf3ca-7365-47a1-8d9b-1abee381545c	2022-07-10 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-04 00:00:00
87cb0e51-e934-4cd9-bcc4-63165ab1c845	a9f2c313-7d80-4c1f-bda5-91f2767b3716	94c37443-9caa-4b6d-a03d-e2f602ad0145	2021-08-30 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-22 00:00:00
a1881283-9d5a-4bf4-b342-d745d98108b9	a9f2c313-7d80-4c1f-bda5-91f2767b3716	94c37443-9caa-4b6d-a03d-e2f602ad0145	2021-08-30 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-22 00:00:00
ab6a865c-409e-4de1-85ba-3270a710e661	31d81e5c-a916-470b-aabe-6860f8464211	459cf3ca-7365-47a1-8d9b-1abee381545c	2022-07-10 00:00:00	Configuration	389ef7a2-ca9e-44de-ac6f-61bb00034b87	2	2022-07-04 00:00:00
1f9a7364-4938-47e0-aa1a-68bd24b0c458	31d81e5c-a916-470b-aabe-6860f8464211	459cf3ca-7365-47a1-8d9b-1abee381545c	2022-07-31 00:00:00	Configuration	f6bded44-d753-4035-85d6-064dfd096471	2	2022-07-04 00:00:00
8bd7e065-f369-4b96-b0bd-8456221b31a7	31d81e5c-a916-470b-aabe-6860f8464211	459cf3ca-7365-47a1-8d9b-1abee381545c	2022-07-17 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-04 00:00:00
00ff2ae7-eeae-4740-b950-bb0518c66d8f	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
01536cb6-7c31-4a92-81f1-8ae4141cc2ad	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-07-24 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
2c5f9df4-de15-4cb4-919c-72e91ef0809b	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-07-24 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
c2780fab-2115-4bcd-968b-0588fff2909f	31c142a6-b735-4bce-bfb4-9fba6b539116	4e63656c-eac1-440b-9625-30d72044fe10	2022-06-12 00:00:00	Configuration	0afd3d14-6473-4e0e-af40-4e51793d3e49	20	2022-06-24 00:00:00
a572f05c-c96c-48f5-9f6c-e8d4ea0ded81	31c142a6-b735-4bce-bfb4-9fba6b539116	4e63656c-eac1-440b-9625-30d72044fe10	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-24 00:00:00
ef715447-966a-418a-9e61-8d2efb9d9011	31c142a6-b735-4bce-bfb4-9fba6b539116	4e63656c-eac1-440b-9625-30d72044fe10	2022-06-12 00:00:00	Configuration	c2328ea2-4a10-4bf7-9742-5bcc26d66314	4	2022-06-24 00:00:00
09f80827-e09e-4838-9fe0-cbdc64411885	9599c5bd-f702-4965-b655-29b0fed00e23	4e022429-e478-4830-b62c-dca5feec7c8d	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-24 00:00:00
2ac17913-6dd2-4aab-83cf-3f3446b68a12	9599c5bd-f702-4965-b655-29b0fed00e23	4e022429-e478-4830-b62c-dca5feec7c8d	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-24 00:00:00
489e5671-9c54-4cfe-be78-8a4894eaf15a	9599c5bd-f702-4965-b655-29b0fed00e23	4e022429-e478-4830-b62c-dca5feec7c8d	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-24 00:00:00
5310efd2-8cf0-4fbf-992f-e0005286c8f0	9599c5bd-f702-4965-b655-29b0fed00e23	4e022429-e478-4830-b62c-dca5feec7c8d	2022-06-12 00:00:00	Configuration	c2328ea2-4a10-4bf7-9742-5bcc26d66314	4	2022-06-24 00:00:00
3153f38e-6db8-439f-9e8f-bb4c44bcbf67	9599c5bd-f702-4965-b655-29b0fed00e23	4e022429-e478-4830-b62c-dca5feec7c8d	2022-06-12 00:00:00	Configuration	df25f455-6b4a-4471-92ae-baa475edce96	10	2022-06-24 00:00:00
f78ce1a0-2e97-4563-901e-936eb8ab92e0	9599c5bd-f702-4965-b655-29b0fed00e23	56be8ded-5b5d-4528-99d5-acdbf6f7ed3f	2022-06-19 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-06-24 00:00:00
d39ea71e-182f-4748-a611-a1fa07815401	9599c5bd-f702-4965-b655-29b0fed00e23	56be8ded-5b5d-4528-99d5-acdbf6f7ed3f	2022-06-19 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-06-24 00:00:00
048264ce-dc9e-420a-9d7c-5a38e09382e6	d9ff3754-5adc-41f0-a23d-21fb33c0323d	8d4aa4c3-bfd8-433c-a1b3-dca7086da476	2022-06-12 00:00:00	Configuration	df25f455-6b4a-4471-92ae-baa475edce96	10	2022-06-27 00:00:00
b6f90b60-e8ba-4611-8513-9c7cf10f51c0	d9ff3754-5adc-41f0-a23d-21fb33c0323d	8d4aa4c3-bfd8-433c-a1b3-dca7086da476	2022-06-12 00:00:00	Configuration	27c98f47-d85c-4148-9b66-b6f7e4309f92	50	2022-06-27 00:00:00
91a228cc-2fa7-49d8-bd81-fb5242e9b828	d9ff3754-5adc-41f0-a23d-21fb33c0323d	8d4aa4c3-bfd8-433c-a1b3-dca7086da476	2022-06-12 00:00:00	Configuration	ff53ac9f-3eed-4605-98e9-6a06a2579e11	3	2022-06-27 00:00:00
7c9b043a-b572-45d5-90ea-755741298b83	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	f6bded44-d753-4035-85d6-064dfd096471	2	2022-07-11 00:00:00
bc96a1a2-96fc-44e7-b38d-42f0b5a2f1fa	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-11 00:00:00
a435ff6e-2dda-42e2-ba44-5702f18fff8c	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	1922a5fb-228c-4a90-b2d3-ec517d7a3f9a	3	2022-07-11 00:00:00
2cd69392-6525-4a18-ab75-0de831284755	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	70f3e917-4553-445a-89fd-45bca45ae075	2	2022-07-11 00:00:00
604372ef-ca19-438d-a4e1-188b07c837da	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	df960781-3e91-4395-98b3-6fcb5b8931aa	2	2022-07-11 00:00:00
c0beab05-ce1f-4289-9ddb-41d63a838592	37d5b2a8-63ac-4112-85ed-a2a2256fb4ba	0abdff08-bdec-4974-ba8d-d42ff84036dc	2022-06-18 00:00:00	Configuration	13937da3-98ec-48c1-a970-36dc335d566c	3	2022-07-12 00:00:00
1587335d-bedc-4d3f-9e12-a63a27666c64	37d5b2a8-63ac-4112-85ed-a2a2256fb4ba	0abdff08-bdec-4974-ba8d-d42ff84036dc	2022-07-02 00:00:00	Configuration	13937da3-98ec-48c1-a970-36dc335d566c	3	2022-07-12 00:00:00
34409cc4-2853-4186-a7c4-cd18b5830400	31d81e5c-a916-470b-aabe-6860f8464211	459cf3ca-7365-47a1-8d9b-1abee381545c	2022-07-24 00:00:00	Configuration	8ce2f5c0-203c-48c2-a747-b9c5632a9027	3	2022-07-04 00:00:00
5facb398-ba92-4d28-aa49-1c5c6f58e382	9599c5bd-f702-4965-b655-29b0fed00e23	56be8ded-5b5d-4528-99d5-acdbf6f7ed3f	2022-07-03 00:00:00	Configuration	70863c13-3429-41c8-bcc5-cb705c5b5afb	1	2022-07-12 00:00:00
adcf947f-d3fe-42a0-92fe-d8c9e3d8d848	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-07-10 00:00:00	Configuration	f6bded44-d753-4035-85d6-064dfd096471	2	2022-07-08 00:00:00
d4346d00-dea7-44b6-a87d-a8ff20025712	31d81e5c-a916-470b-aabe-6860f8464211	10fdbeda-3d36-48ae-946a-99a002088f2e	2022-07-17 00:00:00	Configuration	f6bded44-d753-4035-85d6-064dfd096471	2	2022-07-05 00:00:00
50e3d30a-f829-42d2-82b3-623aea3c7d39	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	AutomationPlatform	3baa5c29-f94d-4281-83b0-d705c2e2f5ad	5	2022-07-11 00:00:00
666dba7e-4ec5-4465-b3e3-6474e8f3d756	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	c49a3148-1e74-4090-9876-d062011d9bcb	0	2022-07-08 00:00:00
b7fab5fb-1e8b-47a6-867d-84af8c82d97c	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
b2f8f3d9-61a8-4c12-b638-46eed65f77c5	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-07 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
1496c732-0e0d-4d7a-a5e3-8d1b281f67b0	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	2022-03-19 00:00:00	Configuration	13937da3-98ec-48c1-a970-36dc335d566c	3	2022-07-06 00:00:00
4700e826-be6b-4816-97cc-e778683aa079	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	2022-03-19 00:00:00	Configuration	f83f06ff-1b2c-433a-818e-b852b3825433	1	2022-07-06 00:00:00
942e1cd6-d163-4d2e-9107-5af8bf673fc4	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	2022-03-26 00:00:00	Configuration	f83f06ff-1b2c-433a-818e-b852b3825433	1	2022-07-06 00:00:00
8505fe43-23da-4d56-9ef3-94ed1044a6e6	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	2022-03-26 00:00:00	Configuration	13937da3-98ec-48c1-a970-36dc335d566c	3	2022-07-06 00:00:00
46a41cc9-ccb2-458b-9e42-a26677df59f2	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-28 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
bd25d7bb-8e1f-461d-ad25-edecf8e9274b	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
d9e0dd0d-8424-4510-9593-d4d9dfc8f28e	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
217cca89-30c7-4019-8c7e-b348f125332e	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
c1f57cdb-58dc-44cd-af27-e945fd492fcf	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-07-10 00:00:00	Configuration	8ce2f5c0-203c-48c2-a747-b9c5632a9027	1	2022-07-08 00:00:00
06283032-ae64-406f-9a42-8898567b64b1	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
05be8638-7a22-4236-8ff7-c99b6d4cdb40	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	c49a3148-1e74-4090-9876-d062011d9bcb	0	2022-07-08 00:00:00
3bd8fa35-0a52-49ed-bd71-f799ed6f80f6	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-08-01 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
4a12e5fb-0ed7-4b39-915f-7dc2ccc023b3	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-09-25 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
227ce1b8-e06d-48c3-afb3-7aa3283cf07c	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-07-17 00:00:00	Configuration	ef7a4bcd-fc3f-4f87-bf87-ae934799690b	2	2022-07-08 00:00:00
fde5b156-4f48-494a-b843-d2c14dfecb44	ac7a78c2-d0b2-4c81-9538-321562d426c7	8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	2022-07-24 00:00:00	Configuration	f6bded44-d753-4035-85d6-064dfd096471	2	2022-07-08 00:00:00
dec88313-220f-436e-97f2-d6766b8ea58a	d9ff3754-5adc-41f0-a23d-21fb33c0323d	6bf88085-2d52-4363-8b13-e392efaf52f5	2022-06-25 00:00:00	Configuration	df25f455-6b4a-4471-92ae-baa475edce96	10	2022-07-07 00:00:00
4157ffd3-f181-40be-9127-11b7b7c0d396	d9ff3754-5adc-41f0-a23d-21fb33c0323d	291b49df-5fa9-4d02-8cb5-bd42d8d05e2f	2022-07-02 00:00:00	Configuration	2aa09daa-3b38-4bee-ab53-3a85537e1918	5	2022-07-07 00:00:00
f0b3a538-e3b0-439d-9166-0e25d269f9ae	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	06e9720c-b7b7-4124-b67a-5332dfe116f8	4	2022-07-11 00:00:00
9820dad8-eab5-4bce-ae34-865d7de78e52	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	389ef7a2-ca9e-44de-ac6f-61bb00034b87	2	2022-07-11 00:00:00
21dad31a-d22b-4ab9-bf86-f49d3188daf1	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	51fc2c47-b066-46f2-a613-93c350da9869	2	2022-07-11 00:00:00
1f21fbef-be8c-433d-ae1a-e658fbfd5d24	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	cdd0e8af-1ba4-4a20-b354-bf7c6c121dc3	0	2022-07-11 00:00:00
087fb3dd-0c42-468b-883a-38f1cb5ca05e	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	936662a7-febd-4cbf-bc58-477e5d5a9d10	0	2022-07-11 00:00:00
0c5755b6-e65a-4afb-9f94-7a16f462eb29	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-11 00:00:00	Configuration	416e91f1-5c02-489c-b971-48c305751cfc	2	2022-07-11 00:00:00
48feb601-c1e5-423d-9de0-ceb5e86b6182	37d5b2a8-63ac-4112-85ed-a2a2256fb4ba	0abdff08-bdec-4974-ba8d-d42ff84036dc	2022-06-25 00:00:00	Configuration	13937da3-98ec-48c1-a970-36dc335d566c	3	2022-07-12 00:00:00
0634ea66-1bcf-4f96-a8df-468308be9184	37d5b2a8-63ac-4112-85ed-a2a2256fb4ba	0abdff08-bdec-4974-ba8d-d42ff84036dc	2022-07-09 00:00:00	Configuration	13937da3-98ec-48c1-a970-36dc335d566c	3	2022-07-12 00:00:00
cf6564d9-24bd-4735-b7a6-4b70beeccca0	31c142a6-b735-4bce-bfb4-9fba6b539116	b7b16e7e-5c1d-4e18-99b5-bd983d043915	2022-07-03 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-07-12 00:00:00
72bb8050-9752-45b9-a403-8d6d8986f8ff	31c142a6-b735-4bce-bfb4-9fba6b539116	b7b16e7e-5c1d-4e18-99b5-bd983d043915	2022-07-03 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-07-12 00:00:00
ada83d8b-8623-48af-b19e-2b9191a955ba	9599c5bd-f702-4965-b655-29b0fed00e23	56be8ded-5b5d-4528-99d5-acdbf6f7ed3f	2022-07-03 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-07-12 00:00:00
898adadc-fb81-443b-a0be-9e348cde5001	9599c5bd-f702-4965-b655-29b0fed00e23	56be8ded-5b5d-4528-99d5-acdbf6f7ed3f	2022-07-03 00:00:00	Configuration	ff53ac9f-3eed-4605-98e9-6a06a2579e11	3	2022-07-12 00:00:00
964782de-1736-4f20-8260-9bc5996b1748	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-17 00:00:00	Configuration	a232062c-c31a-4075-a81f-3b0dc4683fff	1	2022-07-14 00:00:00
852a2611-5062-4323-9205-178dfd766488	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-17 00:00:00	Configuration	5b8f1bec-580c-4f9b-9b8c-29ab3fbc69f5	1	2022-07-14 00:00:00
d69d69ff-b844-4e13-8e58-7174e831bd97	d45db408-6ceb-4218-bd36-6355e0e21bfb	9fd20dca-33f0-4bd2-b484-d81dd6423626	2022-07-17 00:00:00	Configuration	1f6d24d4-c8dc-4512-852d-6c0cd6de9d64	1	2022-07-14 00:00:00
7026b872-77c4-4c43-a52c-fea17fc9a9bb	9599c5bd-f702-4965-b655-29b0fed00e23	56be8ded-5b5d-4528-99d5-acdbf6f7ed3f	2022-07-10 00:00:00	Configuration	eeff2eac-c1cc-47a1-a628-eb1a59dd5897	3	2022-07-15 00:00:00
c232f69d-b23f-4bd7-8e0b-c47739590a4c	31c142a6-b735-4bce-bfb4-9fba6b539116	f8e757f4-a7d2-416d-80df-beefba44f88f	2022-07-10 00:00:00	Configuration	df62f253-04f3-46b6-b73e-1f47b2ff86f5	18	2022-07-15 00:00:00
c323f5f8-cd49-4b0b-ac74-fe2113b658b8	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	2022-07-16 00:00:00	Configuration	d41126e1-53eb-473f-b011-9bd0ac44644a	2	2022-07-18 00:00:00
\.


--
-- Data for Name: project; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project (id, subaccount_id, code, name, status, open_date, close_date) FROM stdin;
f8e757f4-a7d2-416d-80df-beefba44f88f	31c142a6-b735-4bce-bfb4-9fba6b539116	1001-1	MTRA Certification Testing	Open	2022-07-13 05:00:00	\N
ccfd312f-4a06-4746-a5da-71d148d52cc0	86ed6072-069c-4712-92d7-a258e354b798	12345	SIPT - Asterisk PBX	Open	2022-06-01 05:00:00	\N
10fdbeda-3d36-48ae-946a-99a002088f2e	31d81e5c-a916-470b-aabe-6860f8464211	3	test1	Open	2022-07-05 04:00:00	\N
2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	f5a609c0-8b70-4a10-9dc8-9536bdb5652c	01	app devalopment	Open	2022-03-20 18:30:00	\N
9b809c33-7db8-42e4-9dd8-4f4ae710d135	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	1234	Token starting point	Open	2022-06-13 05:00:00	\N
37a18d09-d9b7-4328-ae96-d9ef0d27e42f	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	1234-2	Regular Testing 	Open	2022-06-23 05:00:00	\N
16ff29a3-b14a-4dff-9c61-c28c17270bbd	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	1234-3	Cisco Webex Calling Certification	Open	2022-06-23 05:00:00	\N
9fd20dca-33f0-4bd2-b484-d81dd6423626	d45db408-6ceb-4218-bd36-6355e0e21bfb	Test1	Test	Open	2022-07-11 04:00:00	\N
0abdff08-bdec-4974-ba8d-d42ff84036dc	37d5b2a8-63ac-4112-85ed-a2a2256fb4ba	1	Teams Panel Test	Open	2022-06-19 18:30:00	\N
4e63656c-eac1-440b-9625-30d72044fe10	31c142a6-b735-4bce-bfb4-9fba6b539116	8122-1	Token Consumption Normalization	Closed	2022-06-13 05:00:00	2022-06-24 14:57:24
94c37443-9caa-4b6d-a03d-e2f602ad0145	a9f2c313-7d80-4c1f-bda5-91f2767b3716	1	Token Catch Up	Open	2021-09-01 05:00:00	\N
4e022429-e478-4830-b62c-dca5feec7c8d	9599c5bd-f702-4965-b655-29b0fed00e23	7185	Token Consumption Normalization	Closed	2022-06-13 05:00:00	2022-06-24 15:05:17
234d6482-4004-44ca-a846-f9ec9a7ae1dd	9599c5bd-f702-4965-b655-29b0fed00e23	1234-1	Poly MTRA Collab Bar w/ Touch Console	Open	2022-06-20 05:00:00	\N
56be8ded-5b5d-4528-99d5-acdbf6f7ed3f	9599c5bd-f702-4965-b655-29b0fed00e23	1234-3	Poly MTRW	Open	2022-06-22 05:00:00	\N
b7b16e7e-5c1d-4e18-99b5-bd983d043915	31c142a6-b735-4bce-bfb4-9fba6b539116	1234-1	MTRA Validation Testing	Open	2022-06-22 05:00:00	\N
27a535c1-c12f-43b4-b908-bab0338140d9	e8fc6a86-884f-4cfe-b220-73b4e5e97577	1234-5	SIPT Test - X PBX 6/27/2022	Open	2022-06-27 05:00:00	\N
8d4aa4c3-bfd8-433c-a1b3-dca7086da476	d9ff3754-5adc-41f0-a23d-21fb33c0323d	7931	Token Consumption Normalization	Closed	2022-06-17 05:00:00	2022-06-27 12:17:25
6bf88085-2d52-4363-8b13-e392efaf52f5	d9ff3754-5adc-41f0-a23d-21fb33c0323d	001	Grandstream WP810	Open	2022-06-20 18:30:00	\N
291b49df-5fa9-4d02-8cb5-bd42d8d05e2f	d9ff3754-5adc-41f0-a23d-21fb33c0323d	002	Grandstream WP810	Closed	2022-06-20 18:30:00	2022-07-07 14:58:16
459cf3ca-7365-47a1-8d9b-1abee381545c	31d81e5c-a916-470b-aabe-6860f8464211	v@gmail.com	testProject	Open	2022-07-12 04:00:00	\N
8bfec35d-bce0-4b36-a7b8-3cab3f1f48fa	ac7a78c2-d0b2-4c81-9538-321562d426c7	001	First Project	Open	2022-07-01 04:00:00	\N
\.


--
-- Data for Name: subaccount; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subaccount (id, name, customer_id) FROM stdin;
31c142a6-b735-4bce-bfb4-9fba6b539116	Logitech - 360 Large	4a095621-5dea-4c68-91dd-705012e92a53
24372e49-5f31-4b38-bc3e-fb6a5c371623	360 Custom (No Tokens)	aa85399d-1ce9-425d-9df7-d6e8a8baaec2
d45db408-6ceb-4218-bd36-6355e0e21bfb	Default	740162ed-3abe-4f89-89ef-452e3c0787e2
1e22eb0d-e499-4dbc-8f68-3dff5a42086b	testv6	06f808dd-0ecc-40dd-b98a-c6a1c5dda4fa
d977656e-049a-4490-ad4c-c3fc9205d50f	360 Custom (No Tokens)	10382e3e-ab62-475a-ab52-c0bdce40a628
3819dc98-0e34-4237-ad0f-e79895b887e9	Developer Account	27c7c1a3-c68b-e811-816b-e0071b72c711
9b9cd5ee-27ae-41e0-976c-db263be8f71f	CUBE - 360 Custom (No Tokens)	b5ce9ce7-9532-4671-9491-61a234311b70
30249e2b-876c-48f5-a804-b4dc688c2d84	WebEx Calling - 360 Custom (No Tokens)	b5ce9ce7-9532-4671-9491-61a234311b70
b50349c8-0811-4c21-a757-f70597a22990	BWKS PSTN - 360 Custom (No Tokens)	b5ce9ce7-9532-4671-9491-61a234311b70
e8cf8d9a-f842-44ac-9f9e-b1aa61f8386a	Default	c4716775-bad0-4eee-8f77-e14f878c0320
d9ff3754-5adc-41f0-a23d-21fb33c0323d	Grandstream - 360 Small	6b5f9f5e-f33e-48a4-9345-f76e2c463550
e17d1ef3-597c-4d17-a208-21b1a612ea5c	IPC - 360 Custom (No Tokens)	ce3619a6-7af2-4967-8c7b-dd605939ef60
e5e293a7-1cab-4d95-86f0-c758541fd957	IPC - 360 Medium	ce3619a6-7af2-4967-8c7b-dd605939ef60
a9f2c313-7d80-4c1f-bda5-91f2767b3716	ISI - 360 Small	e01441a8-6589-4a10-a71e-fa6aeb0a98e3
04dfda26-98f4-42e5-889a-3edccf4b799c	Lifesize - 360 Small	ae0a4bcb-1a40-445d-9be1-56baaf8e6ae1
078b980a-96f8-460b-a44d-b7d37fbc858a	Lumen - 360 Custom (No Tokens)	368b487c-bdd8-491c-8a1c-00a688a80da5
f5a609c0-8b70-4a10-9dc8-9536bdb5652c	Martello - 360 Small	7d133fd2-8228-44ff-9636-1881f58f2dbb
87283654-cb92-4355-ac0d-88dcafc778ad	Masergy - 360 Basic	958b4b42-02de-40a2-ae35-cd343c0a0df5
3f87fff9-200c-4f1b-af9e-5ab9ade5e3e3	MetTel - 360 Basic - MSFT Ready	7d0c7b21-faad-4925-9844-77c06b78b8d6
173c00ea-6e5c-462c-9295-ae5e14adc14f	Neustar - 360 Small	9b401d46-4e03-4a5f-9729-71adac5bd1a7
637b5502-cf56-4113-8354-cd7098442f97	Nexon - 360 Basic - MSFT Ready	4d460c28-eeee-402b-9a8c-6be8f86daac8
845881b4-3584-4ae0-bf8a-0c12f7892095	NFON - 360 Basic - MSFT Ready	0ecea4ac-1322-46b0-bc98-1d215c86f5a3
485d3fe8-ee5d-41d9-a586-e033d4b95c95	Nokia - 360 Custom (No Tokens)	1d7492f7-6626-47c1-9d43-621f2bc820ee
a6278e6c-8e45-421f-97f0-de60fce06608	PCCW - 360 Basic - MSFT Ready	82a5c1f0-cd88-437f-880d-0e22a70edf8c
48a8f94a-35ab-461c-9e8e-585692f087f5	Peerless - 360 Basic - MSFT Ready	8a5ece98-41ca-433f-bd8c-4f5f7c253707
9599c5bd-f702-4965-b655-29b0fed00e23	Poly - 360 Medium	7ebd6e00-a59a-4704-858c-d889cb698761
82e579e9-4444-46c9-aaf7-5b365c92524a	Poly - 360 Basic	7ebd6e00-a59a-4704-858c-d889cb698761
cae19a1a-c9b5-4a55-8cdd-811dfea3770c	Ribbon - 360 Small	875f3b42-1e49-412b-9c68-014b1294ee2d
0454e724-f26f-4b64-a757-7d99a02f6464	Tele2 - 360 Basic - MSFT Ready	d74b9e6f-63f2-456f-ab1c-3d993c93161c
241234a3-f182-4eb9-ae04-6e802f3db04f	T-Mobil / Sprint - 360 Custom (No Tokens)	20a00e47-464f-4ff3-ba01-5269170d38ac
01442bce-d452-4742-bcb5-27b93a44314f	VodafoneZiggo - 360 Large	07c35ff3-f418-41f7-918a-f90c18052baa
565e134e-62ef-4820-b077-2d8a6f628702	Vonage - 360 Small - Old Token Model	821f079f-be9f-4b11-b364-4f9652c581ce
c428b1f2-0322-4686-a5cf-66eb4e74a0f5	kaushik	467aee0e-0cc8-4822-9789-fc90acea0a04
9e6d1769-5f32-461d-a557-8fb9a499757b	360 Small	79f4f8b5-d9e9-e611-8101-3863bb3c7738
99ffe734-dccc-4020-b6b2-cc48216bdcca	Bell Canada - 360 Small	054ff4d5-efee-4987-8695-30e1d2cbd070
e8fc6a86-884f-4cfe-b220-73b4e5e97577	BT - 360 Small - Old Token Model	7749f42c-8c75-4c5e-b0c1-d937dae7c009
67e0b7a0-523f-439e-898a-3ed9c2f941f0	Charter - 360 Medium - Old Token Model	926cc793-3526-4879-8966-3aa55ffb724f
66eb20c9-e65c-4aa6-b20f-eb42de96a0f5	IR - 360 Medium	19dd9b4b-a1f0-4f29-b9c3-37de53f57ff5
a8c40b4c-6eaf-4efd-bfd9-fa73bac4b2f2	EvolveIP - 360 Small - MSFT Ready	8123b86f-7147-411c-b2ba-5967f75ce913
37d5b2a8-63ac-4112-85ed-a2a2256fb4ba	EPOS - 360 Basic	7a0d26a4-93c5-4c4d-b1f6-5574ea13a5ff
86ed6072-069c-4712-92d7-a258e354b798	Cox - 360 Medium	91d70b2f-d201-4177-8704-2a03a37d2e46
22cc6133-6888-45ce-89ee-71f8571208a0	Consolidated - 360 Small	7ef34527-4b22-47e5-ae82-ec75aef3fb75
0d916dcc-515f-47b5-b8c3-4f7884d274f5	Cloud9 - 360 Small	aed14150-7807-425e-b858-50e1b5f15e9e
ca0338ac-4ebc-4108-a92a-b1d253e05b31	Kandy - 360 Small	38e2e282-c33d-4fa6-991a-38dcbb7eb080
8d81e306-bbdb-409f-b0e8-0ece1bc489ee	Avaya - 360 Custom (With Tokens)	371c89cd-5ac2-4118-86c8-f5c15fa28358
0f49e2e2-546e-4acf-a051-f5fcac1a3ae0	Avaya - 360 Small	371c89cd-5ac2-4118-86c8-f5c15fa28358
0aefbe26-e929-4a04-922e-0aee390c0d89	AudioCodes - 360 Small	fdadbc12-268e-4aa9-bfb8-1fe3d093cebc
3242e5b8-7a7f-4050-9b50-eadaa7bcd048	Alianza - 360 Small	3bd6ed9a-8b7b-4946-87b5-1cd9f51cc1c1
3e3eb864-689d-40a6-816e-340a8def68dd	Mutare - 360 Small	64434b64-0f13-41a8-8c03-9ecd723e0d12
1730bb3f-1f13-4401-a366-a5dccdd620e0	CBTS - 360 Basic - MSFT Ready	55bfa01c-b790-473f-8c24-960f251912b9
5f1fa1f7-92e3-4c92-b18b-d30f26ef4f73	Testsub	c4716775-bad0-4eee-8f77-e14f878c0320
ac7a78c2-d0b2-4c81-9538-321562d426c7	Default	0b1ef03f-98d8-4fa3-8f9f-6b0013ce5848
b01c05c7-dfec-400d-be57-505b0bcd7de4	Bigger Better 360 Small	79f4f8b5-d9e9-e611-8101-3863bb3c7738
0cde8c0e-9eab-4fa9-9dda-a38c0c514b3a	testxx	157fdef0-c28e-4764-9023-75c06daad09d
83dbbb1d-2bdc-484d-8c51-4f290e4e3002	Default	5cc24582-343c-4687-9af8-be25859afe45
069dc3aa-dcb1-45e6-886f-be8f2345080f	Default	0856df81-8d32-4adb-941a-c0d9187f36a7
0364be93-447e-4fae-91b1-7278bbf63574	Default	467aee0e-0cc8-4822-9789-fc90acea0a04
31d81e5c-a916-470b-aabe-6860f8464211	testv3Sub	467aee0e-0cc8-4822-9789-fc90acea0a04
53c19602-bbb4-49da-a277-0d29dcc1538d	testDemo	26898de8-7305-471f-9f11-01ca725ac20b
1dfb59b1-62ec-4575-8ebc-8f31948d64f8	testCustomerDemo2	26898de8-7305-471f-9f11-01ca725ac20b
30ab21cd-61ae-4439-a532-84487b061bbd	Default	0ed27fc6-16f7-441e-9a2c-93e6eb5a7d10
8078a836-66aa-4a51-b5db-5b2c008e55aa	Default	c30ba7a8-03bf-45d2-a795-b739acb469f8
6b06ef8d-5eb6-44c3-bf61-e78f8644767e	testDemoR	24f63557-5a4e-46ae-8ef7-d5c0b1767a8a
\.


--
-- Data for Name: subaccount_admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subaccount_admin (subaccount_admin_email, subaccount_id) FROM stdin;
TestDemo@hotmail.com	53c19602-bbb4-49da-a277-0d29dcc1538d
rajkamal@tekvizion.com	66eb20c9-e65c-4aa6-b20f-eb42de96a0f5
default@gmail.com	0364be93-447e-4fae-91b1-7278bbf63574
skanniyappan@tekvizion.com	3e3eb864-689d-40a6-816e-340a8def68dd
kmukkamala@tekvizion.com	8d81e306-bbdb-409f-b0e8-0ece1bc489ee
simmanuel@tekvizion.com	3242e5b8-7a7f-4050-9b50-eadaa7bcd048
v@tekv.com	31d81e5c-a916-470b-aabe-6860f8464211
jalphin@tekvizion.com	0aefbe26-e929-4a04-922e-0aee390c0d89
sdu@tekvizion.com	0f49e2e2-546e-4acf-a051-f5fcac1a3ae0
dmeredith@tekvizion.com	99ffe734-dccc-4020-b6b2-cc48216bdcca
testDemo2@hotmail.com	1dfb59b1-62ec-4575-8ebc-8f31948d64f8
samuelvs667+4@gmail.com	30ab21cd-61ae-4439-a532-84487b061bbd
jalphin+1@tekvizion.com	ca0338ac-4ebc-4108-a92a-b1d253e05b31
dmeredith+1@tekvizion.com	d977656e-049a-4490-ad4c-c3fc9205d50f
dmeredith+2@tekvizion.com	e8fc6a86-884f-4cfe-b220-73b4e5e97577
dmeredith+3@tekvizion.com	1730bb3f-1f13-4401-a366-a5dccdd620e0
svalayanantham@tekvizion.com	67e0b7a0-523f-439e-898a-3ed9c2f941f0
skumar+1@tekvizion.com	9b9cd5ee-27ae-41e0-976c-db263be8f71f
relango@tekvizion.com	30249e2b-876c-48f5-a804-b4dc688c2d84
samuelvs667+8@gmail.com	8078a836-66aa-4a51-b5db-5b2c008e55aa
jalphin+2@tekvizion.com	b50349c8-0811-4c21-a757-f70597a22990
skumar+2@tekvizion.com	0d916dcc-515f-47b5-b8c3-4f7884d274f5
skumar+3@tekvizion.com	22cc6133-6888-45ce-89ee-71f8571208a0
dmadiyan@tekvizion.com	86ed6072-069c-4712-92d7-a258e354b798
skadiyala@tekvizion.com	e8cf8d9a-f842-44ac-9f9e-b1aa61f8386a
rviswanathan+1@tekvizion.com	37d5b2a8-63ac-4112-85ed-a2a2256fb4ba
skumar+4@tekvizion.com	a8c40b4c-6eaf-4efd-bfd9-fa73bac4b2f2
skanniyappan+1@tekvizion.com	d9ff3754-5adc-41f0-a23d-21fb33c0323d
rweber@tekvizion.com	e17d1ef3-597c-4d17-a208-21b1a612ea5c
rweber+1@tekvizion.com	e5e293a7-1cab-4d95-86f0-c758541fd957
svalayanantham+1@tekvizion.com	a9f2c313-7d80-4c1f-bda5-91f2767b3716
jalphin+3@tekvizion.com	04dfda26-98f4-42e5-889a-3edccf4b799c
skadiyala+2@tekvizion.com	31c142a6-b735-4bce-bfb4-9fba6b539116
skadiyala+3@tekvizion.com	078b980a-96f8-460b-a44d-b7d37fbc858a
rajkamal+2@tekvizion.com	f5a609c0-8b70-4a10-9dc8-9536bdb5652c
aguajardo@tekvizion.com	87283654-cb92-4355-ac0d-88dcafc778ad
dmeredith+4@tekvizion.com	3f87fff9-200c-4f1b-af9e-5ab9ade5e3e3
simmanuel+1@tekvizion.com	173c00ea-6e5c-462c-9295-ae5e14adc14f
cpoornachandran@tekvizion.com	637b5502-cf56-4113-8354-cd7098442f97
cpoornachandran+1@tekvizion.com	845881b4-3584-4ae0-bf8a-0c12f7892095
dmadiyan+1@tekvizion.com	485d3fe8-ee5d-41d9-a586-e033d4b95c95
cpoornachandran+2@tekvizion.com	a6278e6c-8e45-421f-97f0-de60fce06608
dmeredith+5@tekvizion.com	48a8f94a-35ab-461c-9e8e-585692f087f5
skadiyala+4@tekvizion.com	9599c5bd-f702-4965-b655-29b0fed00e23
skumar+5@tekvizion.com	82e579e9-4444-46c9-aaf7-5b365c92524a
jalphin+4@tekvizion.com	cae19a1a-c9b5-4a55-8cdd-811dfea3770c
cpoornachandran+3@tekvizion.com	0454e724-f26f-4b64-a757-7d99a02f6464
dmadiyan+2@tekvizion.com	241234a3-f182-4eb9-ae04-6e802f3db04f
skanniyappan+2@tekvizion.com	01442bce-d452-4742-bcb5-27b93a44314f
dmeredith+6@tekvizion.com	565e134e-62ef-4820-b077-2d8a6f628702
testDemoR1@hotmail.com	6b06ef8d-5eb6-44c3-bf61-e78f8644767e
tes@email.com	5f1fa1f7-92e3-4c92-b18b-d30f26ef4f73
default@rodrigotest.com	d45db408-6ceb-4218-bd36-6355e0e21bfb
vtest6@gmail.com	1e22eb0d-e499-4dbc-8f68-3dff5a42086b
sravraksh@outlook.com	3819dc98-0e34-4237-ad0f-e79895b887e9
kaushik@test.com	c428b1f2-0322-4686-a5cf-66eb4e74a0f5
stan.chizhevskiy@access4.com.au	9e6d1769-5f32-461d-a557-8fb9a499757b
test+1@tekvizion.com	b01c05c7-dfec-400d-be57-505b0bcd7de4
test-customer-full-admin@tekvizionlabs.com	ac7a78c2-d0b2-4c81-9538-321562d426c7
testvv22@g.com	0cde8c0e-9eab-4fa9-9dda-a38c0c514b3a
samuelvs667+3@gmail.com	83dbbb1d-2bdc-484d-8c51-4f290e4e3002
samuel-vs6+5@hotmail.com	069dc3aa-dcb1-45e6-886f-be8f2345080f
\.


--
-- Data for Name: usage_detail; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usage_detail (id, consumption_id, usage_date, day_of_week, mac_address, serial_number) FROM stdin;
eea27aa4-f2b7-455a-a8ea-af85ee6ac25e	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-17	1		
3ad3f83e-2654-466d-b9e9-9cd8ded28110	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-18	2		
34859fba-9987-4a1c-b176-14569b331653	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-19	3		
b66edd36-ee7f-42e7-bfb4-41810ea69fe6	c323f5f8-cd49-4b0b-ac74-fe2113b658b8	2022-07-20	4		
e5613bef-790c-43ec-ab57-35300748ee8b	c2780fab-2115-4bcd-968b-0588fff2909f	2022-06-17	5		
5f24200f-d28a-4a7b-828b-1c5657c5aa74	ef715447-966a-418a-9e61-8d2efb9d9011	2022-06-17	5		
6c53e631-03db-4eab-a46c-6add85eef6a4	a572f05c-c96c-48f5-9f6c-e8d4ea0ded81	2022-06-17	5		
a0d347c4-d14f-4d73-ab33-4ad4e0896c85	09f80827-e09e-4838-9fe0-cbdc64411885	2022-06-17	5		
528fad08-e75d-4724-9672-c9ada6fc2be9	489e5671-9c54-4cfe-be78-8a4894eaf15a	2022-06-17	5		
a5c72dc5-88d6-4735-99be-763e7ddaa1a4	3153f38e-6db8-439f-9e8f-bb4c44bcbf67	2022-06-17	5		
02daf0e3-3035-432b-9c02-344d35801a8a	5310efd2-8cf0-4fbf-992f-e0005286c8f0	2022-06-17	5		
678b8cb2-1d01-4f3c-9979-bef43e215e5e	2ac17913-6dd2-4aab-83cf-3f3446b68a12	2022-06-17	5		
c6a21d7d-a466-4c6b-9bcf-61ecea80717d	f78ce1a0-2e97-4563-901e-936eb8ab92e0	2022-06-23	4		
e866768d-4c2b-47e1-a708-38cbe3f40321	f78ce1a0-2e97-4563-901e-936eb8ab92e0	2022-06-24	5		
047eacba-d938-4599-ab68-aef1ce67ee7f	d39ea71e-182f-4748-a611-a1fa07815401	2022-06-23	4		
3280cda5-2282-4bec-97b7-fc9dda3c724d	d39ea71e-182f-4748-a611-a1fa07815401	2022-06-24	5		
16d19b68-4b52-4d65-8603-41d050ef8569	b2e9ab91-2a2b-46db-b80e-0f9b49351e35	2022-06-22	3		
15e6d5ed-adf1-47f1-8a31-b01d617318ea	b2e9ab91-2a2b-46db-b80e-0f9b49351e35	2022-06-23	4		
c226605f-0d6e-4638-ab47-3b7cb68daaf1	b2e9ab91-2a2b-46db-b80e-0f9b49351e35	2022-06-24	5		
3fdca933-4ef2-4e1e-b8fd-131b1c3cd5d2	58abb2a2-0763-445c-9b1d-5bfe8993b6b2	2022-06-23	4		
d260b70a-f750-40aa-9a21-6c30be29f43b	58abb2a2-0763-445c-9b1d-5bfe8993b6b2	2022-06-24	5		
dae6c2c3-fa69-4cd4-8b27-9cacfe371141	90f3b141-b149-493d-a5c3-f7bf52e81d1c	2022-06-24	5		
5b2a5eec-814b-4cee-8a3a-80045adf66d9	adcf947f-d3fe-42a0-92fe-d8c9e3d8d848	2022-07-10	0		
69c0a2c5-e7bf-4011-a77e-d2b7b740968b	048264ce-dc9e-420a-9d7c-5a38e09382e6	2022-06-17	5		
2802f526-515d-4c24-b1c1-d18f894d05ce	91a228cc-2fa7-49d8-bd81-fb5242e9b828	2022-06-17	5		
3582cfe9-b68b-47c4-80ce-62bc088a4238	b6f90b60-e8ba-4611-8513-9c7cf10f51c0	2022-06-17	5		
99402ae3-e313-4f59-bc31-7a0592e08012	adcf947f-d3fe-42a0-92fe-d8c9e3d8d848	2022-07-16	6		
98794327-5bbe-49d5-932c-f873a30d39d0	07d95831-cdc0-4435-bd4e-75eba16d5dc3	2022-06-13	1		
b4a5f305-7786-4c81-9163-a0a57533767c	3f3507da-d4c5-462d-abd0-b8b37997651d	2022-06-13	1		
4cef468b-29b2-4748-826c-0b3fb300446b	5262ca4a-9bf4-4b48-a985-890a9dc32418	2022-07-05	2		
a5e20852-5e69-41d5-a3d2-2caa0f00ebdc	5262ca4a-9bf4-4b48-a985-890a9dc32418	2022-07-06	3		
66a0bfb3-139c-4619-9f41-47a55e378f5c	01412e5e-8377-4101-811d-2553b7cad83e	2022-06-13	1		
77c690a5-9f99-4f59-8212-8f609b4d449b	40df3055-8117-4bc3-9178-8efee8d30bb6	2022-06-13	1		
c87c6db1-103f-463e-b5e1-ad6392c7c82b	f960a45d-d269-4ce4-ada9-7be5876fe923	2022-06-13	1		
b709aabc-2f75-4cfe-a093-48b75d3fd58b	13afe7ef-262e-4ec0-a9c3-2778285a7475	2022-06-13	1		
68d8cc97-5db2-4de1-808b-affc6b504bbf	615afc15-4b01-4e78-b7d7-65767a2c27e0	2022-06-12	0		
e8e2f85f-2704-4d06-b87c-d8a657778f31	ee41d801-bac2-497c-b001-7e9be8782461	2022-08-21	0		
28d1e8c5-d558-46e7-b272-a07b1771309f	3a545eed-7830-459f-843e-8f3a8466e986	2021-08-30	0		
81fcfc60-3314-419d-a42d-a3bd69cb5457	87cb0e51-e934-4cd9-bcc4-63165ab1c845	2021-08-30	0		
867892ec-f894-4995-878e-fef78cb9aa15	a1881283-9d5a-4bf4-b342-d745d98108b9	2021-08-30	0		
ef266266-fee0-4f89-8671-02e3d2210143	ee41d801-bac2-497c-b001-7e9be8782461	2022-08-22	1		
bc24007a-5dff-433b-9216-75efc40d34fc	399f5bac-6256-4968-8119-6d101f4d5707	2022-08-28	0		
4a826759-cea8-489e-8c8d-3f8cf12828f7	399f5bac-6256-4968-8119-6d101f4d5707	2022-08-29	1		
c9f8f60d-0fd5-4d38-b289-163432c852a0	399f5bac-6256-4968-8119-6d101f4d5707	2022-08-30	2		
7538df05-c725-45d3-bed8-5958ac8de52f	227a11f7-6a92-4c9d-a0fb-97293d5bcf6c	2022-06-28	2		
0d9028ac-104d-43c5-a961-48f2f5d5d0e7	227a11f7-6a92-4c9d-a0fb-97293d5bcf6c	2022-06-29	3		
c925c51f-e893-4a5a-9cdd-134ded8f0521	227a11f7-6a92-4c9d-a0fb-97293d5bcf6c	2022-06-30	4		
fa689fc3-fdfc-4faf-8a3f-670ab10a04da	399f5bac-6256-4968-8119-6d101f4d5707	2022-08-31	3		
196b07c0-f32e-4090-b29c-44f8c216eba3	399f5bac-6256-4968-8119-6d101f4d5707	2022-09-01	4		
d6b57da6-a3e3-474e-9322-664c0036d187	399f5bac-6256-4968-8119-6d101f4d5707	2022-09-02	5		
b04265c3-b5cf-4e55-9854-217db2b3d5a7	227a11f7-6a92-4c9d-a0fb-97293d5bcf6c	2022-07-01	5		
64cdb92a-5de5-456b-9093-34b2a1cf50eb	399f5bac-6256-4968-8119-6d101f4d5707	2022-09-03	6		
f584e8cb-0dfa-480c-a8ce-cfdf4d2c11db	bd7c38c7-1c18-453a-991a-1b32fc971972	2022-08-28	0		
f7d76616-45e9-49df-820b-6488e70c00b1	4a04dd4f-7bf1-4acd-b8ab-88ea91cbad2e	2022-08-07	0		
3be87c9e-359e-4a94-bb26-ee6d8c61be76	c0dcf7aa-efc9-4d47-8db1-6f34ac5083fa	2022-07-11	4		
ea21ce2c-486e-4a89-999e-92f4af815433	89a7ed09-a5ec-4380-a52e-6b232a328196	2022-08-02	1		
7c91af7e-e096-4b14-a456-9fa36b6e8541	ff034a3a-c166-4f08-847c-1a1190e8f1fa	2022-06-27	1		
98e7d27b-9048-4cc5-afc6-c9226533f6fc	ab423f2e-26d6-4e9d-9e97-5aadba0ab522	2022-08-29	1		
e9d41ea0-40d0-4f03-a13a-0da45f109288	00ff2ae7-eeae-4740-b950-bb0518c66d8f	2022-08-03	2		
ed39f347-dd4f-4293-bd1d-ea2a0a986238	01536cb6-7c31-4a92-81f1-8ae4141cc2ad	2022-07-25	1		
a7874138-9772-412a-9d0e-826e73e369fb	01536cb6-7c31-4a92-81f1-8ae4141cc2ad	2022-07-26	2		
ab3cc0a3-5d7c-47f1-b005-496ad7bba554	2c5f9df4-de15-4cb4-919c-72e91ef0809b	2022-07-26	2		
c6e455d1-5993-46d4-ad56-f7d8e6be1210	ff034a3a-c166-4f08-847c-1a1190e8f1fa	2022-06-28	2		
84d34689-f00f-4d07-b48b-0b865d912d1f	6e2e46a5-f3e3-469b-895d-f71d2857fb26	2022-06-30	4		
88cd4aa6-9aa5-4cb2-836b-a62182aca3f6	6e2e46a5-f3e3-469b-895d-f71d2857fb26	2022-07-01	5		
181f5b31-240d-4c35-a082-8d7d84e067e6	94f427c8-2fbb-49c2-958c-ec07924664e9	2022-06-27	1		
c2bb0c59-5d23-4732-a736-4bd5645b5958	94f427c8-2fbb-49c2-958c-ec07924664e9	2022-06-28	2		
ac3514c9-3238-432a-ab87-79b056677d71	94f427c8-2fbb-49c2-958c-ec07924664e9	2022-06-29	3		
5625d57a-5605-40b9-820b-1cc2fb8fae88	94f427c8-2fbb-49c2-958c-ec07924664e9	2022-06-30	4		
d3a0cabb-c312-4877-833e-d6ac228132b2	94f427c8-2fbb-49c2-958c-ec07924664e9	2022-07-01	5		
157f6bcf-dd9c-4d31-b81e-608b7de11ccb	8a31b4d3-a4b2-4d9f-9012-2eaaafa450b0	2022-06-27	1		
08895e91-d160-468a-a214-9c0fe04e9bb8	8a31b4d3-a4b2-4d9f-9012-2eaaafa450b0	2022-06-28	2		
f0ad539a-d6bf-448a-8d1e-874086fbeab0	8a31b4d3-a4b2-4d9f-9012-2eaaafa450b0	2022-06-29	3		
00776c8f-e648-4db5-90db-db462703fbe2	8a31b4d3-a4b2-4d9f-9012-2eaaafa450b0	2022-06-30	4		
e7baff25-f5da-4c24-bdb7-110b0c3888fe	8a31b4d3-a4b2-4d9f-9012-2eaaafa450b0	2022-07-01	5		
b42ab6d0-9b1b-47a8-bf87-6b693c654d68	7c9b043a-b572-45d5-90ea-755741298b83	2022-07-13	2		
828408f3-5879-42df-9df1-bc69ea6129bc	7c9b043a-b572-45d5-90ea-755741298b83	2022-07-14	3		
1b5bc353-63f3-4fe9-aeee-e6aaf6bbb6e0	bc96a1a2-96fc-44e7-b38d-42f0b5a2f1fa	2022-07-12	1		
484ea357-c09d-42c8-bff6-d419d324720c	6d433c0b-9ba2-413f-89ee-b606a3262c7d	2022-07-12	2		
56a8ec96-4a14-46cc-ab6a-e56a3dbf7a38	6d433c0b-9ba2-413f-89ee-b606a3262c7d	2022-07-13	3		
c03dc31c-0404-4c47-ae04-3242d059b3db	6d433c0b-9ba2-413f-89ee-b606a3262c7d	2022-07-14	4		
d8ab8f5f-fcc1-4737-b559-08ca97c8f0cb	ab6a865c-409e-4de1-85ba-3270a710e661	2022-07-13	3		
8995d270-a71c-4168-8e11-e439f6015502	ab6a865c-409e-4de1-85ba-3270a710e661	2022-07-14	4		
eddc151d-aff1-4163-8578-4db445835b2c	ab6a865c-409e-4de1-85ba-3270a710e661	2022-07-15	5		
34db5be5-6be2-4985-aac1-e2fa87a1647d	1f9a7364-4938-47e0-aa1a-68bd24b0c458	2022-08-02	2		
ea0fe5ac-0f35-4a40-9b53-5ac017d47b72	1f9a7364-4938-47e0-aa1a-68bd24b0c458	2022-08-03	3		
39586a5c-7a3c-4a61-a3dc-bf57cdfdae73	1f9a7364-4938-47e0-aa1a-68bd24b0c458	2022-08-04	4		
8338c615-6411-4507-920d-a24921576d3f	8bd7e065-f369-4b96-b0bd-8456221b31a7	2022-07-19	2		
9789f1f7-8d6a-4552-a3e7-71c7782bccfb	8bd7e065-f369-4b96-b0bd-8456221b31a7	2022-07-20	3		
cc581bce-ebb2-4cc7-8d49-ea710cec38e7	8bd7e065-f369-4b96-b0bd-8456221b31a7	2022-07-21	4		
7c3b2540-35af-4294-b87f-11995dc0d640	13efb7b2-a7bd-4679-8dd0-4dfbb72756b1	2022-07-27	3		
e3f16126-e3ad-4855-b506-35404760317b	f0b3a538-e3b0-439d-9166-0e25d269f9ae	2022-07-13	2		
969ca6d1-f02c-438b-bd5d-150f49b09969	bc96a1a2-96fc-44e7-b38d-42f0b5a2f1fa	2022-07-15	4		
f98855bc-fe57-4e03-8b6e-6281ad96beff	21dad31a-d22b-4ab9-bf86-f49d3188daf1	2022-07-12	1		
1d960d7a-3374-47df-bb33-e126455c8f75	21dad31a-d22b-4ab9-bf86-f49d3188daf1	2022-07-15	4		
b9468fb9-59ad-4e51-b7cb-104c698991e4	2cd69392-6525-4a18-ab75-0de831284755	2022-07-13	2		
79eeb531-6589-4fe5-af66-55ae02646dc2	2cd69392-6525-4a18-ab75-0de831284755	2022-07-15	4		
ecf72967-690e-4f5e-8aa3-22fc1605e151	087fb3dd-0c42-468b-883a-38f1cb5ca05e	2022-07-13	2		
6a191018-4f6e-4f23-8d1b-165fb53a9048	0c5755b6-e65a-4afb-9f94-7a16f462eb29	2022-07-12	1		
7b25802c-3257-48c2-9047-9d4eee791af3	0c5755b6-e65a-4afb-9f94-7a16f462eb29	2022-07-15	4		
7ad94517-d2ab-4771-957f-ee659108f93d	c0beab05-ce1f-4289-9ddb-41d63a838592	2022-06-19	1		
6552d3a7-85af-447e-92f7-707c903c8b05	c0beab05-ce1f-4289-9ddb-41d63a838592	2022-06-20	2		
183c4fb7-5186-4a72-b7cb-ce288f1028a0	c0beab05-ce1f-4289-9ddb-41d63a838592	2022-06-21	3		
93d7d2d4-2a39-478d-b292-92c344732dfe	13efb7b2-a7bd-4679-8dd0-4dfbb72756b1	2022-07-28	4		
18133d76-ae1c-47f8-9d9c-b5678eb9f57f	f8f314a9-e0e5-40cb-8469-51df50aa348d	2022-07-03	0		
1ad01abc-7f80-457f-ab8d-bc11633d18af	f8f314a9-e0e5-40cb-8469-51df50aa348d	2022-07-04	1		
d1418531-c515-416b-8da2-1070dd7f801f	f8f314a9-e0e5-40cb-8469-51df50aa348d	2022-07-09	6		
9266afc4-bb3a-4107-a9b4-84f951a26bc4	adcf947f-d3fe-42a0-92fe-d8c9e3d8d848	2022-07-11	1		
6b11a790-404e-44a6-aa19-4180c7a6ee11	adcf947f-d3fe-42a0-92fe-d8c9e3d8d848	2022-07-12	2		
3610ac3c-f1f7-4f1c-ab76-976facfb2d1e	adcf947f-d3fe-42a0-92fe-d8c9e3d8d848	2022-07-13	3		
46f9467f-795c-4501-951c-61b5beeee071	adcf947f-d3fe-42a0-92fe-d8c9e3d8d848	2022-07-14	4		
71bf32ed-a58b-4f7c-8ee4-b532a56ac141	adcf947f-d3fe-42a0-92fe-d8c9e3d8d848	2022-07-15	5		
56234c45-f66d-4f8a-9f4b-59218195fc35	34409cc4-2853-4186-a7c4-cd18b5830400	2022-07-27	3		
9a59dd9f-6a2b-4cef-95cf-b0e619fa34c9	34409cc4-2853-4186-a7c4-cd18b5830400	2022-07-28	4		
c2e544bb-e914-4cc0-8b2f-6f1d5716a6ac	b7fab5fb-1e8b-47a6-867d-84af8c82d97c	2022-08-02	1		
e94a3a9a-bebf-4171-aee1-dba5b91ab7e1	666dba7e-4ec5-4465-b3e3-6474e8f3d756	2022-08-02	1		
328ebacb-0d8a-44d2-a801-9b796184f2d9	b7fab5fb-1e8b-47a6-867d-84af8c82d97c	2022-08-03	2		
ccf69ef4-be70-4cee-941a-d32842a6ea99	666dba7e-4ec5-4465-b3e3-6474e8f3d756	2022-08-03	2		
9a77791c-0dc6-4f9d-a960-f9ee090f5e2b	b7fab5fb-1e8b-47a6-867d-84af8c82d97c	2022-08-04	3		
1a7edec0-e94c-471e-b9c2-58fd0f3ff253	666dba7e-4ec5-4465-b3e3-6474e8f3d756	2022-08-04	3		
ec83ccac-faba-40ba-8042-6f29aa9b09fb	d4346d00-dea7-44b6-a87d-a8ff20025712	2022-07-18	1		
2ed5a36c-4fe8-4f5e-9fb5-5e8cb22aa5a6	d4346d00-dea7-44b6-a87d-a8ff20025712	2022-07-19	2		
d5aeefeb-b776-4a4d-aafd-1fe8efa8ec8c	d4346d00-dea7-44b6-a87d-a8ff20025712	2022-07-20	3		
2e80bb21-8565-4ae4-8aec-346edf56291e	b7fab5fb-1e8b-47a6-867d-84af8c82d97c	2022-08-05	4		
78b3e89e-40d5-4d59-b00b-87920dad45ab	666dba7e-4ec5-4465-b3e3-6474e8f3d756	2022-08-05	4		
6aee8925-e3b7-437e-9be9-5a033327cf74	b7fab5fb-1e8b-47a6-867d-84af8c82d97c	2022-08-06	5		
7e06647c-471c-48d6-b2aa-dde9022695b0	666dba7e-4ec5-4465-b3e3-6474e8f3d756	2022-08-06	5		
5eeb2979-934b-457c-82f2-5af62fb47c05	b7fab5fb-1e8b-47a6-867d-84af8c82d97c	2022-08-07	6		
97490596-330b-4c39-bbc9-3fa1d65acf56	666dba7e-4ec5-4465-b3e3-6474e8f3d756	2022-08-07	6		
6cd1d07e-db65-4499-875f-ee0198eb04bf	4700e826-be6b-4816-97cc-e778683aa079	2022-03-19	0		
ed4c9f47-1ac2-4aaa-8d51-cfea4e220171	4700e826-be6b-4816-97cc-e778683aa079	2022-03-20	1		
4c7db660-44b3-4d0a-90e3-4cde61285334	4700e826-be6b-4816-97cc-e778683aa079	2022-03-21	2		
03e293ed-5bca-4116-a49c-100ae33d466b	4700e826-be6b-4816-97cc-e778683aa079	2022-03-22	3		
cce11cf1-e46e-4f1e-b57a-90e7a12dc298	4700e826-be6b-4816-97cc-e778683aa079	2022-03-23	4		
9cf4042b-23c9-43b8-b039-5b282d210a52	4700e826-be6b-4816-97cc-e778683aa079	2022-03-24	5		
a3545d02-b614-4e7e-9c37-fb87da6d26ad	4700e826-be6b-4816-97cc-e778683aa079	2022-03-25	6		
8595bfc3-f4fc-46b0-a376-bf390f92790c	1496c732-0e0d-4d7a-a5e3-8d1b281f67b0	2022-03-19	0		
9d723f10-ba48-4f67-bf93-d62c1775df57	1496c732-0e0d-4d7a-a5e3-8d1b281f67b0	2022-03-20	1		
3d0be5c5-8af2-4180-bb23-74a104a7fb49	1496c732-0e0d-4d7a-a5e3-8d1b281f67b0	2022-03-21	2		
03a9abb5-e567-4108-950f-172cf40d3b0b	1496c732-0e0d-4d7a-a5e3-8d1b281f67b0	2022-03-22	3		
9a449f4d-08ef-4d96-80d0-bc8b453bdaad	1496c732-0e0d-4d7a-a5e3-8d1b281f67b0	2022-03-23	4		
52ec87d0-fe25-42c2-98a8-a49447bf2af0	1496c732-0e0d-4d7a-a5e3-8d1b281f67b0	2022-03-24	5		
a44798d0-740d-463b-bc5d-8c00223f9960	1496c732-0e0d-4d7a-a5e3-8d1b281f67b0	2022-03-25	6		
cd8dcfc1-646b-4098-b773-d0f3920f2491	942e1cd6-d163-4d2e-9107-5af8bf673fc4	2022-03-26	0		
ee3a1c8e-0e92-49e8-a233-47f446b4c2a3	942e1cd6-d163-4d2e-9107-5af8bf673fc4	2022-03-27	1		
a7613d67-b1aa-4909-8b8d-a63f1fc548c1	942e1cd6-d163-4d2e-9107-5af8bf673fc4	2022-03-28	2		
efe05122-863f-4479-85db-4d74efaca986	942e1cd6-d163-4d2e-9107-5af8bf673fc4	2022-03-29	3		
faeedbf6-840e-45a5-b72f-baf856b79184	942e1cd6-d163-4d2e-9107-5af8bf673fc4	2022-03-30	4		
57d6b83f-ebef-491b-9019-cf1b3bde4cff	942e1cd6-d163-4d2e-9107-5af8bf673fc4	2022-03-31	5		
59357102-81f1-46a2-baee-e6f4d47e5957	942e1cd6-d163-4d2e-9107-5af8bf673fc4	2022-04-01	6		
c280bd63-a959-43e9-bbae-416813724070	8505fe43-23da-4d56-9ef3-94ed1044a6e6	2022-03-26	0		
c86a2f17-a916-4529-8f93-8e02195ee278	8505fe43-23da-4d56-9ef3-94ed1044a6e6	2022-03-27	1		
2f3de6ec-392b-4795-b4d2-5c74933c3bb4	8505fe43-23da-4d56-9ef3-94ed1044a6e6	2022-03-28	2		
098ac226-8435-458c-bdc7-fd3557185485	8505fe43-23da-4d56-9ef3-94ed1044a6e6	2022-03-29	3		
1e72e0be-7bc2-4d70-a4df-3a98bb83bae8	8505fe43-23da-4d56-9ef3-94ed1044a6e6	2022-03-30	4		
6f167166-3d34-4a3b-be01-0333e4d8c16a	8505fe43-23da-4d56-9ef3-94ed1044a6e6	2022-03-31	5		
400e1717-39c1-4fde-9501-94c2b3d2ca58	8505fe43-23da-4d56-9ef3-94ed1044a6e6	2022-04-01	6		
c756ca67-f6f7-484e-adb6-eb84336e8f5d	b2f8f3d9-61a8-4c12-b638-46eed65f77c5	2022-08-11	4		
3509fd7e-162c-4b73-bd73-862ab7091b73	b2f8f3d9-61a8-4c12-b638-46eed65f77c5	2022-08-12	5		
801757b8-2740-4458-9bea-3bbc52e50c54	46a41cc9-ccb2-458b-9e42-a26677df59f2	2022-08-28	0		
41023d4e-6e7a-48f7-aac8-c60b61ec8ce2	46a41cc9-ccb2-458b-9e42-a26677df59f2	2022-08-30	2		
1b0e6487-7229-406f-8415-8b4b9d32adc8	bd25d7bb-8e1f-461d-ad25-edecf8e9274b	2022-08-02	1		
ec545c85-e76b-4f07-ba98-cb20c43646c5	bd25d7bb-8e1f-461d-ad25-edecf8e9274b	2022-08-03	2		
b163e37d-a23f-4e07-bc72-169b0fd72f99	bd25d7bb-8e1f-461d-ad25-edecf8e9274b	2022-08-04	3		
fb18cc33-53aa-41ed-888d-b3d53f7a4ce5	bd25d7bb-8e1f-461d-ad25-edecf8e9274b	2022-08-05	4		
462d62e0-3cc5-49ef-bf17-4b944b188533	bd25d7bb-8e1f-461d-ad25-edecf8e9274b	2022-08-06	5		
53e211b3-f7e4-4caa-a6b7-ebc33fadb6d4	bd25d7bb-8e1f-461d-ad25-edecf8e9274b	2022-08-07	6		
1b45b65b-2e48-41c1-8c97-eb5239b6edf7	d9e0dd0d-8424-4510-9593-d4d9dfc8f28e	2022-08-05	4		
c1ccd4c7-6b1c-4663-8c89-fd8b45651838	217cca89-30c7-4019-8c7e-b348f125332e	2022-08-02	1		
c73b3f5c-ccdf-4540-93a8-e96c9c2cd16a	c1f57cdb-58dc-44cd-af27-e945fd492fcf	2022-07-12	2		
1ec94dcc-0ad2-41a4-9ee4-54d7ee8a2238	05be8638-7a22-4236-8ff7-c99b6d4cdb40	2022-08-04	3		
0130dcb4-639b-4252-9e3b-9a4411829073	06283032-ae64-406f-9a42-8898567b64b1	2022-08-02	1		
f15414b5-7b91-4d1a-89f1-1172b497f974	3bd8fa35-0a52-49ed-bd71-f799ed6f80f6	2022-08-01	0		
0e64963a-7bd1-45c3-85c9-b5a0fd6475bc	4a12e5fb-0ed7-4b39-915f-7dc2ccc023b3	2022-09-29	4		
18d03e07-a532-4144-8afa-dbb0bec261e6	4a12e5fb-0ed7-4b39-915f-7dc2ccc023b3	2022-09-30	5		
adbc0237-7d96-467b-a912-e1d11967c57f	227ce1b8-e06d-48c3-afb3-7aa3283cf07c	2022-07-17	0		
de84957f-46a6-4e11-b029-1ece5e8d165a	fde5b156-4f48-494a-b843-d2c14dfecb44	2022-07-24	0		
6444fe46-eadb-4615-84df-303fbcea28cd	dec88313-220f-436e-97f2-d6766b8ea58a	2022-06-26	1		
2401832c-dfbf-4dbe-b8c1-3d7133c60dca	dec88313-220f-436e-97f2-d6766b8ea58a	2022-06-27	2		
cdd4c3f0-0025-41a7-acbb-271d9999dca6	dec88313-220f-436e-97f2-d6766b8ea58a	2022-06-28	3		
b78f305b-1184-4c66-9229-c430fbb33b22	dec88313-220f-436e-97f2-d6766b8ea58a	2022-06-29	4		
1c17bcb6-1ae0-4340-b494-f41115b0ff81	dec88313-220f-436e-97f2-d6766b8ea58a	2022-06-30	5		
c848b0a0-6a02-4c8e-8c19-c80d0ea5d857	4157ffd3-f181-40be-9127-11b7b7c0d396	2022-07-03	1		
11f632e4-a74e-4cec-80b4-94650d4f405c	4157ffd3-f181-40be-9127-11b7b7c0d396	2022-07-04	2		
ad586271-1e36-4206-a4fe-927c2c140fb6	9820dad8-eab5-4bce-ae34-865d7de78e52	2022-07-13	2		
b8efb998-c269-4a1c-9510-c1309d010b3e	9820dad8-eab5-4bce-ae34-865d7de78e52	2022-07-14	3		
b45fb8d5-207a-4b38-bcd1-81194f9e7f77	a435ff6e-2dda-42e2-ba44-5702f18fff8c	2022-07-13	2		
a224f539-3aba-4674-938b-93a57fe8f5f5	bb6d5442-d147-403d-920b-36bc31a0abe2	2022-07-13	2		
a003363f-546c-435d-9c1e-3e2a3e602d02	bb6d5442-d147-403d-920b-36bc31a0abe2	2022-07-16	5		
31967017-25f3-4ac9-99fb-735fd09e7bfc	604372ef-ca19-438d-a4e1-188b07c837da	2022-07-13	2		
cbe8e768-bb50-4866-9f71-0ccda7b7ddf1	1f21fbef-be8c-433d-ae1a-e658fbfd5d24	2022-07-12	1		
a6d99c0e-7f33-4d9e-bf69-5fa03f729e78	1f21fbef-be8c-433d-ae1a-e658fbfd5d24	2022-07-17	6		
dfda53b1-46d0-474b-a516-8e4c2f47590c	c0beab05-ce1f-4289-9ddb-41d63a838592	2022-06-22	4		
a9a3bee8-2192-4a47-9dd4-9962165da1e2	c0beab05-ce1f-4289-9ddb-41d63a838592	2022-06-23	5		
f8b2cbd6-ef1d-4c5b-b5e2-bdf806eaba5e	48feb601-c1e5-423d-9de0-ceb5e86b6182	2022-06-26	1		
e27f0d41-99d0-40db-8606-6529d624ed4c	48feb601-c1e5-423d-9de0-ceb5e86b6182	2022-06-27	2		
86ef34e6-d2c3-44d2-97b4-f8b42e7c3415	48feb601-c1e5-423d-9de0-ceb5e86b6182	2022-06-28	3		
b2e1dc86-c355-4fac-b439-411599823aae	48feb601-c1e5-423d-9de0-ceb5e86b6182	2022-06-29	4		
1f5f4fb9-ede2-4399-ba74-4920b0245a7e	48feb601-c1e5-423d-9de0-ceb5e86b6182	2022-06-30	5		
44e62f01-52ce-4461-99cf-999f67d84dd0	1587335d-bedc-4d3f-9e12-a63a27666c64	2022-07-03	1		
8f81552c-81e3-4866-ab4b-f5a4a1497367	1587335d-bedc-4d3f-9e12-a63a27666c64	2022-07-04	2		
461409b3-1e9e-418f-82e1-19675d52e3d4	1587335d-bedc-4d3f-9e12-a63a27666c64	2022-07-05	3		
9008eadc-4afa-4da5-a014-7f0ac9d4d630	1587335d-bedc-4d3f-9e12-a63a27666c64	2022-07-06	4		
7421c35c-eb6a-4a25-8b7b-191f6bdff8b7	1587335d-bedc-4d3f-9e12-a63a27666c64	2022-07-07	5		
e1c67804-8f44-4219-93d0-404ea51bdd45	0634ea66-1bcf-4f96-a8df-468308be9184	2022-07-10	1		
b05c75f8-c77a-4f63-88d0-d08590db54e4	0634ea66-1bcf-4f96-a8df-468308be9184	2022-07-11	2		
41aa097b-a769-47e5-acbf-45051224d131	0634ea66-1bcf-4f96-a8df-468308be9184	2022-07-12	3		
0575d91a-2350-4190-8be4-d6a2cb53118b	0634ea66-1bcf-4f96-a8df-468308be9184	2022-07-13	4		
af0ad36e-acc9-4649-96d6-cf748d7e7320	0634ea66-1bcf-4f96-a8df-468308be9184	2022-07-14	5		
be549c10-8f13-4d12-8f5a-7db0b4be8dc8	72bb8050-9752-45b9-a403-8d6d8986f8ff	2022-07-04	1		
7e5e8559-c507-402f-aa3f-fcb1c28bcd82	72bb8050-9752-45b9-a403-8d6d8986f8ff	2022-07-05	2		
411f24b5-4529-4361-9b78-16d57f1c4a8b	72bb8050-9752-45b9-a403-8d6d8986f8ff	2022-07-06	3		
ace9f9db-2ff3-4547-8adf-85b69e588b40	72bb8050-9752-45b9-a403-8d6d8986f8ff	2022-07-07	4		
717ceb8c-8d97-4ebc-9250-65003c82a6ff	72bb8050-9752-45b9-a403-8d6d8986f8ff	2022-07-08	5		
908dab2b-4da5-4208-af32-ba0cf3bc756c	ada83d8b-8623-48af-b19e-2b9191a955ba	2022-07-04	1		
1edd1903-2ebf-4b46-9a32-23987666a0c2	ada83d8b-8623-48af-b19e-2b9191a955ba	2022-07-05	2		
b52aab5c-1261-46cb-b8b2-590924e2eb01	ada83d8b-8623-48af-b19e-2b9191a955ba	2022-07-06	3		
66e36158-c00d-4b4d-8114-abce7e4f1124	ada83d8b-8623-48af-b19e-2b9191a955ba	2022-07-07	4		
1a4c47d0-ba92-4e6b-8856-a5998039bb3a	ada83d8b-8623-48af-b19e-2b9191a955ba	2022-07-08	5		
55268a9c-5017-439f-9238-45160b76d4d3	898adadc-fb81-443b-a0be-9e348cde5001	2022-07-04	1		
3a5904e7-bb79-4e42-aa81-5cc305709600	7026b872-77c4-4c43-a52c-fea17fc9a9bb	2022-07-11	1		
484e1957-c88d-4636-8ec5-0f6c812d019b	7026b872-77c4-4c43-a52c-fea17fc9a9bb	2022-07-12	2		
db8b4923-a498-493c-86e2-c0799f601cb1	7026b872-77c4-4c43-a52c-fea17fc9a9bb	2022-07-13	3		
04dff9c9-ec80-4ff1-822f-368d3447ab03	5facb398-ba92-4d28-aa49-1c5c6f58e382	2022-07-04	1		
356ae984-71bd-49c9-8ac3-1fb2ebdd691c	c232f69d-b23f-4bd7-8e0b-c47739590a4c	2022-07-13	3		
ef6d1a62-1459-42f0-8f4f-b0718d2d4315	c232f69d-b23f-4bd7-8e0b-c47739590a4c	2022-07-14	4		
26b0be9d-e5f6-4115-af72-0287b0a7d167	c232f69d-b23f-4bd7-8e0b-c47739590a4c	2022-07-15	5		
340002ae-b4eb-428d-9059-8c593cf19e78	50e3d30a-f829-42d2-82b3-623aea3c7d39	2022-07-08	3	\N	\N
007fed87-7064-4bc5-9d2f-f9077f315f63	bb6d5442-d147-403d-920b-36bc31a0abe2	2022-07-15	4		
d8cb7089-0133-4fde-8b14-00d92b173277	852a2611-5062-4323-9205-178dfd766488	2022-07-18	1		
627581bc-a13a-424f-b2a2-e350f7487cb0	964782de-1736-4f20-8260-9bc5996b1748	2022-07-18	1		
0dd27f0b-587f-4554-ac8e-9f2a644a578d	d69d69ff-b844-4e13-8e58-7174e831bd97	2022-07-17	0		
eaab3c1f-886e-42f0-87a4-48dfc599a727	a435ff6e-2dda-42e2-ba44-5702f18fff8c	2022-07-15	4		
981c1bf9-92ff-4db4-8a59-3e7124c8b3da	cf6564d9-24bd-4735-b7a6-4b70beeccca0	2022-07-04	1		
76681349-7097-4ceb-9665-9416c501a6ba	cf6564d9-24bd-4735-b7a6-4b70beeccca0	2022-07-05	2		
7e846b49-1844-4757-b8b1-020d0091dcb4	cf6564d9-24bd-4735-b7a6-4b70beeccca0	2022-07-06	3		
3fb135ad-463c-480a-ae84-4aff7358bdb5	cf6564d9-24bd-4735-b7a6-4b70beeccca0	2022-07-07	4		
fd8461d8-db38-447f-b3b7-19014ba66e41	cf6564d9-24bd-4735-b7a6-4b70beeccca0	2022-07-08	5		
\.


--
-- Name: bundle bundle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundle
    ADD CONSTRAINT bundle_pkey PRIMARY KEY (id);


--
-- Name: license_consumption consumption_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_consumption
    ADD CONSTRAINT consumption_detail_pkey PRIMARY KEY (id);


--
-- Name: customer_admin customer_admin_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_admin
    ADD CONSTRAINT customer_admin_pk PRIMARY KEY (admin_email);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: customer customer_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_unique UNIQUE (name, type);


--
-- Name: device device_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_unique UNIQUE (vendor, product, version, type, start_date);


--
-- Name: distributor distributor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.distributor
    ADD CONSTRAINT distributor_pkey PRIMARY KEY (id);


--
-- Name: distributor distributor_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.distributor
    ADD CONSTRAINT distributor_unique UNIQUE (name);


--
-- Name: license license_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license
    ADD CONSTRAINT license_pkey PRIMARY KEY (id);


--
-- Name: license license_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license
    ADD CONSTRAINT license_unique UNIQUE (subaccount_id, start_date, package_type, renewal_date, status);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: project project_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_unique UNIQUE (subaccount_id, name, code);


--
-- Name: subaccount_admin subaccount_admin_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subaccount_admin
    ADD CONSTRAINT subaccount_admin_pk PRIMARY KEY (subaccount_admin_email);


--
-- Name: subaccount subaccount_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subaccount
    ADD CONSTRAINT subaccount_pkey PRIMARY KEY (id);


--
-- Name: subaccount subaccount_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subaccount
    ADD CONSTRAINT subaccount_unique UNIQUE (customer_id, name);


--
-- Name: device supported_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT supported_device_pkey PRIMARY KEY (id);


--
-- Name: usage_detail usage_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_detail
    ADD CONSTRAINT usage_detail_pkey PRIMARY KEY (id);


--
-- Name: subaccount fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subaccount
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON DELETE CASCADE;


--
-- Name: customer_admin fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_admin
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: license_consumption fk_device; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_consumption
    ADD CONSTRAINT fk_device FOREIGN KEY (device_id) REFERENCES public.device(id) ON DELETE CASCADE;


--
-- Name: customer fk_distributor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT fk_distributor FOREIGN KEY (distributor_id) REFERENCES public.distributor(id);


--
-- Name: usage_detail fk_license_consumption; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_detail
    ADD CONSTRAINT fk_license_consumption FOREIGN KEY (consumption_id) REFERENCES public.license_consumption(id) ON DELETE CASCADE;


--
-- Name: license_consumption fk_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_consumption
    ADD CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: license fk_subaccount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON DELETE CASCADE;


--
-- Name: project fk_subaccount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON DELETE CASCADE;


--
-- Name: license_consumption fk_subaccount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_consumption
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON DELETE CASCADE;


--
-- Name: subaccount_admin fk_subaccount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subaccount_admin
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: device fk_subaccount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Adding project_owner to project
--

ALTER TABLE IF EXISTS public.project
    ADD COLUMN IF NOT EXISTS project_owner character varying;


--
-- Adding modified_by to license_consumption
--

ALTER TABLE IF EXISTS public.license_consumption
    ADD COLUMN IF NOT EXISTS modified_by character varying;


--
-- Adding modified_date and modified_by to usage_detail
--

ALTER TABLE IF EXISTS public.usage_detail
    ADD COLUMN IF NOT EXISTS modified_date timestamp without time zone;

ALTER TABLE IF EXISTS public.usage_detail
    ADD COLUMN IF NOT EXISTS modified_by character varying;


--
-- PostgreSQL database dump complete
--