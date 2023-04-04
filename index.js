const express = require('express');
const app  = express();
const Course = require('./modals/course');
const Interships = require('./modals/intership');
const Event = require('./modals/event');
const TechnicalBlog = require('./modals/technicalBlog')
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
      const students=[]
      const data = {
                    title:req.body.title,
                    price:req.body.price,
                    subtitle:req.body.subtitle,
                    details:req.body.details,
                    benifits:req.body.benifits,
                    videos:req.body.videos,
                    assignments:req.body.assignments,
                    duration:req.body.duration,
                    materails:req.body.materails,
                    videos:req.body.videos,
                    img:req.body.img,
                    students:students,
                    created_on:new Date()
                  };
      const response = await db.collection("courses").doc(req.body.title).set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/interships',async(req,res)=>{
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
      const response = await db.collection("interships").doc(req.body.title).set(data)
        res.send(response)
    }catch(err){
        res.send(err)
    }
})
app.post('/events',async(req,res)=>{
    try{
      const students=[]
      const data = {title:req.body.title,subtitle:req.body.subtitle,date:req.body.date,img:req.body.img,details:req.body.details,price:req.body.price,students:students};
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
app.get('/getcourses',async(req,res)=>{
    try{
        const courses =  db.collection("courses").orderBy("created_on",'desc');
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
                    doc.data().assignment,
                    doc.data().students
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
        const interships =  db.collection("interships").orderBy("created_on",'desc');
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
                    doc.data().img,
                    doc.data().students
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
        res.send('internship record deleted successfuly');
    }catch(err){
        res.send(err)
    }
})
app.delete('/deleteevent/:id',async(req,res)=>{
    try{;
        db.collection("events").doc(req.params.id).delete();
        res.send('event record deleted successfuly');
    }catch(err){
        res.send(err)
    } 
})
app.delete('/deletetechnicalblog/:id',async(req,res)=>{
    try{;
        db.collection("technicalBlog").doc(req.params.id).delete();
        res.send('Blog record deleted successfuly');
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
    const { userId, course,name } = req.query;
    const assignment =  db.collection("submittedassignment").orderBy('submitted_on','desc');
      const data = await assignment.get();
      const document = [] 
      data.forEach((data)=>{ 
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
app.put('/subscribedcourse/:userId',async (req, res) => {
  // const userId = req.params.userId;     
  const type = req.body.type; 
  const courseId = req.body.courseId; 
  const courses =[courseId+" "+type]
  const { userId } = req.params;
  // const { courses } = req.body;

  try {
    // Check if user exists in Firestore
    const userRef = admin.firestore().collection('subscribecourse').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user document if it does not exist
      await userRef.set({ subscribedCourses: [] });
    }

    // Get current subscribedCourses array for the user
    const subscribedCourses = userDoc.exists ? userDoc.data().subscribedCourses : [];

    // Add new courses to subscribedCourses array
    courses.forEach(course => {
      if (!subscribedCourses.includes(course)) {
        subscribedCourses.push(course);
      }
    });

    // Update subscribedCourses array in Firestore
    await userRef.update({ subscribedCourses });
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
    res.status(500).send('Error fetching subscribed users for intership');
  }
});  
app.post('/subscribedevent/:userId',async (req, res) => {
  const userId = req.params.userId;
  const eventId = req.body.eventId;
  const subscribedEvents =[eventId]
  try {
    // Add the event ID to the user's subscribed events array
    db.collection('subscribeevent').doc(userId).get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        db.collection('subscribeevent').doc(userId).onSnapshot((doc) => {
          db.collection('subscribeevent').doc(userId).update({
            subscribedEvents: admin.firestore.FieldValue.arrayUnion(eventId)
          }); 
        });
      } else {
        // create the document
        db.collection('subscribeevent').doc(userId).set({subscribedEvents})
      }
      db.collection('events').doc(eventId).update({
        students: admin.firestore.FieldValue.arrayUnion(userId)
      });
    });
      res.status(200).send('User subscribed to event successfully');       
  } catch (error) {
    console.error(error); 
    res.status(500).send(error);
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
app.post('/subscribedintership/:userId',async (req, res) => {
    const userId = req.params.userId;  
    const type = req.body.type; 
    const name = req.body.name;
    const contact = req.body.contact;
    const intershipId = req.body.internshipId;
    const subscribedInterships =[intershipId+" "+type]
    try {
      // Add the course ID to the user's subscribed courses array
    db.collection('subscribeintership').doc(userId).set({resume:req.body.resume,name:name,contact:contact})
      db.collection('subscribeintership').doc(userId).get()
      .then((docSnapshot) => {
      if (docSnapshot.exists) {
        db.collection('subscribeintership').doc(userId).onSnapshot((doc) => {
          db.collection('subscribeintership').doc(userId).update({
            subscribedInterships: admin.firestore.FieldValue.arrayUnion(intershipId+" "+type)
          }); 
        });
      } else {
        // create the document
        db.collection('subscribeintership').doc(userId).set({subscribedInterships,name:name,contact:contact,resume:req.body.resume,type:type})
      }
    }); 
      
    db.collection('interships').doc(intershipId).update({
      students: admin.firestore.FieldValue.arrayUnion(userId)
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
app.post('/filecourses', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send('No file uploaded');
      }
      const filename = `Courses/${file.originalname}`;
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
app.post('/fileinteship', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send('No file uploaded');
      }
      const filename = `Intership/${file.originalname}`;
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
app.post('/fileevent', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send('No file uploaded');
      }
      const filename = `Event/${file.originalname}`;
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
// app.get('/file/:filename', (req, res) => { 
//     const filename = req.params.filename;
//     const file = bucket.file(filename);
  
//     try {
//       const stream = file.createReadStream();
//       stream.on('error', err => {
//         console.log(err)
//         res.status(404).send('File not found');
//       });
//       stream.pipe(res);
//     } catch (err) {
//       res.status(500).send('Server error');
//     }
//   });
const PORT = process.env.PORT || 8000;
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`) 
})