const fs = require("fs");
const path = require("path");

function sortObjectRecursively(obj) {
  if (Array.isArray(obj)) {
    return obj.map((v) =>
      v && typeof v === "object" ? sortObjectRecursively(v) : v
    );
  }
  if (obj && typeof obj === "object") {
    const sorted = {};
    Object.keys(obj)
      .sort((a, b) => a.localeCompare(b, "en"))
      .forEach((key) => {
        sorted[key] = sortObjectRecursively(obj[key]);
      });
    return sorted;
  }
  return obj;
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse JSON: ${filePath}`);
    throw err;
  }

  const sorted = sortObjectRecursively(parsed);
  const formatted = JSON.stringify(sorted, null, 2) + "\n";
  fs.writeFileSync(filePath, formatted, "utf8");
  console.log(`Sorted ${filePath}`);
}

function walkDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) walkDir(p);
    else if (item.isFile() && item.name.endsWith(".json")) processFile(p);
  }
}

function main() {
  const base = path.resolve(__dirname, "..", "public", "locales");
  if (!fs.existsSync(base)) {
    console.error("Locales directory not found at", base);
    process.exit(1);
  }
  walkDir(base);
}

if (require.main === module) main();
