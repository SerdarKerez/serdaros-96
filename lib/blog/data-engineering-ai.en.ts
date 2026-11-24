import type { BlogPost } from "./types";

export const post: BlogPost = {
  slug: "data-engineering-ai",
  title: "Data Engineering and AI: A Model Is Only as Good as Its Pipeline",
  date: "2026-11-03",
  tags: ["data engineering", "artificial intelligence", "SQL", "RAG", "career"],
  cover: "/blog/data-engineering-ai/cover.en.svg",
  coverAlt: "Pixel data blocks flowing from a data pipeline into an AI chip on a retro CRT screen",
  summary:
    "Everyone talks about the shiny side of AI; I'm writing about the data pipelines behind it. Roles, pipeline layers, data quality, RAG and a learning roadmap for a student.",
  blocks: [
    {
      type: "p",
      text: "Everyone is talking about models: which LLM is smarter, which is cheaper, which has the longer context window. But while building my own AI-powered CMS project, I noticed something: most of my problems didn't come from the model, they came from **the data going into the model**. Missing fields, duplicate records, badly formatted dates... That is exactly why I want to move into data engineering. In this post I'll try to explain, through what I've learned myself, why AI is only ever as good as its data pipelines.",
    },
    { type: "h", text: "Three roles, three different questions" },
    {
      type: "p",
      text: "The thing people mix up most in this field is where one role ends and another begins. Roughly, this is how I split them: a **data engineer** makes sure data arrives somewhere reliably, on time and in the right shape. A **data scientist** asks questions of that data, analyses it and experiments with models. An **ML engineer** takes the model that was tested into production, serves it and monitors it. In real companies these lines blur; on small teams one person may do all three.",
    },
    {
      type: "table",
      head: ["Role", "Core question", "Typical tools"],
      rows: [
        ["Data Engineer", "Is the data correct, fresh and accessible?", "SQL, Python, Airflow/Dagster, dbt, Spark, Kafka"],
        ["Data Scientist", "What is the data telling us?", "Python, pandas, statistics, notebooks"],
        ["ML Engineer", "Does the model run reliably in production?", "MLflow, Docker, model serving, monitoring"],
      ],
    },
    {
      type: "img",
      src: "/blog/data-engineering-ai/roles.en.svg",
      alt: "Three-circle Venn diagram showing the overlap between the data engineer, data scientist and ML engineer roles",
      caption: "The roles overlap, but their focus differs: infrastructure, analysis and production.",
    },
    { type: "h", text: "The layers of a pipeline" },
    {
      type: "p",
      text: "An end-to-end data pipeline usually has five steps. If something goes wrong at any step, the dashboard or model at the very end silently produces wrong results.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "**Ingestion:** Collecting data from application databases, APIs, logs and files. It can be batch (hourly/daily) or streaming (real time). Using CDC (change data capture) to pick up only the rows that changed is a common approach.",
        "**Storage:** A *data lake* keeps raw data in cheap object storage (such as S3 or ADLS). A *data warehouse* (Snowflake, BigQuery, Redshift) is for structured, queryable data. A *lakehouse* combines the two: open table formats like Delta Lake and Apache Iceberg bring ACID transactions and schema management on top of the lake.",
        "**Transformation:** In classic ETL, data is transformed before it is loaded. In modern cloud warehouses, ELT is common: raw data is loaded first, and transformation happens inside the warehouse with SQL. dbt is the best-known tool for this approach.",
        "**Orchestration:** Which job runs when, in what order, with which dependencies? Tools like Airflow, Dagster and Prefect manage these DAGs, retry on failure and send alerts.",
        "**Serving:** Clean data is served to BI dashboards, reports, ML models or applications.",
      ],
    },
    {
      type: "img",
      src: "/blog/data-engineering-ai/pipeline.en.svg",
      alt: "End-to-end data pipeline diagram running from source ingestion through a data lake, transformation and a data warehouse to BI/ML layers",
      caption: "From source to consumer: every arrow is a place where an error can hide.",
    },
    { type: "h", text: "Garbage in, garbage out" },
    {
      type: "p",
      text: "The saying is old, but it matters even more in the age of AI. If a model is trained on bad data or fed the wrong context, it presents its mistakes in a very **confident** voice. That's why data quality should be thought of under four headings:",
    },
    {
      type: "list",
      items: [
        "**Validation:** Is a field that shouldn't be null actually null? Is a price negative? Is a value within the expected range? Tools like Great Expectations, dbt tests or Pandera let you write these rules as code.",
        "**Schema:** When a source system changes a column's name or type, the pipeline should catch it. The idea of a data contract binds the schema to an agreement between producing and consuming teams.",
        "**Lineage:** Which source did this table come from, and which transformations did it go through? Essential for tracing an error's impact backwards and forwards once you find it. OpenLineage is an open standard for this.",
        "**Freshness:** When was the data last updated? If a job that should have run last night didn't, the morning report shows data from the day before yesterday instead of yesterday, and nobody may notice.",
      ],
    },
    {
      type: "p",
      text: "A small example: the Python code below runs an orders table through some simple checks before it goes to a model or a warehouse. In a real project you'd write these with a framework, but the logic is the same.",
    },
    {
      type: "code",
      lang: "python",
      code: `import pandas as pd

def validate_orders(df: pd.DataFrame) -> list[str]:
    errors = []
    required = {"order_id", "customer_id", "amount", "created_at"}
    missing = required - set(df.columns)
    if missing:
        return [f"Missing columns: {sorted(missing)}"]

    if df["order_id"].duplicated().any():
        errors.append("Duplicate order_id found")
    if df["amount"].lt(0).any():
        errors.append("Negative amount found")
    if df["customer_id"].isna().mean() > 0.01:
        errors.append("customer_id null rate exceeds 1%")

    created = pd.to_datetime(df["created_at"], errors="coerce", utc=True)
    if created.isna().any():
        errors.append("Unparseable date found")
    elif created.max() < pd.Timestamp.now(tz="UTC") - pd.Timedelta(hours=24):
        errors.append("Data is older than 24 hours (freshness)")
    return errors`,
    },
    {
      type: "p",
      text: "On the transformation side, SQL is still king. Window functions solve jobs like finding each customer's latest order or computing a running total in a single query. In MSSQL, something like this:",
    },
    {
      type: "code",
      lang: "sql",
      code: `WITH ranked AS (
    SELECT
        customer_id,
        order_id,
        amount,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn,
        SUM(amount)  OVER (PARTITION BY customer_id ORDER BY created_at
                           ROWS UNBOUNDED PRECEDING) AS running_total
    FROM dbo.orders
)
SELECT customer_id, order_id AS last_order_id, amount AS last_amount, running_total
FROM ranked
WHERE rn = 1;`,
    },
    { type: "h", text: "Feature store: the model's pantry" },
    {
      type: "p",
      text: "In classic ML, features such as \"amount spent in the last 30 days\" must be computed **the same way** both in training and in live prediction. Otherwise you get a sneaky bug called training-serving skew: the model sees one kind of data in training and another in production. Feature stores (such as Feast or Databricks Feature Store) define these features centrally, serving historically correct values (point-in-time correctness) for training and low-latency values for live serving.",
    },
    { type: "h", text: "Data engineering in the age of LLMs" },
    {
      type: "p",
      text: "LLMs haven't made data engineering unnecessary; quite the opposite, they've brought a new workload. The most concrete example is RAG (Retrieval-Augmented Generation): before answering, the model finds the relevant pieces of your documents and adds them to its context. It sounds simple, but it is really a full data pipeline:",
    },
    {
      type: "list",
      items: [
        "**Ingestion and cleaning:** PDFs, HTML and wiki pages are converted to text; duplicates, menus and boilerplate are stripped out.",
        "**Chunking:** The text is split into pieces. Chunks that are too small lose context; chunks that are too large carry irrelevant information. Splitting by headings and leaving a little overlap between chunks is a common starting point.",
        "**Embedding:** Each chunk is turned into a vector by an embedding model. If the model changes, every vector has to be regenerated, which is a backfill job.",
        "**Vector store:** Vectors are stored in something like pgvector, Qdrant or Weaviate, together with metadata (source, date, permissions). Hybrid search, combined with keyword search, often gives better results.",
        "**Evaluation:** Are the right chunks coming back (retrieval), and is the answer based on those chunks (groundedness)? Without measuring against hand-built question-answer sets, \"it seems to work\" isn't good enough.",
      ],
    },
    {
      type: "img",
      src: "/blog/data-engineering-ai/rag.en.svg",
      alt: "RAG pipeline diagram in which documents are chunked, turned into embeddings and written to a vector store, then given to the LLM as context at query time",
      caption: "RAG is half indexing, half querying: and both are data engineering.",
    },
    {
      type: "p",
      text: "The same goes for fine-tuning. Even a set of a few thousand examples needs careful preparation: duplicates removed, personal data masked, no test data leaking into the training set, and a record of where every example came from. The model's quality depends heavily on the quality of that set.",
    },
    { type: "h", text: "How does AI help the data engineer?" },
    {
      type: "p",
      text: "I use AI assistants quite a lot in my day-to-day work, and they genuinely speed things up: drafting SQL from natural language, explaining a complex query, generating table and column documentation, and boring jobs like regexes or date-format conversions. ML-based monitoring tools have also become common for anomaly detection in metric time series (such as a sudden drop in row counts).",
    },
    {
      type: "note",
      text: "The limits are clear too: the model doesn't know your schema, your business rules or the real distribution of your data. Generated SQL can be syntactically correct but logically wrong (a wrong JOIN, double-counted rows, NULL behaviour). Verify every query on a small sample, check the result counts, and think twice before sending sensitive data to external services.",
    },
    { type: "h", text: "My roadmap as a student" },
    {
      type: "p",
      text: "Below is the order I've laid out for myself. Each step builds on the previous one, so I try not to skip any. Timelines vary from person to person; what matters is finishing a small but real project at every stage.",
    },
    {
      type: "table",
      head: ["Stage", "What to learn", "Mini project idea"],
      rows: [
        ["1. SQL", "JOIN, GROUP BY, window functions, CTEs, how indexes work", "Analysis queries on an open dataset"],
        ["2. Python", "pandas, reading files/APIs, testing, clean code", "A script that pulls data from an API and writes it to CSV/Parquet"],
        ["3. Data modelling", "Normalisation, star schema, fact/dimension, dbt", "A small star schema built from raw tables"],
        ["4. Orchestration", "DAGs, retries and scheduling with Airflow or Dagster", "A pipeline that runs and tests itself daily"],
        ["5. Cloud warehouse", "BigQuery/Snowflake, cost, partitioning, IAM", "Moving the pipeline to the cloud and connecting a dashboard"],
        ["6. Streaming", "Kafka, events, the exactly-once concept", "Producing real-time metrics from an event stream"],
      ],
    },
    { type: "h", text: "Final word" },
    {
      type: "p",
      text: "The visible face of an AI system is the model, but what keeps it standing is the data. A good pipeline is quiet: data arrives on time, tests pass, nobody notices a thing. That quiet but critical side is where I want to specialise. If you're starting down this path too, the best first step is still the same: write slightly better SQL today.",
    },
  ],
};
