"""Reproduce six controlled text-layout checks with the existing isolated fixtures.

Requires frontend npm dependencies and Playwright Chromium; run the local frontend
on port 5173 first. It never authenticates to or writes to production.
"""
import argparse
from pathlib import Path
import shutil
import subprocess

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--mode',choices=['resize','spacing'],required=True)
p.add_argument('--output',required=True)
args=p.parse_args()
root=Path(__file__).resolve().parents[1]
frontend=root/'src/frontend'
source=(frontend/'e2e/accessibility.spec.ts').read_text(encoding='utf-8')
loop='of scenarios)'
viewport='    await page.setViewportSize({width:320,height:800});'
assert source.count(loop)==1 and source.count(viewport)==1,'Fixture changed; review the text-check adapter'
source=source.replace(loop,"of scenarios.filter(([name])=>['login','cliente','usuarios','vehiculo-editar','cliente-editar','ruta-reoptimizar'].includes(name)))")
resize="""    await page.evaluate(()=>{
      const sizes=Array.from(document.querySelectorAll<HTMLElement>('*')).map(node=>({node,size:parseFloat(getComputedStyle(node).fontSize)}));
      sizes.forEach(({node,size})=>{node.style.fontSize=String(size*2)+'px';});
    });"""
spacing="    await page.addStyleTag({content:'* {line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p {margin-bottom:2em !important}'});"
source=source.replace(viewport,viewport+'\n'+(resize if args.mode=='resize' else spacing))
source=source.replace("    await info.attach('mobile-320'", "    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);\n    await info.attach('mobile-320'")
temporary=frontend/'e2e/text-accessibility.generated.local.spec.ts'
if temporary.exists():raise SystemExit('Temporary test already exists; refusing to overwrite it')
output=Path(args.output).resolve();output.parent.mkdir(parents=True,exist_ok=True)
node=shutil.which('node')
if not node:raise SystemExit('Node.js must be available on PATH')
try:
    temporary.write_text(source,encoding='utf-8')
    with output.open('w',encoding='utf-8') as stream:
        result=subprocess.run([node,str(frontend/'node_modules/@playwright/test/cli.js'),'test','e2e/'+temporary.name,
            '--project=chromium','--timeout=20000','--reporter=json'],cwd=frontend,stdout=stream)
finally:
    temporary.unlink(missing_ok=True)
raise SystemExit(result.returncode)
