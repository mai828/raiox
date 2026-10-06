#!/usr/bin/env python3
"""Gera web/index.html (abre localmente) e web/artifact.html (sem doctype, para publicação) a partir de web/src/."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..")
rd = lambda p: open(os.path.join(ROOT, p), encoding="utf-8").read()
quiz = json.load(open(os.path.join(ROOT, "data", "quiz.json"), encoding="utf-8"))
page = rd("web/src/page.html")
page = page.replace("/*__STYLES__*/", rd("web/src/styles.css"))
page = page.replace("/*__QUIZ__*/", json.dumps(quiz, ensure_ascii=False).replace("</", "<\\/"))
page = page.replace("/*__COPY__*/", rd("web/src/copy.js")).replace("/*__APP__*/", rd("web/src/app.js"))
open(os.path.join(ROOT, "web", "artifact.html"), "w", encoding="utf-8").write(page)
full = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)} [hidden]{display:none!important}</style>\n'
        + page.split("<header", 1)[0] + "</head>\n<body>\n<header" + page.split("<header", 1)[1] + "\n</body>\n</html>\n")
open(os.path.join(ROOT, "web", "index.html"), "w", encoding="utf-8").write(full)
print("web gerado:", len(full), "bytes")
