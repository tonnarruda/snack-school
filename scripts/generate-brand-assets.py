"""
Deriva os ícones do app da logomarca.

Fonte: public/lancho-logo.png (a arte completa). Saídas: a lancheira recortada
(public/lancho-mark.png), os ícones do PWA e o favicon.

    python3 scripts/generate-brand-assets.py

Depende de Pillow (`pip install Pillow`) e roda a partir da raiz do projeto.
Trocou a arte? Rode de novo e confira os PNGs — só isso.
"""

from PIL import Image, ImageDraw

LOGO = "public/lancho-logo.png"
WHITE = (255, 255, 255, 255)
CREAM = (255, 242, 214, 255)  # creme do círculo da arte

# Recorte da lancheira dentro da arte, em fração da imagem: sobrevive a
# mudanças de resolução do arquivo de origem.
MARK_BOX = (0.2306, 0.0619, 0.7927, 0.6103)


def crop_mark(logo: Image.Image) -> Image.Image:
    w, h = logo.size
    left, top, right, bottom = MARK_BOX
    return logo.crop((round(left * w), round(top * h), round(right * w), round(bottom * h)))


def drop_background(image: Image.Image) -> Image.Image:
    """
    Recorta o fundo branco da arte.

    Flood fill a partir das bordas, e não "todo pixel branco": os brilhos dentro
    da lancheira são igualmente claros e precisam continuar opacos.
    """
    rgb = image.convert("RGB")
    sentinel = (255, 0, 255)
    w, h = rgb.size
    for xy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        ImageDraw.floodfill(rgb, xy, sentinel, thresh=24)

    out = rgb.convert("RGBA")
    out.putdata([(0, 0, 0, 0) if pixel[:3] == sentinel else pixel for pixel in out.getdata()])
    return out


def square(image: Image.Image, background, scale: float = 1.0, size: int = 1024) -> Image.Image:
    """Centraliza a marca num quadrado, ocupando `scale` do lado."""
    canvas = Image.new("RGBA", (size, size), background)
    target = int(size * scale)
    ratio = min(target / image.width, target / image.height)
    resized = image.resize((round(image.width * ratio), round(image.height * ratio)), Image.LANCZOS)
    canvas.paste(resized, ((size - resized.width) // 2, (size - resized.height) // 2), resized)
    return canvas


def compress(image: Image.Image, path: str, rgb: bool = False) -> None:
    """A arte é ilustração: 128 cores indexadas cortam o peso sem diferença visível."""
    flat = image.convert("RGB") if rgb else image
    flat.quantize(colors=128, method=Image.FASTOCTREE).save(path, optimize=True)


def main() -> None:
    logo = Image.open(LOGO).convert("RGBA")
    mark = drop_background(crop_mark(logo))

    compress(square(mark, (0, 0, 0, 0), 1.0, size=512), "public/lancho-mark.png")

    icon = square(mark, WHITE, 0.94)
    # O maskable recua para os 80% centrais: é a área que o Android não recorta.
    maskable = square(mark, CREAM, 0.74)

    for size in (192, 512):
        compress(icon.resize((size, size), Image.LANCZOS), f"public/icons/icon-{size}.png", rgb=True)
    compress(maskable.resize((512, 512), Image.LANCZOS), "public/icons/icon-maskable-512.png", rgb=True)
    # iOS aplica o próprio arredondamento e não lida com transparência.
    compress(icon.resize((180, 180), Image.LANCZOS), "public/icons/apple-touch-icon.png", rgb=True)

    # O Next exige PNG RGBA dentro do .ico — nada de converter para RGB aqui.
    icon.resize((128, 128), Image.LANCZOS).save(
        "src/app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128)]
    )


if __name__ == "__main__":
    main()
