document.querySelector('form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const longUrl = document.getElementById('longUrl').value;
    const response = await fetch('/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `longUrl=${encodeURIComponent(longUrl)}`
    });
    const result = await response.text();
    document.getElementById('result').innerText = result;
  });
  