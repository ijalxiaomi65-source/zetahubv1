
const ANILIST_URL = "/api/proxy/anilist";
const JIKAN_URL = "/api/proxy/jikan";
const CONSUMET_URL = "/api/proxy/consumet";

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

// Consumet Streaming API
export const fetchAnimeEpisodes = async (id: string, retryCount = 0): Promise<any[]> => {
  try {
    const response = await fetch(`${CONSUMET_URL}/meta/anilist/info/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch episodes: ${response.status}`);
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const data = await response.json();
    return data.episodes || [];
  } catch (error) {
    console.error("fetchAnimeEpisodes error:", error);
    if (retryCount < 2) {
      await sleep(1000);
      return fetchAnimeEpisodes(id, retryCount + 1);
    }
    return [];
  }
};

export const fetchStreamSources = async (episodeId: string, retryCount = 0): Promise<any> => {
  try {
    const response = await fetch(`${CONSUMET_URL}/meta/anilist/watch/${episodeId}`);
    if (!response.ok) throw new Error(`Failed to fetch stream sources: ${response.status}`);
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchStreamSources error:", error);
    if (retryCount < 2) {
      await sleep(1000);
      return fetchStreamSources(episodeId, retryCount + 1);
    }
    return null;
  }
};

// K-Drama API (Using AsianLoad via Consumet)
export const fetchTrendingKdrama = async (retryCount = 0): Promise<any[]> => {
  try {
    // Try AsianLoad first, then DramaCool as fallback
    const provider = retryCount % 2 === 0 ? "asianload" : "dramacool";
    const response = await fetch(`${CONSUMET_URL}/movies/${provider}/trending`);
    if (!response.ok) throw new Error(`Failed to fetch trending K-Drama: ${response.status}`);
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("fetchTrendingKdrama error:", error);
    if (retryCount < 3) {
      await sleep(1000);
      return fetchTrendingKdrama(retryCount + 1);
    }
    return [];
  }
};

export const fetchPopularKdrama = async (retryCount = 0): Promise<any[]> => {
  try {
    const provider = retryCount % 2 === 0 ? "asianload" : "dramacool";
    const response = await fetch(`${CONSUMET_URL}/movies/${provider}/popular`);
    if (!response.ok) throw new Error(`Failed to fetch popular K-Drama: ${response.status}`);
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("fetchPopularKdrama error:", error);
    if (retryCount < 3) {
      await sleep(1000);
      return fetchPopularKdrama(retryCount + 1);
    }
    return [];
  }
};

export const fetchKdramaDetails = async (id: string, retryCount = 0): Promise<any> => {
  try {
    const provider = retryCount % 2 === 0 ? "asianload" : "dramacool";
    const response = await fetch(`${CONSUMET_URL}/movies/${provider}/info?id=${id}`);
    if (!response.ok) throw new Error(`Failed to fetch K-Drama details: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchKdramaDetails error:", error);
    if (retryCount < 3) {
      await sleep(1000);
      return fetchKdramaDetails(id, retryCount + 1);
    }
    return null;
  }
};

export const fetchKdramaStream = async (episodeId: string, mediaId: string, retryCount = 0): Promise<any> => {
  try {
    const provider = retryCount % 2 === 0 ? "asianload" : "dramacool";
    const response = await fetch(`${CONSUMET_URL}/movies/${provider}/watch?episodeId=${episodeId}&mediaId=${mediaId}`);
    if (!response.ok) throw new Error(`Failed to fetch K-Drama stream: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchKdramaStream error:", error);
    if (retryCount < 3) {
      await sleep(1000);
      return fetchKdramaStream(episodeId, mediaId, retryCount + 1);
    }
    return null;
  }
};

export const searchKdrama = async (query: string, retryCount = 0): Promise<any[]> => {
  try {
    const provider = retryCount % 2 === 0 ? "asianload" : "dramacool";
    const response = await fetch(`${CONSUMET_URL}/movies/${provider}/${query}`);
    if (!response.ok) throw new Error("Failed to search K-Drama");
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("searchKdrama error:", error);
    if (retryCount < 3) {
      await sleep(1000);
      return searchKdrama(query, retryCount + 1);
    }
    return [];
  }
};
