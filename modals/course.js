class Course {
    constructor(id, title, subtitle,price, details,duration,benifits,category,img,banner,materails,videos,assignment,students ) {
            this.id = id;
            this.title = title;
            this.subtitle = subtitle;
            this.price = price;
            this.details = details;
            this.duration = duration;
            this.benifits = benifits;
            this.category = category;
            this.img = img;
            this.banner = banner
            this.materails = materails;
            this.videos = videos;
            this.assignment = assignment;
            this.students = students
    }
}

module.exports = Course;