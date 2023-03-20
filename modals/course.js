class Course {
    constructor(id, title, subtitle,price, details,duration,benifits,img,materails,videos,assignment,students ) {
            this.id = id;
            this.title = title;
            this.subtitle = subtitle;
            this.price = price;
            this.details = details;
            this.duration = duration;
            this.benifits = benifits;
            this.img = img;
            this.materails = materails;
            this.videos = videos;
            this.assignment = assignment;
            this.students = students
    }
}

module.exports = Course;