trigger MatchGoalTrigger on Match_Goal__c (before insert, before update, after insert, after update, after delete) {
    if (Trigger.isBefore) {
        setScoreTeam();
    } else if (Trigger.isAfter) {
        updateMatchScores();
    }

    private static void setScoreTeam() {
        Set<Id> matchIds = new Set<Id>();
        Set<Id> playerIds = new Set<Id>();

        for (Match_Goal__c mg : Trigger.new) {
            matchIds.add(mg.Match__c);
            playerIds.add(mg.Player__c);
        }

        Map<Id, Match__c> matchesMap = new Map<Id, Match__c>([
            SELECT Id, Team_1__c, Team_2__c
            FROM Match__c
            WHERE Id IN :matchIds
        ]);

        Map<Id, Player__c> playersMap = new Map<Id, Player__c>([
            SELECT Id, Club__c
            FROM Player__c
            WHERE Id IN :playerIds
        ]);

        for (Match_Goal__c mg : Trigger.new) {
            Match__c match = matchesMap.get(mg.Match__c);
            Player__c player = playersMap.get(mg.Player__c);

            if (match != null && player != null) {
                // If the Type_of_Goal__c is 'Own Goal', assign the goal to the opposing team
                if (mg.Goal_Type__c == 'Own Goal') {
                    if (player.Club__c == match.Team_1__c) {
                        mg.Scoring_Team__c = match.Team_2__c;
                    } else if (player.Club__c == match.Team_2__c) {
                        mg.Scoring_Team__c = match.Team_1__c;
                    } else {
                        mg.addError('The player does not belong to one of the teams in this match.');
                    }
                } else {
                    // Regular goal: assign the goal to the player's team
                    if (player.Club__c == match.Team_1__c) {
                        mg.Scoring_Team__c = match.Team_1__c;
                    } else if (player.Club__c == match.Team_2__c) {
                        mg.Scoring_Team__c = match.Team_2__c;
                    } else {
                        mg.addError('The player does not belong to one of the teams in this match.');
                    }
                }
            }
        }
    }

    private static void updateMatchScores() {
        Set<Id> matchIds = new Set<Id>();

        if (Trigger.isInsert || Trigger.isUpdate) {
            for (Match_Goal__c mg : Trigger.new) {
                matchIds.add(mg.Match__c);
            }
        } else if (Trigger.isDelete) {
            for (Match_Goal__c mg : Trigger.old) {
                matchIds.add(mg.Match__c);
            }
        }

        if (!matchIds.isEmpty()) {
            Map<Id, Match__c> matchesMap = new Map<Id, Match__c>([
                SELECT Id, Team_1__c, Team_2__c, Team_1_Score__c, Team_2_Score__c
                FROM Match__c
                WHERE Id IN :matchIds
            ]);

            List<Match_Goal__c> allGoals = [
                SELECT Id, Match__c, Scoring_Team__c, Goal_Type__c
                FROM Match_Goal__c
                WHERE Match__c IN :matchIds
            ];

            for (Match__c match : matchesMap.values()) {
                Decimal team1Score = 0;
                Decimal team2Score = 0;

                for (Match_Goal__c mg : allGoals) {
                    if (mg.Match__c == match.Id) {
                        // Update scores based on the scoring team
                        if (mg.Scoring_Team__c == match.Team_1__c) {
                            team1Score += 1;
                        } else if (mg.Scoring_Team__c == match.Team_2__c) {
                            team2Score += 1;
                        }
                    }
                }

                match.Team_1_Score__c = team1Score;
                match.Team_2_Score__c = team2Score;
            }

            update matchesMap.values();
        }
    }
}