/**
 * merkle.js
 *
 * This script processes all files within the 'files' directory located in the same
 * directory as this script, generates a Merkle root for each file by splitting
 * the file into chunks, and writes out the Merkle root along with the file
 * size and execution time for the operation to an 'output.txt' file.
 *
 * Usage:
 * 1. Place the 'merkle.js' file in your Node.js project.
 * 2. Ensure there is a directory named 'files' in the same directory as 'merkle.js'.
 * 3. Place the files you want to process in the 'files' directory.
 * 4. Run the script with Node.js in your terminal without any arguments:
 *
 *    node merkle.js
 *
 * Requirements:
 * - Node.js must be installed on your system.
 * - The 'files' directory must exist and contain the files to be processed.
 * - There should be read and write permissions for the 'files' directory and its contents.
 *
 * The script will loop through each file in the 'files' directory, calculate the
 * Merkle root, and output the file size, Merkle root, and execution time to the 'output.txt' file.
 */

const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const { performance } = require("perf_hooks");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function combineHashes(left, right) {
  return sha256(Buffer.from(left + right, "hex"));
}

function buildMerkleTree(hashes) {
  if (hashes.length === 1) {
    return hashes[0];
  }

  const newHashes = [];
  for (let i = 0; i < hashes.length; i += 2) {
    if (i + 1 < hashes.length) {
      newHashes.push(combineHashes(hashes[i], hashes[i + 1]));
    } else {
      newHashes.push(hashes[i]);
    }
  }

  return buildMerkleTree(newHashes);
}

async function writeResultsToFile(
  filePath,
  fileSize,
  merkleRoot,
  executionTime
) {
  const result =
    `File: ${filePath}\n` +
    `File Size: ${fileSize} bytes\n` +
    `Merkle Root: ${merkleRoot}\n` +
    `Execution Time: ${executionTime.toFixed(2)}ms\n\n`;

  await fs.appendFile("output.txt", result, "utf8");
}

async function createMerkleRoot(filePath, chunkSize) {
  try {
    const startTime = performance.now();

    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    const data = await fs.readFile(filePath);
    const chunks = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      chunks.push(sha256(chunk));
    }

    const merkleRoot = buildMerkleTree(chunks);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    await writeResultsToFile(
      path.basename(filePath),
      fileSize,
      merkleRoot,
      executionTime
    );
  } catch (err) {
    console.error("Error:", err);
  }
}

async function processFilesInDirectory(directory, chunkSize) {
  try {
    // Clear the output.txt file before writing new results
    await fs.writeFile("output.txt", "", "utf8");

    const files = await fs.readdir(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileStats = await fs.stat(filePath);
      if (fileStats.isFile()) {
        await createMerkleRoot(filePath, chunkSize);
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
}

const CHUNK_SIZE = 1024; // Size of each chunk in bytes
const filesDirectory = path.join(__dirname, "files"); // Directory containing files to process

processFilesInDirectory(filesDirectory, CHUNK_SIZE);
