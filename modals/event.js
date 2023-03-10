class Event {
    constructor(id,past, title, subtitle,price,date,details,img ) {
            this.id = id;
            this.past = past;
            this.title = title;
            this.subtitle = subtitle;
            this.price = price;
            this.date = date;
            this.details = details;
            this.img = img;
    }
}

module.exports = Event;