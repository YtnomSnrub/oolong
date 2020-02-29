---
---

{%- assign resources = "" | split: "" -%}
{%- assign resource_files = site.static_files | where: "resource", true -%}
{%- for file in resource_files -%}
{%- assign file_path = site.baseurl | append: file.path -%}
{%- assign resource_name = '"' | append: file_path | append: '"' | split: "\n" -%}
{%- assign resources = resources | concat: resource_name -%}
{%- endfor -%}

const OolongResources = [{{ resources | join: ", " }}];
