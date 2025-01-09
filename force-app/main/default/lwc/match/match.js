import { LightningElement, api, wire } from 'lwc';
import getMatchDetailsById from '@salesforce/apex/FootballManager.getMatchDetailsById';

export default class Match extends LightningElement {
    @api matchId;
    match;
    matchDate = '';
    team1Name = '';
    team1Logo = '';
    team2Name = '';
    team2Logo = '';
    team1Score = '';
    team2Score = '';
    team1Goals = [];
    team2Goals = [];
    hasMatchData = false;

    @wire(getMatchDetailsById, { matchId: '$matchId' })
    wiredMatchDetails({ data, error }) {
        if (data) {
            this.populateMatchDetails(data);
            this.hasMatchData = true;
        } else if (error) {
            console.error('Error fetching match details:', error);
            this.resetFields();
        }
    }

    populateMatchDetails(match) {
        this.match = match;
        this.matchDate = this.formatDate(match.Match_Date__c);
        this.team1Name = match.Team_1__r ? match.Team_1__r.Name : '';
        this.team2Name = match.Team_2__r ? match.Team_2__r.Name : '';
        this.team1Logo = this.decodeHtmlEntities(this.extractImageUrl(match.Team_1__r.Logo__c));
        this.team2Logo = this.decodeHtmlEntities(this.extractImageUrl(match.Team_2__r.Logo__c));
        this.team1Score = match.Team_1_Score__c;
        this.team2Score = match.Team_2_Score__c;

        this.team1Goals = [];
        this.team2Goals = [];

        match.Match_Goals__r.forEach(goal => {
            const processedGoal = {
                ...goal,
                isOwnGoal: goal.Goal_Type__c === 'Own Goal'
            };

            if (goal.Scoring_Team__c === match.Team_1__r.Id) {
                this.team1Goals.push(processedGoal);
            } else if (goal.Scoring_Team__c === match.Team_2__r.Id) {
                this.team2Goals.push(processedGoal);
            }
        });
    }

    extractImageUrl(photoRichText) {
        const imgTagMatch = /<img.*?src="(.*?)"/.exec(photoRichText);
        return imgTagMatch ? imgTagMatch[1] : '';
    }

    decodeHtmlEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }

    formatDate(dateString) {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(dateString));
    }

    resetFields() {
        this.match = null;
        this.matchDate = '';
        this.team1Name = '';
        this.team1Logo = '';
        this.team2Name = '';
        this.team2Logo = '';
        this.team1Score = '';
        this.team2Score = '';
        this.team1Goals = [];
        this.team2Goals = [];
        this.hasMatchData = false;
    }
}