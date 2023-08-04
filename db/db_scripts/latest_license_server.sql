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
-- Name: dut_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.dut_type_enum AS ENUM (
    'Device/Phone/ATA',
    'Soft Client/UC Client',
    'SBC',
    'BYOC',
    'Application',
    'Headset',
    'Video Collab Device (ROW)',
    'Video Collab Device (US)'
);

--
-- Name: calling_platform_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.calling_platform_type_enum AS ENUM (
    'PBX',
    'UCaaS',
    'Contact Center',
    'CCaaS',
    'CPaaS'
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
    'Contact Center',
    'UCAAS',
    'UCaaS',
    'CCaaS',
    'CPaaS',
    'CLIENT',
    'CERT',
    'Sandbox',
    'Device/Phone/ATA',
    'Soft Client/UC Client',
    'BYOC',
    'Application',
    'Headset',
    'Video Collab Device (ROW)',
    'Video Collab Device (US)',
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
    'AutomationPlatform',
    'Ctaas',
    'Certification'
);

--
-- Name: note_status_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.note_status_type_enum AS ENUM (
    'Open',
    'Closed'
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
    type public.device_type_enum NOT NULL,
    granularity public.granularity_type_enum DEFAULT 'week'::public.granularity_type_enum NOT NULL,
    tokens_to_consume integer NOT NULL,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deprecated_date timestamp without time zone DEFAULT 'infinity'::timestamp without time zone,
    subaccount_id uuid,
    tombstone boolean DEFAULT false,
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
    status public.status_type_enum DEFAULT 'Active'::public.status_type_enum NOT NULL,
    description character varying NOT NULL
);

--
-- Name: consumption_matrix; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consumption_matrix (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tokens integer DEFAULT 0,
    dut_type public.dut_type_enum NOT NULL,
    calling_platform public.calling_platform_type_enum NOT NULL,
    updated_by character varying
);


--
-- Name: license_consumption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.license_consumption (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subaccount_id uuid,
    project_id uuid,
    consumption_matrix_id uuid,
    consumption_date timestamp without time zone,
    usage_type public.usage_type_enum NOT NULL,
    device_id uuid,
    calling_platform_id uuid,
    tokens_consumed integer DEFAULT 0 NOT NULL,
    modified_date timestamp without time zone,
    modified_by character varying,
    comment character varying
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
    serial_number character varying,
    modified_date timestamp without time zone,
    modified_by character varying
);


--
-- Name: project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subaccount_id uuid NOT NULL,
    license_id uuid NOT NULL,
    code character varying DEFAULT 0,
    name character varying NOT NULL,
    status public.project_status_type_enum DEFAULT 'Open'::public.project_status_type_enum NOT NULL,
    open_date timestamp without time zone,
    close_date timestamp without time zone,
    project_owner character varying
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
    subaccount_id uuid NOT NULL,
    latest_callback_request_date timestamp without time zone,
    email_notifications boolean DEFAULT true
);

CREATE TABLE public.ctaas_test_suite
(
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subaccount_id uuid NOT NULL,
    total_executions integer NOT NULL DEFAULT 0,
    next_execution_ts timestamp without time zone,
    frequency character varying,
    device_type character varying,
    name character varying NOT NULL    
);

CREATE TABLE public.ctaas_run_instance
(
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    ctaas_test_suite_id uuid NOT NULL,
    run_no integer NOT NULL DEFAULT 0,
    start_date timestamp without time zone,
    completion_date timestamp without time zone 
);

CREATE TABLE public.ctaas_setup
(
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    azure_resource_group character varying,
    tap_url character varying,
    status character varying,
    on_boarding_complete boolean,
    subaccount_id uuid NOT NULL,
    maintenance boolean default false
);

CREATE TABLE public.ctaas_support_email (
	ctaas_setup_id  uuid DEFAULT public.uuid_generate_v4() NOT NULL,
	email VARCHAR
);

CREATE TABLE public.feature_toggle (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    status boolean DEFAULT false NOT NULL,
    author character varying,
    description character varying,
    name character varying NOT NULL
);

