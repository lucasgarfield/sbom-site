
#### generic-container — dnf4 — 288 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 1.44 | 0.88 | 0.15 | 2.99 |
|   of which depsolver SBOM (MB) | 0.57 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 7054 | 7054 | 0 | 7054 |
| Py interpreter start (before harness) | 116 (102–118) | 101 (101–110) | 101 (92–105) | 99 (96–108) |
| Py import dnf/libdnf5 + tool | 237 (230–244) | 241 (232–266) | 243 (226–261) | 240 (225–262) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 822 (717–1165) | 851 (808–1236) | 1068 (801–1322) | 1157 (1110–1334) |
| Py depsolve (resolve, minus convert/SBOM) | 177 (168–186) | 163 (158–184) | 165 (156–318) | 167 (161–183) |
| Py dnf pkg -> model.Package | 50 (49–56) | 46 (46–50) | 11 (10–15) | 171 (157–179) |
| Py SPDX SBOM in depsolver | 124 (119–130) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 3 (3–5) | 3 (3–4) | 1 (1–2) | 5 (5–6) |
| Py model.Package -> dict | 2 (2–4) | 3 (3–4) | 0 (0–0) | 3 (3–4) |
| Py json.dumps | 6 (5–8) | 3 (3–6) | 1 (1–1) | 9 (8–9) |
| Py stdout write+flush | 4 (4–8) | 2 (2–3) | 0 (0–1) | 9 (8–10) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
|   (of repo load: Repo.load md check) | 262 (169–527) | 263 (245–586) | 474 (281–750) | 402 (167–589) |
| Go marshal request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 12 (12–13) | 8 (8–11) | 2 (1–3) | 25 (24–28) |
| Go convert to rpmmd | 0 (0–0) | 0 (0–1) | 0 (0–0) | 0 (0–1) |
| Go other post-processing (incl. SBOM doc) | 0 (0–1) | 0 (0–1) | 0 (0–1) | 0 (0–0) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 83 (77–84) | 67 (66–76) | 16 (14–20) | 224 (210–234) |
| depsolver process (Go view) | 1551 (1413–1905) | 1428 (1365–1855) | 1639 (1291–1852) | 1878 (1779–2044) |
| output arrival window (first→last byte) | 7 (7–11) | 3 (2–3) | 0 (0–0) | 9 (8–9) |
| rest of image-builder (not depsolve) | 2767 (2603–3019) | 2674 (2611–3146) | 2759 (2608–2976) | 2754 (2699–2981) |
| **total wall** | 4212 (4166–4740) | 4102 (3985–5011) | 4300 (3900–4831) | 4726 (4505–4958) |
| metadata-dependent share of wall | 1.9% | 1.6% | 0.4% | 4.7% |
| peak RSS Python (MiB, max over calls) | 124 | 120 | 120 | 131 |
| peak RSS image-builder Go process (MiB) | 68 | 69 | 69 | 73 |

