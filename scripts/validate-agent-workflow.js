import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (message) => failures.push(message);
const absolute = (relativePath) => path.join(repoRoot, relativePath);
const read = (relativePath) => fs.readFileSync(absolute(relativePath), "utf8");

const walk = (relativePath, predicate = () => true) => {
  const target = absolute(relativePath);
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (!stat.isDirectory()) return predicate(relativePath) ? [relativePath] : [];
  return fs.readdirSync(target).flatMap((child) =>
    walk(path.join(relativePath, child), predicate),
  );
};

const skillNames = [
  "tram-audit-workflow",
  "tram-specialist-consultation",
  "tram-refactoring-workflow",
];
const agentPaths = [
  "agents/level-1-audit/AGENT.md",
  "agents/level-2-specialist/AGENT.md",
  "agents/level-3-refactor/AGENT.md",
];
const skillReferences = {
  "tram-audit-workflow": [
    "architecture-data-flow.md",
    "backend-ingestion-realtime.md",
    "dashboard-research-ux.md",
    "database-telemetry-retention.md",
    "discovery-product.md",
    "frontend-public-admin.md",
    "infrastructure-device-field.md",
    "production-readiness.md",
    "security-devops-observability.md",
  ],
  "tram-specialist-consultation": [
    "backend-ingestion-realtime.md",
    "developer-dashboard-visualization.md",
    "esp32-http.md",
    "identity-security-privacy.md",
    "lorawan-ttn.md",
    "mobile-socketio.md",
    "observability-field-testing.md",
    "postgres-redis-retention.md",
    "product-research-design.md",
    "telemetry-geospatial-analysis.md",
  ],
  "tram-refactoring-workflow": [],
};

for (const requiredPath of [
  "AGENTS.md",
  "docs/research/device-comparison-scope.md",
  "docs/tasks/task-spec-template.md",
  "scripts/agy-worker.sh",
  ...agentPaths,
  ...skillNames.flatMap((name) => [
    `.agents/skills/${name}/SKILL.md`,
    `.agents/skills/${name}/agents/openai.yaml`,
  ]),
]) {
  if (!fs.existsSync(absolute(requiredPath))) fail(`Missing workflow file: ${requiredPath}`);
}

const discoveredAgents = walk("agents", (file) => file.endsWith("AGENT.md")).sort();
if (JSON.stringify(discoveredAgents) !== JSON.stringify([...agentPaths].sort())) {
  fail(`Expected exactly three agent contracts; found: ${discoveredAgents.join(", ")}`);
}

const duplicateRootSkills = walk("skills", (file) => file.endsWith("SKILL.md"));
if (duplicateRootSkills.length > 0) {
  fail(`Project skills must live only in .agents/skills: ${duplicateRootSkills.join(", ")}`);
}

for (const name of skillNames) {
  const relativePath = `.agents/skills/${name}/SKILL.md`;
  if (!fs.existsSync(absolute(relativePath))) continue;
  const content = read(relativePath);
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) {
    fail(`Missing YAML frontmatter: ${relativePath}`);
    continue;
  }
  const declaredName = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (declaredName !== name) fail(`Skill name mismatch in ${relativePath}`);
  if (!description) fail(`Missing skill description in ${relativePath}`);

  const referenceRoot = `.agents/skills/${name}/references`;
  const actualReferences = walk(referenceRoot, (file) => file.endsWith(".md"))
    .map((file) => path.basename(file))
    .sort();
  const expectedReferences = [...skillReferences[name]].sort();
  if (JSON.stringify(actualReferences) !== JSON.stringify(expectedReferences)) {
    fail(`Unexpected reference inventory for ${name}: ${actualReferences.join(", ")}`);
  }
  for (const reference of expectedReferences) {
    if (!content.includes(`(references/${reference})`)) {
      fail(`Skill ${name} does not route to references/${reference}`);
    }
  }
}

