import "dotenv/config";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/node-postgres";
import { nanoid } from "nanoid";
import { issues, roasts } from "./schema";

const db = drizzle(process.env.DATABASE_URL as string, { casing: "snake_case" });

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "ruby",
  "php",
];

const CODE_SNIPPETS: Record<string, string[]> = {
  javascript: [
    `function sum(a, b) {\n  var result = a + b;\n  return result;\n}`,
    `for (var i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}`,
    `const fetchData = () => {\n  fetch(url).then(res => res.json()).then(data => console.log(data))\n}`,
    `if (x == null) {\n  return "empty"\n} else if (x == undefined) {\n  return "undefined"\n}`,
  ],
  typescript: [
    `function getUser(id: any): any {\n  const user = db.query("SELECT * FROM users WHERE id = " + id);\n  return user;\n}`,
    `const handler = async (req: Request, res: Response) => {\n  try {\n    const data = JSON.parse(req.body);\n    res.send(data);\n  } catch(e) { res.send(500) }\n}`,
    `type Props = { data: any, callback: Function, items: Array<any> }`,
  ],
  python: [
    `def process(data):\n    result = []\n    for i in range(len(data)):\n        result.append(data[i] * 2)\n    return result`,
    `import os\ndef read_file(path):\n    f = open(path, 'r')\n    content = f.read()\n    return content`,
    `class User:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    def __str__(self):\n        return self.name + " " + str(self.age)`,
  ],
  go: [
    `func getUsers() {\n\trows, _ := db.Query("SELECT * FROM users")\n\tdefer rows.Close()\n\tfor rows.Next() {\n\t\tfmt.Println(rows)\n\t}\n}`,
    `func divide(a, b int) int {\n\treturn a / b\n}`,
  ],
  rust: [
    `fn main() {\n    let mut v = Vec::new();\n    for i in 0..100 {\n        v.push(i);\n    }\n    println!("{:?}", v);\n}`,
    `fn parse_input(input: &str) -> i32 {\n    input.trim().parse().unwrap()\n}`,
  ],
  java: [
    `public static void main(String[] args) {\n    ArrayList list = new ArrayList();\n    list.add("hello");\n    System.out.println(list.get(0));\n}`,
    `public String concatenate(String[] parts) {\n    String result = "";\n    for (String p : parts) {\n        result += p;\n    }\n    return result;\n}`,
  ],
  c: [
    `int main() {\n    char* str = malloc(100);\n    strcpy(str, "hello");\n    printf("%s\\n", str);\n    return 0;\n}`,
  ],
  cpp: [
    `int main() {\n    int* arr = new int[10];\n    for (int i = 0; i < 10; i++) arr[i] = i;\n    cout << arr[5] << endl;\n}`,
  ],
  ruby: [
    `def fetch_users\n  users = []\n  File.open("users.txt").each do |line|\n    users << line.strip\n  end\n  users\nend`,
  ],
  php: [
    `function getUser($id) {\n  $conn = mysqli_connect("localhost", "root", "", "db");\n  $result = mysqli_query($conn, "SELECT * FROM users WHERE id = $id");\n  return mysqli_fetch_assoc($result);\n}`,
  ],
};

const ROAST_COMMENTS = [
  "This code looks like it was written during a power outage.",
  "I've seen better code from a cat walking on a keyboard.",
  "Did you write this with your eyes closed?",
  "This is what happens when Stack Overflow is down.",
  "Congratulations, you've invented a new anti-pattern.",
  "This code is so bad it made my linter cry.",
  "I'm not mad, I'm just disappointed.",
  "Were you trying to win a 'worst code' competition?",
  "Even spaghetti has more structure than this.",
  "This code violates the Geneva Convention.",
  "I've seen cleaner code in a /tmp directory.",
  "Your variable naming is a war crime.",
  "This function has more bugs than a rainforest.",
  "Not terrible. Just aggressively mediocre.",
  "Surprisingly decent. Did someone help you?",
  "Clean and readable. Who are you and what happened to the usual dev?",
  "This is actually... good? I'm suspicious.",
  "Solid work. Almost nothing to roast here.",
  "Textbook implementation. Boring in the best way.",
  "Flawless. I have nothing. You win this round.",
];

