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
      if (!duplicate.includes(trimmed)) {
        duplicate.push(trimmed);
      }
    } else {
      seen.add(trimmed);
      valid.push(trimmed);
    }
  }

  res.json({ valid, invalid, duplicate });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});