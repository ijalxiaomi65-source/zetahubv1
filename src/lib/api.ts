
const ANILIST_URL = "/api/proxy/anilist";
const JIKAN_URL = "/api/proxy/jikan";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAnilist = async (query: string, variables: any = {}, retryCount = 0): Promise<any> => {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    
    if (response.status === 429 && retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 2000;
      console.warn(`AniList rate limited. Retrying in ${Math.round(delay)}ms...`);
      await sleep(delay);
      return fetchAnilist(query, variables, retryCount + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AniList API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    if (data.errors) {
      // If it's a rate limit error inside the GraphQL response
      if (data.errors.some((e: any) => e.status === 429 || e.message?.includes("Too Many Requests"))) {
        if (retryCount < 5) {
          const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 2000;
          await sleep(delay);
          return fetchAnilist(query, variables, retryCount + 1);
        }
      }
      throw new Error(`AniList GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    // Cache successful response
    cache.set(cacheKey, { data: data.data, timestamp: Date.now() });
    
    return data.data;
  } catch (error) {
    console.error("fetchAnilist error:", error);
    throw error;
  }
};

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
  const data = await fetchAnilist(query);
  return data.Page.media;
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
  const data = await fetchAnilist(query);
  return data.Page.media;
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
        format
        source
        studios(isMain: true) { nodes { name } }
        trailer { id site }
        nextAiringEpisode { episode airingAt }
        relations {
          edges {
            relationType
            node {
              id
              title { english romaji }
              coverImage { large }
              type
              status
            }
          }
        }
        characters(sort: ROLE, perPage: 6) {
          nodes {
            id
            name { full }
            image { large }
          }
        }
      }
    }
  `;
  const data = await fetchAnilist(query, { id: parseInt(id) });
  return data.Media;
};

export const fetchTrendingDonghua = async () => {
  const query = `
    query {
      Page(page: 1, perPage: 24) {
        media(sort: TRENDING_DESC, type: ANIME, countryOfOrigin: "CN") {
          id
          title { english romaji native }
          coverImage { large extraLarge }
          bannerImage
          description
          averageScore
          genres
          status
        }
      }
    }
  `;
  const data = await fetchAnilist(query);
  return data.Page.media;
};

export const fetchPopularDonghua = async () => {
  const query = `
    query {
      Page(page: 1, perPage: 24) {
        media(sort: POPULARITY_DESC, type: ANIME, countryOfOrigin: "CN") {
          id
          title { english romaji native }
          coverImage { large extraLarge }
          bannerImage
          description
          averageScore
          genres
          status
        }
      }
    }
  `;
  const data = await fetchAnilist(query);
  return data.Page.media;
};

export const searchAnime = async (search: string) => {
  try {
    const response = await fetch(`${JIKAN_URL}/anime?q=${encodeURIComponent(search)}&limit=20`);
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("searchAnime error:", error);
    throw error;
  }
};
