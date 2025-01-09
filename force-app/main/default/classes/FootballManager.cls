public class FootballManager {
    
    @AuraEnabled(cacheable=True)
    public static List<Player__c> getPlayers() {
        List<Player__c> playerList = [SELECT Id, Name, Position__c, Nationality__c, Club__r.Name, Goals_Scored__c FROM Player__c];
        return playerList;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static Player__c getPlayerDetailsById(Id playerId) {
        Player__c player = [SELECT Id, Name, Position__c, Club__r.Name, Goals_Scored__c, Nationality__c, Photo__c 
                            FROM Player__c 
                            WHERE Id = :playerId];
        return player;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Club__c> getClubs() {
        List<Club__c> clubList = [SELECT Id, Name, Logo__c FROM Club__c];
        return clubList;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static Club__c getClubDetailsById(Id clubId) {
        Club__c club = [SELECT Id, Name, Logo__c, Club_Manager__r.Name, Stadium__c FROM Club__c WHERE Id = :clubId];
        return club;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Player__c> getPlayersByClub(Id clubId) {
        List<Player__c> players = [SELECT Id, Name, Position__c, Photo__c, Nationality__c, Goals_Scored__c FROM Player__c
                             WHERE Club__c = :clubId ORDER BY Position__c, Name];
        return players;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Match__c> getMatches() {
        List<Match__c> matchList = [SELECT Id, Match_Date__c, Team_1__r.Name, Team_2__r.Name, Team_1_Score__c, Team_2_Score__c FROM Match__c];
        return matchList;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static Match__c getMatchDetailsById(Id matchId) {
        Match__c match = [
            SELECT Id, Match_Date__c, Team_1__r.Name, Team_1__r.Logo__c, Team_2__r.Logo__c, Team_2__r.Name, Team_1_Score__c, Team_2_Score__c,
                   (SELECT Id, Player__r.Name, Scoring_Team__c, Goal_Type__c, Minute__c FROM Match_Goals__r)
            FROM Match__c
            WHERE Id = :matchId
        ];
        return match;
    }

}