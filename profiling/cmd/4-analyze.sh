podman exec -w $PWD ib-v2 python3 bench/analyze_matrix.py runs/cold --variants today,minimal --md runs/cold/tables.md --json runs/cold/summary.json
python3 bench/overview_table.py cold
podman exec -w $PWD ib-v2 python3 bench/analyze_scaling.py      # runs/scaling/fits.md + plots/scaling_*.png
python3 bench/analyze_dump.py runs/dump                          # runs/dump/tables.md
