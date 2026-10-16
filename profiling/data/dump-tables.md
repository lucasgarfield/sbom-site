| solver-metadata | cmd | runs ok | wall s (median, min–max) | py import | py repo load | py pkg_convert | py dict | py json.dumps | py write | Go Unmarshal | Go convert | payload MB | py RSS MiB | Go RSS MiB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dnf4-full | dump | 3/3 | 10.83 (10.68–11.56) | 0.14 | 0.91 | 4.71 | 0.68 | 1.32 | 0.68 | 2.03 | 0.08 | 207 | 132 | 872 |
| dnf4-full | search | 3/3 | 17.16 (16.35–17.32) | 0.13 | 0.53 | 7.13 | 4.27 | 1.07 | 0.86 | 2.17 | 0.09 | 207 | 1656 | 872 |
| dnf4-minimal | dump | 3/3 | 4.70 (4.34–4.88) | 0.13 | 0.91 | 2.50 | 0.04 | 0.31 | 0.16 | 0.42 | 0.03 | 40 | 125 | 377 |
| dnf4-minimal | search | 3/3 | 4.74 (4.68–4.86) | 0.13 | 0.54 | 2.74 | 0.08 | 0.15 | 0.13 | 0.45 | 0.03 | 40 | 443 | 377 |
| dnf5-full | dump | 0/3 | OOM-killed at 4 GiB | | | | | | | | | | | |
| dnf5-full | search | 0/3 | OOM-killed at 4 GiB | | | | | | | | | | | |
| dnf5-minimal | dump | 3/3 | 15.59 (15.52–15.72) | 0.12 | 0.35 | 3.73 | 0.05 | 2.30 | 2.49 | 5.91 | 0.02 | 1001 | 115 | 3106 |
| dnf5-minimal | search | 0/3 | OOM-killed at 4 GiB | | | | | | | | | | | |
