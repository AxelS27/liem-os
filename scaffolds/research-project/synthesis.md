# Research Findings Synthesis — [Research Title]

> [!NOTE]
> Use this synthesis template to map, group, and cross-reference research facts extracted from literature sources. It supports building a highly rigorous literature review and citation index.

---

## 1. Literature Mapping Matrix

Track and evaluate your primary sources side-by-side to detect common methodologies and gaps:

| Ref ID | Citation & DOI Link | Methodology / Architecture | Sample Size / Dataset | Key Findings | Identified Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[Ref-1]** | [Title/Authors](http://dx.doi.org/10.xxxx) <br> `DOI: 10.xxxx` | [e.g., Soft-margin Linear SVM with TF-IDF] | [e.g., 13k Indonesian Twitter posts] | [Key metric results, e.g. F1 82.4%] | [e.g. Omitted slang normalization, high memory footprint] |
| **[Ref-2]** | [Title/Authors](http://dx.doi.org/10.yyyy) <br> `DOI: 10.yyyy` | [e.g., Fine-tuned IndoBERT base model] | [e.g., Same dataset splits] | [e.g., F1 89.2%, SOTA baseline] | [e.g., High inference latency, GPU-dependent] |

---

## 2. Synthesized Findings & Thematic Analysis

Group extracted facts into themes rather than listing papers individually. This forms the foundation of your Literature Review.

### Theme A: [e.g., Linguistic Normalization Challenges in Informal Indonesian]
- **Synthesized Fact A.1**: [Details on how informal orthography affects tokenization, supported by citations. E.g., "Informal Indonesian text contains clitic particles that cause out-of-vocabulary fragmentation in neural tokenizers **[Ref-2]**."]
- **Synthesized Fact A.2**: [Details on colloquial dictionary mapping and accuracy improvements. E.g., "Applying normalized slang mappings increases SVM classification performance by up to $4.8\%$ F1-score **[Ref-1]**."]

### Theme B: [e.g., Model Compression & CPU Execution Efficiency]
- **Synthesized Fact B.1**: [Details on quantization methods. E.g., "INT8 Post-Training Quantization on BERT models reduces CPU memory bandwidth requirements by $4\times$ while retaining over $99\%$ of baseline accuracy **[Ref-2]**."]
- **Synthesized Fact B.2**: [E.g., "High-dimensional TF-IDF vectors require feature selection (like Chi-Square) to prevent memory allocation faults during batch inference on resource-constrained ARM CPUs **[Ref-1]**."]

---

## 3. Gaps & Contradictions Identified

Detail any areas where existing literature disagrees or remains incomplete:

- **Contradiction 1**: [E.g., "While **[Ref-1]** claims that character n-grams are sufficient to handle colloquial typos, **[Ref-2]** demonstrates that BPE tokenization outperforms n-grams in capturing semantic proximity, despite vocabulary fragmentation."]
- **Unaddressed Gap**: [State what is missing that your current research will resolve. E.g., "No study has evaluated the exact trade-off boundary (Pareto frontier) of accuracy vs. latency when deploying these models on constrained hardware."]

---

## 4. Inferences & Empirical Deductions

Deduce logical conclusions from the synthesized literature to support your methodology:

- **Deduction 1**: [E.g., "If vocabulary fragmentation increases sequence length and computational cost, then a dedicated slang normalization pass prior to tokenization should decrease both sequence length and inference latency on CPU systems."]
- **Deduction 2**: [E.g., "If SVM with optimized feature selection matches quantized Transformer performance within a $5\%$ accuracy threshold, it represents the optimal choice for ultra-low-latency moderation APIs on edge nodes."]

---

## 5. Citations Bibliography (APA Format)

1. **[Ref-1]** Author, A. A., & Author, B. B. (Year). Title of the paper. *Journal Title*, *Volume*(Issue), Page numbers. [Link to Publisher](http://dx.doi.org/10.xxxx) `DOI: 10.xxxx`
2. **[Ref-2]** Author, C. C. (Year). Title of the conference paper. In *Proceedings of Conference Name* (pp. xx-xx). [Link to Publisher](http://dx.doi.org/10.yyyy) `DOI: 10.yyyy`
