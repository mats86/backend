import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, gql, HttpLink, ApolloLink } from '@apollo/client';

// Erstellen Sie eine Instanz von HttpLink
const httpLink = new HttpLink({ uri: 'https://localhost:7209/graphql' });

// Funktion, um das Token zu holen
const fetchToken = async () => {
  const tokenUrl = "https://localhost:7209/connect/token";
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: 'client1234',
      client_secret: 'secret1234',
      grant_type: 'client_credentials',
      scope: 'api1'
    })
  });
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data.access_token;
};

export default function Home() {
  const [response, setResponse] = useState('');

  const sendQuery = async (buttonId: string, apiKey: string) => {
    const authToken = await fetchToken();

    // Konfigurieren Sie Apollo Client mit dem abgerufenen Token
    const authLink = new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          ApiKey: apiKey // Verwenden des übergebenen API-Schlüssels
        }
      });
      return forward(operation);
    });

    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    });

    const result = await client.query({
      query: gql`query { hello(buttonId: "${buttonId}") }`,
    });
    setResponse(result.data.hello);
  };

  return (
    <div>
      <button onClick={() => sendQuery('button1', 'key1')}>Kurs 1 Buchen</button>
      <p></p>
      <button onClick={() => sendQuery('button2', 'key2')}>Kurs 2 Buchen</button>
      <p></p>
      <button onClick={() => sendQuery('button3', 'key3')}>Kurs 2 Buchen</button>
      <p></p>
      <button onClick={() => sendQuery('button4', 'key4')}>Kurs 4 Buchen</button>
      <p>Antwort: {response}</p>
    </div>
  );
}
