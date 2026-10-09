import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import {config} from './config.js';
import {Admin,Category,Product,Navigation,Setting,Homepage} from './models.js';
import {industrialHero,industrialAbout,industrialFooter,industrialPromotion} from './industrial-content.js';
await mongoose.connect(config.mongoUri);
try{
 const email=(process.env.ADMIN_EMAIL||'admin@example.com').toLowerCase(),password=process.env.ADMIN_PASSWORD||'ChangeMe123!';
 await Admin.findOneAndUpdate({email},{name:'Catalog Administrator',email,passwordHash:await bcrypt.hash(password,12)},{upsert:true});
 let category=await Category.findOne({slug:'liquid-flow-meters'});
 if(!category)category=await Category.create({name:'Liquid Flow Meters',slug:'liquid-flow-meters',description:'Explore flow measurement solutions for water and process liquids.',image:''});
 if(!await Product.countDocuments())await Product.create({name:'Industrial Liquid Flow Meter',slug:'industrial-liquid-flow-meter',shortDescription:'Flow measurement for industrial liquid applications.',description:'Contact us to confirm the flow range, connection size, wetted materials, operating limits, and outputs required for your application.',price:0,category:category.id,images:[],stock:0,dimensions:'Contact us for connection sizes',material:'Contact us for wetted material options',colors:[],featured:true,newArrival:true,bestSeller:true});
 if(!await Navigation.countDocuments())await Navigation.insertMany([{label:'Home',url:'/',order:1},{label:'Flow Meters',url:'/shop',order:2},{label:'Categories',url:'/#categories',order:3},{label:'About Us',url:'/#about',order:4},{label:'Contact Us',url:'/contact',order:5}]);
 await Setting.findOneAndUpdate({key:'main'},{$setOnInsert:{websiteName:'Industrial Flow',logo:'',footerText:industrialFooter}},{upsert:true});
 await Homepage.findOneAndUpdate({key:'main'},{$setOnInsert:{hero:{...industrialHero,image:''},...industrialAbout,promotions:[{...industrialPromotion,image:''}]}},{upsert:true});
 console.log(`Seed complete. Admin: ${email}. Existing homepage and settings preserved.`);
}finally{await mongoose.disconnect()}