const ISSUE_POOL = {
  critical: [
    {
      title: "SQL injection vulnerability",
      description:
        "String concatenation in SQL queries allows injection attacks. Use parameterized queries.",
    },
    {
      title: "No error handling",
      description:
        "Unhandled exceptions will crash the application. Wrap in try/catch or use Result types.",
    },
    {
      title: "Memory leak detected",
      description: "Resources opened but never closed. This will consume memory over time.",
    },
    {
      title: "Using eval() or equivalent",
      description: "Dynamic code execution is a massive security risk. Find a safer alternative.",
    },
    {
      title: "Hardcoded credentials",
      description:
        "Secrets in source code will end up in version control. Use environment variables.",
    },
    {
      title: "Race condition potential",
      description:
        "Shared mutable state without synchronization. This will cause intermittent bugs.",
    },
  ],
  warning: [
    {
      title: "Using var instead of const/let",
      description: "var is function-scoped and leads to hoisting bugs. Prefer const/let.",
    },
    {
      title: "No input validation",
      description: "User input should always be validated before processing.",
    },
    {
      title: "Inefficient loop pattern",
      description: "Iterating by index when a for-of or map would be cleaner and less error-prone.",
    },
    {
      title: "Missing type annotations",
      description: "Using 'any' defeats the purpose of TypeScript. Add proper types.",
    },
    {
      title: "String concatenation in loop",
      description: "Creates a new string each iteration. Use array join or template literals.",
    },
    {
      title: "Callback hell",
      description: "Deeply nested callbacks reduce readability. Use async/await or Promises.",
    },
    {
      title: "Magic numbers",
      description:
        "Unexplained numeric literals make code hard to understand. Extract to named constants.",
    },
    {
      title: "Unused imports/variables",
      description: "Dead code adds noise and confusion. Remove what you don't use.",
    },
  ],
  good: [
    {
      title: "Clean function signatures",
      description: "Parameters are well-named and the function does one thing. Nice.",
    },
    {
      title: "Good error messages",
      description: "Error messages are descriptive and actionable. Helps debugging.",
    },
    {
      title: "Proper resource cleanup",
      description: "Resources are properly closed/released. No leaks here.",
    },
    {
      title: "Consistent naming convention",
      description: "Variable and function names follow a consistent pattern throughout.",
    },
    {
      title: "Well-structured code",
      description: "Logical organization and clear separation of concerns.",
    },
  ],
};

type Verdict =
  | "disaster"
  | "needs_serious_help"
  | "mediocre"
  | "decent"
  | "impressive"
  | "flawless";
type Severity = "critical" | "warning" | "good";

function scoreToVerdict(score: number): Verdict {
  if (score < 2) return "disaster";
  if (score < 4) return "needs_serious_help";
  if (score < 6) return "mediocre";
  if (score < 8) return "decent";
  if (score < 10) return "impressive";
  return "flawless";
}

function generateIssues(score: number) {
  const issueList: { severity: Severity; title: string; description: string; order: number }[] = [];
  let count: number;
  let severityWeights: { critical: number; warning: number; good: number };

  if (score < 3) {
    count = faker.number.int({ min: 4, max: 6 });
    severityWeights = { critical: 0.5, warning: 0.4, good: 0.1 };
  } else if (score < 6) {
    count = faker.number.int({ min: 3, max: 5 });
    severityWeights = { critical: 0.2, warning: 0.5, good: 0.3 };
  } else if (score < 8) {
    count = faker.number.int({ min: 2, max: 4 });
    severityWeights = { critical: 0.05, warning: 0.35, good: 0.6 };
  } else {
    count = faker.number.int({ min: 1, max: 3 });
    severityWeights = { critical: 0, warning: 0.2, good: 0.8 };
  }

  const usedTitles = new Set<string>();

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let severity: Severity;
    if (roll < severityWeights.critical) severity = "critical";
    else if (roll < severityWeights.critical + severityWeights.warning) severity = "warning";
    else severity = "good";

    const pool = ISSUE_POOL[severity];
    let issue = faker.helpers.arrayElement(pool);

    // avoid duplicate titles
    let attempts = 0;
    while (usedTitles.has(issue.title) && attempts < 10) {
      issue = faker.helpers.arrayElement(pool);
      attempts++;
    }
    if (usedTitles.has(issue.title)) continue;

    usedTitles.add(issue.title);
    issueList.push({ severity, title: issue.title, description: issue.description, order: i + 1 });
  }

  return issueList;
}

async function seed() {
  console.log("Seeding 100 roasts...");

  for (let i = 0; i < 100; i++) {
    const language = faker.helpers.arrayElement(LANGUAGES);
    const snippets = CODE_SNIPPETS[language] ?? CODE_SNIPPETS.javascript;
    const code = faker.helpers.arrayElement(snippets);
    const score = Math.round(faker.number.float({ min: 0, max: 10, fractionDigits: 1 }) * 10) / 10;
    const verdict = scoreToVerdict(score);
    const roastComment = faker.helpers.arrayElement(ROAST_COMMENTS);
    const lineCount = code.split("\n").length;
    const slug = nanoid(8);

    const [roast] = await db
      .insert(roasts)
      .values({
        slug,
        code,
        language,
        lineCount,
        roastMode: faker.datatype.boolean({ probability: 0.8 }),
        score,
        verdict,
        roastComment,
        improvedCode: faker.datatype.boolean({ probability: 0.6 })
          ? `// improved version\n${code}`
          : null,
        createdAt: faker.date.recent({ days: 90 }),
      })
      .returning({ id: roasts.id });

    const roastIssues = generateIssues(score);
    if (roastIssues.length > 0) {
      await db.insert(issues).values(
        roastIssues.map((issue) => ({
          ...issue,
          roastId: roast.id,
        })),
      );
    }

    if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/100 done`);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
