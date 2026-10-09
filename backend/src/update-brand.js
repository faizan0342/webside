import mongoose from 'mongoose';
import {config} from './config.js';
import {Setting} from './models.js';
import {industrialFooter} from './industrial-content.js';
await mongoose.connect(config.mongoUri);
try{await Setting.findOneAndUpdate({key:'main'},{$set:{websiteName:'Industrial Flow',footerText:industrialFooter}},{upsert:true});console.log('Industrial Flow branding saved to MongoDB')}finally{await mongoose.disconnect()}