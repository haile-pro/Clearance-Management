import { AxiosError } from 'axios';

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", error.response.data);
      console.error("API Error Status:", error.response.status);
      console.error("API Error Headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response Error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Request Setup Error:", error.message);
    }
  } else {
    console.error("Unknown error:", error);
  }
  throw error;
};