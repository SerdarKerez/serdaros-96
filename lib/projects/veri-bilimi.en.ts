import type { ProjectDetails } from "./types";

export const details: ProjectDetails = {
  slug: "veri-bilimi",
  status: "Completed / ongoing",
  role: "Course project",
  period: "2025 – 2026",
  cover: "/projects/veri-bilimi/cover.en.svg",
  coverAlt:
    "A pandas table, a box plot and the title 'Data Science Projects' on a retro CRT screen",
  highlights: [
    "Python work prepared for the Systems Analysis and Design I course",
    "Three modules: Data Manipulation 101, Data Manipulation 201 and Data Preprocessing",
    "Hands-on practice with NumPy, pandas, Seaborn, missingno and scikit-learn",
    "Code and four training certificates are public on GitHub",
  ],
  blocks: [
    {
      type: "p",
      text: "This project collects the data science work I did for the **Systems Analysis and Design I** course. All of the code lives in the `turkcell-veri-bilimi` repository on GitHub. The aim wasn't to build a big model. The real goal was to lay the foundation for the road to data engineering: reading data, reshaping it, spotting what's missing and what's an outlier, and then getting it ready for a model.",
    },
    {
      type: "note",
      text: "Repository: github.com/SerdarKerez/turkcell-veri-bilimi — full profile: github.com/SerdarKerez",
    },
    { type: "h", text: "What's in the repository?" },
    {
      type: "p",
      text: "The work is split into three folders. Each folder corresponds to a training module, and each module's certificate is in the `Sertifikalar/` (Certificates) folder. There are four certificates in total: Data Literacy, Data Manipulation 101, Data Manipulation 201 and Data Preprocessing.",
    },
    {
      type: "table",
      head: ["Folder", "Files", "Topic"],
      rows: [
        ["veri_manipülasyonu_101", "numpy_giris.py, eleman_islemleri.py, matematiksel_islemler.py", "Creating NumPy arrays, reshape, concatenate, split, sort"],
        ["veri_manipülasyonu_201", "pandas_serileri.py, pandas_dataframe.py, gruplama_ve_toplulastirma.py", "Series/DataFrame, loc–iloc, merge, groupby, pivot_table"],
        ["veri_ön_işleme", "eksik_gozlem.py, aykiri_gozlem_analiz.py, degisken_standardizasyon.py", "Missing data, outliers, scaling and encoding"],
      ],
    },
    {
      type: "img",
      src: "/projects/veri-bilimi/workflow.en.svg",
      alt: "Steps from raw data to model-ready data: reading, manipulation, missing data, outliers, transformation",
      caption: "The three modules in the repository map to consecutive steps of a data preparation flow.",
    },
    { type: "h", text: "Data manipulation: NumPy and pandas" },
    {
      type: "p",
      text: "In the first module I worked through the NumPy basics: `np.zeros`, `np.arange`, `reshape`, two-dimensional `concatenate` and `vsplit`/`hsplit`. I noted small but important details in the code comments, like the difference between `np.sort(v)` and `v.sort()`: one keeps the original array, the other changes it in place.",
    },
    {
      type: "p",
      text: "In the second module I moved on to pandas. Using Seaborn's built-in `planets` and `titanic` datasets, I tried out `groupby`, `aggregate`, `filter`, `transform`, `apply` and `pivot_table`. Mapping these steps to the logic of SQL's `GROUP BY` and `JOIN` reinforced what I knew from MSSQL. Joining employee and department tables with `pd.merge` was a direct counterpart of relational design.",
    },
    { type: "h", text: "Data preprocessing: missing values, outliers, scale" },
    {
      type: "p",
      text: "This is the part I spent the most time on. For missing data I counted with `isnull().sum()`, tried the `dropna` options and filled values with the mean, median and mode. There's also imputation with group means broken down by department, and KNN-based predictive imputation. I visualized the structure of the missingness with `missingno` as a bar chart, a matrix and a heatmap.",
    },
    {
      type: "p",
      text: "For outliers, I computed lower and upper bounds on the `diamonds` dataset with the **IQR method**. Then I compared three remedies: deleting, filling with the mean and capping. On the multivariate side, I set a threshold based on LOF scores using scikit-learn's `LocalOutlierFactor`.",
    },
    {
      type: "code",
      lang: "python",
      code: `Q1 = df_table.quantile(0.25)
Q3 = df_table.quantile(0.75)
IQR = Q3 - Q1

alt_sinir = Q1 - 1.5 * IQR
ust_sinir = Q3 + 1.5 * IQR

# Capping: pull out-of-range values back to the bound
df_baskilama = df["table"].copy()
df_baskilama[df_baskilama < alt_sinir] = alt_sinir
df_baskilama[df_baskilama > ust_sinir] = ust_sinir`,
    },
    {
      type: "img",
      src: "/projects/veri-bilimi/editor.en.svg",
      alt: "IQR code in a retro editor window, next to a box plot drawn with sample data",
      caption: "Catching outliers with IQR. The values in the chart are illustrative (sample data).",
    },
    {
      type: "p",
      text: "The last file covers variable transformations: standardization with `preprocessing.scale`, `normalize`, `MinMaxScaler` to the 10–20 range, 0-1 encoding with `LabelEncoder` and one-hot encoding with `get_dummies`. This is also where I learned about the dummy variable trap.",
    },
    { type: "h", text: "How it connects to systems analysis" },
    {
      type: "p",
      text: "Doing this work in a systems analysis course may seem odd at first, but the connection is clear. When analyzing a system we draw up **requirements**, **data flow diagrams (DFDs)** and **use cases**. Every process in a DFD is really a data transformation, and every data store is a table. Cleaning missing and outlier data means meeting the analysis's \"data quality\" requirement.",
    },
    {
      type: "img",
      src: "/projects/veri-bilimi/dfd.en.svg",
      alt: "Data flow diagram showing the analyst actor, the raw data store, the cleaning and transformation processes, and the clean data store",
      caption: "A simple DFD view of the data preparation flow: processes are transformations, stores are tables.",
    },
    { type: "h", text: "Tools" },
    {
      type: "list",
      items: [
        "**Python** `.py` scripts, developed in **PyCharm**",
        "**NumPy** and **pandas**: data structures and manipulation",
        "**Seaborn**, **Matplotlib** and **missingno**: visualization and built-in datasets",
        "**scikit-learn**: LOF, scaling and encoding",
        "**Git / GitHub**: version control and sharing",
      ],
    },
    { type: "h", text: "What did I learn?" },
    {
      type: "list",
      items: [
        "The shape and quality of the data come before the model. Most of the work is in preparation.",
        "Dropping missing data is easy but loses information. Group-based or predictive imputation is often better.",
        "An outlier isn't always an error. Deleting, filling and capping lead to different results.",
        "The difference between `inplace` and a copy (`.copy()`) is a major source of silent bugs.",
      ],
    },
    { type: "h", text: "Next steps" },
    {
      type: "list",
      items: [
        "Build simple regression and classification models in scikit-learn with the prepared data",
        "Move repeated cleaning steps into functions and a `Pipeline`",
        "Write the results to a SQL database and set up a small ETL flow",
        "Add outputs and short explanations to the README for each module",
      ],
    },
  ],
};
