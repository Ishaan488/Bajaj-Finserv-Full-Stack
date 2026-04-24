import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

function isValid(entry) {
  const trimmed = entry.trim();
  const pattern = /^[A-Z]->[A-Z]$/;
  if (!pattern.test(trimmed)) return false;
  if (trimmed[0] === trimmed[3]) return false;
  return true;
}

function buildTrees(valid) {
  let children = {};
  let hasParent = new Set();
  let allNodes = new Set();

  for (let i = 0; i < valid.length; i++) {
    let edge = valid[i];

    let parent = edge[0];
    let child = edge[3];

    allNodes.add(parent);
    allNodes.add(child);

    if (children[parent] === undefined) {
      children[parent] = [];
    }

    if (hasParent.has(child) === false) {
      children[parent].push(child);
      hasParent.add(child);
    }
  }
  let roots = [];
  for (let node of allNodes) {
    if (hasParent.has(node) === false) {
      roots.push(node);
    }
  }

  roots.sort();
  function makeTree(node) {
    let result = {};
    if (children[node] !== undefined) {
      for (let i = 0; i < children[node].length; i++) {
        let child = children[node][i];
        result[child] = makeTree(child);
      }
    }
    return result;
  }

  let hierarchies = [];
  for (let i = 0; i < roots.length; i++) {
    let root = roots[i];
    let tree = {};
    tree[root] = makeTree(root);
    hierarchies.push({
      root: root,
      tree: tree
    });
  }

  return hierarchies;
}

app.post('/bfhl', (req, res) => {
  const data = req.body.data || [];

  const valid = [];
  const invalid = [];
  const duplicate = [];
  const seen = new Set();

  for (let entry of data) {
    const trimmed = entry.trim();
    if (!isValid(trimmed)) {
      invalid.push(trimmed);
    } else if (seen.has(trimmed)) {
      if (!duplicate.includes(trimmed)) duplicate.push(trimmed);
    } else {
      seen.add(trimmed);
      valid.push(trimmed);
    }
  }

  const hierarchies = buildTrees(valid);

  res.json({ valid, invalid, duplicate, hierarchies });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});