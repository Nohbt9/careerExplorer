const express = require("express");
const bodyParser=require("body-parser");
const crypto=require("crypto-js");
const path=require("path");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
const {createUser,authenticate,User,fetchNewsTopics,NewsList,Career}=require("./database");
const cors=require("cors");
const app=express();
app.use(express.static(path.join(__dirname,"dist","assets")));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"dist","index.html"));
});

app.post("/getFullCareer",async (req,res)=>{
    console.log(req.body.id);
  const career= await Career.findOne({_id:req.body.id});
  console.log(career);
res.send(career);
});

app.get("/careers",async (req,res)=>{
const x= await Career.find();
const nx=x.map(({_id,title})=> {return {id:_id,title:title};});
res.send(nx);
});
app.post("/createToken",async (req,res)=>{
    
    
    if( req.body.emailID=="" || req.body.password=="" || req.body.username==""){
     res.send({message:"Empty Field"});
     return;
    }
     var message=await createUser(req.body.username,req.body.emailID,req.body.password);
     console.log(message);
     if(message.code==0){
      var d={...message}
      res.json(d);
      return;
     }
    //  if(message.code==0){
    //   res.cookie(encrypt("username"),,{httpOnly:true});
    //   res.cookie(encrypt("token"),encrypt(jwt.sign({exp:Math.floor(Date.now()/1000)+3600*12*7},process.env.KEY)),{httpOnly:true});
    //  } 
    res.send(message);
});
app.get("/",(req,res)=>{
  res.send("heykdk");
});
function encrypt(data){
return crypto.AES.encrypt(data,process.env.KEY).toString() ;
}
function dcrypt(data){
return crypto.AES.decrypt(data,process.env.KEY).toString(crypto.enc.Utf8);
}
//for sign in createToken&a
app.post("/createToken&a",async (req,res)=>{
  console.log("sign in");
 if(req.body.token==null || req.body.token==undefined){
     const result= await authenticate(req.body.username,req.body.password);
     console.log(result);

     if(result.code){
          const user= await User.findOne({username:req.body.username});
          
            jwt.verify(dcrypt(user.token),process.env.KEY,async (err)=>{
              if(err){
               
                const token=jwt.sign({exp:Math.floor(Date.now()/1000)+3600*12*7},process.env.KEY);
                const etoken=crypto.AES.encrypt(token,process.env.KEY).toString();
                try{
                  await  User.updateOne({username:req.body.username},{token:etoken});
                  await NewsList.updateOne({token:user.token},{token:etoken});
                }catch(e){
                 console.log(e.message);
                }
                res.send({code:0,token:etoken,username:req.body.username});

              }else{
                res.send({token:req.body.token,username:user.token,code:0});
              }
            });
          
     }else{
       res.send({code:1,message:"Invalid credentials"});
     }


     ////** */
//      if(result.code){
//        const token=jwt.sign({exp:Math.floor(Date.now()/1000)+3600*12*7},process.env.KEY);
//        const etoken=crypto.AES.encrypt(token,process.env.KEY).toString();
//        try{
//          await  User.updateOne({username:req.body.username},{token:etoken});
//        }catch(e){
//         console.log(e.message);
//        }
//        res.send({code:0,token:etoken,username:req.body.username});
//      }
//  }else{
//   console.log("second case");
//   jwt.verify(dcrypt(req.body.token),process.env.KEY, async (err)=>{
//     if(err){
//       console.log("expired");
//       const token=jwt.sign({exp:Math.floor(Date.now()/1000)+3600*12*7},process.env.KEY);
//       const etoken=crypto.AES.encrypt(token,process.env.KEY).toString();
//       try{
//         await  User.updateOne({username:req.body.username},{token:etoken});
//         await  NewsList.updateOne({token:req.body.token},{token:etoken});
//       }catch(e){
//        console.log(e.message);
//       }
//       res.send({code:0,token:etoken,username:req.body.username}); 

      
//      }else{
//      // const result=  await  User.findOne({token:req.body.token});
//      const result= await authenticate(req.body.username,req.body.password);
//      console.log(result);
//      const obj= await User.findOne({username:req.body.username});
//    console.log(obj);
//   if(result.code){
//     if(obj.token==req.body.token){
//       res.send({code:2,message:"Already signed in "});
//      }else{
//       jwt.verify(dcrypt(obj.token),process.env.KEY, async (err)=>{
//         if(err){
//           const token=jwt.sign({exp:Math.floor(Date.now()/1000)+3600*12*7},process.env.KEY);
//           const etoken=crypto.AES.encrypt(token,process.env.KEY).toString();
//           try{
//             await  User.updateOne({username:req.body.username},{token:etoken});
//             await  NewsList.updateOne({token:req.body.token},{token:etoken});
//           }catch(e){
//            console.log(e.message);
//           }
//           res.send({code:0,token:etoken,username:req.body.username});  
//         }else{
//           const result=  await  User.findOne({token: obj.token});
//           res.send({username: result.username,code:0,token: result.token});
//           //res.send({username:result[0].username,code:0});
//         }
//        });
//      }
  

// }
      //res.send({username:result[0].username,code:0});
    }else{
      const result= await authenticate(req.body.username,req.body.password);
      if(result.code){
        const user= await User.findOne({username:req.body.username});
          console.log(user);
        jwt.verify(dcrypt(user.token),process.env.KEY,async (err)=>{
          if(err){
           
            const token=jwt.sign({exp:Math.floor(Date.now()/1000)+3600*12*7},process.env.KEY);
            const etoken=crypto.AES.encrypt(token,process.env.KEY).toString();
            try{
              await  User.updateOne({username:req.body.username},{token:etoken});
              await NewsList.updateOne({token:user.token},{token:etoken});
            }catch(e){
             console.log(e.message);
            }
            res.send({code:0,token:etoken,username:req.body.username});
  
          }else{
            if(req.body.token==user.token){
              res.send({code:2,message:"Already SignedIn"});
            }else{
              res.send({token:user.token,username:req.body.username,code:0});
            }
           
          }
        });
      }else{
        res.send({code:1,message:"Invalid credentials"});
      }
      

    }
   });
