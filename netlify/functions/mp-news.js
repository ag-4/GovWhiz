const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Cache for news articles
let newsCache = new Map();
const CACHE_DURATION = 1800000; // 30 minutes

exports.handler = async (event) => {
    try {
        const { mp, constituency } = event.queryStringParameters;
        if (!mp || !constituency) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'MP name and constituency are required' })
            };
        }

        const cacheKey = `${mp}-${constituency}`;

        // Check cache
        const cachedResult = newsCache.get(cacheKey);
        if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
            return {
                statusCode: 200,
                body: JSON.stringify(cachedResult.data)
            };
        }

        // Fetch news from The Guardian
        const guardianNews = await fetchGuardianNews(mp, constituency);
        
        // Fetch news from BBC
        const bbcNews = await fetchBBCNews(mp, constituency);

        const result = {
            articles: [...guardianNews, ...bbcNews]
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                .slice(0, 10)
        };

        // Cache the result
        newsCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('News fetch error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch news' })
        };
    }
};

async function fetchGuardianNews(mp, constituency) {
    try {
        const query = encodeURIComponent(`${mp} ${constituency} parliament`);
        const response = await fetch(
            `https://www.theguardian.com/politics/search?q=${query}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const articles = [];
        $('.fc-item').each((i, el) => {
            if (i < 5) { // Limit to 5 articles
                const title = $(el).find('.fc-item__title').text().trim();
                const url = $(el).find('a').attr('href');
                const date = $(el).find('time').attr('datetime');
                
                if (title && url) {
                    articles.push({
                        title,
                        url,
                        source: 'The Guardian',
                        publishedAt: date || new Date().toISOString()
                    });
                }
            }
        });
        
        return articles;
    } catch (error) {
        console.error('Guardian news fetch error:', error);
        return [];
    }
}

async function fetchBBCNews(mp, constituency) {
    try {
        const query = encodeURIComponent(`${mp} ${constituency} parliament`);
        const response = await fetch(
            `https://www.bbc.co.uk/search?q=${query}&filter=news`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const articles = [];
        $('.ssrcss-1v7bxtk-StyledContainer').each((i, el) => {
            if (i < 5) { // Limit to 5 articles
                const title = $(el).find('.ssrcss-6arcww-PromoHeadline').text().trim();
                const url = $(el).find('a').attr('href');
                const date = $(el).find('time').attr('datetime');
                
                if (title && url) {
                    articles.push({
                        title,
                        url: url.startsWith('http') ? url : `https://www.bbc.co.uk${url}`,
                        source: 'BBC News',
                        publishedAt: date || new Date().toISOString()
                    });
                }
            }
        });
        
        return articles;
    } catch (error) {
        console.error('BBC news fetch error:', error);
        return [];
    }
}
