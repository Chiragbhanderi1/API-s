const express = require('express');
const app  = express();
const Course = require('./modals/course');
const admin = require('firebase-admin');
const credentials = require('./key.json');
const multer = require('multer')

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
      const response = await db.collection("courses").doc().set(data)
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
                    doc.data().course,
                    doc.data().price,
                    doc.data().details,
                    doc.data().benifits
                );
                coursesArray.push(course);
            });
            res.send(coursesArray);
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
app.put('/update/:id',async(req,res)=>{
    try{
        const data = req.body; 
        const course =  db.collection("courses").doc(req.params.id);
        await course.update(data);
        res.send('course record updated successfuly');
    }catch(err){
        res.send(err)
    }
})
app.delete('/delete/:id',async(req,res)=>{
    try{;
        db.collection("courses").doc(req.params.id).delete();
        res.send('course record deleted successfuly');
    }catch(err){
        res.send(err)
    }
})


app.post('/file', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send('No file uploaded');
      }
  
      const filename = `${file.originalname}`;
      const fileRef = bucket.file(filename);
      const options = {
        metadata: {
          contentType: file.mimetype,
        },
      };
      await fileRef.save(file.buffer, options);
  
    //   const downloadUrl = await fileRef.getSignedUrl({
    //     action: 'read',
    //     expires: '03-17-2025', // Replace with your desired expiration date
    //   });
   
      return res.send("photo saved");
    } catch (err) {
      console.error(err);
      return res.status(500).send('Server error');
    } 
  }); 

  app.get('/file/:filename', (req, res) => { // Assuming images are stored in a directory called 'images'
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