#### minimal-raw-xz — dnf4 — 592 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 5.39 | 4.18 | 0.30 | 8.03 |
|   of which depsolver SBOM (MB) | 1.22 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 51554 | 51554 | 0 | 51554 |
| Py interpreter start (before harness) | 110 (103–117) | 108 (105–124) | 109 (101–124) | 109 (108–118) |
| Py import dnf/libdnf5 + tool | 244 (236–282) | 253 (235–255) | 250 (238–325) | 255 (237–312) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 928 (850–1077) | 883 (850–1050) | 866 (734–1532) | 1166 (997–1304) |
| Py depsolve (resolve, minus convert/SBOM) | 610 (598–623) | 616 (613–653) | 624 (580–648) | 642 (605–847) |
| Py dnf pkg -> model.Package | 184 (182–203) | 194 (186–197) | 41 (36–55) | 494 (465–561) |
| Py SPDX SBOM in depsolver | 226 (218–247) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 28 (27–31) | 29 (27–33) | 4 (4–5) | 37 (36–41) |
| Py model.Package -> dict | 44 (42–49) | 18 (16–21) | 0 (0–1) | 19 (17–21) |
| Py json.dumps | 23 (22–24) | 21 (20–22) | 1 (1–2) | 31 (30–37) |
| Py stdout write+flush | 17 (16–20) | 12 (10–12) | 1 (1–1) | 23 (20–44) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
|   (of repo load: Repo.load md check) | 318 (268–459) | 297 (241–442) | 286 (181–763) | 296 (207–459) |
| Go marshal request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 47 (46–50) | 42 (39–58) | 3 (3–5) | 69 (64–87) |
| Go convert to rpmmd | 2 (1–5) | 4 (1–6) | 0 (0–2) | 2 (2–5) |
| Go other post-processing (incl. SBOM doc) | 0 (0–1) | 1 (1–1) | 1 (0–1) | 1 (0–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 346 (342–376) | 319 (312–339) | 54 (45–66) | 689 (647–768) |
| depsolver process (Go view) | 2512 (2312–2612) | 2163 (2114–2355) | 1923 (1709–2683) | 2899 (2647–2997) |
| output arrival window (first→last byte) | 27 (25–29) | 16 (15–19) | 1 (1–2) | 29 (26–48) |
| rest of image-builder (not depsolve) | 3100 (2780–3187) | 2926 (2673–3274) | 2890 (2748–3013) | 3059 (2756–3178) |
| **total wall** | 5552 (5397–5813) | 5136 (4829–5693) | 4941 (4487–5579) | 5914 (5586–6192) |
| metadata-dependent share of wall | 6.3% | 6.2% | 1.0% | 11.6% |
| peak RSS Python (MiB, max over calls) | 169 | 160 | 128 | 182 |
| peak RSS image-builder Go process (MiB) | 84 | 80 | 69 | 88 |

#### generic-qcow2 — dnf4 — 704 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 5.93 | 4.48 | 0.36 | 8.57 |
|   of which depsolver SBOM (MB) | 1.44 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 53964 | 53964 | 0 | 53964 |
| Py interpreter start (before harness) | 109 (99–122) | 104 (99–114) | 101 (99–117) | 113 (101–115) |
| Py import dnf/libdnf5 + tool | 240 (234–255) | 238 (223–273) | 235 (234–241) | 250 (228–279) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 1044 (809–1129) | 894 (792–1242) | 958 (756–1224) | 1156 (1017–1546) |
| Py depsolve (resolve, minus convert/SBOM) | 687 (642–712) | 697 (655–721) | 687 (649–799) | 732 (672–775) |
| Py dnf pkg -> model.Package | 209 (203–220) | 210 (208–218) | 47 (42–55) | 544 (511–626) |
| Py SPDX SBOM in depsolver | 260 (248–275) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 31 (28–35) | 29 (28–30) | 5 (5–8) | 40 (35–44) |
| Py model.Package -> dict | 44 (37–49) | 18 (18–22) | 0 (0–1) | 19 (16–21) |
| Py json.dumps | 26 (23–27) | 22 (20–27) | 1 (1–2) | 34 (31–38) |
| Py stdout write+flush | 16 (15–17) | 10 (9–11) | 1 (1–2) | 20 (19–28) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
|   (of repo load: Repo.load md check) | 454 (202–599) | 321 (262–673) | 346 (223–679) | 341 (249–799) |
| Go marshal request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 54 (48–56) | 45 (44–53) | 4 (3–5) | 76 (68–88) |
| Go convert to rpmmd | 1 (1–2) | 4 (2–5) | 0 (0–1) | 2 (2–3) |
| Go other post-processing (incl. SBOM doc) | 0 (0–1) | 0 (0–1) | 0 (0–0) | 0 (0–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 387 (360–391) | 343 (336–354) | 62 (53–71) | 748 (683–820) |
| depsolver process (Go view) | 2676 (2502–2729) | 2222 (2075–2640) | 2123 (1799–2280) | 3083 (2737–3174) |
| output arrival window (first→last byte) | 26 (24–31) | 14 (12–14) | 1 (1–2) | 25 (22–34) |
| rest of image-builder (not depsolve) | 2829 (2689–3043) | 2873 (2792–2938) | 2748 (2675–2816) | 2789 (2720–3103) |
| **total wall** | 5514 (5423–5617) | 5202 (4914–5528) | 4886 (4505–5033) | 5901 (5599–6292) |
| metadata-dependent share of wall | 7.0% | 6.5% | 1.3% | 12.6% |
| peak RSS Python (MiB, max over calls) | 170 | 162 | 128 | 184 |
| peak RSS image-builder Go process (MiB) | 85 | 80 | 68 | 87 |

#### server-qcow2 — dnf4 — 1095 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 8.09 | 5.71 | 0.56 | 11.48 |
|   of which depsolver SBOM (MB) | 2.38 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 68633 | 68633 | 0 | 68633 |
| Py interpreter start (before harness) | 127 (124–130) | 110 (106–111) | 110 (102–125) | 113 (107–123) |
| Py import dnf/libdnf5 + tool | 255 (247–274) | 244 (233–269) | 249 (242–254) | 234 (230–297) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 932 (882–1343) | 955 (869–1108) | 1071 (867–1208) | 1300 (1040–1423) |
| Py depsolve (resolve, minus convert/SBOM) | 1215 (1180–1311) | 1165 (1149–1219) | 1210 (1163–1269) | 1212 (1154–1256) |
| Py dnf pkg -> model.Package | 301 (295–333) | 314 (282–322) | 71 (69–72) | 743 (726–793) |
| Py SPDX SBOM in depsolver | 393 (388–395) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 46 (44–46) | 44 (43–54) | 8 (8–10) | 57 (54–59) |
| Py model.Package -> dict | 25 (23–29) | 25 (23–34) | 1 (1–1) | 27 (25–30) |
| Py json.dumps | 35 (33–39) | 27 (27–32) | 2 (2–3) | 46 (44–49) |
| Py stdout write+flush | 23 (19–36) | 18 (15–22) | 2 (2–3) | 33 (31–53) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
|   (of repo load: Repo.load md check) | 282 (243–675) | 350 (283–511) | 410 (257–595) | 493 (285–506) |
| Go marshal request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 70 (67–74) | 58 (54–69) | 6 (5–7) | 94 (92–104) |
| Go convert to rpmmd | 3 (2–7) | 2 (2–6) | 0 (0–1) | 3 (3–3) |
| Go other post-processing (incl. SBOM doc) | 1 (0–1) | 1 (1–1) | 1 (0–1) | 1 (0–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 508 (485–553) | 492 (462–532) | 91 (88–94) | 1027 (979–1062) |
| depsolver process (Go view) | 3484 (3329–3768) | 2967 (2779–3144) | 2713 (2493–2929) | 3737 (3522–4042) |
| output arrival window (first→last byte) | 41 (35–52) | 26 (23–31) | 3 (2–3) | 44 (41–65) |
| rest of image-builder (not depsolve) | 2901 (2734–3002) | 2950 (2744–3067) | 3102 (2905–3122) | 2872 (2655–3344) |
| **total wall** | 6464 (6141–6762) | 5918 (5807–6096) | 5628 (5613–6059) | 6656 (6273–7495) |
| metadata-dependent share of wall | 7.9% | 8.1% | 1.6% | 15.1% |
| peak RSS Python (MiB, max over calls) | 191 | 174 | 131 | 212 |
| peak RSS image-builder Go process (MiB) | 88 | 85 | 68 | 104 |

#### workstation-live-installer — dnf4 — 2276 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 14.30 | 9.24 | 1.17 | 20.23 |
|   of which depsolver SBOM (MB) | 5.06 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 108404 | 108404 | 0 | 108404 |
| Py interpreter start (before harness) | 152 (134–171) | 117 (110–175) | 108 (104–118) | 119 (110–205) |
| Py import dnf/libdnf5 + tool | 255 (254–267) | 280 (256–296) | 268 (261–292) | 262 (253–281) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–1) |
| Py repo metadata load (solver init) | 1021 (882–1084) | 1040 (914–1266) | 1173 (991–1349) | 1049 (1022–1141) |
| Py depsolve (resolve, minus convert/SBOM) | 995 (918–1006) | 976 (943–1126) | 942 (921–1045) | 947 (931–1027) |
| Py dnf pkg -> model.Package | 286 (270–310) | 294 (273–315) | 86 (80–97) | 819 (767–840) |
| Py SPDX SBOM in depsolver | 706 (680–761) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 49 (48–51) | 49 (46–51) | 14 (14–15) | 63 (58–90) |
| Py model.Package -> dict | 52 (51–54) | 97 (93–103) | 1 (1–2) | 95 (95–106) |
| Py json.dumps | 66 (65–68) | 48 (45–50) | 4 (4–4) | 88 (85–90) |
| Py stdout write+flush | 36 (34–40) | 33 (30–37) | 3 (3–4) | 81 (65–109) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
|   (of repo load: Repo.load md check) | 354 (238–475) | 373 (209–555) | 481 (309–659) | 249 (227–290) |
| Go marshal request | 0 (0–0) | 0 (0–0) | 0 (0–1) | 0 (0–0) |
| Go json.Unmarshal | 122 (118–128) | 108 (98–113) | 12 (11–13) | 172 (162–178) |
| Go convert to rpmmd | 8 (7–8) | 9 (8–10) | 1 (1–1) | 4 (3–6) |
| Go other post-processing (incl. SBOM doc) | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 620 (598–652) | 643 (608–651) | 123 (116–135) | 1331 (1268–1387) |
| depsolver process (Go view) | 3567 (3474–3744) | 2916 (2851–3204) | 2573 (2444–2895) | 3604 (3499–3782) |
| output arrival window (first→last byte) | 64 (62–70) | 38 (37–56) | 4 (4–5) | 96 (76–111) |
| rest of image-builder (not depsolve) | 3010 (2798–3051) | 3159 (2888–3203) | 3228 (3058–3436) | 3063 (2946–3218) |
| **total wall** | 6710 (6492–6879) | 6213 (5922–6479) | 5821 (5516–6139) | 6968 (6612–7016) |
| metadata-dependent share of wall | 9.2% | 10.3% | 2.1% | 19.5% |
| peak RSS Python (MiB, max over calls) | 217 | 189 | 137 | 242 |
| peak RSS image-builder Go process (MiB) | 117 | 115 | 71 | 139 |

#### generic-container — dnf5 — 288 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 4.81 | 4.24 | 3.52 | 6.36 |
|   of which depsolver SBOM (MB) | 0.56 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 7054 | 7054 | 0 | 7054 |
| Py interpreter start (before harness) | 107 (105–118) | 100 (97–104) | 104 (100–112) | 111 (103–128) |
| Py import dnf/libdnf5 + tool | 222 (211–238) | 225 (216–290) | 226 (213–272) | 229 (204–241) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 355 (263–460) | 304 (270–325) | 288 (266–496) | 418 (356–566) |
| Py depsolve (resolve, minus convert/SBOM) | 203 (201–213) | 203 (200–211) | 211 (203–224) | 221 (198–225) |
| Py dnf pkg -> model.Package | 100 (97–102) | 103 (102–113) | 21 (21–24) | 226 (216–239) |
| Py SPDX SBOM in depsolver | 171 (162–183) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 6 (5–6) | 5 (5–6) | 3 (3–4) | 8 (7–8) |
| Py model.Package -> dict | 3 (3–3) | 6 (6–6) | 0 (0–0) | 7 (6–7) |
| Py json.dumps | 13 (13–14) | 12 (11–13) | 8 (8–9) | 19 (17–21) |
| Py stdout write+flush | 12 (11–15) | 12 (11–15) | 10 (8–13) | 19 (16–24) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
| Go marshal request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 32 (31–34) | 28 (27–30) | 22 (19–24) | 43 (39–48) |
| Go convert to rpmmd | 0 (0–1) | 0 (0–1) | 0 (0–0) | 0 (0–0) |
| Go other post-processing (incl. SBOM doc) | 0 (0–1) | 0 (0–0) | 0 (0–1) | 0 (0–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 168 (162–171) | 168 (166–179) | 67 (61–67) | 325 (306–338) |
| depsolver process (Go view) | 1228 (1090–1329) | 986 (952–1008) | 894 (840–1158) | 1289 (1162–1387) |
| output arrival window (first→last byte) | 19 (17–22) | 15 (14–17) | 15 (11–17) | 22 (18–37) |
| rest of image-builder (not depsolve) | 2858 (2770–3022) | 2935 (2800–2990) | 2920 (2714–3068) | 3068 (2843–3237) |
| **total wall** | 4132 (3982–4285) | 3971 (3797–4008) | 3838 (3586–4248) | 4305 (4274–4575) |
| metadata-dependent share of wall | 4.0% | 4.3% | 1.7% | 7.4% |
| peak RSS Python (MiB, max over calls) | 142 | 138 | 135 | 145 |
| peak RSS image-builder Go process (MiB) | 78 | 76 | 71 | 81 |

#### minimal-raw-xz — dnf5 — 592 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 12.36 | 11.15 | 7.28 | 15.00 |
|   of which depsolver SBOM (MB) | 1.21 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 51554 | 51554 | 0 | 51554 |
| Py interpreter start (before harness) | 116 (106–122) | 104 (101–104) | 99 (97–100) | 111 (93–119) |
| Py import dnf/libdnf5 + tool | 222 (207–226) | 228 (214–257) | 214 (212–230) | 215 (208–255) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 267 (247–627) | 284 (259–305) | 341 (261–617) | 363 (356–401) |
| Py depsolve (resolve, minus convert/SBOM) | 268 (261–294) | 291 (280–316) | 268 (259–298) | 277 (269–285) |
| Py dnf pkg -> model.Package | 525 (509–565) | 535 (496–576) | 68 (64–79) | 807 (792–883) |
| Py SPDX SBOM in depsolver | 420 (401–451) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 37 (35–51) | 38 (35–47) | 11 (11–13) | 42 (41–43) |
| Py model.Package -> dict | 15 (14–21) | 21 (18–23) | 1 (0–1) | 19 (19–20) |
| Py json.dumps | 45 (43–62) | 43 (39–47) | 17 (17–18) | 48 (48–50) |
| Py stdout write+flush | 39 (37–47) | 37 (33–39) | 21 (20–22) | 41 (36–56) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
| Go marshal request | 0 (0–1) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 86 (84–98) | 79 (74–100) | 41 (40–44) | 105 (97–148) |
| Go convert to rpmmd | 1 (1–3) | 2 (1–3) | 0 (0–0) | 2 (1–2) |
| Go other post-processing (incl. SBOM doc) | 1 (0–1) | 0 (0–1) | 0 (0–0) | 1 (0–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 746 (734–823) | 755 (706–821) | 159 (153–173) | 1060 (1053–1189) |
| depsolver process (Go view) | 2114 (1929–2352) | 1592 (1553–1660) | 1109 (964–1324) | 2011 (1905–2045) |
| output arrival window (first→last byte) | 54 (49–65) | 45 (43–49) | 25 (24–26) | 57 (49–74) |
| rest of image-builder (not depsolve) | 2772 (2742–2987) | 2883 (2754–3013) | 2851 (2736–3009) | 2902 (2701–3171) |
| **total wall** | 4969 (4759–5441) | 4640 (4397–4714) | 3940 (3797–4236) | 5017 (4706–5368) |
| metadata-dependent share of wall | 15.2% | 16.2% | 4.1% | 22.1% |
| peak RSS Python (MiB, max over calls) | 208 | 193 | 155 | 209 |
| peak RSS image-builder Go process (MiB) | 104 | 105 | 85 | 105 |

#### generic-qcow2 — dnf5 — 704 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 14.26 | 12.82 | 8.70 | 16.91 |
|   of which depsolver SBOM (MB) | 1.44 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 53964 | 53964 | 0 | 53964 |
| Py interpreter start (before harness) | 122 (118–270) | 116 (105–123) | 102 (96–136) | 118 (100–119) |
| Py import dnf/libdnf5 + tool | 239 (216–327) | 245 (217–274) | 226 (209–271) | 235 (208–256) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 303 (270–975) | 361 (272–759) | 313 (252–450) | 389 (348–522) |
| Py depsolve (resolve, minus convert/SBOM) | 307 (292–352) | 305 (298–321) | 305 (279–342) | 305 (290–327) |
| Py dnf pkg -> model.Package | 606 (572–723) | 591 (590–615) | 84 (76–110) | 930 (893–1013) |
| Py SPDX SBOM in depsolver | 485 (458–5845) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 41 (40–60) | 41 (40–44) | 14 (13–14) | 49 (47–50) |
| Py model.Package -> dict | 21 (19–37) | 22 (21–23) | 1 (1–1) | 22 (20–33) |
| Py json.dumps | 50 (49–76) | 44 (43–59) | 23 (22–37) | 59 (53–78) |
| Py stdout write+flush | 44 (38–120) | 38 (35–81) | 22 (21–37) | 45 (39–119) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
| Go marshal request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 103 (92–140) | 92 (89–107) | 47 (46–49) | 126 (118–144) |
| Go convert to rpmmd | 2 (2–6) | 2 (2–3) | 0 (0–0) | 3 (2–3) |
| Go other post-processing (incl. SBOM doc) | 1 (1–5) | 1 (0–1) | 0 (0–1) | 1 (0–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 852 (813–1163) | 853 (823–898) | 193 (179–244) | 1219 (1192–1438) |
| depsolver process (Go view) | 2227 (2106–8808) | 1896 (1654–2246) | 1185 (980–1285) | 2118 (2051–2533) |
| output arrival window (first→last byte) | 67 (52–141) | 49 (44–88) | 26 (23–41) | 57 (51–127) |
| rest of image-builder (not depsolve) | 2749 (2674–3208) | 3018 (2731–3231) | 2967 (2801–3363) | 2943 (2766–3172) |
| **total wall** | 5182 (4875–11709) | 4910 (4545–5514) | 4178 (3829–4699) | 5183 (4940–5776) |
| metadata-dependent share of wall | 16.7% | 17.3% | 4.8% | 24.0% |
| peak RSS Python (MiB, max over calls) | 215 | 199 | 165 | 217 |
| peak RSS image-builder Go process (MiB) | 102 | 106 | 86 | 117 |

#### server-qcow2 — dnf5 — 1095 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 21.04 | 18.68 | 13.53 | 24.45 |
|   of which depsolver SBOM (MB) | 2.36 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 68633 | 68633 | 0 | 68633 |
| Py interpreter start (before harness) | 119 (115–123) | 107 (95–110) | 109 (102–119) | 107 (105–129) |
| Py import dnf/libdnf5 + tool | 232 (218–238) | 220 (206–271) | 232 (226–267) | 230 (221–242) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 288 (276–489) | 296 (266–492) | 279 (260–541) | 409 (406–769) |
| Py depsolve (resolve, minus convert/SBOM) | 396 (386–403) | 410 (372–422) | 408 (389–429) | 403 (396–427) |
| Py dnf pkg -> model.Package | 874 (859–959) | 902 (828–927) | 129 (128–134) | 1418 (1328–1539) |
| Py SPDX SBOM in depsolver | 664 (637–772) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 65 (63–69) | 63 (57–67) | 24 (24–26) | 79 (76–91) |
| Py model.Package -> dict | 29 (28–40) | 65 (55–79) | 1 (1–1) | 86 (73–90) |
| Py json.dumps | 75 (70–83) | 67 (58–75) | 36 (35–37) | 85 (79–113) |
| Py stdout write+flush | 94 (79–104) | 60 (48–63) | 42 (36–46) | 93 (71–99) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
| Go marshal request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 138 (135–147) | 128 (126–130) | 75 (74–82) | 174 (164–191) |
| Go convert to rpmmd | 3 (2–4) | 7 (2–7) | 0 (0–0) | 3 (3–4) |
| Go other post-processing (incl. SBOM doc) | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (0–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 1300 (1254–1378) | 1318 (1176–1332) | 312 (304–317) | 1937 (1846–2089) |
| depsolver process (Go view) | 3001 (2801–3049) | 2301 (2014–2468) | 1314 (1237–1521) | 3008 (2974–3215) |
| output arrival window (first→last byte) | 117 (102–130) | 70 (61–75) | 48 (44–51) | 112 (90–120) |
| rest of image-builder (not depsolve) | 2864 (2540–3101) | 2858 (2719–2976) | 2867 (2687–2954) | 2918 (2777–3117) |
| **total wall** | 5894 (5679–6292) | 5224 (4981–5581) | 4217 (4075–4390) | 6304 (5944–6361) |
| metadata-dependent share of wall | 22.1% | 24.8% | 7.2% | 32.6% |
| peak RSS Python (MiB, max over calls) | 252 | 234 | 189 | 262 |
| peak RSS image-builder Go process (MiB) | 146 | 120 | 104 | 155 |

#### workstation-live-installer — dnf5 — 2276 packages over 2 depsolve calls, 5 reps

| stage (sum over calls), median (min–max) ms | today | full | minimal | full_files |
|---|---|---|---|---|
| response payload (MB) | 41.63 | 36.59 | 28.52 | 47.58 |
|   of which depsolver SBOM (MB) | 5.04 | 0.00 | 0.00 | 0.00 |
| reldeps / files returned | 108404 | 108404 | 0 | 108404 |
| Py interpreter start (before harness) | 132 (123–154) | 105 (100–130) | 102 (100–107) | 107 (104–117) |
| Py import dnf/libdnf5 + tool | 222 (217–276) | 211 (207–240) | 224 (208–247) | 218 (214–254) |
| Py read+parse request | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 294 (251–448) | 305 (266–441) | 293 (275–415) | 402 (370–526) |
| Py depsolve (resolve, minus convert/SBOM) | 516 (465–657) | 519 (493–521) | 521 (490–544) | 518 (503–570) |
| Py dnf pkg -> model.Package | 833 (809–1123) | 914 (834–918) | 152 (141–156) | 1392 (1342–1541) |
| Py SPDX SBOM in depsolver | 1146 (1135–1383) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 70 (69–72) | 67 (64–69) | 33 (31–36) | 78 (75–86) |
| Py model.Package -> dict | 52 (49–67) | 97 (92–132) | 5 (5–6) | 106 (96–148) |
| Py json.dumps | 139 (129–175) | 127 (122–139) | 76 (73–84) | 167 (148–213) |
| Py stdout write+flush | 177 (126–275) | 99 (77–123) | 90 (79–112) | 184 (166–301) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) | 1 (1–1) | 1 (1–1) |
| Go marshal request | 0 (0–0) | 0 (0–4) | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 272 (270–279) | 249 (233–259) | 162 (153–168) | 311 (307–367) |
| Go convert to rpmmd | 6 (5–6) | 4 (3–5) | 1 (1–1) | 6 (5–6) |
| Go other post-processing (incl. SBOM doc) | 1 (1–1) | 1 (0–1) | 1 (0–1) | 1 (1–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 1551 (1473–1995) | 1534 (1454–1624) | 515 (507–534) | 2218 (2215–2654) |
| depsolver process (Go view) | 3819 (3461–4620) | 2500 (2363–2697) | 1545 (1505–1583) | 3203 (3169–3738) |
| output arrival window (first→last byte) | 211 (155–295) | 108 (88–127) | 89 (81–103) | 193 (170–274) |
| rest of image-builder (not depsolve) | 2871 (2805–3089) | 2871 (2788–2957) | 2867 (2770–2952) | 2916 (2784–3000) |
| **total wall** | 6961 (6549–7994) | 5692 (5390–5922) | 4601 (4460–4652) | 6424 (6288–7113) |
| metadata-dependent share of wall | 22.7% | 27.3% | 11.5% | 34.9% |
| peak RSS Python (MiB, max over calls) | 302 | 273 | 223 | 311 |
| peak RSS image-builder Go process (MiB) | 230 | 148 | 150 | 246 |
