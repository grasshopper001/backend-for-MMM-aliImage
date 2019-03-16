var express=require("express");
var router=express.Router();
var multer=require("multer");
var fs=require("fs");
/* OSS info */
var OSSak="LTAI3lEsjcnLflRn";
var OSSakSecret="I1m9zaRbiftlt74fcU0Rk4u6PPGHBi";
var fileName=undefined;

//OSS dependencies
var co=require("co");
var OSS=require("ali-oss");
var client=new OSS({
    region:"oss-cn-shanghai",
    accessKeyId:OSSak,
    accessKeySecret:OSSakSecret
})
var ali_oss={
    bucket:"grasshopper002-schedule",
    endPoint:"oss-cn-shanghai.aliyuncs.com"
}


var storage=multer.diskStorage({
    destination: function(req,file,callback){
        callback(null,"public/images");
    },
    filename: function(req,file,callback){
        callback(null,file.fieldname+"-"+Date.now());
    }
})

var upload=multer({storage:storage});

router.get("/post",function(req,res,next){
    res.render("post",{});
})

router.post("/post",upload.single("schedule"),function(req,res,next){
    co(function*(){
        client.useBucket(ali_oss.bucket);
        var result=yield client.put(Date.now()+".jpg",req.file.path);
        console.log("fileName on aliyun: "+result.name);
        fileName="http://"+ali_oss.bucket+"."+ali_oss.endPoint+"/"+result.name;
        res.send("post succeed");
    }).catch(function(err){
        res.send("post failed, please try again.");
    })
    fs.unlinkSync(req.file.path);
    console.log(req.file);
  })

  router.get("/getSchedule",function(req,res,next){
      if(!fileName){
          co(function*(){
              client.useBucket(ali_oss.bucket);
              client.list({
            }).then(function(result){
                //console.log(result.objects);
                fileName=result.objects[result.objects.length-1].url;
                res.send(fileName);
            }).catch(function(err){
                console.log(err);
            })
          })
      }
      else{
        res.send(fileName);
      }
  })

module.exports=router;