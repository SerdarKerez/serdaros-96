import type { ProjectDetails } from "./types";

export const details: ProjectDetails = {
  slug: "genomik-crm",
  status: "Concept",
  role: "Design & architecture",
  period: "2026",
  cover: "/projects/genomik-crm/cover.en.svg",
  coverAlt: "A DNA helix, a customer card and data pipeline icons on a retro CRT screen, under the title 'Genomic CRM'",
  highlights: [
    "A platform concept that combines raw DNA file upload, parsing and quality control with the customer record",
    "A layered data architecture: Parquet partitioned by chromosome + CRM tables in SQL",
    "Consent, encryption and the right to erasure built into the design from day one (KVKK / GDPR)",
    "No diagnostic claims: reports are informational only and carry a verification warning",
  ],
  blocks: [
    {
      type: "p",
      text: "Genomic CRM is a **product and architecture concept** I've been thinking about: a system where customers upload the raw files they downloaded from consumer DNA tests, and the platform parses and annotates them, classifies the variants and ties all of it to a customer relationship system. It isn't a working product yet; this page explains how I define the problem and how I would build the system.",
    },
    {
      type: "note",
      text: "**Important:** Genomic CRM is a concept; it is not a medical device and it does not diagnose anything. The reports I've designed are for information only. Any health-related finding must be confirmed in a clinical laboratory and reviewed with a physician or genetic counselor.",
    },
    { type: "h", text: "The problem" },
    {
      type: "p",
      text: "Downloading a raw DNA file is easy; managing it in a meaningful and secure way is hard. A team that might want to work with this data, say a hypothetical **nutrition/wellness clinic** or a **genetic counselor**, may today have to receive files by email and process them by hand, keep consent on paper and store reports in scattered folders. My question was: what happens if the customer record, consent, file processing and reporting all meet in the same data model?",
    },
    { type: "h", text: "Target users (hypothetical)" },
    {
      type: "list",
      items: [
        "**Counselor / specialist:** sees the customer card, the status of uploaded files and draft reports on a single screen.",
        "**Customer:** uploads their file securely, manages their own consents, downloads their report or requests deletion of their data.",
        "**Administrator:** monitors access records (audit log) and retention periods.",
      ],
    },
    { type: "h", text: "Core modules" },
    {
      type: "table",
      head: ["Module", "Purpose", "Data / technology"],
      rows: [
        ["CRM records", "Customer, appointment, note and report history", "SQL (MSSQL / PostgreSQL)"],
        ["Secure upload", "Encrypted transfer, size and format checks", "Object storage, signed URLs"],
        ["Parsing & QC", "Normalizing provider formats, call rate, no-calls", "Python, pandas"],
        ["Annotation", "Versioned enrichment with dbSNP, ClinVar, gnomAD", "Parquet, versioned reference tables"],
        ["Report generation", "Consent-filtered report with warnings", "Template + PDF"],
        ["Consent management", "Scope-based, revocable approvals", "SQL, event log"],
      ],
    },
    {
      type: "p",
      text: "I won't repeat the details of file formats, reference genome builds, quality control and classification here; I covered them step by step in the Blog post **'Classifying and Mapping Raw DNA Data'**. This page focuses more on how those steps would fit inside a product.",
    },
    { type: "img", src: "/projects/genomik-crm/architecture.en.svg", alt: "System architecture diagram showing upload, object storage, the processing pipeline, Parquet partitioned by chromosome, the data warehouse and the SQL CRM tables", caption: "The system architecture I designed: genomic data and CRM data live in separate layers, linked by a shared sample ID." },
    { type: "h", text: "Data architecture" },
    {
      type: "p",
      text: "An uploaded file first lands, encrypted, in **object storage**. The processing pipeline reads the file, normalizes it and writes the result as **Parquet partitioned by chromosome**; from there it is loaded into a **data warehouse** for analytical queries. The CRM side (customers, consents, reports, access logs) lives in relational **SQL** tables. The only thing connecting the two worlds is a `sample_id` that contains no identifying information. Details like name and email never reach the genomic layer.",
    },
    {
      type: "p",
      text: "When a report is generated, every query goes through the consent table. For example, the pharmacogenomics section only runs for samples with active consent for that scope:",
    },
    {
      type: "code",
      lang: "sql",
      code: `-- Only include samples with active consent for the 'pgx' scope in the report
SELECT s.sample_id, v.rsid, v.genotype, a.gene, a.category
FROM crm.samples AS s
JOIN crm.consents AS c
  ON c.customer_id = s.customer_id
 AND c.scope = 'pgx'
 AND c.granted_at IS NOT NULL
 AND c.revoked_at IS NULL
JOIN dw.variants AS v
  ON v.sample_id = s.sample_id
JOIN dw.annotations AS a
  ON a.rsid = v.rsid
 AND a.db_version = @annotation_version
WHERE s.deleted_at IS NULL;`,
    },
    { type: "img", src: "/projects/genomik-crm/customer-card.en.svg", alt: "Screen draft of the customer card for a fictional person named Sample Customer: consent statuses, file status and a list of reports", caption: "Customer card draft. The person and all values are fictional." },
    { type: "h", text: "Privacy and ethics as part of the design" },
    {
      type: "list",
      items: [
        "**Encryption:** TLS in transit, encrypted objects at rest; keys are managed separately from application data.",
        "**Consent:** scope-based (processing, reporting, pharmacogenomics, research) and revocable at any time; every change is recorded as an event.",
        "**Data minimization:** only a `sample_id` in the genomic layer; the raw file is deleted after a set period once it has been processed.",
        "**Right to erasure:** a single request triggers deletion jobs for the CRM record, Parquet partitions, warehouse rows and copies in backups.",
        "**No diagnostic claims:** clinical labels are shown not as results but with a 'requires verification' warning.",
      ],
    },
    { type: "img", src: "/projects/genomik-crm/consent-flow.en.svg", alt: "Data flow diagram showing the steps of granting consent, processing, reporting, revoking consent and deletion", caption: "Consent and data flow: which layers of the pipeline are affected when consent is revoked or deletion is requested." },
    { type: "h", text: "Roadmap" },
    {
      type: "list",
      ordered: true,
      items: [
        "Write the SQL schema for the CRM and consent tables and test it with sample (synthetic) data.",
        "Turn the parsing and QC step into a standalone Python module.",
        "Combine Parquet partitioning and versioned annotation tables in a small ETL pipeline.",
        "Prototype the consent-aware report template and the deletion workflow.",
        "Not work with real user data without a legal and ethical review.",
      ],
    },
  ],
};
