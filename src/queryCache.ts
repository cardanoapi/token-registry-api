import path from "path";
import fs from "fs";

export async function queryCache(localDir: string, id: string, res: any) {
  const filePath = path.join(localDir, `${id}.json`);
  fs.promises
    .stat(filePath)
    .then(() => {
      fs.promises
        .readFile(filePath, "utf-8")
        .then((content) => {
          res.status(200).json(JSON.parse(content));
        })
        .catch((readError) => {
          res.status(500).json({
            error: "Error reading the file content",
            details: readError,
          });
        });
    })
    .catch(() => {
      res
        .status(404)
        .json({ message: `File for id '${id}' not found`, status: 404 });
    });
}
