---
title: "Tags"
layout: "tags"
---

<head>
  <link rel="stylesheet" href="{{ "css/tag-list.css" | absURL }}">
</head>

<ul class="tag-list">
  {{ range .Site.Taxonomies.tags }}
    <li><a href="{{ .Page.Permalink }}">{{ .Page.Title }}</a> <span>({{ len .Pages }})</span></li>
  {{ end }}
</ul>
