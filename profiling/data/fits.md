| solver | files | level | stage | exponent b (t ∝ n^b) | µs per package | ns per payload byte | R² (linear) |
|---|---|---|---|---|---|---|---|
| dnf4 | False | full | Py pkg_convert | 1.02 | 225.09 | 82.69 | 1.000 |
| dnf4 | False | full | Py disjoint | 1.15 | 26.48 | 9.69 | 0.999 |
| dnf4 | False | full | Py pkg_dict | 1.31 | 61.04 | 22.34 | 0.997 |
| dnf4 | False | full | Py json_dumps | 1.09 | 19.37 | 7.12 | 1.000 |
| dnf4 | False | full | Py write | 0.74 | 1.25 | 0.47 | 0.985 |
| dnf4 | False | full | Go Unmarshal | 1.03 | 27.73 | 10.22 | 0.999 |
| dnf4 | False | full | Go Full | 1.02 | 27.86 | 10.26 | 0.999 |
| dnf4 | False | minimal | Py pkg_convert | 0.99 | 42.18 | 79.43 | 1.000 |
| dnf4 | False | minimal | Py disjoint | 1.19 | 15.39 | 28.81 | 0.997 |
| dnf4 | False | minimal | Py pkg_dict | 1.29 | 2.34 | 4.39 | 0.999 |
| dnf4 | False | minimal | Py json_dumps | 1.09 | 3.58 | 6.72 | 0.999 |
| dnf4 | False | minimal | Py write | 0.55 | 0.29 | 0.55 | 0.992 |
| dnf4 | False | minimal | Go Unmarshal | 1.02 | 5.16 | 9.73 | 1.000 |
| dnf4 | False | minimal | Go Full | 1.02 | 5.65 | 10.64 | 0.999 |
| dnf4 | True | full | Py pkg_convert | 1.05 | 716.43 | 56.57 | 0.999 |
| dnf4 | True | full | Py disjoint | 1.12 | 28.21 | 2.23 | 1.000 |
| dnf4 | True | full | Py pkg_dict | 1.27 | 36.29 | 2.87 | 0.998 |
| dnf4 | True | full | Py json_dumps | 1.08 | 43.12 | 3.40 | 1.000 |
| dnf4 | True | full | Py write | 0.81 | 5.64 | 0.45 | 0.997 |
| dnf4 | True | full | Go Unmarshal | 1.02 | 92.27 | 7.28 | 1.000 |
| dnf4 | True | full | Go Full | 1.00 | 89.68 | 7.08 | 1.000 |
| dnf4 | True | minimal | Py pkg_convert | 0.97 | 37.45 | 70.68 | 1.000 |
| dnf4 | True | minimal | Py disjoint | 1.16 | 10.41 | 19.65 | 0.999 |
| dnf4 | True | minimal | Py pkg_dict | 1.26 | 1.71 | 3.23 | 0.998 |
| dnf4 | True | minimal | Py json_dumps | 1.02 | 2.53 | 4.77 | 1.000 |
| dnf4 | True | minimal | Py write | 0.45 | 0.36 | 0.68 | 0.999 |
| dnf4 | True | minimal | Go Unmarshal | 1.02 | 5.34 | 10.07 | 1.000 |
| dnf4 | True | minimal | Go Full | 1.02 | 5.17 | 9.76 | 1.000 |
| dnf5 | False | full | Py pkg_convert | 1.02 | 349.00 | 22.67 | 0.999 |
| dnf5 | False | full | Py disjoint | 1.11 | 31.95 | 2.07 | 0.999 |
| dnf5 | False | full | Py pkg_dict | 1.35 | 74.10 | 4.73 | 0.973 |
| dnf5 | False | full | Py json_dumps | 1.07 | 53.87 | 3.50 | 1.000 |
| dnf5 | False | full | Py write | 0.83 | 7.24 | 0.47 | 1.000 |
| dnf5 | False | full | Go Unmarshal | 1.00 | 96.26 | 6.28 | 1.000 |
| dnf5 | False | full | Go Full | 1.00 | 100.02 | 6.52 | 1.000 |
| dnf5 | False | minimal | Py pkg_convert | 1.04 | 75.51 | 5.73 | 0.998 |
| dnf5 | False | minimal | Py disjoint | 1.15 | 20.87 | 1.58 | 0.998 |
| dnf5 | False | minimal | Py pkg_dict | 1.33 | 2.19 | 0.17 | 0.996 |
| dnf5 | False | minimal | Py json_dumps | 1.07 | 35.56 | 2.71 | 1.000 |
| dnf5 | False | minimal | Py write | 0.80 | 6.11 | 0.47 | 1.000 |
| dnf5 | False | minimal | Go Unmarshal | 0.99 | 71.20 | 5.44 | 1.000 |
| dnf5 | False | minimal | Go Full | 0.99 | 70.00 | 5.35 | 1.000 |

