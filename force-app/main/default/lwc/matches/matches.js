import { LightningElement, wire, track } from 'lwc';
import getMatches from '@salesforce/apex/FootballManager.getMatches';

export default class Matches extends LightningElement {
    @track groupedMatches = [];
    @track paginatedMatches = [];
    @track selectedMatchId;

    pageSize = 3;
    currentPage = 1;
    totalPages = 1;

    @wire(getMatches)
    wiredMatches({ data, error }) {
        if (data) {
            this.processMatches(data);
        } else if (error) {
            this.handleError(error);
        }
    }

    processMatches(data) {
        try {
            const groupedByDate = this.groupMatchesByDate(data);
            this.groupedMatches = this.sortGroupedMatches(groupedByDate);
            this.totalPages = Math.ceil(this.groupedMatches.length / this.pageSize);
            this.updatePaginatedMatches();
        } catch (err) {
            this.handleError(err);
        }
    }

    groupMatchesByDate(data) {
        return data.reduce((acc, match) => {
            const formattedDate = this.formatDate(match.Match_Date__c);
            acc[formattedDate] = acc[formattedDate] || [];
            acc[formattedDate].push({
                ...match
            });
            return acc;
        }, {});
    }

    sortGroupedMatches(groupedByDate) {
        const dateMatchesArray = [];
        for (const date in groupedByDate) {
            dateMatchesArray.push({ date, matches: groupedByDate[date] });
        }
        dateMatchesArray.sort((a, b) => new Date(b.date) - new Date(a.date));
        return dateMatchesArray;
    }

    formatDate(dateString) {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(dateString));
    }

    updatePaginatedMatches() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = this.currentPage * this.pageSize;
        this.paginatedMatches = this.groupedMatches.slice(start, end);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    handlePrevious() {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.updatePaginatedMatches();
        }
    }

    handleNext() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.updatePaginatedMatches();
        }
    }

    handleError(error) {
        console.error('Error:', error);
        this.resetDataOnError();
    }

    resetDataOnError() {
        this.groupedMatches = [];
        this.paginatedMatches = [];
    }

    handleMatchSelect(event) {
        const matchId = event.currentTarget.dataset.id;
        if (matchId !== this.selectedMatchId) {
            this.selectedMatchId = matchId;
        } else {
            this.selectedMatchId = null;
        }
    }
}