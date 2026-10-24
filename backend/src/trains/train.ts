export class Train {
    /** Four-number ID of the train */
    trainNumber: number;

    constructor(trainNumber: number) {
        this.trainNumber = trainNumber;
    }

    /** The first two digits of the train, indicating the series */
    get series() { return Math.floor(this.trainNumber / 100); }
    /** The last two digits of the train, indicating the unique train */
    get run() { return this.trainNumber % 100; }
}