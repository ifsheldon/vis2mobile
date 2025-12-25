"""将包含单个 SVG 的 HTML 转为 PNG 图像。"""

from argparse import ArgumentParser
from pathlib import Path

from svg_converter import ConversionParams, to_png


def main() -> None:
    parser = ArgumentParser(description="将 HTML（仅 SVG）渲染为 PNG。")
    parser.add_argument(
        "html_path", type=Path, help="HTML 文件路径，文件里只包含一个 SVG。"
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("output.png"),
        help="输出 PNG 文件名（默认 output.png）。",
    )
    args = parser.parse_args()
    params = ConversionParams(html_path=args.html_path, output_path=args.output)
    to_png(params)
    print(f"已生成图片：{params.output_path}")


if __name__ == "__main__":
    main()
