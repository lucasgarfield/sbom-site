python3 -m venv sbom-grader-venv
. sbom-grader-venv/bin/activate
pip install git+https://github.com/BorekZnovustvoritel/SBOM-Grader@66e37c8333ac6055a8c34f2578bab0f2e1385087
sbomgrader grade p1.image-os.spdx.json
