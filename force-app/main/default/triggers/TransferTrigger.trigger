trigger TransferTrigger on Transfer__c (before insert, before update) {
    List<Id> playerIds = new List<Id>();
    List<Id> newClubIds = new List<Id>();
    
    for (Transfer__c transfer : Trigger.new) {
        if (transfer.Player__c != null) {
            playerIds.add(transfer.Player__c);
        }
        if (transfer.New_Club__c != null) {
            newClubIds.add(transfer.New_Club__c);
        }
    }
    
    Map<Id, Player__c> players = new Map<Id, Player__c>([
        SELECT Id, Club__c, Club__r.Club_Manager__c 
        FROM Player__c 
        WHERE Id IN :playerIds
    ]);
    
    Map<Id, Club__c> newClubs = new Map<Id, Club__c>([
        SELECT Id, Club_Manager__c 
        FROM Club__c 
        WHERE Id IN :newClubIds
    ]);
    
    for (Transfer__c transfer : Trigger.new) {
        if (transfer.Player__c != null) {
            Player__c player = players.get(transfer.Player__c);
            if (player != null) {
                // Set Current Club
                transfer.Current_Club__c = player.Club__c;
                
                // Set Current Club Manager
                if (player.Club__r.Club_Manager__c != null) {
                    transfer.Current_Club_Manager__c = player.Club__r.Club_Manager__c;
                }
            }
        }
        
        if (transfer.New_Club__c != null) {
            Club__c newClub = newClubs.get(transfer.New_Club__c);
            if (newClub != null && newClub.Club_Manager__c != null) {
                transfer.New_Club_Manager__c = newClub.Club_Manager__c;
            }
        }
    }
}