//  }
// }
// );

app.post("/tokenAuthentication",async (req,res)=>{
  console.log(req.body.token + "token");
     jwt.verify(dcrypt(req.body.token),process.env.KEY, async (err)=>{
      if(err){
            console.log("expired");
            res.send({code:1}); 
      }else{
        const result=  await  User.findOne({token:req.body.token});
        res.send({username: result.username,code:0});
        //res.send({username:result[0].username,code:0});
      }
     });
    
    // if(result){
    //     const obj=      User.findOne({token:dcrypt(req.body.token)});
    //     res.send({redirectTos:false,username:obj.username});
    // }
});


function verify(subpro,token,res){// common function for verifying
  jwt.verify(dcrypt(token),process.env.KEY, async (err)=>{
    if(err){
          res.send({code:1}); 
    }else{
      // const result=  await  User.findOne({token:req.body.token});
      // res.send({username: result.username,code:0});
      // //res.send({username:result[0].username,code:0});
      subpro();
    }
   });
}



app.post("/getNewsList",async (req,res)=>{
  var result=await NewsList.find({token:req.body.token});
 // console.log(result[0].id);
res.send(result);
});
app.post("/newsListAdd",async (req,res)=>{
  console.log("send token" +req.body.token);
 async  function todo(){
    try{
      await NewsList.create({title:req.body.title,content:req.body.content,url:req.body.url,token: req.body.token});
      res.send({code:0,redirect:false});
      }catch(e){
      console.log(e.message);
      }
  }
  verify(todo,req.body.token,res);

});
app.post("/newsListLength",async (req,res)=>{

  async function todo(){
    try{
      const list=await NewsList.find({token:req.body.token});
      res.send({code:0,length:list.length});
      }catch(e){
      console.log(e.message);
      }
  }
  verify(todo,req.body.token,res);
 
  });

  app.post("/deleteNews",async (req,res)=>{
    console.log(req.body);
   await NewsList.deleteOne({_id:req.body.id});
   var result=await NewsList.find({token:req.body.token});
 // console.log(result[0].id);
res.send(result);
  });

// var x=encrypt("tom").toString();
// console.log(dcrypt(x));

app.listen(800);
