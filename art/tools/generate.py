"""Génère les sprites manquants avec l'API PixelLab (lancé par GitHub Actions)."""
import base64, json, os, sys, time, urllib.request, urllib.error

KEY = os.environ.get("PIXELLAB_KEY", "").strip()
if not KEY:
    print("::error::Secret PIXELLAB_KEY manquant");sys.exit("Secret PIXELLAB_KEY manquant : ajoute-le dans Settings > Secrets and variables > Actions.")
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(root, "requests.json"), encoding="utf-8"))
d = cfg["defaults"]
out_dir = os.path.join(root, "generated")
os.makedirs(out_dir, exist_ok=True)
made, failed = [], []
only = set(cfg.get("only") or [])
for s in cfg["sprites"]:
    if only and s["id"] not in only:
        continue
    path = os.path.join(out_dir, s["id"] + ".png")
    if os.path.exists(path) and not s.get("force"):
        continue
    size = s.get("size", d["size"])
    body = {
        "description": f'{s["description"]}, {d["suffix"]}',
        "negative_description": d["negative"],
        "image_size": {"width": size, "height": size},
        "no_background": True,
        "view": "side",
        "direction": s.get("direction", "east"),
        "outline": d["outline"],
        "shading": d["shading"],
        "detail": d["detail"],
        "text_guidance_scale": 8,
        "seed": s.get("seed", 0),
    }
    if s.get("init"):
        raw = open(os.path.join(root, s["init"]), "rb").read()
        body["init_image"] = {"type": "base64", "base64": base64.b64encode(raw).decode()}
        body["init_image_strength"] = s.get("init_strength", 300)
    req = urllib.request.Request("https://api.pixellab.ai/v1/generate-image-pixflux", data=json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"})
    for attempt in range(8):
        try:
            res = json.load(urllib.request.urlopen(req, timeout=180))
            b64 = res["image"]["base64"].split(",", 1)[-1]
            open(path, "wb").write(base64.b64decode(b64))
            made.append(s["id"]); print("ok", s["id"], res.get("usage"))
            break
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:300]
            print(f"::error::PixelLab {s['id']} HTTP {e.code} : {msg}")
            if e.code == 429:
                time.sleep(20); continue
            if e.code in (401, 402, 403):
                sys.exit(f"PixelLab refuse la clé ou manque de crédits ({e.code}) : {msg}")
            time.sleep(5)
        except Exception as e:
            print(f"::error::PixelLab {s['id']} : {e}"); time.sleep(5)
    else:
        failed.append(s["id"])
print("générés :", made, "· échecs :", failed)
if failed and not made:
    sys.exit(1)
