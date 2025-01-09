import { LightningElement, track, wire } from 'lwc';
import getClubs from '@salesforce/apex/FootballManager.getClubs';

export default class Clubs extends LightningElement {

    @track clubs;
    @track selectedClubId;

    @wire(getClubs)
    wiredClubs({ data, error }) {
        if (data) {
            this.clubs = data.map(club => ({
                ...club,
                logoUrl: this.decodeHtmlEntities(this.extractImageUrl(club.Logo__c))
            }));
        } else if (error) {
            this.clubs = [];
            console.error('Error fetching clubs:', error);
        }
    }

    handleClubSelect(event) {
        this.selectedClubId = event.target.dataset.id;
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
}