import axios from "axios";

const ANILIST_URL = "https://graphql.anilist.co";
const JIKAN_URL = "https://api.jikan.moe/v4";

export const fetchTrending = async () => {
  const query = `
    query {
      Page(page: 1, perPage: 10) {
        media(sort: TRENDING_DESC, type: ANIME) {
          id
          title { english romaji }
          coverImage { large extraLarge }
          bannerImage
          description
          averageScore
          genres
        }
      }
    }
  `;
  const response = await axios.post(ANILIST_URL, { query });
  return response.data.data.Page.media;
};

export const fetchPopular = async () => {
  const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(sort: POPULARITY_DESC, type: ANIME) {
          id
          title { english romaji }
          coverImage { large }
          averageScore
          status
        }
      }
    }
  `;
  const response = await axios.post(ANILIST_URL, { query });
  return response.data.data.Page.media;
};

export const fetchDetails = async (id: string) => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { english romaji native }
        coverImage { extraLarge }
        bannerImage
        description
        genres
        averageScore
        status
        episodes
        seasonYear
        studios(isMain: true) { nodes { name } }
        trailer { id site }
        nextAiringEpisode { episode airingAt }
      }
    }
  `;
  const response = await axios.post(ANILIST_URL, { query, variables: { id: parseInt(id) } });
  return response.data.data.Media;
};

export const searchAnime = async (search: string) => {
  const response = await axios.get(`${JIKAN_URL}/anime?q=${search}&limit=20`);
  return response.data.data;
};
