const express = require('express');
const app  = express();
const Course = require('./modals/course');
const Internships = require('./modals/internship');
const Event = require('./modals/event');
const TechnicalBlog = require('./modals/technicalBlog');
const User = require('./modals/user');
const Banner = require('./modals/banner');
const Blog = require("./modals/blog");
const Contact =require("./modals/contactus");
const Achievements = require("./modals/achievements")
const admin = require('firebase-admin');
const credentials = require("./key.json");
const multer = require('multer');
const twilio = require('twilio');
const cors = require('cors');
const nodemailer = require('nodemailer');
var CryptoJS = require('crypto-js')
const client = twilio("AC5379cc509dd22a03dec92142cb441d5d","2c8f13abd180ca6d8849fc5fd3fda461");
app.use(cors());
admin.initializeApp({
    credential:admin.credential.cert(credentials),
    storageBucket: 'gs://internship-project-57ed0.appspot.com',
})
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cbhanderi666@gmail.com',
    pass: 'qewybyqsmuzkbwqg'
  }
});
function generateEventId(companyName, eventName) {
  const companyId = companyName.slice(0, 3).toUpperCase();
  const eventId = eventName.slice(0, 2).toUpperCase();
  const randomNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${companyId}${eventId}${randomNumbers}`;
}
const bucket = admin.storage().bucket();
const upload = multer({ 
  storage: multer.memoryStorage().storage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB in bytes
    fieldSize: 100 * 1024 * 1024, // 100MB in bytes
    parts: 100, // Increase this if your upload involves multiple parts
    files: 1 // Increase this if you're uploading multiple files simultaneously
  }
});

const db =  admin.firestore();
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Admin Account system starts here
app.get('/getadmins',async(req,res)=>{
  try {
    const admin = db.collection('admin');
    const getdata = await admin.get();
    const adminArray =[];
    if (!getdata.empty) {
      getdata.forEach(doc =>{
        const object = doc.data();
        object.id = doc.id;
        adminArray.push(object);
      })
      res.status(200).send(adminArray);
    }else{
      res.status(400).send("No Admin")
    }
  } catch (error) {
    
  }
})
app.post('/adminsignup',async(req,res)=>{
  try{
      const users =  db.collection("admin");
      const getdata = await users.get();
      if(!getdata.empty) {
        getdata.forEach(doc => {
          if (doc.id===req.body.username) {
            res.status(400).send("Username already exists");
            return
          }
        });
      }
    const data = {name:req.body.name,username:req.body.username,password:CryptoJS.AES.encrypt(req.body.password,"techoithubAdmin").toString(),contact:req.body.contact};
    const response = await db.collection("admin").doc(req.body.username).set(data)
    if (response) {
      res.status(200).send(response)
    }else{
      res.status(400).send("Internal Error Ocurred")
    }
  }catch(err){
      res.send(err)
  }
})
app.post('/adminlogin',async(req,res)=>{
  try{
    const username = req.body.username;
    const userById =  db.collection("admin").doc(username);
    const data = await userById.get();    
    if(!data.exists) {
          res.status(404).send('Invalid Credentials');
    }else {
        const bytes  = CryptoJS.AES.decrypt(data.data().password,"techoithubAdmin");
        let decryptPass = bytes.toString(CryptoJS.enc.Utf8);
        if (decryptPass === req.body.password) {
          res.status(200).send("Loggedin Successfully");
          return
        }
        else{
          res.status(400).send("Incorrect Password");
        }
    }
  }catch(err){ 
      res.send(err)
  }
})
app.put('/adminforget',async(req,res)=>{
  try{
    const username = req.body.username;
    const userById =  db.collection("admin").doc(username);
    const data = await userById.get();    
    if(!data.exists) {
          res.status(404).send('User does not exits');
    }else {
      const response = await db.collection("admin").doc(req.body.username).update({password:CryptoJS.AES.encrypt(req.body.password,"techoithubAdmin").toString()})
      if (response) {
        res.status(200).send(response)
      }else{
        res.status(400).send("Internal Error Ocurred")
      }
    }
  }catch(err){ 
      res.send(err)
  }
});
app.delete('/admindelete/:id',async(req,res)=>{
  try{
    const response = await db.collection("admin").doc(req.params.id).delete();
    if (response){
      res.status(200).send('Admin  deleted successfuly');      
    }else{
      res.status(400).send("Internal Error")
    }
  }catch(err){
      res.send(err)
  } 
})
// Admin Account system ends here
app.post('/courses',async(req,res)=>{
  try {
    const students=[]
      // Create a new course document in the "courses" collection
      const courseData = {
                    title:req.body.title,
                    price:req.body.price, 
                    subtitle:req.body.subtitle,
                    details:req.body.details,
                    benefits:req.body.benefits,
                    duration:req.body.duration,
                    category:req.body.category,
                    img:req.body.img,
                    banner:req.body.banner,
                    students:students,
                    created_on:new Date()
      };
      const courseRef = db.collection("courses").doc(req.body.title);
      await courseRef.set(courseData);
      // Get the subcollection data from the request body
      const  videos =req.body.videos;
      const  assignments =req.body.assignments;
      const  materials =req.body.materials;
      const  faqs =req.body.faqs;
      // Add documents to the videos subcollection
      const videosRef = courseRef.collection("videos");
      for(let i = 0; i < videos.length; i++){
        const videoRef = await videosRef.add(videos[i]);
      }
      // Add documents to the assignments subcollection
      const assignmentsRef = courseRef.collection("assignments");
      for(let i = 0; i < assignments.length; i++){
        const assignmentRef = await assignmentsRef.add(assignments[i]);
      }
      // Add documents to the materials subcollection
      const materialsRef = courseRef.collection("materials");
      for(let i = 0; i < materials.length; i++){
        const materialRef = await materialsRef.add(materials[i]);
      }
      // Add documents to the faqs subcollection
      const faq = courseRef.collection("faqs");
      for(let i = 0; i < faqs.length; i++){
        const faqsref = await faq.add(faqs[i]);
      }
      
      res.send("success") 
  } catch (error) {
    res.send(error)
  }
})
app.post('/addcoursedata/:collectionId/:subcollectionId',async(req,res)=>{
  const subcollection = req.params.subcollectionId;
  const data = req.body;
  const courseRef = db.collection('courses').doc(req.params.collectionId);
  const postRef = courseRef.collection(subcollection);
  postRef.add(data)
    .then(() => {
      res.send('Post added successfully');
    })
    .catch((error) => {
      res.send(error);
    });
})
app.post('/internships',async(req,res)=>{
    try{
      const students=[]
      const data = {title:req.body.title,
                    perks:req.body.perks,
                    subtitle:req.body.subtitle,
                    details:req.body.details,
                    img:req.body.img,
                    students:students,
                    created_on:new Date()
                  };
      const response = await db.collection("internships").doc(req.body.title).set(data)
      const internshipRef = db.collection("internships").doc(req.body.title);
      const  faqs =req.body.faqs;
      // Add documents to the faqs subcollection
      const faqsRef = internshipRef.collection("faqs");
      for(let i = 0; i < faqs.length; i++){
        const faqsRefs= await faqsRef.add(faqs[i]);
      }
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/addinternshipdata/:collectionId/:subcollectionId',async(req,res)=>{
  const subcollection = req.params.subcollectionId;
  const data = req.body;
  const courseRef = db.collection('internships').doc(req.params.collectionId);
  const postRef = courseRef.collection(subcollection);
  postRef.add(data)
    .then(() => {
      res.send('Post added successfully');
    })
    .catch((error) => {
      res.send(error);
    });
})
app.post('/events',async(req,res)=>{
    try{
      const students=[]
      const data = {title:req.body.title,subtitle:req.body.subtitle,date:req.body.date,img:req.body.img,banner:req.body.banner,details:req.body.details,price:req.body.price,students:students};
      const response = await db.collection("events").doc(req.body.title).set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/technicalblogs',async(req,res)=>{
    try{
      const data = {title:req.body.title,subtitle:req.body.subtitle,date:new Date(),img:req.body.img,details:req.body.details};
      const response = await db.collection("technicalBlog").doc(req.body.title).set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/banners',async(req,res)=>{
    try{
      const data = {title:req.body.title,subtitle:req.body.subtitle,link:req.body.link,type:req.body.type,imgDesk:req.body.imgDesk,imgMob:req.body.imgMob};
      const response = await db.collection("banners").doc().set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/blogs',async(req,res)=>{
    try{
      const data = {title:req.body.title,details:req.body.details,img:req.body.img,author:req.body.author};
      const response = await db.collection("blogs").doc().set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/achievements',async(req,res)=>{
    try{
      const data = {title:req.body.title,subtitle:req.body.subtitle,details:req.body.details,img:req.body.img,date:req.body.date};
      const response = await db.collection("achievements").doc().set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/contactus',async(req,res)=>{
    try{
      const data = {name:req.body.name,email:req.body.email,message:req.body.message,contact:req.body.contact,created_on:new Date()};
      const response = await db.collection("contactus").doc().set(data)
      client.messages.create({
        to: '+919898660970',
        from: '+14406368399',
        body: `<br/>Name :${data.name},<br/>Email : ${data.email},<br/>Contact : ${data.contact},<br/>message:${data.message}`
      })
      res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/login',async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        admin.auth().signInWithEmailAndPassword({email:email, password:password})
            .then(userCredential => {
            // User is signed in.
            const user = userCredential.user;
            console.log(`User ${user.uid} is signed in.`);
            })
            .catch(error => {
              console.error(`Error authenticating user: ${error}`);
            });
        res.send(userRecord)
    } catch (error) {
        res.send(error)
    }
})
app.post('/users',async(req,res)=>{
    try{
        const data = {name:req.body.name,college:req.body.college , email:req.body.email,contact:req.body.contact,year:req.body.year,address:req.body.address,created_on:new Date()};
        const email = req.body.email
        const password = req.body.password
        const name = req.body.name
        await admin.auth().createUser({
            email: email,
            password: password,
            displayName:name
          })
          
          const response = await db.collection("users").doc(req.body.email).set(data)
          res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/newsletter',async(req,res)=>{
    try{
          const email = req.body.email;          
          const response = await db.collection("newsletter").doc(email).set({email,created_on:new Date()})
          if (response) {
            res.status(200).send(response)
          }else{
            res.status(400).send("Internal Error")
          }
    }catch(err){
        res.send(err)
    }
})
app.get('/getnewsletters',async(req,res)=>{
  try{
    const blogs =  db.collection("newsletter");
    const data = await blogs.get();
    const blogArray = [];
    if(data.empty) {
        res.status(404).send('No email found');
    }else {
        data.forEach(doc => {
            blogArray.push(doc.data().email);
        });
        res.send(blogArray);
    }
}catch(err){
    res.send(err)
}
})
app.get('/getcourses',async(req,res)=>{
  const coursesRef = db.collection('courses');
  try {
      const coursesData = [];
      // Query the "courses" collection
      const coursesSnapshot = await coursesRef.get();
      // Iterate through each course document
      const coursePromises = coursesSnapshot.docs.map(async (courseDoc) => {
      // Get data from the course document
      const courseData = courseDoc.data();
      // Query the "videos" subcollection for this course
      const videosSnapshot = await courseDoc.ref.collection('videos').get();
      // Add video data to the course data object
      courseData.videos = [];
      videosSnapshot.forEach((videoDoc) => {
        courseData.videos.push(videoDoc.data());
      });
      // Query the "materail" subcollection for this course
      const materailsSnapshot = await courseDoc.ref.collection('materials').get();
      // Add video data to the course data object
      courseData.materials = [];
      materailsSnapshot.forEach((matDoc) => {
        courseData.materials.push(matDoc.data());
      });
      // Query the "assignments" subcollection for this course
      const assignmentsSnapshot = await courseDoc.ref.collection('assignments').get();
      // Add assignment data to the course data object
      courseData.assignments = [];
      assignmentsSnapshot.forEach((assignmentDoc) => {
        courseData.assignments.push(assignmentDoc.data());
      });
      // Query the "faqs" subcollection for this course
      const faqSnapshot = await courseDoc.ref.collection('faqs').get();
      // Add faqs data to the course data object
      courseData.faqs = [];
      faqSnapshot.forEach((faqDoc) => {
        courseData.faqs.push(faqDoc.data());
      });
      // Add the course data to the response array
      coursesData.push(courseData);
    });

    await Promise.all(coursePromises);
    // Send the course data in the response
    res.status(200).send(coursesData);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving courses');
  }
})
app.get('/getcoursescategory/:category',async(req,res)=>{
  const coursesRef = db.collection('courses');
  const category = req.params.category;
  try {
      const coursesData = [];
      // Query the "courses" collection
      const coursesSnapshot = await coursesRef.get();
      // Iterate through each course document
      const coursePromises = coursesSnapshot.docs.map(async (courseDoc) => {
      // Get data from the course document
      const courseData = courseDoc.data();
      // Query the "videos" subcollection for this course
      if(courseData.category===category){
        const videosSnapshot = await courseDoc.ref.collection('videos').get();
        // Add video data to the course data object
        courseData.videos = [];
        videosSnapshot.forEach((videoDoc) => {
          courseData.videos.push(videoDoc.data());
        });
        // Query the "faqs" subcollection for this course
        const faqSnapshot = await courseDoc.ref.collection('faqs').get();
        // Add faqs data to the course data object
        courseData.faqs = [];
        faqSnapshot.forEach((faqDoc) => {
          courseData.faqs.push(faqDoc.data());
        });
        // Query the "videos" subcollection for this course
        const materailsSnapshot = await courseDoc.ref.collection('materials').get();
        // Add video data to the course data object
        courseData.materials = [];
        materailsSnapshot.forEach((matDoc) => {
          courseData.materials.push(matDoc.data());
        });
        // Query the "assignments" subcollection for this course
        const assignmentsSnapshot = await courseDoc.ref.collection('assignments').get();
        // Add assignment data to the course data object
        courseData.assignments = [];
        assignmentsSnapshot.forEach((assignmentDoc) => {
          courseData.assignments.push(assignmentDoc.data());
        });
      // Add the course data to the response array
      coursesData.push(courseData);
    }
    });

    await Promise.all(coursePromises);
    // Send the course data in the response
    res.status(200).send(coursesData);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving courses');
  }
})
app.get('/getinternships',async(req,res)=>{
  const internshipsRef = db.collection('internships');
  try {
      const internshipsData = [];
      const internshipsSnapshot = await internshipsRef.get();
      // Iterate through each internship document
      const internshipPromises = internshipsSnapshot.docs.map(async (internshipDoc) => {
      // Get data from the internship document
      const internshipData = internshipDoc.data();
      // Query the "faqs" subcollection for this internship
      const faqSnapshot = await internshipDoc.ref.collection('faqs').get();
      // Add faqs data to the internship data object
      internshipData.faqs = [];
      faqSnapshot.forEach((faqDoc) => {
        internshipData.faqs.push(faqDoc.data());
      });
      // Add the internship data to the response array
      internshipsData.push(internshipData);
    });

    await Promise.all(internshipPromises);
    // Send the internship data in the response
    res.status(200).send(internshipsData);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving internships');
  }
})
app.get('/getevents',async(req,res)=>{
    try{
        const events =  db.collection("events").orderBy("date","desc");
        const data = await events.get();
        const eventArray = [];
        if(data.empty) {
            res.status(404).send('No Event record found');
        }else {
            data.forEach(doc => {
                const event = new Event(
                    doc.id,
                    doc.data().past,
                    doc.data().title,
                    doc.data().subtitle, 
                    doc.data().price,
                    doc.data().date,
                    doc.data().details,
                    doc.data().img,
                    doc.data().banner,
                    doc.data().students
                );
                eventArray.push(event);
            });
            res.send(eventArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/gettechnicalblogs',async(req,res)=>{
    try{
        const blogs =  db.collection("technicalBlog").orderBy('date','desc');
        const data = await blogs.get();
        const blogArray = [];
        if(data.empty) {
            res.status(404).send('No Blog record found');
        }else {
            data.forEach(doc => {
                const blog = new TechnicalBlog(
                    doc.id,
                    doc.data().title,
                    doc.data().subtitle, 
                    doc.data().date,
                    doc.data().details,
                    doc.data().img,
                );
                blogArray.push(blog);
            });
            res.send(blogArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getbanners',async(req,res)=>{
    try{
        const banners =  db.collection("banners");
        const data = await banners.get();
        const bannerArray = [];
        if(data.empty) {
            res.status(404).send('No Banner record found');
        }else {
            data.forEach(doc => {
                const banner = new Banner(
                    doc.id,
                    doc.data().title,
                    doc.data().subtitle,
                    doc.data().type,
                    doc.data().imgDesk,
                    doc.data().imgMob,
                );
                bannerArray.push(banner);
            });
            res.send(bannerArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getblogs',async(req,res)=>{
    try{
        const blogs =  db.collection("blogs");
        const data = await blogs.get();
        const blogArray = [];
        if(data.empty) {
            res.status(404).send('No Blogs record found');
        }else {
            data.forEach(doc => {
                const blog = new Blog(
                    doc.id,
                    doc.data().title,
                    doc.data().author,
                    doc.data().date,
                    doc.data().details,
                    doc.data().img,
                );
                blogArray.push(blog);
            });
            res.send(blogArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getachievements',async(req,res)=>{
    try{
        const achievement =  db.collection("achievements");
        const data = await achievement.get();
        const achievementArray = [];
        if(data.empty) {
            res.status(404).send('No Achievements record found');
        }else {
            data.forEach(doc => {
                const achievement = new Achievements(
                    doc.id,
                    doc.data().title,
                    doc.data().subtitle,
                    doc.data().details,
                    doc.data().date,
                    doc.data().img,
                );
                achievementArray.push(achievement);
            });
            res.send(achievementArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getcontactus',async(req,res)=>{
    try{
        const contact =  db.collection("contactus");
        const data = await contact.get();
        const contactArray = [];
        if(data.empty) {
            res.status(404).send('No Contact record found');
        }else {
            data.forEach(doc => {
                const contact = new Contact(
                    doc.id,
                    doc.data().name,
                    doc.data().email,
                    doc.data().contact,
                    doc.data().message,
                );
                contactArray.push(contact);
            });
            res.send(contactArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getusers',async(req,res)=>{
    try{
        const users =  db.collection("users").orderBy('created_on','desc');
        const data = await users.get();
        const userArray = []; 
        if(data.empty) {
            res.status(404).send('No Event record found');
        }else {
            data.forEach(doc => {
                const user = new User(
                    doc.id,
                    doc.data().email,
                    doc.data().name,
                    doc.data().college, 
                    doc.data().contact,
                    doc.data().address,
                    doc.data().year
                );
                userArray.push(user);
            });
            res.send(userArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getcourse/:id',async(req,res)=>{
  try {
    const coursesRef = db.collection('courses');
    const courseId = req.params.id;
    const courseDoc = await coursesRef.doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const courseData = courseDoc.data();
    // Add sub-collections data to courseData
        // Get sub-collection data and add it to courseData
        const videosSnap = await courseDoc.ref.collection('videos').get();
        const videosData = videosSnap.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        courseData.videos = videosData;
    
        const assignmentsSnap = await courseDoc.ref.collection('assignments').get();
        const assignmentsData = assignmentsSnap.docs.map(doc => {
          return {
          id: doc.id,
          ...doc.data()
        };});
        courseData.assignments = assignmentsData;
    
        const materialsSnap = await courseDoc.ref.collection('materials').get();
        const materialsData = materialsSnap.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        courseData.materials = materialsData;

        const faqsSnap = await courseDoc.ref.collection('faqs').get();
        const faqsData = faqsSnap.docs.map(doc => {
          return {
          id: doc.id,
          ...doc.data()
        };});
        courseData.faqs = faqsData;
    res.json(courseData);
  } catch (error) {
    res.send(error)
  }
})
app.get('/getuser/:id',async(req,res)=>{
  try{
      const userById =  db.collection("users").doc(req.params.id);
      const data = await userById.get();
      if(!data.exists) {
          res.status(404).send('No user record found');
      }else {
          res.send(data.data());
      }
  }catch(err){
      res.send(err)
  }
})
app.get('/getinternship/:id',async(req,res)=>{
  try {
    const internshipsRef = db.collection('internships');
    const internshipId = req.params.id;
    const internshipDoc = await internshipsRef.doc(internshipId).get();
    if (!internshipDoc.exists) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    const internshipData = internshipDoc.data();
    // Get sub-collection data and add it to internshipData
    const faqsSnap = await internshipDoc.ref.collection('faqs').get();
    const faqsData = faqsSnap.docs.map(doc => {
      return {
      id: doc.id,
      ...doc.data()
    };});
    internshipData.faqs = faqsData;
    res.json(internshipData);   
  } catch (error) {
    res.send(error)
  }
})
app.get('/getevent/:id',async(req,res)=>{
  try{
      const eventById =  db.collection("events").doc(req.params.id);
      const data = await eventById.get();
      if(!data.exists) {
          res.status(404).send('No course record found');
      }else {
          res.send(data.data());
      }
  }catch(err){
      res.send(err)
  }
})
app.get('/gettechnicalblog/:id',async(req,res)=>{
  try{
      const blog =  db.collection("technicalBlog").doc(req.params.id);
      const data = await blog.get();
      if(!data.exists) {
          res.status(404).send('No Blog record found');
      }else {
          res.send(data.data());
      }
  }catch(err){
      res.send(err)
  }
})
app.get('/getbanner/:id',async(req,res)=>{
  try{
      const blog =  db.collection("banners").doc(req.params.id);
      const data = await blog.get();
      if(!data.exists) {
          res.status(404).send('No Banner record found');
      }else {
          res.send(data.data());
      }
  }catch(err){
      res.send(err)
  }
})
app.get('/getachievement/:id',async(req,res)=>{
  try{
      const achievement =  db.collection("achievements").doc(req.params.id);
      const data = await achievement.get();
      if(!data.exists) {
          res.status(404).send('No Achievement record found');
      }else {
          res.send(data.data());
      }
  }catch(err){
      res.send(err)
  }
})
app.get('/getblog/:id',async(req,res)=>{
  try{
      const blog =  db.collection("blogs").doc(req.params.id);
      const data = await blog.get();
      if(!data.exists) {
          res.status(404).send('No Blog record found');
      }else {
          res.send(data.data());
      }
  }catch(err){
      res.send(err)
  }
})
app.put('/updatecourse/:id',async(req,res)=>{
    try{
      const data = req.body;  
      const course =  db.collection("courses").doc(req.params.id);
      await course.update(data);
      res.send('course record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.put('/updateinternship/:id',async(req,res)=>{
    try{
        const data = req.body; 
        const internship =  db.collection("internships").doc(req.params.id);
        await internship.update(data);
        res.send('course record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.put('/updateevent/:id',async(req,res)=>{
    try{
        const data = req.body; 
        const event =  db.collection("events").doc(req.params.id);
        await event.update(data);
        res.send('events record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.put('/updatetechnicalblog/:id',async(req,res)=>{
    try{
        const data = req.body; 
        const blog =  db.collection("technicalBlog").doc(req.params.id);
        await blog.update(data);
        res.send('Blog record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.put('/updatebanner/:id',async(req,res)=>{
    try{
        const data = req.body; 
        const banner =  db.collection("banners").doc(req.params.id);
        await banner.update(data);
        res.send('Banner record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.put('/updateachievement/:id',async(req,res)=>{
    try{
        const data = req.body; 
        const banner =  db.collection("achievements").doc(req.params.id);
        await banner.update(data);
        res.send('Achievemt record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.put('/updateblog/:id',async(req,res)=>{
    try{
        const data = req.body; 
        const blog =  db.collection("blogs").doc(req.params.id);
        await blog.update(data);
        res.send('Blog record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.put('/updateuser/:id',async(req,res)=>{
    try{
        const data = req.body; 
        const user =  db.collection("users").doc(req.params.id);
        await user.update(data);
        res.send('users record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.put('/updatecoursedata/:collectionId/:subcollectionId/:documentId', async (req, res) => {
  const collectionId = req.params.collectionId;
  const subcollectionId = req.params.subcollectionId;
  const documentId = req.params.documentId;
  const data = req.body; // Updated data for the document
  try {
    const collectionRef = admin.firestore().collection('courses');
    const subcollectionRef = collectionRef.doc(collectionId).collection(subcollectionId);
    await subcollectionRef.doc(documentId).update(data); // Update the specific document in the subcollection
    res.status(200).send('Document updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating document');
  }
});
app.delete('/deletecoursedata/:collectionId/:subcollectionId/:documentId', async (req, res) => {
  const collectionId = req.params.collectionId;
  const subcollectionId = req.params.subcollectionId;
  const documentId = req.params.documentId;
  try {
    const collectionRef = admin.firestore().collection("courses");
    const subcollectionRef = collectionRef.doc(collectionId).collection(subcollectionId);
    await subcollectionRef.doc(documentId).delete(); // Delete the specific document in the subcollection
    res.status(200).send('Document deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting document');
  }
});
app.put('/updateinternshipdata/:collectionId/:subcollectionId/:documentId', async (req, res) => {
  const collectionId = req.params.collectionId;
  const subcollectionId = req.params.subcollectionId;
  const documentId = req.params.documentId;
  const data = req.body; // Updated data for the document
  try {
    const collectionRef = admin.firestore().collection('internships');
    const subcollectionRef = collectionRef.doc(collectionId).collection(subcollectionId);
    await subcollectionRef.doc(documentId).update(data); // Update the specific document in the subcollection
    res.status(200).send('Document updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating document');
  }
});
app.delete('/deleteinternshipdata/:collectionId/:subcollectionId/:documentId', async (req, res) => {
  const collectionId = req.params.collectionId;
  const subcollectionId = req.params.subcollectionId;
  const documentId = req.params.documentId;
  try {
    const collectionRef = admin.firestore().collection("internships");
    const subcollectionRef = collectionRef.doc(collectionId).collection(subcollectionId);
    await subcollectionRef.doc(documentId).delete(); // Delete the specific document in the subcollection
    res.status(200).send('Document deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting document');
  }
});
app.delete('/deletecourse/:id',async(req,res)=>{
    try{
        await db.collection("courses").doc(req.params.id).delete();
        const myCollection = db.collection("subscribecourse");
        // Query all documents in the collection
        myCollection.get().then((querySnapshot) => {
          // Iterate over each document in the collection
          querySnapshot.forEach((doc) => {
            const myArray = doc.data().subscribedCourses;
            const myImageArray = doc.data().courseImage;
            const removedElements = myArray.filter((element) => !element.includes(req.params.id));
            const index = myArray
                .map((element, index) => (element.includes(req.params.id) ? index : -1))
                .filter((index) => index !== -1);
            if (index.length == 1) {
              myImageArray.splice(index[0], 1);
            }
            myCollection.doc(doc.id).update({courseImage:myImageArray,subscribedCourses: removedElements });
          });
        });
        
        res.send('course record deleted successfuly');
    }catch(err){
        res.send(err)
    }
})
app.delete('/deleteinternship/:id',async(req,res)=>{
    try{
        await db.collection("internships").doc(req.params.id).delete();
        const myCollection = db.collection("subscribeinternship");
        // Query all documents in the collection
        myCollection.get().then((querySnapshot) => {
          // Iterate over each document in the collection
          querySnapshot.forEach((doc) => {
            const myArray = doc.data().subscribedInternships;            
            const removedElements = myArray.filter((element) => !element.includes(req.params.id));
            myCollection.doc(doc.id).update({subscribedInternships: removedElements });
          });
        });
        res.send('internship record deleted successfuly');
    }catch(err){
        res.send(err)
    }
})
app.delete('/deleteevent/:id',async(req,res)=>{
    try{
        await db.collection("events").doc(req.params.id).delete();
        const myCollection = db.collection("subscribeevent");
        // Query all documents in the collection
        myCollection.get().then((querySnapshot) => {
          // Iterate over each document in the collection
          querySnapshot.forEach((doc) => {
            const myArray = doc.data().subscribedEvents;
            const myImageArray = doc.data().eventImage;
            const myIdArray = doc.data().registrationId;
            const removedElements = myArray.filter((element) => !element.includes(req.params.id));
            const index = myArray
                .map((element, index) => (element.includes(req.params.id) ? index : -1))
                .filter((index) => index !== -1);
            if (index.length == 1) {
              myImageArray.splice(index[0], 1);
              myIdArray.splice(index[0], 1);
            }
            myCollection.doc(doc.id).update({eventImage:myImageArray,subscribedEvents: removedElements,registrationId:myIdArray });
          });
        });
        res.send('event record deleted successfuly');
    }catch(err){
        res.send(err)
    } 
})
app.delete('/deletetechnicalblog/:id',async(req,res)=>{
    try{
        await db.collection("technicalBlog").doc(req.params.id).delete();
        res.send('Blog record deleted successfuly');
    }catch(err){
        res.send(err)
    } 
})
app.delete('/deletebanner/:id',async(req,res)=>{
    try{
        await db.collection("banners").doc(req.params.id).delete();
        res.send('Banner record deleted successfuly');
    }catch(err){
        res.send(err)
    } 
})
app.delete('/deleteblog/:id',async(req,res)=>{
    try{
        await db.collection("blogs").doc(req.params.id).delete();
        res.send('Blog record deleted successfuly');
    }catch(err){
        res.send(err)
    } 
})
app.delete('/deleteachievement/:id',async(req,res)=>{
    try{
        await db.collection("achievements").doc(req.params.id).delete();
        res.send('Achievement record deleted successfuly');
    }catch(err){
        res.send(err)
    } 
})
app.delete('/deletecontact/:id',async(req,res)=>{
    try{
        await db.collection("contactus").doc(req.params.id).delete();
        res.send('Contact record deleted successfuly');
    }catch(err){
        res.send(err)
    } 
})
app.post('/submittedassignment/:userId',async (req, res) => {
  const userId = req.params.userId;  
  try { 
    const data = {assignment:req.body.assignment ,user:userId,submitted_on:new Date(),course:req.body.course,que_name:req.body.que_name,name:req.body.name};
    const response = await db.collection("submittedassignment").doc().set(data)
    res.status(200).send(response);       
  } catch (error) {   
    console.error(error); 
    res.status(500).send(error);
  }
});
app.get('/getsubmittedassignment/:userId',async (req, res) => {
  try { 
    const userId = req.params.userId;
    const assignment =  db.collection("submittedassignment").orderBy('submitted_on','desc');
      const data = await assignment.get();
      const document = [] 
          data.forEach((data)=>{
            if(data.data().user===userId){
              document.push(data.data())
            }
          })
          res.send(document);
      // }      
  } catch (error) {
    console.error(error); 
    res.status(500).send(error);
  }
});
app.get('/getsubmittedassignment',async (req, res) => {
  try { 
    const { userId,course,name } = req.query;
    const assignment =  db.collection("submittedassignment").orderBy('submitted_on','desc');
      const data = await assignment.get();
      const document = [] 
      data.forEach((data)=>{  
        console.log(name,data.data())
        if(data.data().user===userId && data.data().course===course && data.data().name===name){
              document.push(data.data())
            }
          })
          res.send(document);
      // }      
  } catch (error) {
    console.error(error); 
    res.status(500).send(error);
  }
});
app.get('/getsubmittedassignments',async (req, res) => {
  try { 
    const assignment =  db.collection("submittedassignment").orderBy('submitted_on','desc');
      const data = await assignment.get();
      const document = []
      // if(!data.exists) {
      //     res.status(404).send('No assignment record found');
      // }else {
          data.forEach((data)=>{
            document.push(data.data())
          })
          res.send(document);
      // }      
  } catch (error) {
    console.error(error); 
    res.status(500).send(error);
  }
});
// To send the request for the offline payment
app.post('/offlinepayment/:email',async (req,res)=>{
  try{
    const email = req.params.email;
    const courseId = req.body.courseId;
    const type  = req.body.type;
    const courseimage = req.body.courseimage;
    const data = { email:email,courseId:courseId,type:type,courseimage:courseimage,status:"Pending",created_on:new Date()};
    try {
      const response = await db.collection("requests").doc().set(data)
      res.send(response)
    } catch (error) {
      res.status(404).send("Check the Field Names Properly");
    }
  }catch(err){
    res.send(err)
  }
});
app.get('/getrequests',async (req,res)=>{
  try{
    const blog =  db.collection("requests").orderBy("created_on","desc");
    const data = await blog.get();
    const blogArray = [];
    if(data.empty) {
        res.status(404).send('No email found');
    }else {
        data.forEach(doc => {
            const response = doc.data();
            response.id = doc.id;
            blogArray.push(response);
        });
        res.send(blogArray);
    }
  }catch(err){
      res.send(err)
  }
});
app.get('/getrequest/:id',async (req,res)=>{
  try{
    const blog =  db.collection("requests").doc(req.params.id);
    const data = await blog.get();
    if(!data.exists) {
      res.status(404).send('No course record found');
    }else {
      const response = data.data();
      response.id = data.id;
      res.send(response);
    }
  }catch(err){
      res.send(err)
  }
});
app.put('/updaterequest/:id',async(req,res)=>{
  try{
      const data = req.body; 
      const request =  db.collection("requests").doc(req.params.id);
      await request.update(data);
      res.send('Request record updated successfuly');
  }catch(err){
      res.send(err)
  }
})
app.put('/subscribedcourse/:userId',async (req, res) => {
  // const userId = req.params.userId;     
  const type = req.body.type; 
  const courseId = req.body.courseId; 
  const courses =[courseId+" "+type]
  const { userId } = req.params;
  const imageId = req.body.courseimage;
  // const { courses } = req.body;

  try {
    // Check if user exists in Firestore
    const userRef = admin.firestore().collection('subscribecourse').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user document if it does not exist
      await userRef.set({ subscribedCourses: [] });
      await userRef.set({ courseImage: [] });
    }

    // Get current subscribedCourses array for the user
    const subscribedCourses = userDoc.exists ? userDoc.data().subscribedCourses : [];
    const courseImage = userDoc.exists ? userDoc.data().courseImage : [];

    // Add new courses to subscribedCourses array
    courses.forEach(course => {
      if (!subscribedCourses.includes(course)) {
        subscribedCourses.push(course);
        courseImage.push(imageId);
      }
    });

    // Update subscribedCourses array in Firestore
    await userRef.update({ subscribedCourses });
    await userRef.update({ courseImage });
    await db.collection('courses').doc(courseId).update({
      students: admin.firestore.FieldValue.arrayUnion(userId)
    })
    res.status(200).json({ message: 'Subscribed courses updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating subscribed courses' });
  }

});
app.get('/getsubscribedcourses/:userId',async (req, res) => {
  try {
    const userDoc = await db.collection('subscribecourse').doc(req.params.userId).get();
    const subscribecourse = userDoc.data();
    res.status(200).send(subscribecourse);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching subscribed users for internship');
  }
});  
app.post('/subscribedevent/:userId',async (req, res) => {
  const eventId = req.body.eventId; 
  const imageId = req.body.eventimage;
  const name = req.body.name;
  const contact = req.body.contact;
  const id = generateEventId("TIH", eventId)
  const { userId } = req.params;
  const eventregis = userId+"-"+id;
  try {
    // Check if user exists in Firestore
    const userRef = admin.firestore().collection('subscribeevent').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      // Create new user document if it does not exist
      await userRef.set({ subscribedEvents: [] });
      await userRef.set({eventimage:[]});
      await userRef.set({registrationId:[]});
    }
    // Get current subscribedCourses array for the user
    const subscribedEvents = userDoc.exists ? userDoc.data().subscribedEvents : [];
    const eventImage = userDoc.exists ? userDoc.data().eventImage : [];
    const registrationId = userDoc.exists ? userDoc.data().registrationId : [];
    await db.collection('subscribeevent').doc(userId).set({name:name,contact:contact,email:userId}) 
    // Add new courses to subscribedCourses array
    subscribedEvents.push(eventId);
    eventImage.push(imageId);
    registrationId.push(id)
    // Update subscribedCourses array in Firestore
    await userRef.update({ subscribedEvents});
    await userRef.update({ eventImage});
    await userRef.update({ registrationId});
    await db.collection('events').doc(eventId).update({
      students: admin.firestore.FieldValue.arrayUnion(eventregis)
    })
    res.status(200).json({ message: 'Subscribed event updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating subscribed event' });
  }finally{
    {
      
      let mailOptions = {
        from: 'cbhanderi666@gmail.com',
        to: userId,
        subject: 'Successdfully Registering in event',
        text:`Dear ${userId}, 

        Thank you for registering for ${eventId}! We are excited to have you join us for this event.
        
        Your event ID for ${eventId} is: ${id}
        
        Please make sure to bring this ID with you to the event. It will be required for check-in and to access certain parts of the event.
        
        If you have any questions or concerns, please feel free to contact us at technoithub@gmail.com.
        
        We look forward to seeing you at ${eventId}!
        
        Best regards,
        Techno It Hub`
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      
    }
  }
});
app.get('/getsubscribedevents/:userId',async (req, res) => {
  try {
    const userDoc = await db.collection('subscribeevent').doc(req.params.userId).get();
    const subscribeevent = userDoc.data();
    res.status(200).send(subscribeevent);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching subscribed users for event');
  }
});
app.post('/subscribedinternship/:userId',async (req, res) => {
  const type = req.body.type; 
  const resume = req.body.resume; 
  const name = req.body.name;
  const contact = req.body.contact;
  const internshipId = req.body.internshipId; 
  const internships =[internshipId+" "+type]
  const { userId } = req.params;

  try {
    // Check if user exists in Firestore
    const userRef = admin.firestore().collection('subscribeinternship').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user document if it does not exist
      await userRef.set({ subscribedInternships: [],name:"",contact:"",resume:"" });
    }

    const subscribedInternships = userDoc.exists ? userDoc.data().subscribedInternships : [];
    await db.collection('subscribeinternship').doc(userId).set({name:name,resume:resume,contact:contact}) 
    internships.forEach(internship => {
      if (!subscribedInternships.includes(internship)) {
        subscribedInternships.push(internship);
      }
    });

    await userRef.update({ subscribedInternships });
    await db.collection('internships').doc(internshipId).update({
      students: admin.firestore.FieldValue.arrayUnion(userId)
    })
    res.status(200).json({ message: 'Subscribed Internship updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating subscribed internships' });
  }
  });
app.get('/getsubscribedcourses/:userId',async (req, res) => {
  try {
    const userDoc = await db.collection('subscribecourse').doc(req.params.userId).get();
    const subscribecourse = userDoc.data();
    res.status(200).send(subscribecourse);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching subscribed users for internship');
  }
});
app.get('/getsubscribedinternship/:userId',async (req, res) => {
  try {
    const userDoc = await db.collection('subscribeinternship').doc(req.params.userId).get();
    const subscribeinternship = userDoc.data();
    res.status(200).send(subscribeinternship);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching subscribed users for internship');
  }
});
app.post('/filecourses', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;  
      // Upload the file to Firebase Storage
      const folderName = 'Course';
      const bucket = admin.storage().bucket();
      const fileName = `${folderName}/${file.originalname}`;
      const fileUpload = bucket.file(fileName);
    
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });
    
      blobStream.on('error', (error) => {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file.' });
      });
    
      blobStream.on('finish', () => {
        // Generate download URL for the file
        fileUpload.getSignedUrl({
          action: 'read',
          expires: '03-01-2500' // Adjust the expiration date as needed
        }).then((signedUrls) => {
          const downloadUrl = signedUrls[0];
          res.status(200).json({ downloadUrl });
        }).catch((error) => {
          res.status(500).json({error});
        });
      });
    
      blobStream.end(file.buffer);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Server error');
    } 
  }); 
app.post('/fileinternship', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;  
      // Upload the file to Firebase Storage
      const folderName = 'Internship';
      const bucket = admin.storage().bucket();
      const fileName = `${folderName}/${file.originalname}`;
      const fileUpload = bucket.file(fileName);
    
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });
    
      blobStream.on('error', (error) => {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file.' });
      });
    
      blobStream.on('finish', () => {
        // Generate download URL for the file
        fileUpload.getSignedUrl({
          action: 'read',
          expires: '03-01-2500' // Adjust the expiration date as needed
        }).then((signedUrls) => {
          const downloadUrl = signedUrls[0];
          res.status(200).json({ downloadUrl });
        }).catch((error) => {
          res.status(500).json({error});
        });
      });
    
      blobStream.end(file.buffer);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Server error');
    } 
  }); 
app.post('/fileevent', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;  
    // Upload the file to Firebase Storage
    const folderName = 'Event';
    const bucket = admin.storage().bucket();
    const fileName = `${folderName}/${file.originalname}`;
    const fileUpload = bucket.file(fileName);
  
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });
  
    blobStream.on('error', (error) => {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file.' });
    });
  
    blobStream.on('finish', () => {
      // Generate download URL for the file
      fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Adjust the expiration date as needed
      }).then((signedUrls) => {
        const downloadUrl = signedUrls[0];
        res.status(200).json({ downloadUrl });
      }).catch((error) => {
        res.status(500).json({error});
      });
    });
  
    blobStream.end(file.buffer);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Server error');
    } 
  }); 
const PORT = process.env.PORT || 8000;
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`) 
})