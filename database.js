require("dotenv").config();
const mongoose=require("mongoose");
const data=require("./data");
const bcrypt=require("bcrypt");
const crypto=require("crypto-js");
const key="2wAKhWNBi0";
console.log(key);
const jwt=require("jsonwebtoken");
const {Schema}=mongoose;
mongoose.connect(`mongodb+srv://adminx:${process.env.PASS}@cluster0.fvvdife.mongodb.net/career`).then(()=>{console.log("connected")}).catch((e)=>{
    console.log("not connected");
    console.log("the error is" + e.message);
});
const UserSchema = new Schema({
    username:String,
    emailID:String,
    password:String,
    token:String,
});
const CareerSchema=new Schema({
    title:String,
    roles:[String],
    qualifications:[String]
});
const NewsListSchema= new Schema({title:String,content:String,url:String,token:String});
const NewsSchema= new Schema({name:String});
const User= mongoose.model("User",UserSchema);
const Career=mongoose.model("Ecareer",CareerSchema);
//function to check if user exists
const News=mongoose.model("New",NewsSchema);
const NewsList=mongoose.model("usernew",NewsListSchema);
async function doit(){
    console.log(data);
    for(var i=0;i<data.length;i++){
        await Career.create({title:data[i].title,roles:data[i].roles,qualifications:data[i].qualifications});
    }

}
//doit();
async function fetchNewsTopics(){
    var result=await News.find();
   return result;
}
//fecthNewsTopics();
async function checkUserExists(username,userid){
try{
    var user= await User.find({username:username});
    console.log(user);
var user2= await User.find({emailID:userid});
}catch(e){
console.log(e.message);
}

if(user.length==0 && user2.length==0){
return false;
}
return true;
}


async function authenticate(username,password){
    console.log("the name of the user is" +username);
    var user= await User.find({username:username});
    console.log("The user is"+user);
   if(user.length!=0){
    const hpass=await bcrypt.hash(password,10);
     var dpassword=user[0].password;
     console.log("user exists");
     console.log(hpass);
     console.log(dpassword);
     var code;
    try{
         code= await  bcrypt.compare(password,dpassword);
         console.log("the match is" + code);
    }catch(err){
       console.log(message);
    }
    return {code:code,username:user[0].username};
   }else{
    console.log("user not exists");
      return false;
   }
 
    
    }

async function createUser(username,userid,password){
var exists=await checkUserExists(username,userid);
if(exists===false){
    try{
        password=await bcrypt.hash(password,10);
    }catch(e){
   console.log(e.message);
    }
try{
   const token=jwt.sign({exp:Math.floor(Date.now()/1000)+3600*12*7},key);
    const etoken = crypto.AES.encrypt(token,key).toString();
   //  console.log(token);
    await User.create({username:username,emailID:userid,password:password,token: etoken});
   // not returning redirecting to home page
    return {message:"Account created Successfully!!!",code:0,token:etoken} ;
}catch(e){
    // errors
    console.log(e);
    return {message:"Sign up failed!!!",code:1,token:null} ;
return ;
}
}else{
    return  {message:"Account id already exists",code:1,token:null} ;
}

}

module.exports={createUser,authenticate,User,fetchNewsTopics,NewsList,Career};


