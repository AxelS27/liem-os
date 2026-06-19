# Research Project Outline — [Research Title]

> [!NOTE]
> Use this outline template to structure, scope, and plan your technical or academic research campaign. Replace all brackets with your project-specific details.

---

## 1. Research Scope & Core Objectives

### 1.1 Primary Research Question
- [State the core research question/problem you aim to solve. E.g., "What is the computational latency vs. accuracy trade-off when deploying quantized regional NLP models on edge CPUs?"]

### 1.2 Secondary Research Pointers
- **Pointer 1**: [E.g., "How does colloquial text normalization affect vocabulary fragmentation in subword tokenizers?"]
- **Pointer 2**: [E.g., "What is the peak dynamic RAM watermark comparison between linear classifiers and quantized transformer models?"]

### 1.3 Scope Boundaries & Non-Goals
- **In-Scope**: [E.g., "Benchmarking MNB, SVM, and IndoBERT-lite on the Ibrohim & Budi dataset."]
- **Out-of-Scope (Non-Goals)**: [E.g., "Fine-tuning models on large-scale GPUs, multi-lingual translation tasks, or building real-time production moderation APIs."]

---

## 2. Hypothesis & Premise Formulation

### 2.1 Research Hypotheses
- **Null Hypothesis ($H_0$)**: [E.g., "There is no statistically significant difference in classification accuracy or inference latency between optimized classical pipelines and quantized Transformer models."]
- **Alternative Hypothesis ($H_1$)**: [E.g., "Optimized classical ML pipelines achieve at least 90% of the Transformer's Macro F1-score while reducing inference latency by $10\times$ and peak memory by $50\times$."]

### 2.2 Core Assumptions & Constraints
- **Assumption 1**: [E.g., "The slang-mapping dictionary is representative of the informal language variations in the target corpus."]
- **Assumption 2**: [E.g., "Hardware profiling CPU cycles are isolated from container/background OS process noise."]

---

## 3. Methodology & Experimental Design

### 3.1 Data Collection & Instrumentation
- **Data Source**: [E.g., "Ibrohim & Budi (2019) Indonesian Twitter Hate Speech Dataset."]
- **Collection Method**: [E.g., "Local CSV ingestion with stratified K-fold partitions."]

### 3.2 Evaluation Metrics & Mathematical Formulation
- **Classification Performance**: Macro-Precision, Macro-Recall, Macro-F1.
- **Computational Efficiency**: 
  - Inference Latency (Mean, $p_{50}, p_{95}, p_{99}$ in ms/token).
  - Peak Dynamic RAM Watermark (MB).
  - Model Size on Disk (MB).
- **Statistical Significance**: McNemar's Test on holdout sets:
  \[\chi^2 = \frac{(|b - c| - 1)^2}{b + c}\]

---

## 4. Sources & Citations Ledger

Search strings to be executed across academic databases (e.g., IEEE Xplore, ACM Digital Library, Google Scholar):
- **Query 1**: `"Indonesian NLP" AND ("hate speech" OR "text classification")`
- **Query 2**: `"model quantization" AND "inference latency" AND "edge CPU"`

### Targeted Citation List
| ID | Paper Title | Author / Year | Venue | Expected Contribution / Target Metric |
| :--- | :--- | :--- | :--- | :--- |
| **[Ref-1]** | [Paper Title] | [Author, Year] | [Venue] | [How it supports the baseline or methodology] |
| **[Ref-2]** | [Paper Title] | [Author, Year] | [Venue] | [How it supports the baseline or methodology] |

---

## 5. Risk, Limitations & Bias Audit

### 5.1 Internal & External Validity Risks
- **Selection Bias**: [E.g., "The Twitter dataset annotation might suffer from subjective label bias regarding hate speech definitions."]
- **Hardware Bias**: [E.g., "Latency profiling on x86 containerized CPUs might not scale proportionally to ARM-based physical edge devices."]

### 5.2 Mitigation Strategies
- **Mitigation 1**: [E.g., "Cross-reference classifications with third-party annotator consensus scores."]
- **Mitigation 2**: [E.g., "Run a validation profiling pass on a physical Raspberry Pi 4 ARM CPU to calibrate the simulated latency metrics."]
