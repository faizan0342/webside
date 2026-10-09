import fs from 'node:fs';
import mongoose from 'mongoose';
import {config} from './config.js';
import {Setting,Homepage,Category,Product,Navigation} from './models.js';
import {industrialHero,industrialAbout,industrialFooter,industrialPromotion} from './industrial-content.js';
await mongoose.connect(config.mongoUri);
try{
 const snapshot={settings:await Setting.find().lean(),homepage:await Homepage.find().lean(),categories:await Category.find().lean(),products:await Product.find().lean(),navigation:await Navigation.find().lean()};
 fs.mkdirSync(new URL('../backups/',import.meta.url),{recursive:true});
 fs.writeFileSync(new URL(`../backups/before-industrial-${Date.now()}.json`,import.meta.url),JSON.stringify(snapshot,null,2));
 await Setting.findOneAndUpdate({key:'main'},{$set:{websiteName:'Industrial Flow',logo:'',footerText:industrialFooter}},{upsert:true});
 const home=await Homepage.findOne({key:'main'});
 const updates={...industrialAbout,...Object.fromEntries(Object.entries(industrialHero).map(([key,value])=>[`hero.${key}`,value]))};
 if(home?.promotions?.length)updates.promotions=home.promotions.map(p=>({...p.toObject(),...industrialPromotion}));
 await Homepage.findOneAndUpdate({key:'main'},{$set:updates},{upsert:true});
 await Category.updateOne({slug:'living-room'},{$set:{name:'Liquid Flow Meters',slug:'liquid-flow-meters',description:'Explore flow measurement solutions for water and process liquids.'}});
 await Product.updateOne({slug:'arden-lounge-chair'},{$set:{name:'Industrial Liquid Flow Meter',slug:'industrial-liquid-flow-meter',shortDescription:'Flow measurement for industrial liquid applications.',description:'Explore a liquid flow meter solution for your process. Contact us to confirm the measurement range, connection size, wetted materials, pressure and temperature limits, and output options required for your application.',dimensions:'Contact us for connection sizes',material:'Contact us for wetted material options',colors:[]}});
 await Navigation.updateMany({label:'Shop'},{$set:{label:'Flow Meters'}});
 console.log('Industrial content saved; existing images preserved. Backup saved under backend/backups.');
}finally{await mongoose.disconnect()}