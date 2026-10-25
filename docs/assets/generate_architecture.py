"""Draw the README architecture as an editable, restrained editorial diagram.

Run: python docs/assets/generate_architecture.py
The PNG alongside the SVG is a raster export for consistent GitHub rendering.
"""

from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, ElementTree, indent, tostring


WIDTH, HEIGHT = 1800, 1060
INK = "#292C29"
MUTED = "#777C75"
RULE = "#DDDCD6"
ACCENT = "#71618E"
MONO = "Consolas, SFMono-Regular, monospace"


def node(parent, tag, **attributes):
    """Normalize Python attribute names without constructing raw SVG strings."""
    return SubElement(parent, tag, {name.replace("_", "-"): str(value) for name, value in attributes.items()})


def text(parent, x, y, value, size=24, color=INK, weight=400, mono=False, anchor="start"):
    """Keep labels on explicit baselines for predictable Chinese typography."""
    options = {"x": x, "y": y, "fill": color, "font_size": size, "font_weight": weight, "text_anchor": anchor}
    if mono:
        options["font_family"] = MONO
    item = node(parent, "text", **options)
    item.text = value


def line(parent, x1, y1, x2, y2, color=RULE, width=1.4):
    """Draw quiet structural rules; connections are handled separately."""
    node(parent, "line", x1=x1, y1=y1, x2=x2, y2=y2, stroke=color, stroke_width=width)


def rectangle(parent, x, y, width, height, fill="#FFFFFF", stroke=RULE, radius=10):
    """Reserve boxes for real system boundaries rather than every label."""
    return node(parent, "rect", x=x, y=y, width=width, height=height, rx=radius, fill=fill, stroke=stroke, stroke_width=1.4)


def arrow(parent, path, dashed=False, color="#A0A59E"):
    """Use orthogonal routing and one arrowhead size throughout the diagram."""
    options = {"d": path, "fill": "none", "stroke": color, "stroke_width": 1.8, "marker_end": "url(#arrow)", "stroke_linejoin": "round"}
    if dashed:
        options["stroke_dasharray"] = "5 7"
    node(parent, "path", **options)


def document_icon(parent, x, y):
    """A folded document identifies JSON file storage, not a database server."""
    node(parent, "path", d=f"M{x} {y} h38 l18 18 v54 h-56 z", fill="#EEECE6", stroke="#BEBFB6", stroke_width=1.3)
    node(parent, "path", d=f"M{x + 38} {y} v18 h18", fill="none", stroke="#BEBFB6", stroke_width=1.3)
    text(parent, x + 28, y + 51, "{}", 23, "#7B7D72", 400, True, "middle")


def book_icon(parent, x, y):
    """Use a small book spine to distinguish versioned teaching content."""
    rectangle(parent, x, y, 55, 48, "#F0EEF4", "#C5BDCF", 3)
    line(parent, x + 10, y, x + 10, y + 48, "#C5BDCF", 1.2)
    line(parent, x + 22, y + 15, x + 43, y + 15, "#ADA4BA", 1.7)
    line(parent, x + 22, y + 23, x + 38, y + 23, "#ADA4BA", 1.7)


def browser_icon(parent, x, y):
    """A minimal browser window is a semantic actor icon, not mock UI chrome."""
    rectangle(parent, x, y, 51, 36, "#F4F4F0", "#B7BBB3", 4)
    line(parent, x, y + 9, x + 51, y + 9, "#B7BBB3", 1.1)
    for offset in (7, 12, 17):
        node(parent, "circle", cx=x + offset, cy=y + 5, r=1.2, fill="#A1A79C")


def draw_header(svg):
    """A compact title leaves most of the canvas to the architecture."""
    text(svg, 64, 60, "HOT100 / SYSTEM ARCHITECTURE", 18, ACCENT, 400, True)
    text(svg, 64, 121, "系统架构", 47, INK, 700)
    text(svg, 324, 118, "Next.js 全栈单体  /  JSON 持久化  /  可重建演示资源", 24, MUTED)
    text(svg, 1736, 60, "NEXT.JS / NODE.JS", 18, MUTED, 400, True, "end")
    line(svg, 64, 155, 1736, 155)


def draw_application(svg):
    """Show the UI and server routes as two layers of one application."""
    rectangle(svg, 444, 324, 900, 418, "#F8F8F5", "#BCBEB5", 12)
    text(svg, 476, 361, "APPLICATION", 16, ACCENT, 400, True)
    text(svg, 476, 404, "Next.js 全栈应用", 34, INK, 700)
    text(svg, 1312, 403, "React 19 / TypeScript 6", 19, MUTED, 400, True, "end")
    line(svg, 476, 428, 1312, 428)

    text(svg, 476, 471, "页面与交互", 26, INK, 700)
    for x, label in [(476, "学习路线"), (685, "题目研习"), (894, "笔记与错题"), (1103, "账号管理")]:
        text(svg, x, 513, label, 26, INK)
    text(svg, 476, 547, "AuthContext · useProgress · useHints · useNotes", 18, MUTED, 400, True)
    arrow(svg, "M 894 565 V 603")
    text(svg, 916, 590, "fetch + Cookie", 17, MUTED, 400, True)

    text(svg, 476, 632, "Route Handlers", 24, INK, 700, True)
    sections = [
        (476, "登录鉴权", "scrypt · 7 天会话"),
        (685, "进度同步", "规范化 · 账号隔离"),
        (894, "用户管理", "创建 · 重置 · 删除"),
        (1103, "动画资源", "公开目录白名单"),
    ]
    for index, (x, title, detail) in enumerate(sections):
        text(svg, x, 680, title, 25, INK, 600)
        text(svg, x, 713, detail, 18, MUTED)
        if index:
            line(svg, x - 24, 657, x - 24, 720)


