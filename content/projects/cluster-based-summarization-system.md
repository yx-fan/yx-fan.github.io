---
title: "Cluster-Based Summarization System: Scalable Text Clustering and Summarization Pipeline"
date: 2025-07-28
summary: "A production-ready system that clusters semantically similar texts and summarizes key themes using LLMs. Combines transformer embeddings, UMAP, HDBSCAN, and keyword extraction techniques."
draft: false
image: "/images/Cluster_Summary_Architecture.png"
tags: ["Text Clustering", "LLM", "HDBSCAN", "NLP", "Unsupervised Learning", "Sentence Transformers", "UMAP", "Keyword Extraction"]
---


### 1. Overview

The Cluster-Based Summarization System is designed to analyze and summarize large volumes of user-generated text, such as warranty descriptions, customer feedback, or support tickets. The system uses state-of-the-art NLP techniques to:

- Cluster semantically similar entries without supervision.
- Extract meaningful keywords from each cluster.
- Summarize recurring themes using LLMs.

This allows technical and business teams to discover insights and root causes at scale—without manual review.

---

### 2. Architecture Overview

![Cluster-Based_Summarization_System_Architecture](/images/cluster-based-summarization-system-architecture.svg)

---

### 3. Technology Stack

| Step | Tool | Notes |
|------|------|-------|
| **Embedding** | Sentence Transformers (`all-MiniLM`, `e5-base`, etc.) | Captures deep semantic similarity |
| **Dimensionality Reduction** | UMAP | Preserves local structure for better clustering |
| **Clustering** | HDBSCAN | Automatically detects number of clusters and noise |
| **Keyword Extraction** | TF-IDF + KeyBERT | Combines frequency-based and embedding-based signals |
| **Summarization** | LLM | Generates natural language summaries per cluster |

---

### 4. Clustering Approach

#### 4.1 UMAP for Dimensionality Reduction

Transformer embeddings are high-dimensional (384–1024D). UMAP is used to project them to ~5 dimensions for clustering. It preserves semantic neighborhoods better than PCA or t-SNE and is highly configurable (e.g., `n_neighbors`, `min_dist`).

#### 4.2 HDBSCAN for Density-Based Clustering

HDBSCAN offers major advantages:

- No need to predefine `k`.
- Robust to noise/outliers.
- Supports soft clustering (probability per cluster).

Common parameters tuned include:

- `min_cluster_size`: minimum samples to form a cluster
- `min_samples`: how conservative the algorithm is with labeling core points

---

### 5. Keyword Extraction

To interpret clusters:

- **TF-IDF** highlights high-frequency, low-global-frequency terms.
- **KeyBERT** identifies phrases semantically close to the cluster embedding centroid.
- Keywords from both methods are merged to provide both statistical and semantic anchors.

These keywords also prime the LLM to better understand each cluster’s context during summarization.

---

### 6. Summarization Pipeline

A prompt is constructed for each cluster using:

1. **Top Keywords** (from TF-IDF + KeyBERT)
2. **Representative Samples** (30 texts per cluster)
   - Selected using a hybrid strategy:
     - Highest keyword density
     - Longest and shortest entries
     - Random sampling for diversity

These elements are formatted into a bullet-point prompt to avoid “wall of text” issues and ensure clarity for the LLM.

**Output Fields per Cluster**:

| Field | Description |
|-------|-------------|
| `summary` | LLM-generated cluster summary |
| `sample_ids` | IDs of representative entries |
| `cluster_size` | Total number of entries in the cluster |
| `tfidf_keywords` | Top statistical keywords |
| `keybert_keywords` | Top semantic phrases |

---

### 7. Evaluation & Tuning

To ensure meaningful clustering, we evaluate the output using both qualitative and quantitative metrics:

- **Silhouette Score**: Measures cohesion and separation of clusters. Higher scores indicate better-defined clusters.
- **Number of Clusters**: Helps track how granular or coarse the clustering is.
- **Outlier Percentage**: Monitors the proportion of data points classified as noise.

A grid search is used to iterate over combinations of `n_neighbors`, `min_cluster_size`, and `min_samples`, optimizing for silhouette score and interpretability.

Example log output:

```n_neighbors=10, min_cluster_size=15, min_samples=5
n_clusters=12, silhouette=0.45, outlier_pct=12%
```

> 💡 In production settings, text embeddings are often high-dimensional and noisy. A silhouette score between **0.30–0.50** can still yield highly useful results when paired with meaningful summaries and cluster interpretation.

---

### 8. Visualization

To validate the quality of clustering and understand the data structure, we project the embedding vectors into 2D space using UMAP for visualization. Each point represents a text entry, and colors correspond to cluster assignments.

```python
import umap
import matplotlib.pyplot as plt

umap_2d = umap.UMAP(n_components=2).fit_transform(embeddings)
plt.scatter(umap_2d[:, 0], umap_2d[:, 1], c=labels, cmap='Spectral', s=5)
plt.title("UMAP 2D Projection of Text Clusters")
plt.xlabel("UMAP-1")
plt.ylabel("UMAP-2")
plt.colorbar()
plt.show()
```

This plot helps assess whether clusters are well-separated and how many points were labeled as noise (outliers).

---

### 9. Output Schema

Each cluster produces a structured summary output with the following fields:

| Field | Description |
|-------|-------------|
| `summary` | Abstract generated using LLM |
| `sample_ids` | IDs of representative samples |
| `cluster_size` | Number of entries in the cluster |
| `tfidf_keywords` | Top keywords extracted via TF-IDF |
| `keybert_keywords` | Top phrases from KeyBERT |

These results can be consumed by downstream pipelines, integrated into dashboards, or exported for reporting.

---

### 10. Future Extensions

This system is modular and extensible. Possible future improvements include:

- **Topic Labeling**: Auto-generate descriptive titles for each cluster using rules or LLMs.
- **Multilingual Support**: Incorporate models like `distiluse-base-multilingual` to support non-English datasets.
- **Feedback Loop**: Allow human reviewers to accept, reject, or refine summaries and feed corrections back into the pipeline.
- **Time-Based Drift Detection**: Compare clustering results over time to detect shifting trends or emerging issues.

---

### 11. Conclusion

The Cluster-Based Summarization System demonstrates a practical and scalable approach to understanding large-scale unstructured text data. By combining unsupervised clustering with LLM-powered summarization, it helps teams identify patterns, failure modes, or customer concerns efficiently.

Its design emphasizes:

- **Interpretability** via keywords and summaries  
- **Scalability** via vectorization and density-based clustering  
- **Flexibility** with customizable prompts and modular stages  

This solution is production-ready and adaptable across domains like customer service, product feedback, and internal QA.