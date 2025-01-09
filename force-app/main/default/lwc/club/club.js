import { LightningElement, api, wire } from 'lwc';
import getClubDetailsById from '@salesforce/apex/FootballManager.getClubDetailsById';
import getPlayersByClub from '@salesforce/apex/FootballManager.getPlayersByClub';
import getNewsForClub from '@salesforce/apex/NewsService.getNewsForClub';
import myImageBundle from '@salesforce/resourceUrl/myImageBundle';

export default class Club extends LightningElement {
    @api clubId;
    club;
    clubName = '';
    clubLogo = '';
    clubManager = '';
    clubStadium = '';
    hasClubData = false;
    managerLogoUrl = myImageBundle + '/manager-icon.png';
    stadiumLogoUrl = myImageBundle + '/stadium-icon.png';

    goalkeepers = [];
    defenders = [];
    midfielders = [];
    forwards = [];

    // For news
    clubNews = [];
    isLoading = false;
    hasNews = false;
    newsError;
    
    // Tab keys
    playersTabKey = 'players';
    newsTabKey = 'news';

    @wire(getClubDetailsById, { clubId: '$clubId' })
    wiredClubDetails({ data, error }) {
        if (data) {
            this.populateClubDetails(data);
            this.hasClubData = true;
            this.fetchNewsForClub();
        } else if (error) {
            console.error('Error fetching club details:', error);
            this.resetFields();
        }
    }

    @wire(getPlayersByClub, { clubId: '$clubId' })
    wiredPlayers({ data, error }) {
        if (data) {
            this.organizePlayersByPosition(data);
        } else if (error) {
            console.error('Error fetching players:', error);
        }
    }

    async fetchNewsForClub() {
        if (!this.clubName) return;
        
        this.isLoading = true;
        this.newsError = undefined;
        this.hasNews = false;
        
        try {
            this.clubNews = await getNewsForClub({ clubName: this.clubName });
            this.hasNews = this.clubNews.length > 0;
        } catch (error) {
            this.newsError = error.body?.message || 'Error fetching news';
            console.error('Error fetching news:', error);
        } finally {
            this.isLoading = false;
        }
    }
    
    
    populateClubDetails(club) {
        this.club = club;
        this.clubName = club.Name;
        this.clubLogo = this.decodeHtmlEntities(this.extractImageUrl(club.Logo__c));
        this.clubManager = club.Club_Manager__r ? club.Club_Manager__r.Name : '';
        this.clubStadium = club.Stadium__c;
    }

    organizePlayersByPosition(players) {
        this.goalkeepers = [];
        this.defenders = [];
        this.midfielders = [];
        this.forwards = [];

        players.forEach(player => {
            const playerWithPhoto = {
                ...player,
                photoUrl: this.decodeHtmlEntities(this.extractImageUrl(player.Photo__c))
            };

            switch(player.Position__c) {
                case 'Goalkeeper':
                    this.goalkeepers.push(playerWithPhoto);
                    break;
                case 'Defender':
                    this.defenders.push(playerWithPhoto);
                    break;
                case 'Midfielder':
                    this.midfielders.push(playerWithPhoto);
                    break;
                case 'Forward':
                    this.forwards.push(playerWithPhoto);
                    break;
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

    resetFields() {
        this.club = null;
        this.clubName = '';
        this.clubLogo = '';
        this.clubManager = '';
        this.clubStadium = '';
        this.hasClubData = false;
        this.goalkeepers = [];
        this.defenders = [];
        this.midfielders = [];
        this.forwards = [];
        this.newsData = [];
    }
}