| solver | files | level | n | bytes | gzip-1 (est.) | msgpack (est.) | cbor (est.) | Py convert s | Py dict s | Py dumps s | Py write s | Py msgpack.packb s (est.) | Go Unmarshal s | Go Unmarshal+convert s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dnf4 | False | full | 10 | 0.03 MB | 0.01 MB | 0.02 MB | 0.02 MB | 0.003 | 0.000 | 0.000 | 0.001 | 0.000 | 0.000 | 0.000 |
| dnf4 | False | full | 30 | 0.08 MB | 0.01 MB | 0.06 MB | 0.06 MB | 0.006 | 0.000 | 0.001 | 0.001 | 0.000 | 0.001 | 0.001 |
| dnf4 | False | full | 100 | 0.24 MB | 0.04 MB | 0.20 MB | 0.20 MB | 0.021 | 0.001 | 0.001 | 0.001 | 0.001 | 0.002 | 0.003 |
| dnf4 | False | full | 300 | 0.73 MB | 0.12 MB | 0.60 MB | 0.60 MB | 0.058 | 0.003 | 0.004 | 0.002 | 0.002 | 0.007 | 0.008 |
| dnf4 | False | full | 1000 | 2.56 MB | 0.40 MB | 2.11 MB | 2.12 MB | 0.199 | 0.015 | 0.013 | 0.003 | 0.009 | 0.027 | 0.028 |
| dnf4 | False | full | 3000 | 7.66 MB | 1.13 MB | 6.33 MB | 6.35 MB | 0.593 | 0.055 | 0.044 | 0.009 | 0.040 | 0.082 | 0.079 |
| dnf4 | False | full | 10000 | 27.58 MB | 3.77 MB | 22.77 MB | 22.84 MB | 2.119 | 0.376 | 0.192 | 0.023 | 0.152 | 0.309 | 0.287 |
| dnf4 | False | full | 30000 | 82.72 MB | 10.52 MB | 68.32 MB | 68.51 MB | 6.658 | 1.909 | 0.602 | 0.048 | 0.627 | 0.891 | 0.895 |
| dnf4 | False | full | 76354 | 207.15 MB | 24.28 MB | 171.33 MB | 171.80 MB | 17.160 | 4.566 | 1.468 | 0.097 | 1.412 | 2.108 | 2.114 |
| dnf4 | False | minimal | 10 | 0.01 MB | 0.00 MB | 0.00 MB | 0.00 MB | 0.001 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| dnf4 | False | minimal | 30 | 0.02 MB | 0.00 MB | 0.01 MB | 0.01 MB | 0.002 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| dnf4 | False | minimal | 100 | 0.05 MB | 0.01 MB | 0.05 MB | 0.05 MB | 0.004 | 0.000 | 0.000 | 0.001 | 0.000 | 0.000 | 0.000 |
| dnf4 | False | minimal | 300 | 0.16 MB | 0.02 MB | 0.14 MB | 0.14 MB | 0.013 | 0.000 | 0.001 | 0.001 | 0.000 | 0.001 | 0.001 |
| dnf4 | False | minimal | 1000 | 0.53 MB | 0.08 MB | 0.47 MB | 0.47 MB | 0.040 | 0.001 | 0.002 | 0.001 | 0.001 | 0.004 | 0.005 |
| dnf4 | False | minimal | 3000 | 1.59 MB | 0.23 MB | 1.41 MB | 1.41 MB | 0.118 | 0.005 | 0.007 | 0.002 | 0.004 | 0.014 | 0.016 |
| dnf4 | False | minimal | 10000 | 5.30 MB | 0.72 MB | 4.69 MB | 4.69 MB | 0.391 | 0.016 | 0.025 | 0.005 | 0.016 | 0.048 | 0.052 |
| dnf4 | False | minimal | 30000 | 15.90 MB | 2.08 MB | 14.07 MB | 14.08 MB | 1.208 | 0.065 | 0.101 | 0.008 | 0.070 | 0.159 | 0.156 |
| dnf4 | False | minimal | 76354 | 40.48 MB | 5.04 MB | 35.83 MB | 35.84 MB | 3.227 | 0.178 | 0.272 | 0.023 | 0.251 | 0.392 | 0.433 |
| dnf4 | True | full | 100 | 1.10 MB | 0.13 MB | 1.03 MB | 1.03 MB | 0.056 | 0.001 | 0.003 | 0.001 | 0.001 | 0.008 | 0.009 |
| dnf4 | True | full | 1000 | 11.31 MB | 1.30 MB | 10.62 MB | 10.63 MB | 0.523 | 0.015 | 0.032 | 0.010 | 0.024 | 0.081 | 0.082 |
| dnf4 | True | full | 10000 | 125.98 MB | 12.80 MB | 118.54 MB | 118.63 MB | 7.072 | 0.352 | 0.426 | 0.059 | 0.318 | 0.917 | 0.893 |
| dnf4 | True | minimal | 100 | 0.05 MB | 0.01 MB | 0.05 MB | 0.05 MB | 0.004 | 0.000 | 0.000 | 0.001 | 0.000 | 0.000 | 0.000 |
| dnf4 | True | minimal | 1000 | 0.53 MB | 0.08 MB | 0.47 MB | 0.47 MB | 0.038 | 0.001 | 0.002 | 0.001 | 0.001 | 0.005 | 0.005 |
| dnf4 | True | minimal | 10000 | 5.30 MB | 0.72 MB | 4.69 MB | 4.69 MB | 0.375 | 0.017 | 0.025 | 0.004 | 0.015 | 0.053 | 0.052 |
| dnf5 | False | full | 10 | 0.16 MB | 0.01 MB | 0.15 MB | 0.15 MB | 0.003 | 0.000 | 0.000 | 0.001 | 0.000 | 0.001 | 0.001 |
| dnf5 | False | full | 30 | 0.46 MB | 0.03 MB | 0.44 MB | 0.44 MB | 0.008 | 0.000 | 0.001 | 0.001 | 0.001 | 0.003 | 0.003 |
| dnf5 | False | full | 100 | 1.51 MB | 0.10 MB | 1.45 MB | 1.45 MB | 0.031 | 0.001 | 0.004 | 0.002 | 0.003 | 0.010 | 0.010 |
| dnf5 | False | full | 300 | 4.51 MB | 0.30 MB | 4.32 MB | 4.33 MB | 0.085 | 0.003 | 0.012 | 0.005 | 0.017 | 0.030 | 0.029 |
| dnf5 | False | full | 1000 | 15.12 MB | 1.02 MB | 14.49 MB | 14.50 MB | 0.302 | 0.015 | 0.040 | 0.010 | 0.040 | 0.099 | 0.100 |
| dnf5 | False | full | 3000 | 45.34 MB | 3.00 MB | 43.47 MB | 43.48 MB | 0.921 | 0.055 | 0.145 | 0.024 | 0.095 | 0.294 | 0.293 |
| dnf5 | False | full | 10000 | 153.31 MB | 10.07 MB | 146.66 MB | 146.72 MB | 3.147 | 0.364 | 0.504 | 0.076 | 0.307 | 1.011 | 0.985 |
| dnf5 | False | full | 30000 | 460.10 MB | 29.51 MB | 440.18 MB | 440.34 MB | 10.464 | 2.209 | 1.611 | 0.219 | 1.300 | 2.884 | 3.001 |
| dnf5 | False | minimal | 10 | 0.13 MB | 0.01 MB | 0.13 MB | 0.13 MB | 0.001 | 0.000 | 0.000 | 0.001 | 0.000 | 0.001 | 0.001 |
| dnf5 | False | minimal | 30 | 0.40 MB | 0.02 MB | 0.39 MB | 0.39 MB | 0.003 | 0.000 | 0.001 | 0.001 | 0.000 | 0.002 | 0.002 |
| dnf5 | False | minimal | 100 | 1.32 MB | 0.06 MB | 1.30 MB | 1.30 MB | 0.006 | 0.000 | 0.002 | 0.002 | 0.001 | 0.008 | 0.007 |
| dnf5 | False | minimal | 300 | 3.94 MB | 0.19 MB | 3.86 MB | 3.86 MB | 0.018 | 0.000 | 0.008 | 0.004 | 0.005 | 0.021 | 0.022 |
| dnf5 | False | minimal | 1000 | 13.09 MB | 0.62 MB | 12.85 MB | 12.85 MB | 0.061 | 0.001 | 0.029 | 0.009 | 0.014 | 0.077 | 0.073 |
| dnf5 | False | minimal | 3000 | 39.28 MB | 1.86 MB | 38.54 MB | 38.54 MB | 0.181 | 0.007 | 0.100 | 0.020 | 0.063 | 0.217 | 0.209 |
| dnf5 | False | minimal | 10000 | 131.03 MB | 6.17 MB | 128.58 MB | 128.57 MB | 0.641 | 0.018 | 0.348 | 0.065 | 0.229 | 0.758 | 0.735 |
| dnf5 | False | minimal | 30000 | 393.28 MB | 18.37 MB | 385.93 MB | 385.91 MB | 2.263 | 0.066 | 1.063 | 0.185 | 1.076 | 2.133 | 2.097 |

