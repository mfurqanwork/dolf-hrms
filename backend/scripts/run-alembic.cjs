const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendRoot = path.join(__dirname, "..");
const versionsDir = path.join(backendRoot, "alembic", "versions");
const isWindows = process.platform === "win32";
const python = path.join(
  backendRoot,
  ".venv",
  isWindows ? "Scripts/python.exe" : "bin/python",
);

function runAlembic(args, { inherit = false } = {}) {
  return spawnSync(python, ["-m", "alembic", ...args], {
    cwd: backendRoot,
    stdio: inherit ? "inherit" : "pipe",
    encoding: "utf-8",
  });
}

function isAutogenerateRevision(args) {
  const revisionIndex = args.indexOf("revision");
  if (revisionIndex === -1) return false;
  return args.includes("--autogenerate");
}

function listMigrationFiles() {
  if (!fs.existsSync(versionsDir)) return [];
  return fs
    .readdirSync(versionsDir)
    .filter((name) => name.endsWith(".py") && !name.startsWith("__"))
    .map((name) => path.join(versionsDir, name));
}

function isEmptyMigrationFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const upgradeSection = content.match(/def upgrade\(\)[\s\S]*?(?=\ndef downgrade)/);
  if (!upgradeSection) return false;
  return !upgradeSection[0].includes("op.");
}

function removeEmptyMigration(filePath) {
  if (!isEmptyMigrationFile(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

if (!fs.existsSync(python)) {
  console.error(
    "Backend virtualenv not found at backend/.venv\n" +
      "Create it with:\n" +
      "  cd backend\n" +
      "  python -m venv .venv\n" +
      "  .venv\\Scripts\\Activate.ps1   # Windows\n" +
      "  pip install -r requirements.txt",
  );
  process.exit(1);
}

const alembicArgs = process.argv.slice(2);

if (isAutogenerateRevision(alembicArgs)) {
  const check = runAlembic(["check"]);

  if (check.status === 0) {
    console.log("No schema changes detected. No migration file was created.");
    console.log("Update app/models/ first, then run db:revision again.");
    process.exit(0);
  }

  const beforeFiles = new Set(listMigrationFiles());
  const result = runAlembic(alembicArgs, { inherit: true });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const newFiles = listMigrationFiles().filter((file) => !beforeFiles.has(file));
  const emptyFiles = newFiles.filter((file) => removeEmptyMigration(file));

  if (emptyFiles.length > 0) {
    console.log("No schema changes detected. Empty migration file was removed.");
    console.log("Update app/models/ first, then run db:revision again.");
    process.exit(0);
  }

  process.exit(0);
}

const result = runAlembic(alembicArgs, { inherit: true });
process.exit(result.status ?? 1);