for (const relativePath of ["AGENTS.md", ...agentPaths]) {
  const content = read(relativePath);
  for (const match of content.matchAll(/`(\.agents\/skills\/[^`]+\/SKILL\.md)`/g)) {
    if (!fs.existsSync(absolute(match[1]))) {
      fail(`Missing skill referenced by ${relativePath}: ${match[1]}`);
    }
  }
}

const activeArchitectureFiles = [
  "AGENTS.md",
  "README.md",
  "docs/project-knowledge-base.md",
  "docs/audits/specialized/README.md",
  ...agentPaths,
  ...skillNames.map((name) => `.agents/skills/${name}/SKILL.md`),
];
const legacyPathPattern = /agents\/(?:AGENT\.md|lead-audit|specialized|architecture|backend|dashboard|database|discovery|frontend|infrastructure|product|production|roadmap|security)|skills\/(?:agy-worker-task-runner|audit-contract-manager|lead-audit-coordinator|refactoring-roadmap-manager|specialist-decision-manager|specialist-routing|task-verification-suite)/;
for (const relativePath of activeArchitectureFiles) {
  if (legacyPathPattern.test(read(relativePath))) {
    fail(`Legacy agent/skill path remains in ${relativePath}`);
  }
}

const roadmap = read("docs/roadmap/master-refactoring-roadmap.md");
if (!roadmap.includes("## 3. Consolidated Recommendation List")) {
  fail("Roadmap is missing its canonical recommendation section");
}
if (roadmap.includes("Begin with T1")) fail("Roadmap still contains the superseded T1 handoff");

const researchScope = read("docs/research/device-comparison-scope.md");
for (const token of [
  "Mobile",
  "Socket.IO",
  "ESP32",
  "Wi-Fi",
  "LoRaWAN",
  "TTN",
  "route-conformance distance",
  "reported accuracy",
  "HDOP",
  "ground-truth error",
]) {
  if (!researchScope.includes(token)) fail(`Research scope is missing required term: ${token}`);
}

const taskMatches = [...roadmap.matchAll(/^### (T\d+) — .+$/gm)];
const taskSections = [
  "Source Audit(s)", "Phase", "Depends On", "Decision Gates", "Blocks", "Priority",
  "Difficulty", "Suggested Agent", "Execution Mode", "Task Brief", "Related Files",
  "Acceptance Criteria and Verification", "Status",
];
for (let index = 0; index < taskMatches.length; index += 1) {
  const current = taskMatches[index];
  const block = roadmap.slice(current.index, taskMatches[index + 1]?.index ?? roadmap.length);
  for (const section of taskSections) {
    if (!block.includes(`### ${section}`)) fail(`${current[1]} is missing ${section}`);
  }
  if (!/### (?:Current )?Evidence/.test(block)) fail(`${current[1]} is missing Evidence`);
}

const worker = read("scripts/agy-worker.sh");
for (const token of ["worktree add --detach", "--sandbox", "apply --check"]) {
  if (!worker.includes(token)) fail(`Worker isolation token missing: ${token}`);
}
if (/revert unauthorized/i.test(read(".agents/skills/tram-refactoring-workflow/SKILL.md"))) {
  fail("Refactoring skill still instructs automatic reversion");
}

const markdownFiles = [
  "AGENTS.md",
  ...walk("agents", (file) => file.endsWith(".md")),
  ...walk(".agents/skills", (file) => file.endsWith(".md")),
  ...walk("docs", (file) => file.endsWith(".md")),
];
for (const relativePath of markdownFiles) {
  for (const match of read(relativePath).matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)) {
    const target = match[1];
    if (/^(?:https?:\/\/|mailto:)/.test(target)) continue;
    const resolved = path.resolve(repoRoot, path.dirname(relativePath), target);
    if (!fs.existsSync(resolved)) fail(`Broken Markdown link in ${relativePath}: ${target}`);
  }
}

if (failures.length > 0) {
  console.error("Agent workflow validation failed:");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Agent workflow validation passed (3 agents, 3 skills, ${taskMatches.length} roadmap tasks).`);
