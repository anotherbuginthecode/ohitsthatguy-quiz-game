import { mockClassicGame } from "./mock";


export async function fetchData(endpoint: string) {
  const url = `${import.meta.env.VITE_APP_API_URL}/${endpoint}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function postData(endpoint: string, data: any) {
  const url = `${import.meta.env.VITE_APP_API_URL}/${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchClassicGameset() {
  if(import.meta.env.NODE_ENV === "development"){
    console.log("Using mock classic game data");
    return Promise.resolve(mockClassicGame);
  }
 const url = `${import.meta.env.VITE_APP_API_URL}/api/gameset?mode=classic`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchStandardGameset() {
 const url = `${import.meta.env.VITE_APP_API_URL}/api/gameset?mode=standard`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}