CREATE TABLE public.feature_toggle_exception (
    feature_toggle_id uuid NOT NULL,
    subaccount_id uuid NOT NULL,
    status boolean DEFAULT false NOT NULL
);

--
-- Name: subaccount_admin_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subaccount_admin_device
(
    subaccount_admin_email varchar not null,
    device_token           varchar not null
);

--
-- Name: note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.note (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    subaccount_id uuid NOT NULL,
    content character varying NOT NULL,
    status public.note_status_type_enum DEFAULT 'Open'::public.note_status_type_enum NOT NULL,
    open_date timestamp without time zone,
    opened_by character varying,
    close_date timestamp without time zone,
    closed_by character varying
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
1ffd1209-f03a-4d07-a27f-fee93ec4cb5f	tekVizion	Base SpotLight platform ready	1.0	OTHER	static	0	2022-06-17 15:42:48.550405	infinity	\N	t
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

COPY public.consumption_matrix (id, tokens, dut_type, calling_platform) FROM stdin;
a8654484-1cb2-4fec-adf4-ee7ddc17375d	2	Device/Phone/ATA	PBX
5726d813-834e-40c4-a52e-e9ac63459e03	2	Device/Phone/ATA	UCaaS
30ab93f1-3bde-4721-8892-1ba34a005d08	2	Device/Phone/ATA	Contact Center
89eeb522-157f-4125-96e6-b4cc900fa9d1	2	Device/Phone/ATA	CCaaS
5798ecd9-6db9-43a6-a521-b21f065e7879	2	Device/Phone/ATA	CPaaS
67e342e7-fc87-4440-bbd7-315b2938c858	2	Soft Client/UC Client	CCaaS
be612704-c26e-48ea-ab9b-19312f03d644	2	Soft Client/UC Client	CPaaS
eea27aa4-f2b7-455a-a8ea-af85ee6ac25e	5	SBC	PBX
3ad3f83e-2654-466d-b9e9-9cd8ded28110	5	SBC	UCaaS
34859fba-9987-4a1c-b176-14569b331653	5	SBC	CCaaS
b66edd36-ee7f-42e7-bfb4-41810ea69fe6	5	SBC	CPaaS
c323f5f8-cd49-4b0b-ac74-fe2113b658b8	5	BYOC	UCaaS
0cba280f-06fa-47c2-9782-c16d8bf8ed05	5	BYOC	CCaaS
9285ca9e-04c3-49df-9d59-085322a13319	5	BYOC	CPaaS
7f6c9fec-978f-41a6-ba38-117611f0dfa3	3	Application	PBX
1ba09c6f-9a2a-4181-ac1e-b7217763df96	3	Application	UCaaS
0e709699-3dab-47f1-a710-ebd2ae78d57b	3	Application	Contact Center
ea00b987-0f14-4888-a0ce-f963d1eb7592	3	Application	CCaaS
7ab51789-e767-42cc-a9ba-4ab4aef81d1f	3	Application	CPaaS
9c0cc4a5-a773-46f3-b73e-a09c55080b1f	5	Headset	PBX
9f53d1ae-e22d-4c3b-b05d-6bf6b13c0658	5	Headset	UCaaS
f2b57afb-c389-48ec-a54b-7d8a05a51f32	5	Headset	CCaaS
2bdaf2af-838f-4053-b3fa-ef22aaa11b0d	5	Headset	CPaaS
7564aab0-5331-4ab5-85f7-e37acbdfd90d	2	Video Collab Device (ROW)	UCaaS
cdd0e8af-1ba4-4a20-b354-bf7c6c121dc3	3	Video Collab Device (US)	UCaaS
\.


--
-- Name: bundle bundle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundle
    ADD CONSTRAINT bundle_pkey PRIMARY KEY (id);


--
-- Name: consumption_matrix consumption_matrix_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consumption_matrix
    ADD CONSTRAINT consumption_matrix_pkey PRIMARY KEY (id);


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
	
ALTER TABLE ONLY public.ctaas_test_suite
    ADD CONSTRAINT ctaas_test_suite_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.ctaas_test_suite
    ADD CONSTRAINT ctaas_test_suite_unique UNIQUE (subaccount_id, name);
	
ALTER TABLE ONLY public.ctaas_run_instance
    ADD CONSTRAINT ctaas_run_instance_pkey PRIMARY KEY (id);
	
ALTER TABLE ONLY public.ctaas_run_instance
    ADD CONSTRAINT ctaas_run_instance_unique UNIQUE (ctaas_test_suite_id, run_no);

ALTER TABLE ONLY public.ctaas_setup
    ADD CONSTRAINT ctaas_setup_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.ctaas_support_email
    ADD CONSTRAINT ctaas_support_email_pkey PRIMARY KEY (ctaas_setup_id, email);

ALTER TABLE ONLY public.subaccount_admin_device
    ADD CONSTRAINT subaccount_admin_device_pkey PRIMARY KEY (subaccount_admin_email, device_token);


--
-- Name: note note_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT note_pkey PRIMARY KEY (id);


--
-- Name: subaccount fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subaccount
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_admin fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_admin
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: license_consumption fk_device; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_consumption
    ADD CONSTRAINT fk_device FOREIGN KEY (device_id) REFERENCES public.device(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: license_consumption fk_calling_platform; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_consumption
    ADD CONSTRAINT fk_calling_platform FOREIGN KEY (calling_platform_id) REFERENCES public.device(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: license_consumption fk_consumption_matrix; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_consumption
    ADD CONSTRAINT fk_consumption_matrix FOREIGN KEY (consumption_matrix_id) REFERENCES public.consumption_matrix(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer fk_distributor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT fk_distributor FOREIGN KEY (distributor_id) REFERENCES public.distributor(id);


--
-- Name: usage_detail fk_license_consumption; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_detail
    ADD CONSTRAINT fk_license_consumption FOREIGN KEY (consumption_id) REFERENCES public.license_consumption(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: license_consumption fk_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_consumption
    ADD CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: license fk_subaccount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project fk_subaccount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project fk_license; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT fk_license FOREIGN KEY (license_id) REFERENCES public.license(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: license_consumption fk_subaccount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_consumption
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON UPDATE CASCADE ON DELETE CASCADE;


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

ALTER TABLE ONLY public.ctaas_test_suite
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.ctaas_setup
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.ctaas_support_email
    ADD CONSTRAINT fk_ctaas_setup FOREIGN KEY (ctaas_setup_id) REFERENCES public.ctaas_setup(id) ON UPDATE CASCADE ON DELETE CASCADE;
	
ALTER TABLE ONLY public.ctaas_run_instance
	ADD CONSTRAINT fk_ctaas_test_suite FOREIGN KEY (ctaas_test_suite_id) REFERENCES public.ctaas_test_suite(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.subaccount
    ADD COLUMN IF NOT EXISTS services character varying;
	
ALTER TABLE IF EXISTS public.subaccount_admin
    ADD COLUMN IF NOT EXISTS notifications character varying;

ALTER TABLE IF EXISTS public.subaccount_admin
    ADD COLUMN IF NOT EXISTS latest_callback_request_date timestamp without time zone;

ALTER TABLE ONLY public.feature_toggle
    ADD CONSTRAINT feature_toggle_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.feature_toggle
    ADD CONSTRAINT ft_name_unique UNIQUE (name);

ALTER TABLE ONLY public.feature_toggle_exception
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.feature_toggle_exception
    ADD CONSTRAINT fk_feature_toggle FOREIGN KEY (feature_toggle_id) REFERENCES public.feature_toggle(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.feature_toggle_exception
    ADD CONSTRAINT feature_toggle_exception_pkey PRIMARY KEY (feature_toggle_id, subaccount_id);

--
-- Name: note fk_subaccount; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note
    ADD CONSTRAINT fk_subaccount FOREIGN KEY (subaccount_id) REFERENCES public.subaccount(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: note subaccount_admin_device_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subaccount_admin_device
    ADD CONSTRAINT subaccount_admin_device_fk FOREIGN KEY (subaccount_admin_email) REFERENCES public.subaccount_admin(subaccount_admin_email) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- PostgreSQL database dump complete
--
