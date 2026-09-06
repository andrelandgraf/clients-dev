import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { registrySchema, registryItemSchema } from "shadcn/schema";
const items = [
  {
    name: "client-picker",
    title: "Client picker",
    description: "Search and select from a caller-supplied client catalog.",
    primitive: "input",
  },
  {
    name: "evidence-badge",
    title: "Evidence badge",
    description: "Show evidence status, verification date and source.",
    primitive: "badge",
  },
  {
    name: "client-behavior-table",
    title: "Client behavior table",
    description:
      "Compare findings from a caller-supplied catalog with its data version.",
    primitive: "table",
  },
].map((item) =>
  registryItemSchema.parse({
    name: item.name,
    title: item.title,
    description: item.description,
    dependencies: [
      "clsx@2.1.1",
      "tailwind-merge@3.6.0",
      ...(item.primitive === "badge"
        ? ["class-variance-authority@0.7.1", "radix-ui@1.6.0-rc.1781217402884"]
        : []),
    ],
    type: "registry:component",
    files: [
      {
        path: `src/components/ui/${item.primitive}.tsx`,
        type: "registry:ui",
        content: readFileSync(
          `src/components/ui/${item.primitive}.tsx`,
          "utf8",
        ),
      },
      {
        path: "src/lib/utils.ts",
        type: "registry:lib",
        content: readFileSync("src/lib/utils.ts", "utf8"),
      },
      {
        path: `registry/${item.name}.tsx`,
        type: "registry:component",
        target: `components/${item.name}.tsx`,
        content: readFileSync(`registry/${item.name}.tsx`, "utf8"),
      },
    ],
  }),
);
const registry = registrySchema.parse({
  name: "clients-dev",
  homepage: "https://clients.dev",
  items,
});
mkdirSync("public/r", { recursive: true });
writeFileSync(
  "public/r/registry.json",
  JSON.stringify(
    { $schema: "https://ui.shadcn.com/schema/registry.json", ...registry },
    null,
    2,
  ) + "\n",
);
for (const item of items)
  writeFileSync(
    `public/r/${item.name}.json`,
    JSON.stringify(
      { $schema: "https://ui.shadcn.com/schema/registry-item.json", ...item },
      null,
      2,
    ) + "\n",
  );
console.log(`Built ${items.length} validated registry items`);