def draw_inputs(svg):
    """Keep the browser actor and versioned content outside the service boundary."""
    rectangle(svg, 714, 199, 360, 83, "#FFFFFF", "#D6D8D0", 8)
    browser_icon(svg, 737, 221)
    text(svg, 808, 235, "学习者 / 管理员", 27, INK, 600)
    text(svg, 808, 263, "浏览器", 18, MUTED)
    arrow(svg, "M 894 282 V 324")

    book_icon(svg, 64, 376)
    text(svg, 140, 403, "CONTENT", 16, ACCENT, 400, True)
    text(svg, 64, 467, "教学内容", 32, INK, 700)
    text(svg, 64, 510, "100 题 · 17 阶段 · 270 解法", 22, INK)
    line(svg, 64, 539, 350, 539)
    text(svg, 64, 576, "src/data", 21, MUTED, 400, True)
    text(svg, 64, 611, "题目 · 路线 · 多解法 · 精修", 21, MUTED)
    arrow(svg, "M 350 497 H 444")
    text(svg, 397, 480, "载入", 17, MUTED, 400, False, "middle")


def draw_storage(svg):
    """Keep persistence visually distinct from publicly served presentation files."""
    text(svg, 1430, 488, "PRIVATE DATA", 16, ACCENT, 400, True)
    text(svg, 1430, 543, "个人学习数据", 31, INK, 700)
    text(svg, 1430, 583, "users.json", 22, INK, 400, True)
    document_icon(svg, 1670, 529)
    text(svg, 1430, 627, "账号  ·  会话  ·  学习进度", 22, MUTED)
    line(svg, 1430, 662, 1736, 662)
    text(svg, 1430, 703, "私有目录 / data/", 21, MUTED)
    arrow(svg, "M 1344 619 H 1408")
    text(svg, 1376, 601, "读写", 17, MUTED, 400, False, "middle")


def draw_generation(svg):
    """Use a separate, shorter route for generated public assets."""
    text(svg, 444, 834, "BUILD TIME", 16, ACCENT, 400, True)
    text(svg, 444, 881, "生成演示", 31, INK, 700)
    text(svg, 444, 923, "pnpm generate:videos", 21, MUTED, 400, True)

    arrow(svg, "M 750 879 H 932")
    text(svg, 841, 861, "生成", 17, MUTED, 400, False, "middle")
    text(svg, 964, 834, "PUBLIC ASSETS", 16, ACCENT, 400, True)
    text(svg, 964, 881, "演示资源", 31, INK, 700)
    text(svg, 964, 923, "ship/<slug>/presentation/", 21, MUTED, 400, True)
    text(svg, 964, 957, "HTML · CSS · JS · 音频 · 图片", 20, MUTED)
    arrow(svg, "M 1210 812 V 742", dashed=True)
    text(svg, 1230, 787, "白名单读取", 18, ACCENT)


def build_svg():
    """Compose the graphic from independently editable semantic groups."""
    svg = Element("svg", {"xmlns": "http://www.w3.org/2000/svg", "width": str(WIDTH), "height": str(HEIGHT), "viewBox": f"0 0 {WIDTH} {HEIGHT}", "font-family": "Segoe UI, Microsoft YaHei, sans-serif"})
    node(svg, "title").text = "Hot100 学习助手：系统架构"
    node(svg, "desc").text = "浏览器访问 Next.js 全栈应用。页面加载版本化教学内容，服务端通过账号会话保存个人学习数据。构建脚本单独生成演示资源，资源路由按公开白名单读取。"
    definitions = node(svg, "defs")
    marker = node(definitions, "marker", id="arrow", markerWidth=8, markerHeight=8, refX=7, refY=4, orient="auto", markerUnits="userSpaceOnUse")
    node(marker, "path", d="M 0 0 L 8 4 L 0 8 z", fill="#A0A59E")
    node(svg, "rect", width=WIDTH, height=HEIGHT, fill="#FFFFFF")
    draw_header(svg)
    draw_application(svg)
    draw_inputs(svg)
    draw_storage(svg)
    draw_generation(svg)
    line(svg, 64, 999, 1736, 999)
    text(svg, 64, 1038, "DEPLOYMENT", 16, ACCENT, 400, True)
    text(svg, 265, 1038, "Docker Compose · Node.js 22 · :3001", 21, INK, 400, True)
    text(svg, 1736, 1038, "单服务 · 单实例", 21, MUTED, 400, False, "end")
    return svg


def main():
    """Save the native vector alongside its README-compatible PNG export."""
    target = Path(__file__).with_name("architecture.svg")
    document = ElementTree(build_svg())
    indent(document)
    # Write bytes to keep line endings identical on Windows, Linux and macOS.
    target.write_bytes(tostring(document.getroot(), encoding="utf-8", xml_declaration=True))
    print(target)


if __name__ == "__main__":
    main()
