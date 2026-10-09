import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import router from './routes.js';
import { config } from './config.js';
import { errorHandler, notFound } from './middleware.js';

await mongoose.connect(config.mongoUri);
if(process.env.VERCEL && !process.env.JWT_SECRET)throw new Error('Set JWT_SECRET in Vercel');
const app=express();
app.set('trust proxy',1);
app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));app.use(cors({origin:config.clientUrl.split(',')}));app.use(express.json({limit:'1mb'}));app.use(morgan('dev'));
app.use('/uploads',express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../uploads')));
app.use('/api/auth/login',rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false}));
app.use('/api',router);app.get('/api/health',(_r,res)=>res.json({status:'ok'}));
const frontendDist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../frontend/dist');
if(fs.existsSync(frontendDist)){app.use(express.static(frontendDist));app.use((req,res,next)=>{if(req.method==='GET'&&req.accepts('html'))return res.sendFile(path.join(frontendDist,'index.html'));next()})}
app.use(notFound);app.use(errorHandler);
if(!process.env.VERCEL)app.listen(config.port,'0.0.0.0',()=>console.log(`Industrial Flow website listening on http://0.0.0.0:${config.port}`));
export default app;
