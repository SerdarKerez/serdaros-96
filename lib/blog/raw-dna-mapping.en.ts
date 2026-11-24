import type { BlogPost } from "./types";

export const post: BlogPost = {
  slug: "raw-dna-mapping",
  title: "Classifying and Mapping Raw DNA Data",
  date: "2026-11-20",
  tags: ["genomics", "data engineering", "python", "pandas", "bioinformatics"],
  cover: "/blog/raw-dna-mapping/cover.en.svg",
  coverAlt: "Chromosome bars and SNP markers on a retro CRT screen, under the heading 'Raw DNA Map'",
  summary:
    "A data engineering journey into reading and cleaning the raw file downloaded from a consumer DNA test, placing SNPs on chromosomes and genes, sorting them into categories and visualising them.",
  blocks: [
    {
      type: "p",
      text: "While working on my genomic CRM concept project, I kept asking myself the same question: when a user uploads the raw file they downloaded from 23andMe or AncestryDNA, how do I turn that pile of text into a meaningful map? In this post I've gathered what I learned, step by step: the file format, reference genomes, quality control, annotation, classification and finally visualisation. Plus the sensitive side of it all: privacy and ethics.",
    },
    {
      type: "note",
      text: "**Important:** This post is for educational purposes. Results from consumer genotyping chips are not a diagnosis. Any health-related finding must be confirmed by a clinical laboratory and evaluated with a doctor or a genetic counsellor.",
    },
    { type: "h", text: "What is a raw DNA file, really?" },
    {
      type: "p",
      text: "My first misconception was that these files contain the whole genome. They don't. Consumer tests use a **genotyping chip** (SNP array). Instead of reading all of the roughly 3 billion base pairs, it looks at **around 600-700 thousand** pre-selected **SNP** (single nucleotide polymorphism) positions. That's less than a thousandth of the genome. Whole genome sequencing (WGS), on the other hand, reads every position, produces far more data and can also catch rare variants that the chip doesn't cover at all.",
    },
    {
      type: "p",
      text: "The file is usually a plain tab-separated (TSV) text file. It starts with comment lines beginning with `#`, followed by four columns: `rsid`, `chromosome`, `position` and `genotype`. The lines below are entirely made up, purely to show the format:",
    },
    {
      type: "code",
      lang: "text",
      code: `# rsid\tchromosome\tposition\tgenotype
# These lines are for illustration only and do not belong to a real person
rs9990001\t1\t752566\tAG
rs9990002\t1\t776546\tAA
rs9990003\t2\t1102344\t--
rs9990004\t7\t5530601\tCT
rs9990005\tX\t2700157\tG
rs9990006\tMT\t3594\tC`,
    },
    {
      type: "p",
      text: "In the AncestryDNA format the genotype is split into two separate columns (`allele1`, `allele2`), and chromosomes are sometimes coded as numbers (for example 23 for X). So the first job is a normalisation layer that fits the different providers into a single schema.",
    },
    { type: "img", src: "/blog/raw-dna-mapping/pipeline.en.svg", alt: "Five-step data pipeline diagram running from the raw file through quality control, annotation and classification to a map", caption: "The pipeline I designed: raw file, QC, annotation, classification, map." },
    { type: "h", text: "Reference genome: GRCh37 or GRCh38?" },
    {
      type: "p",
      text: "The `position` column means nothing on its own; you need to know which **reference genome build** it was written against. Most consumer files still use **GRCh37 (hg19)**, while most up-to-date databases work with **GRCh38 (hg38)**. Between the two builds, gaps were closed and some regions were corrected and re-sequenced, so the same SNP can end up with a different coordinate. Moving coordinates from one build to the other is called **liftover** (tools like UCSC liftOver and CrossMap do it with chain files). Some positions can't be lifted over, or land on a different chromosome; those need to be flagged separately. Practical tip: where possible, join on `rsid` rather than coordinates, but don't forget that rsIDs also get merged over time.",
    },
    { type: "h", text: "Reading and quality control (QC)" },
    {
      type: "list",
      items: [
        "**No-calls:** `--` means the chip couldn't read that position reliably. I filter these out and keep a count.",
        "**Call rate:** the ratio of called SNPs to total SNPs. In a good sample it's usually above 98%; if it's very low, the sample or the file is suspect.",
        "**Strand issues:** Some sources report alleles from the opposite strand. For SNPs that are their own complement, such as A/T and C/G, you can't tell which strand it is just by looking at the file; these need care when comparing.",
        "**Sex chromosomes and MT:** In males, X and Y are single-copy, so the genotype appears as a single letter. Mitochondria (MT) are haploid too. An X call that looks heterozygous in a male sample is a sign of an error.",
        "**Duplicates and invalid values:** The same rsID appearing twice, indel codes like `I`/`D`, or unexpected characters should be logged separately.",
      ],
    },
    { type: "h", text: "Mapping and annotation" },
    {
      type: "p",
      text: "With clean data, I place the SNPs at their positions on the chromosome and from there onto genes. A SNP can sit inside a gene (exon, intron), in a regulatory region or in an intergenic region. Next comes enrichment with public databases:",
    },
    {
      type: "table",
      head: ["Source", "What does it add?"],
      rows: [
        ["dbSNP", "rsID identifiers, reference/alternate alleles, position"],
        ["ClinVar", "Submitted clinical interpretations and significance class for the variant"],
        ["gnomAD", "Allele frequencies by population (rare or common?)"],
        ["GWAS Catalog", "Statistical associations with traits and diseases (not causation)"],
      ],
    },
    {
      type: "p",
      text: "It's important to think conceptually here: GWAS associations are mostly small-effect and statistical; drawing a personal conclusion from a single SNP is misleading. A well-known example: `rs4988235`, near the LCT gene, is associated with lactase persistence in adulthood, particularly in populations of European ancestry. But even this doesn't work the same way in every population.",
    },
    { type: "img", src: "/blog/raw-dna-mapping/ideogram.en.svg", alt: "Bar ideogram of chromosomes 1-22, X and Y, with coloured markers showing SNP density", caption: "Chromosome ideogram with SNP density markers (illustrative, sample data)." },
    { type: "h", text: "Classification" },
    {
      type: "p",
      text: "After annotation, I give each variant one or more labels:",
    },
    {
      type: "list",
      items: [
        "**Ancestry-informative (AIM):** SNPs whose frequency differs markedly between populations.",
        "**Trait:** GWAS-associated markers such as eye colour or lactase persistence.",
        "**Pharmacogenomic:** variants in genes linked to drug metabolism (for example the CYP family); matched against PharmGKB/CPIC resources.",
        "**Clinical significance:** the five ACMG-based classes in ClinVar: Pathogenic, Likely pathogenic, Uncertain significance (VUS), Likely benign, Benign.",
        "**Zygosity:** homozygous (AA) if both alleles are the same, heterozygous (AG) if they differ; hemizygous for single-copy X/Y/MT.",
      ],
    },
    {
      type: "note",
      text: "On chips, the false positive rate for very rare variants can be quite high. That's why in my project a match labelled 'Pathogenic' is never shown as a result; it's only listed with a 'requires clinical confirmation' warning.",
    },
    { type: "img", src: "/blog/raw-dna-mapping/categories.en.svg", alt: "Horizontal bar chart of variant categories: ancestry-informative, trait, pharmacogenomic and clinical classes; labelled as sample data", caption: "Category distribution. The numbers are entirely made up (sample data)." },
    { type: "h", text: "A first step with Python" },
    {
      type: "p",
      text: "A short example using pandas that reads the file, drops no-calls, counts per chromosome and joins with a small annotation table:",
    },
    {
      type: "code",
      lang: "python",
      code: `import pandas as pd

raw = pd.read_csv(
    "genome_raw.txt", sep="\\t", comment="#",
    names=["rsid", "chrom", "pos", "genotype"],
    dtype={"rsid": str, "chrom": str, "pos": "int64", "genotype": str},
)

total = len(raw)
calls = raw[raw["genotype"] != "--"].copy()
print(f"Call rate: {len(calls) / total:.2%}")

order = [str(i) for i in range(1, 23)] + ["X", "Y", "MT"]
calls["chrom"] = pd.Categorical(calls["chrom"], categories=order, ordered=True)
per_chrom = calls.groupby("chrom", observed=False).size()
print(per_chrom)

# Zygosity (single-letter calls are hemizygous)
g = calls["genotype"]
calls["zygosity"] = "hemizygous"
calls.loc[(g.str.len() == 2) & (g.str[0] == g.str[1]), "zygosity"] = "homozygous"
calls.loc[(g.str.len() == 2) & (g.str[0] != g.str[1]), "zygosity"] = "heterozygous"

# Sample annotation table: rsid, gene, category, clin_sig
annot = pd.read_csv("annotations.tsv", sep="\\t")
annotated = calls.merge(annot, on="rsid", how="left")
print(annotated["category"].value_counts(dropna=False))`,
    },
    { type: "h", text: "Visualisation ideas" },
    {
      type: "list",
      items: [
        "**Ideogram / karyogram:** each chromosome is a bar, with SNPs or labelled variants marked at their positions.",
        "**Manhattan-style plot:** chromosomes in order along the x axis, a score on the y axis (for example `-log10` allele frequency). The classic Manhattan plot is for GWAS p-values; for a single person I adapt it into a 'rarity map'.",
        "**Category bars and zygosity ratios:** a summary panel for the user.",
      ],
    },
    { type: "h", text: "The data engineering angle" },
    {
      type: "p",
      text: "For me, this is the really fun part. A single file is small (20-30 MB), but once you scale to thousands of users you need a well-ordered schema. The table I designed: `sample_id, rsid, chrom, pos_grch37, pos_grch38, allele1, allele2, zygosity, is_nocall, source, file_version`. I store the data as **Parquet**, **partitioned by chromosome**; since most queries come with a chromosome filter anyway, the engine never reads the files it doesn't need. Annotation tables are kept separate and versioned, because ClinVar classes can change over time and you need to know which database version a result was produced with.",
    },
    { type: "h", text: "Privacy and ethics" },
    {
      type: "p",
      text: "Genetic data isn't ordinary personal data. Under both KVKK (Turkey's data protection law) and GDPR it counts as **special category personal data**, requiring explicit consent and strict security measures. On top of that, it concerns not only you but your relatives too, and it can't be changed. That's why I stick to these principles in the project:",
    },
    {
      type: "list",
      items: [
        "**Local processing** where possible: the file is analysed in the browser or on the user's machine and not sent to a server.",
        "Explicit, revocable **consent**, and the ability to delete the data completely.",
        "Encryption, data minimisation, and sample IDs kept separate from identity information.",
        "Never presenting health results as a diagnosis; a confirmation warning next to every clinical label.",
      ],
    },
    {
      type: "quote",
      text: "Chip data is a draft of the map, not the terrain itself. A clinical decision requires a validated test and expert interpretation.",
    },
    {
      type: "p",
      text: "My next step is to automate the liftover process and build a small ETL pipeline that tracks annotation versions. Once it's done, I'll write about it here too.",
    },
  ],
};
