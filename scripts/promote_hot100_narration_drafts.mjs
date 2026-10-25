import fs from "node:fs";
import path from "node:path";

const DEFAULT_SHIP_ROOT = "C:\\Users\\11873\\Desktop\\ship";
const shipRoot = path.resolve(process.argv[process.argv.indexOf("--ship-root") + 1] || DEFAULT_SHIP_ROOT);
const auditArg = process.argv.indexOf("--audit");
const auditPath = path.resolve(auditArg >= 0 && process.argv[auditArg + 1] ? process.argv[auditArg + 1] : path.join(process.cwd(), "hot100-narration-audit.json"));

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function generatedProjects(root) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .filter((project) => fs.existsSync(path.join(project, ".generated-hot100")))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
}

if (!fs.existsSync(auditPath)) {
  console.error(`[ERR] audit report not found: ${auditPath}`);
  process.exit(1);
}

const audit = readJson(auditPath);
if (audit.totals?.issueCount !== 0 || audit.animationChangeCandidates?.length) {
  console.error("[ERR] Drafts are not clean. Re-run audit and fix issues before promotion.");
  console.error(
    JSON.stringify(
      {
        issueCount: audit.totals?.issueCount,
        animationChangeCandidates: audit.animationChangeCandidates?.length ?? 0,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

let promoted = 0;
let segments = 0;
for (const project of generatedProjects(shipRoot)) {
  const draftPath = path.join(project, "audio-segments.draft.json");
  const officialPath = path.join(project, "audio-segments.json");
  if (!fs.existsSync(draftPath)) continue;
  const draft = readJson(draftPath);
  fs.writeFileSync(officialPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
  promoted += 1;
  segments += draft.filter((segment) => !segment.silent).length;
}

console.log(
  JSON.stringify(
    {
      promoted,
      spokenSegments: segments,
      officialFile: "audio-segments.json",
    },
    null,
    2,
  ),
);
