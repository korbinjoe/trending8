import { runIngest } from "./ingest";

const ranking = process.argv.includes("--ranking");

runIngest({ ranking })
  .then((r) => {
    console.log("Ingest complete", r);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
