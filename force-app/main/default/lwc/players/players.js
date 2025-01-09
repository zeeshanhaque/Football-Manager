import { LightningElement, track, wire } from 'lwc';
import getPlayers from '@salesforce/apex/FootballManager.getPlayers';

export default class Players extends LightningElement {
    @track players;
    @track selectedPlayerId;
    @track filteredPlayers;

    @wire(getPlayers)
    wiredPlayers({ data, error }) {
        if (data) {
            this.players = data;
            this.filteredPlayers = data;
        } else if (error) {
            this.players = [];
        }
    }

    handlePlayerSelect(event) {
        this.selectedPlayerId = event.target.dataset.id;
    }

    handleFilterChange(event) {
        const { position, nationality } = event.detail;
        this.filteredPlayers = this.players.filter((player) => {
            const positionMatch = !position ||
                (player.Position__c && player.Position__c.toUpperCase() === position.toUpperCase());
            const nationalityMatch = !nationality ||
                (player.Nationality__c && player.Nationality__c.toUpperCase() === nationality.toUpperCase());
            return positionMatch && nationalityMatch;
        });
        this.selectedPlayerId = null;
    }
}