import { LightningElement, track } from 'lwc';

export default class PlayerFilter extends LightningElement {
    @track selectedPosition;
    @track selectedNationality;

    positionOptions = [
        { label: '-- Clear --', value: '' },
        { label: 'Forward', value: 'FORWARD' },
        { label: 'Midfielder', value: 'MIDFIELDER' },
        { label: 'Defender', value: 'DEFENDER' },
        { label: 'Goalkeeper', value: 'GOALKEEPER' },
    ];

    nationOptions = [
        { label: '-- Clear --', value: '' },
        { label: 'Argentina', value: 'ARGENTINA' },
        { label: 'Belgium', value: 'BELGIUM' },
        { label: 'Brazil', value: 'BRAZIL' },
        { label: 'Cameroon', value: 'CAMEROON' },
        { label: 'Croatia', value: 'CROATIA' },
        { label: 'Egypt', value: 'EGYPT' },
        { label: 'England', value: 'ENGLAND' },
        { label: 'France', value: 'FRANCE' },
        { label: 'Germany', value: 'GERMANY' },
        { label: 'Italy', value: 'ITALY' },
        { label: 'Morocco', value: 'MOROCCO' },
        { label: 'Netherlands', value: 'NETHERLANDS' },
        { label: 'Norway', value: 'NORWAY' },
        { label: 'Poland', value: 'POLAND' },
        { label: 'Portugal', value: 'PORTUGAL' },
        { label: 'Scotland', value: 'SCOTLAND' },
        { label: 'Senegal', value: 'SENEGAL' },
        { label: 'Slovenia', value: 'SLOVENIA' },
        { label: 'Spain', value: 'SPAIN' },
        { label: 'Switzerland', value: 'SWITZERLAND' },
        { label: 'UAE', value: 'UAE' },
        { label: 'United States', value: 'UNITED STATES' },
        { label: 'Uruguay', value: 'URUGUAY' }
    ];
    
    handlePositionChange(event) {
        this.selectedPosition = event.detail.value;
        this.dispatchFilterChangeEvent();
    }
    
    handleNationalityChange(event) {
        this.selectedNationality = event.detail.value;
        this.dispatchFilterChangeEvent();
    }

    handleClearAllFilters() {
        this.selectedPosition = '';
        this.selectedNationality = '';
        this.dispatchFilterChangeEvent();
    }
    
    dispatchFilterChangeEvent() {
        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: { 
                position: this.selectedPosition,
                nationality: this.selectedNationality
            }
        }));
    }
}