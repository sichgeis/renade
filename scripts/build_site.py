"""Stage only approved public assets for GitHub Pages."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "_site"
PUBLIC_FILES = ["index.html", "assets/css/styles.css", "assets/js/main.js", "data/content.de.json", "data/content.en.json"]

def stage():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    paths = PUBLIC_FILES + [str(p.relative_to(ROOT)) for p in sorted((ROOT / "assets/img").rglob("*")) if p.is_file()]
    if (ROOT / "CNAME").is_file():
        paths.append("CNAME")
    for relative in paths:
        source = ROOT / relative
        if source.is_symlink() or ROOT not in source.resolve().parents:
            raise ValueError("Public assets must be regular repository files")
        if relative.startswith("assets/img/") and source.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".svg"}:
            raise ValueError("Unexpected file type in public image assets")
        target = OUTPUT / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    (OUTPUT / ".nojekyll").touch()
    print(f"Staged {len(paths)} public files; source notes and configuration excluded.")

if __name__ == "__main__":
    stage()
