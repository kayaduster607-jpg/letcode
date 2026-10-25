"""Generate the editable README architecture using Python's standard library."""

from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, ElementTree, indent


INK = "#172B3A"
MUTED = "#5D7181"
BLUE = "#365EDC"
TEAL = "#087D71"


def node(parent, tag, **attributes):
    """Translate Python attribute names into SVG attributes."""
    return SubElement(parent, tag, {name.replace("_", "-"): str(value) for name, value in attributes.items()})


def text(parent, x, y, value, size=24, color=INK, weight=400):
    """Use explicit baselines for consistent mixed Chinese/English text."""
    item = node(parent, "text", x=x, y=y, fill=color, font_size=size, font_weight=weight)
    item.text = value


def box(parent, x, y, width, height, fill="#FFFFFF", stroke="#D4E0E7", radius=18):
    """Draw a flat module or system boundary."""
    return node(parent, "rect", x=x, y=y, width=width, height=height, rx=radius, fill=fill, stroke=stroke, stroke_width=1.5)


def arrow(parent, path, dashed=False):
    """Keep integrations readable with orthogonal directional paths."""
    options = {"d": path, "fill": "none", "stroke": "#8BA1B2", "stroke_width": 2.5, "marker_end": "url(#arrow)", "stroke_linejoin": "round"}
    if dashed:
        options["stroke_dasharray"] = "7 6"
    return node(parent, "path", **options)


def card(parent, x, y, width, height, label, title, rows, accent=TEAL):
    """Use a shared label/title/body hierarchy across all modules."""
    box(parent, x, y, width, height)
    text(parent, x + 26, y + 35, label, 17, accent, 700)
    text(parent, x + 26, y + 78, title, 29, INK, 700)
    for index, row in enumerate(rows):
        text(parent, x + 26, y + 116 + index * 33, row, 22, MUTED)


def build_svg():
    """Compose the actual pages, account storage and generated-asset boundary."""
    svg = Element("svg", {"xmlns": "http://www.w3.org/2000/svg", "width": "1600", "height": "1210", "viewBox": "0 0 1600 1210", "font-family": "Microsoft YaHei, Noto Sans CJK SC, Arial, sans-serif"})
    node(svg, "title").text = "Hot100 学习助手系统架构"
    node(svg, "desc").text = "Next.js 全栈单体提供学习、错题、笔记和管理页面，通过 Cookie 会话保护 API，使用每账号 JSON 进度。教学内容版本化，动画由脚本生成，仅公开 presentation 白名单资源。"
    definitions = node(svg, "defs")
    marker = node(definitions, "marker", id="arrow", markerWidth=9, markerHeight=9, refX=8, refY=4.5, orient="auto", markerUnits="userSpaceOnUse")
    node(marker, "path", d="M 0 0 L 9 4.5 L 0 9 z", fill="#8BA1B2")
    box(svg, 0, 0, 1600, 1210, "#F7F9FC", "#F7F9FC", 0)
    box(svg, 64, 54, 7, 108, BLUE, BLUE, 2)
    text(svg, 94, 76, "HOT100 / LEARNING WORKBENCH", 18, BLUE, 700)
    text(svg, 89, 141, "100 题，从理解到复盘", 56, INK, 700)
    text(svg, 94, 185, "学习路线  →  渐进提示  →  多解法与动画  →  笔记 / 错题 / 复盘", 25, MUTED)

    box(svg, 64, 236, 1000, 146, "#EAF1FF", "#BFD1F7")
    text(svg, 90, 273, "01 / LEARNING EXPERIENCE", 17, BLUE, 700)
    text(svg, 90, 318, "Next.js App Router + React", 34, INK, 700)
    text(svg, 90, 355, "/learn  ·  /problem/:slug  ·  /wrong-book  ·  /admin", 23, MUTED)
    card(svg, 1120, 236, 416, 146, "VERSIONED / SRC/DATA", "内置教学内容", ["100 题 · 17 阶段 · 270 解法"], BLUE)
    arrow(svg, "M 1120 309 H 1064")

    arrow(svg, "M 564 382 V 450")
    text(svg, 588, 424, "AuthContext / useProgress → fetch", 20, MUTED)
    box(svg, 64, 450, 1000, 118, "#17384D", "#17384D")
    text(svg, 90, 487, "02 / NEXT.JS ROUTE HANDLERS", 17, "#AACFEF", 700)
    text(svg, 90, 533, "登录与会话  ·  学习进度  ·  管理员 API", 33, "#FFFFFF", 700)

    node(svg, "path", d="M 564 568 V 602 H 304 M 564 602 H 824", stroke="#8BA1B2", stroke_width=2.5, fill="none")
    arrow(svg, "M 304 602 V 630")
    arrow(svg, "M 824 602 V 630")
    card(svg, 64, 630, 480, 184, "03 / AUTHENTICATION", "Cookie 会话 + scrypt", ["HttpOnly · SameSite=Lax · 7 天", "服务端用户 / 管理员权限校验"])
    card(svg, 584, 630, 480, 184, "03 / ACCOUNT-SCOPED PROGRESS", "学习状态规范化", ["当前用户 ID 写入 · 过滤非法题号", "笔记 · 提示 · 错题 · 复盘检查"])

    arrow(svg, "M 304 814 V 882")
    arrow(svg, "M 824 814 V 882")
    box(svg, 64, 882, 1000, 164, "#EAF6F1", "#BDDFD2")
    text(svg, 90, 919, "04 / PRIVATE RUNTIME STORAGE", 17, TEAL, 700)
    text(svg, 90, 964, "data/users.json", 34, INK, 700)
    text(svg, 90, 1007, "users  +  sessions  +  progress[userId]      /      通过数据卷保存", 24, MUTED)

    card(svg, 1120, 450, 416, 184, "BUILD / REPRODUCIBLE", "生成动画页面", ["pnpm generate:videos → ship/", "无需密钥；语音合成可选"], BLUE)
    arrow(svg, "M 1328 634 V 714")
    card(svg, 1120, 714, 416, 218, "API / PUBLIC ASSET BOUNDARY", "presentation/ 白名单", ["HTML · JS · CSS · 音频 · 图片", "拦截隐藏配置、密钥与越界路径", "演示目录与私人数据分开"], BLUE)
    arrow(svg, "M 1120 823 H 1092 V 510 H 1064", True)
    text(svg, 1146, 990, "浏览器 iframe 播放生成页面", 23, BLUE, 700)
    text(svg, 1146, 1028, "生成资源不进入 Git 历史", 21, MUTED)

    node(svg, "path", d="M 64 1100 H 1536", stroke="#D4E0E7", stroke_width=1.5)
    text(svg, 64, 1147, "DEPLOYMENT", 17, BLUE, 700)
    text(svg, 278, 1147, "Docker Compose  :3001", 25, INK, 700)
    text(svg, 800, 1147, "./data → /app/data", 23, MUTED)
    text(svg, 1212, 1147, "单服务 · 单实例", 23, MUTED)
    text(svg, 64, 1187, "教学内容可版本化，演示资源可重建，个人学习数据独立保存。主应用无需 API Key。", 20, MUTED)
    return svg


def main():
    """Save the vector beside the README's raster export."""
    target = Path(__file__).with_name("architecture.svg")
    tree = ElementTree(build_svg())
    indent(tree)
    tree.write(target, encoding="utf-8", xml_declaration=True)
    print(target)


if __name__ == "__main__":
    main()
