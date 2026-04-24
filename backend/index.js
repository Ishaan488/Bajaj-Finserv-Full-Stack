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

function hasCycle(root, children) {
  const visited = new Set();

  function dfs(node) {
    if (visited.has(node)) return true;
    visited.add(node);
    if (children[node]) {
      for (let child of children[node]) {
        if (dfs(child)) return true;
      }
    }
    visited.delete(node);
    return false;
  }

  return dfs(root);
}

function getDepth(node, children) {
  if (!children[node] || children[node].length === 0) return 1;
  let max = 0;
  for (let child of children[node]) {
    const d = getDepth(child, children);
    if (d > max) max = d;
  }
  return 1 + max;
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
  let total_trees = 0;
  let total_cycles = 0;
  let largest_tree_root = '';
  let maxDepth = 0;

  for (let root of roots) {
    const tree = { [root]: makeTree(root) };

    if (hasCycle(root, children)) {
      total_cycles++;
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const depth = getDepth(root, children);
      total_trees++;
      if (depth > maxDepth) {
        maxDepth = depth;
        largest_tree_root = root;
      } else if (depth === maxDepth && root < largest_tree_root) {
        largest_tree_root = root;
      }
      hierarchies.push({ root, tree, depth });
    }
  }

  const summary = { total_trees, total_cycles, largest_tree_root };

  return { hierarchies, summary };
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

  const { hierarchies, summary } = buildTrees(valid);

  res.json({ valid, invalid, duplicate, hierarchies, summary });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});