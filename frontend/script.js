document.getElementById('submitBtn').addEventListener('click', async () => {
  const raw = document.getElementById('input').value;

  const data = [];
const parts = raw.split(',');
    for (let i = 0; i < parts.length; i++) {
    const trimmed = parts[i].trim();
    if (trimmed !== '') {
      data.push(trimmed);
    }
}  

  try {
    const res = await fetch('http://localhost:3000/bfhl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });

    const json = await res.json();
    console.log(json);

    document.getElementById('result').innerText = JSON.stringify(json, null, 2);

  } catch (err) {
    document.getElementById('result').innerText = 'Error: ' + err.message;
  }
});