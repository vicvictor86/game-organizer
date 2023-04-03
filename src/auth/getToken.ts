import axios from "axios";

export default async function getToken(): Promise<any> {
  const response = await axios.post('https://id.twitch.tv/oauth2/token', {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: process.env.GRANT_TYPE,
  });

  const { data } = response;

  return data;
}
