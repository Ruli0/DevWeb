#!/usr/bin/env python3
"""
Détoure une photo : retire le fond et écrit un PNG transparent (un « autocollant » pour le collage, voir production/PASSATION-AVIS.md).
  python3 scripts/decouper.py <photo.jpg> <sortie.png>
Modèle : BiRefNet lite (licence MIT), au format ONNX, téléchargé depuis huggingface.co (224 Mo, une fois) puis exécuté en local sur le
processeur : la photo ne quitte pas la machine. Pas de code distant exécuté : seul un fichier de poids est téléchargé.
Dépendances : pip install onnxruntime pillow numpy huggingface_hub
La sortie est rognée sur le sujet. Elle ne reçoit aucune métadonnée (les photos de téléphone portent souvent la position GPS).
"""
import os, sys
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')           # avant l'import de huggingface_hub : le second hôte de téléchargement (xet) n'est pas autorisé
import numpy as np
from PIL import Image

def modele():
    from huggingface_hub import hf_hub_download
    return hf_hub_download('onnx-community/BiRefNet_lite-ONNX', 'onnx/model.onnx')

def masque(img):
    import onnxruntime as ort
    taille = 1024
    session = ort.InferenceSession(modele(), providers=['CPUExecutionProvider'])
    x = np.asarray(img.convert('RGB').resize((taille, taille), Image.BILINEAR), dtype=np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406], dtype=np.float32)) / np.array([0.229, 0.224, 0.225], dtype=np.float32)
    sortie = session.run(None, {session.get_inputs()[0].name: x.transpose(2, 0, 1)[None].astype(np.float32)})[0]
    m = 1 / (1 + np.exp(-sortie[0, 0]))                       # sigmoïde : 0 (fond) à 1 (sujet)
    return Image.fromarray((m * 255).astype(np.uint8)).resize(img.size, Image.LANCZOS)

def main():
    if len(sys.argv) != 3: sys.exit(__doc__)
    img = Image.open(sys.argv[1]); img = img.convert('RGB')
    img.thumbnail((3000, 3000))                               # pleine définition : le sujet ne fait que 420 pixels de large dans la photo
    m = masque(img)
    rgba = img.copy(); rgba.putalpha(m)
    boite = m.point(lambda v: 255 if v > 40 else 0).getbbox()  # on rogne sur le sujet, avec une petite marge
    if boite:
        marge = 12; boite = (max(0, boite[0] - marge), max(0, boite[1] - marge), min(img.width, boite[2] + marge), min(img.height, boite[3] + marge))
        rgba = rgba.crop(boite)
    rgba.save(sys.argv[2], optimize=True)                     # Pillow n'écrit aucune métadonnée de position
    couvert = np.asarray(m, dtype=np.float32).mean() / 255
    print(f"{sys.argv[2]} : {rgba.width} × {rgba.height}, sujet = {100 * couvert:.1f} % de l'image")

if __name__ == '__main__':
    main()
