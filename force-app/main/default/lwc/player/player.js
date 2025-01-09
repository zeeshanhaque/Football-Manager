import { LightningElement, api, wire } from 'lwc';
import getPlayerDetailsById from '@salesforce/apex/FootballManager.getPlayerDetailsById';

export default class Player extends LightningElement {
    @api playerId;
    player;
    playerPosition = '';
    playerClub = '';
    playerGoals = '';
    playerNationality = '';
    playerPhoto = '';
    flagUrl = '';
    positionTextStyle = '';

    countryCodeMap = { 'Argentina': 'ar', 'Belgium': 'be', 'Brazil': 'br', 'Cameroon': 'cm', 'Croatia': 'hr', 'Egypt': 'eg', 'England': 'gb-eng', 'France': 'fr', 'Germany': 'de', 'Italy': 'it', 'Morocco': 'ma', 'Netherlands': 'nl', 'Norway': 'no', 'Poland': 'pl', 'Portugal': 'pt', 'Senegal': 'sn', 'Scotland': 'gb', 'Slovenia': 'si', 'Spain': 'es', 'Switzerland': 'ch', 'UAE': 'ae', 'United States': 'us', 'Uruguay': 'uy' }

    @wire(getPlayerDetailsById, { playerId: '$playerId' })
    wiredPlayer({ error, data }) {
        if (data) {
            this.populatePlayerDetails(data);
        } else if (error) {
            console.error('Error fetching player details:', error);
            this.resetFields();
        }
    }

    populatePlayerDetails(player) {
        this.player = player;
        this.playerPosition = player.Position__c;
        this.playerClub = player.Club__r ? player.Club__r.Name : '';
        this.playerGoals = player.Goals_Scored__c;
        this.playerNationality = player.Nationality__c;
        this.playerPhoto = this.decodeHtmlEntities(this.extractImageUrl(player.Photo__c));

        const countryCode = this.countryCodeMap[this.playerNationality] || 'default';
        this.flagUrl = countryCode !== 'default' ? `https://flagcdn.com/w320/${countryCode}.png` : '';

        const positionElement = this.template.querySelector('.position');
        positionElement.classList.remove('goalkeeper', 'defender', 'midfielder', 'forward');

        switch (this.playerPosition) {
            case 'Goalkeeper':
                positionElement.classList.add('goalkeeper');
                break;
            case 'Defender':
                positionElement.classList.add('defender');
                break;
            case 'Midfielder':
                positionElement.classList.add('midfielder');
                break;
            case 'Forward':
                positionElement.classList.add('forward');
                break;
            default:
                break;
        }
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
        this.player = null;
        this.playerPosition = '';
        this.playerClub = '';
        this.playerGoals = '';
        this.playerNationality = '';
        this.playerPhoto = '';
        this.flagUrl = '';
        this.positionTextStyle = '';
    }
}