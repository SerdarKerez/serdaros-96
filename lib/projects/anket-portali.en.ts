import type { ProjectDetails } from "./types";

export const details: ProjectDetails = {
  slug: "anket-portali",
  status: "In development",
  role: "Solo developer",
  period: "2025 – present",
  cover: "/projects/anket-portali/cover.en.svg",
  coverAlt: "The title SURVEY PORTAL on a retro CRT screen, next to question boxes and a small bar chart",
  highlights: [
    "Survey builder, shareable link and response collection",
    "Layered C# architecture and a relational MSSQL schema",
    "Results screen with charts, summarized in T-SQL",
    "A SQL lab on the road to data engineering",
  ],
  blocks: [
    { type: "h", text: "Why this project?" },
    {
      type: "p",
      text: "The survey portal is a web app where people can create online surveys and collect responses. The idea is simple, but it contains everything I want to learn: a relational data model, validating user input, **summarizing responses with SQL** and presenting the results on a readable screen. I'm building it on my own with **C#** and **MSSQL**; the goal is both a working product and my own small data lab to prepare for data engineering.",
    },
    {
      type: "note",
      text: "The project is still in development. The feature list below describes a design that is partly built and partly planned; the screenshots are design sketches, not real screens.",
    },
    { type: "h", text: "Goals" },
    {
      type: "list",
      items: [
        "Let someone with no technical background put together a survey in a few minutes",
        "Store responses in a consistent, queryable schema",
        "Summarize results with charts and allow the raw data to be exported",
        "Separate the layers in code and build a testable structure",
      ],
    },
    { type: "h", text: "Feature set" },
    {
      type: "list",
      items: [
        "**Survey builder:** single choice, multiple choice, short text and 1–5 rating question types; reorder questions and mark them as required",
        "**Shareable link:** a link with a hard-to-guess code generated for each survey",
        "**Response collection:** server-side validation and a simple check against repeated submissions from the same session",
        "**Results screen:** per-option distributions shown as bar and pie charts",
        "**CSV export:** download raw responses for analysis in Excel or Python",
        "**User roles:** admin, survey owner and participant",
      ],
    },
    {
      type: "img",
      src: "/projects/anket-portali/builder.en.svg",
      alt: "Design sketch of the survey builder: question types on the left, questions in the middle, settings on the right",
      caption: "Design sketch for the survey builder.",
    },
    { type: "h", text: "Architecture" },
    {
      type: "p",
      text: "I'm structuring the app in layers on **ASP.NET**: a presentation layer (pages and forms), a business-rules layer (validation, authorization, survey state) and a data access layer. Data access uses parameterized queries; to guard against SQL injection, user input is never concatenated into query text. Summary calculations happen in the database with T-SQL wherever possible; the C# side just carries the result to the screen.",
    },
    { type: "h", text: "Database schema" },
    {
      type: "table",
      head: ["Table", "Key fields", "Description"],
      rows: [
        ["Surveys", "SurveyId, OwnerId, Title, ShareCode, IsOpen, CreatedAt", "The survey itself and its share code"],
        ["Questions", "QuestionId, SurveyId, Text, QType, SortOrder, IsRequired", "Questions belonging to a survey"],
        ["Options", "OptionId, QuestionId, Text, SortOrder", "Options for multiple-choice questions"],
        ["Responses", "ResponseId, SurveyId, SubmittedAt", "A single submission by one participant"],
        ["Answers", "AnswerId, ResponseId, QuestionId, OptionId, TextValue", "The answer to each question in a submission"],
      ],
    },
    {
      type: "img",
      src: "/projects/anket-portali/er-diagram.en.svg",
      alt: "ER diagram showing the relationships between the Surveys, Questions, Options, Responses and Answers tables",
      caption: "A five-table relational schema; Answers links to both Responses and Questions.",
    },
    {
      type: "p",
      text: "I get the distribution for the results screen with a single query. Thanks to the `LEFT JOIN`, options that were never picked are listed with zero, and a window function calculates the percentage:",
    },
    {
      type: "code",
      lang: "sql",
      code: `SELECT
    q.QuestionId,
    o.OptionId,
    o.Text                          AS OptionText,
    COUNT(a.AnswerId)               AS Votes,
    CAST(100.0 * COUNT(a.AnswerId)
         / NULLIF(SUM(COUNT(a.AnswerId)) OVER (PARTITION BY q.QuestionId), 0)
         AS DECIMAL(5,1))           AS Percent
FROM Questions q
JOIN Options o       ON o.QuestionId = q.QuestionId
LEFT JOIN Answers a  ON a.OptionId   = o.OptionId
WHERE q.SurveyId = @SurveyId
GROUP BY q.QuestionId, o.OptionId, o.Text, o.SortOrder
ORDER BY q.QuestionId, o.SortOrder;`,
    },
    {
      type: "img",
      src: "/projects/anket-portali/results.en.svg",
      alt: "Design sketch of the results screen: a bar chart and a pie chart with sample data",
      caption: "Draft of the results screen. The numbers in the charts are sample data.",
    },
    { type: "h", text: "What did I learn?" },
    {
      type: "list",
      items: [
        "Drawing the schema on paper first is much cheaper than changing it later",
        "How to combine `GROUP BY` with window functions, and how to avoid division by zero with `NULLIF`",
        "Why validation has to happen on both the client and the server",
        "Separating the layers makes it much easier to find where a bug is",
      ],
    },
    { type: "h", text: "Next steps" },
    {
      type: "list",
      items: [
        "Average and distribution summaries for rating questions",
        "Tuning indexes for frequent queries based on measurements",
        "A small ETL step that periodically copies responses into a separate reporting table",
        "An export option that can be analyzed directly in Python instead of CSV",
      ],
    },
    {
      type: "p",
      text: "For me this project is more than a survey app: it's my first serious exercise on the road to **data engineering**, where I build every step myself, from collecting the data to summarizing it.",
    },
  ],
};
