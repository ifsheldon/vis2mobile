"""将包含单个 SVG 的 HTML 渲染为 PDF。"""

from argparse import ArgumentParser
from pathlib import Path

from svg_converter import ConversionParams, to_pdf


def main() -> None:
    parser = ArgumentParser(description="将 HTML（仅 SVG）渲染为 PDF。")
    parser.add_argument(
        "html_path", type=Path, help="HTML 文件路径，文件里只包含一个 SVG。"
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("output.pdf"),
        help="输出 PDF 文件名（默认 output.pdf）。",
    )
    args = parser.parse_args()
    params = ConversionParams(html_path=args.html_path, output_path=args.output)
    to_pdf(params)
    print(f"已生成 PDF：{params.output_path}")


if __name__ == "__main__":
    main()

