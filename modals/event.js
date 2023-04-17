class Event {
    constructor(id,past, title, subtitle,price,date,details,img,banner,students ) {
            this.id = id;
            this.past = past;
            this.title = title;
            this.subtitle = subtitle;
            this.price = price;
            this.date = date;
            this.details = details;
            this.img = img;
            this.banner = banner;
            this.students =students;
    }
}

module.exports = Event;