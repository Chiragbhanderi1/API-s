const express = require('express');
const app  = express();
const Course = require('./modals/course');
const Interships = require('./modals/intership');
const Event = require('./modals/event');
const User = require('./modals/user');
const admin = require('firebase-admin');
const credentials = require("./key.json");
const multer = require('multer')
const cors = require('cors')
app.use(cors());
admin.initializeApp({
    credential:admin.credential.cert(credentials),
    storageBucket: 'gs://internship-project-57ed0.appspot.com',
})
const bucket = admin.storage().bucket();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB file size limit
    },
  });
const db =  admin.firestore();

app.use(express.json())
app.use(express.urlencoded({extended:true}))



app.post('/courses',async(req,res)=>{
    try{
      const data = req.body;
      const response = await db.collection("courses").doc(req.body.title).set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/interships',async(req,res)=>{
    try{
      const data = req.body;
      const response = await db.collection("interships").doc(req.body.title).set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/events',async(req,res)=>{
    try{
      const data = req.body;
      const response = await db.collection("events").doc(req.body.title).set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/users',async(req,res)=>{
    try{
      const data = req.body;
      const response = await db.collection("users").doc(req.body.email).set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.get('/getcourses',async(req,res)=>{
    try{
        const courses =  db.collection("courses");
        const data = await courses.get();
        const coursesArray = [];
        if(data.empty) {
            res.status(404).send('No student record found');
        }else {
            data.forEach(doc => {
                const course = new Course(
                    doc.id,
                    doc.data().title,
                    doc.data().subtitle,
                    doc.data().price, 
                    doc.data().details,
                    doc.data().duration,
                    doc.data().benifits,
                    doc.data().img,
                    doc.data().materails,
                    doc.data().videos,
                    doc.data().assignment
                );
                coursesArray.push(course);
            });
            res.send(coursesArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getinterships',async(req,res)=>{
    try{
        const interships =  db.collection("interships");
        const data = await interships.get();
        const intershipsArray = [];
        if(data.empty) {
            res.status(404).send('No internship record found');
        }else {
            data.forEach(doc => {
                const intership = new Interships(
                    doc.id,
                    doc.data().title,
                    doc.data().subtitle, 
                    doc.data().details,
                    doc.data().perks,
                    doc.data().price,
                    doc.data().img
                );
                intershipsArray.push(intership);
            });
            res.send(intershipsArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getevents',async(req,res)=>{
    try{
        const events =  db.collection("events");
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
                    doc.data().img
                );
                eventArray.push(event);
            });
            res.send(eventArray);
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getusers',async(req,res)=>{
    try{
        const users =  db.collection("users");
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
    try{
        const courseById =  db.collection("courses").doc(req.params.id);
        const data = await courseById.get();
        if(!data.exists) {
            res.status(404).send('No course record found');
        }else {
            res.send(data.data());
        }
    }catch(err){
        res.send(err)
    }
})
app.get('/getintership/:id',async(req,res)=>{
  try{
      const intershipById =  db.collection("interships").doc(req.params.id);
      const data = await intershipById.get();
      if(!data.exists) {
          res.status(404).send('No course record found');
      }else {
          res.send(data.data());
      }
  }catch(err){
      res.send(err)
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
app.put('/updateintership/:id',async(req,res)=>{
    try{
        const data = req.body; 
        const intership =  db.collection("interships").doc(req.params.id);
        await intership.update(data);
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
        res.send('course record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.delete('/deletecourse/:id',async(req,res)=>{
    try{;
        db.collection("courses").doc(req.params.id).delete();
        res.send('course record deleted successfuly');
    }catch(err){
        res.send(err)
    }
})
app.delete('/deleteintership/:id',async(req,res)=>{
    try{;
        db.collection("interships").doc(req.params.id).delete();
        res.send('course record deleted successfuly');
    }catch(err){
        res.send(err)
    }
})
app.delete('/deleteevent/:id',async(req,res)=>{
    try{;
        db.collection("events").doc(req.params.id).delete();
        res.send('course record deleted successfuly');
    }catch(err){
        res.send(err)
    }
})
app.post('/subscribedcourses/:courseId',async (req, res) => {
  const userId = req.body.userId;  
  const type = req.body.type;
  const courseId = req.params.courseId;
  try {
    // Add the course ID to the user's subscribed courses array
    db.collection('subscribecourse').doc(userId).update({
      subscribedCourses: admin.firestore.FieldValue.arrayUnion(courseId+type)
    });    
      res.status(200).send('User subscribed to internship successfully');       
  } catch (error) {
    console.error(error); 
    res.status(500).send(error);
  }
});
app.get('/getsubscribedcourses/:userId',async (req, res) => {
  try {
    const userDoc = await db.collection('subscribecourse').doc(req.params.userId).get();
    const subscribecourse = userDoc.data();
    res.status(200).send(subscribecourse);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching subscribed users for intership');
  }
});
app.post('/subscribedintership/:internshipId',async (req, res) => {
    const userId = req.body.userId;  
    const type = req.body.type;
    const intershipId = req.params.internshipId;
    try {
      // Add the course ID to the user's subscribed courses array
      db.collection('subscribeintership').doc(userId).update({
        subscribedInterships: admin.firestore.FieldValue.arrayUnion(intershipId+type)
      });    
        res.status(200).send('User subscribed to internship successfully');       
    } catch (error) {
      console.error(error); 
      res.status(500).send(error);
    }
  });
  app.get('/getsubscribedcourses/:userId',async (req, res) => {
    try {
      const userDoc = await db.collection('subscribecourse').doc(req.params.userId).get();
      const subscribecourse = userDoc.data();
      res.status(200).send(subscribecourse);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching subscribed users for intership');
    }
  });
  app.get('/getsubscribedintership/:userId',async (req, res) => {
    try {
      const userDoc = await db.collection('subscribeintership').doc(req.params.userId).get();
      const subscribeintership = userDoc.data();
      res.status(200).send(subscribeintership);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching subscribed users for intership');
    }
  });
app.post('/file', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send('No file uploaded');
      }
      const filename = `intership/${file.originalname}`;
      const fileRef = bucket.file(filename);
      const options = {
        metadata: {
          contentType: file.mimetype,
        },
      };
      await fileRef.save(file.buffer, options);
      const downloadUrl = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-17-2035', // Replace with your desired expiration date
      });
      return res.send({success:"File uploaded",downloadUrl});
    } catch (err) {
      console.error(err);
      return res.status(500).send('Server error');
    } 
  }); 
app.get('/file/:filename', (req, res) => { 
    const filename = req.params.filename;
    const file = bucket.file(filename);
  
    try {
      const stream = file.createReadStream();
      stream.on('error', err => {
        console.log(err)
        res.status(404).send('File not found');
      });
      stream.pipe(res);
    } catch (err) {
      res.status(500).send('Server error');
    }
  });
const PORT = process.env.PORT || 8000;
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`) 
})