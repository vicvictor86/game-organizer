import axios from "axios";

export default async function getToken(): Promise<any> {
  const response = await axios.post('https://id.twitch.tv/oauth2/token', {
    client_id: process.env.IGDB_CLIENT_ID,
    client_secret: process.env.IGDB_CLIENT_SECRET,
    grant_type: process.env.IGDB_GRANT_TYPE,
  });

  const { data } = response;

  return data;
}
