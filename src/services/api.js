export async function sendMessageToBot(message) {
  const response = await fetch('https://ragdemocentralus1fa.azurewebsites.net/api/Bot1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return response.json();
}