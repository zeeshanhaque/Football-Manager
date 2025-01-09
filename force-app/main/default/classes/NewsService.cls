public with sharing class NewsService {
    private static final String NEWS_API_KEY = 'fa44ae6175de43c685358604c4149418';
    private static final String NEWS_API_ENDPOINT = 'https://newsapi.org/v2/everything';
    
    @AuraEnabled
    public static List<NewsWrapper> getNewsForClub(String clubName) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        // Prepend 'Football' to the club name for better search results
        String searchQuery = 'Football ' + clubName;
        String encodedQuery = EncodingUtil.urlEncode(searchQuery, 'UTF-8')
            .replace('%20', '+'); // Replace URL-encoded spaces with '+' for better results
        
        String endpoint = NEWS_API_ENDPOINT + 
            '?q=' + encodedQuery +
            '&apiKey=' + NEWS_API_KEY +
            '&pageSize=30' + // Increased page size to ensure we get enough results after filtering
            '&language=en';
        
        request.setEndpoint(endpoint);
        request.setMethod('GET');
        
        try {
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                List<Object> articles = (List<Object>) results.get('articles');
                
                List<NewsWrapper> newsItems = new List<NewsWrapper>();
                String clubNameLower = clubName.toLowerCase();
                
                for (Object article : articles) {
                    Map<String, Object> articleMap = (Map<String, Object>) article;
                    String description = (String) articleMap.get('description');
                    
                    // Only include articles where the club name appears in the description
                    if (description != null && description.toLowerCase().contains(clubNameLower)) {
                        NewsWrapper news = new NewsWrapper();
                        news.title = (String) articleMap.get('title');
                        news.urlToImage = (String) articleMap.get('urlToImage');
                        news.description = description;
                        news.url = (String) articleMap.get('url');
                        news.publishedAt = (String) articleMap.get('publishedAt');
                        news.source = ((Map<String, Object>)articleMap.get('source')).get('name')?.toString();
                        newsItems.add(news);
                        
                        // Limit to 10 filtered results
                        if (newsItems.size() == 11) {
                            break;
                        }
                    }
                }
                
                return newsItems;
            }
            
            throw new AuraHandledException('Failed to fetch news. Status: ' + response.getStatusCode());
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching news: ' + e.getMessage());
        }
    }
    
    public class NewsWrapper {
        @AuraEnabled public String title;
        @AuraEnabled public String description;
        @AuraEnabled public String url;
        @AuraEnabled public String urlToImage;
        @AuraEnabled public String publishedAt;
        @AuraEnabled public String source;
    }
}