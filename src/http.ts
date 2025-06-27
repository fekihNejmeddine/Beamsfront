import axios from "axios";

interface Place {
  id: string;
  name: string;
  location: string;
  // Ajoutez d'autres propriétés selon vos besoins
}

interface FetchUserPlacesResponse {
  places: Place[];
}

interface UpdateUserPlacesResponse {
  message: string;
}

export async function fetchUserPlaces(): Promise<Place[]> {
  const response = await fetch(import.meta.env.VITE_HOST + "/auth/");
  const resData: FetchUserPlacesResponse = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch user places");
  }

  return resData.places;
}

export async function updateUserPlaces(places: Place[]): Promise<string> {
  const response = await fetch(import.meta.env.VITE_HOST + "/auth/update", {
    method: "PUT",
    body: JSON.stringify({ places }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resData: UpdateUserPlacesResponse = await response.json();

  if (!response.ok) {
    throw new Error("Failed to update user data.");
  }

  return resData.message;
}
