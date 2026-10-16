# warm matrix: 5 image types x dnf4,dnf5 x today,full,minimal,full_files x 5 reps
podman exec -w $PWD ib-v2 python3 bench/run_matrix.py --out runs/warm --cache warm --reps 5 \
  --images generic-container,minimal-raw-xz,generic-qcow2,server-qcow2,workstation-live-installer
podman exec -w $PWD ib-v2 python3 bench/analyze_matrix.py runs/warm --md runs/warm/tables.md --json runs/warm/summary.json --plot plots/stages_warm.png
python3 bench/overview_table.py warm