| level | n | bench | encoding/json (v1) s | GOEXPERIMENT=jsonv2 s (estimate) | speedup |
|---|---|---|---|---|---|
| full | 10 | Full | 0.0003 | 0.0002 | 1.72x |
| full | 10 | Unmarshal | 0.0003 | 0.0001 | 2.11x |
| full | 30 | Full | 0.0008 | 0.0005 | 1.67x |
| full | 30 | Unmarshal | 0.0008 | 0.0004 | 1.93x |
| full | 100 | Full | 0.0025 | 0.0015 | 1.70x |
| full | 100 | Unmarshal | 0.0024 | 0.0014 | 1.78x |
| full | 300 | Full | 0.0081 | 0.0051 | 1.59x |
| full | 300 | Unmarshal | 0.0074 | 0.0040 | 1.87x |
| full | 1000 | Full | 0.0278 | 0.0167 | 1.66x |
| full | 1000 | Unmarshal | 0.0271 | 0.0142 | 1.91x |
| full | 3000 | Full | 0.0793 | 0.0479 | 1.66x |
| full | 3000 | Unmarshal | 0.0817 | 0.0423 | 1.93x |
| full | 10000 | Full | 0.2870 | 0.1738 | 1.65x |
| full | 10000 | Unmarshal | 0.3086 | 0.1474 | 2.09x |
| full | 30000 | Full | 0.8952 | 0.5190 | 1.72x |
| full | 30000 | Unmarshal | 0.8913 | 0.4691 | 1.90x |
| full | 76354 | Full | 2.1140 | 1.2951 | 1.63x |
| full | 76354 | Unmarshal | 2.1078 | 2.8053 | 0.75x |
| minimal | 10 | Full | 0.0001 | 0.0000 | 1.93x |
| minimal | 10 | Unmarshal | 0.0001 | 0.0000 | 1.31x |
| minimal | 30 | Full | 0.0002 | 0.0001 | 1.95x |
| minimal | 30 | Unmarshal | 0.0001 | 0.0001 | 1.57x |
| minimal | 100 | Full | 0.0005 | 0.0002 | 1.93x |
| minimal | 100 | Unmarshal | 0.0004 | 0.0002 | 1.80x |
| minimal | 300 | Full | 0.0014 | 0.0008 | 1.80x |
| minimal | 300 | Unmarshal | 0.0014 | 0.0007 | 1.83x |
| minimal | 1000 | Full | 0.0048 | 0.0027 | 1.74x |
| minimal | 1000 | Unmarshal | 0.0045 | 0.0026 | 1.73x |
| minimal | 3000 | Full | 0.0156 | 0.0089 | 1.75x |
| minimal | 3000 | Unmarshal | 0.0136 | 0.0077 | 1.76x |
| minimal | 10000 | Full | 0.0519 | 0.0267 | 1.94x |
| minimal | 10000 | Unmarshal | 0.0478 | 0.0302 | 1.58x |
| minimal | 30000 | Full | 0.1563 | 0.0832 | 1.88x |
| minimal | 30000 | Unmarshal | 0.1591 | 0.1160 | 1.37x |
| minimal | 76354 | Full | 0.4333 | 0.2259 | 1.92x |
| minimal | 76354 | Unmarshal | 0.3921 | 0.2766 | 1.42x |
