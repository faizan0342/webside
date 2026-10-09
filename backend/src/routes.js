import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { Admin, Category, Product, Order, Navigation, Setting, Homepage, Contact, UploadedImage } from './models.js';
import { auth, validate } from './middleware.js';
import { config } from './config.js';
import { orderNumber, sendOrderEmail, sendContactEmails, slugify } from './utils.js';

const router = express.Router();
const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-f\d]{24}$/i);
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const orderSchema = z.object({ customerName: text.max(100), email: z.string().email(), phone: text.max(40), address: text.max(500), city: text.max(100), notes: z.string().max(1000).optional().default(''), productId: id, quantity: z.coerce.number().int().min(1).max(99) });
const contactSchema = z.object({ name: text.max(100), email: z.string().trim().email().max(150), phone: z.string().trim().max(40).optional().default(''), subject: text.max(150), message: text.min(10).max(3000) });
const rateContact=rateLimit({windowMs:15*60*1000,limit:5,standardHeaders:true,legacyHeaders:false,message:{message:'Too many messages. Please try again later.'}});

router.post('/auth/login', validate(loginSchema), async (req,res) => { const admin = await Admin.findOne({ email: req.validated.email.toLowerCase() }); if (!admin || !(await bcrypt.compare(req.validated.password, admin.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' }); const token = jwt.sign({ sub: admin.id, email: admin.email, name: admin.name }, config.jwtSecret, { expiresIn: config.jwtExpiresIn }); res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } }); });
router.get('/auth/me', auth, async (req,res) => res.json(await Admin.findById(req.admin.sub).select('-passwordHash')));

const crud = (base, Model, prepare = v => v) => {
  router.get(`/${base}`, async (req,res) => { const filter = base === 'products' ? { active: true } : {}; if (req.query.admin === '1') Object.keys(filter).forEach(k=>delete filter[k]); if (req.query.category) filter.category = req.query.category; if (req.query.featured) filter.featured = true; if (req.query.newArrival) filter.newArrival = true; if (req.query.bestSeller) filter.bestSeller = true; if (req.query.search) filter.$or = [{ name: new RegExp(req.query.search,'i') }, { description: new RegExp(req.query.search,'i') }]; let q=Model.find(filter); if (base==='products') q=q.populate('category'); if(base==='navigation') q=q.sort({order:1}); else q=q.sort({createdAt:-1}); res.json(await q); });
  router.get(`/${base}/:id`, async (req,res) => { let q=Model.findById(req.params.id); if(base==='products') q=q.populate('category'); const item=await q; if(!item)return res.status(404).json({message:'Not found'}); res.json(item); });
  router.post(`/${base}`, auth, async(req,res)=>res.status(201).json(await Model.create(prepare(req.body))));
  router.put(`/${base}/:id`, auth, async(req,res)=>{const item=await Model.findByIdAndUpdate(req.params.id,prepare(req.body),{new:true,runValidators:true});if(!item)return res.status(404).json({message:'Not found'});res.json(item)});
  router.delete(`/${base}/:id`, auth, async(req,res)=>{const item=await Model.findByIdAndDelete(req.params.id);if(!item)return res.status(404).json({message:'Not found'});res.status(204).end()});
};
crud('categories',Category,v=>({...v,slug:v.slug||slugify(v.name)}));
crud('products',Product,v=>({...v,slug:v.slug||slugify(v.name)}));
crud('navigation',Navigation);

router.post('/orders', validate(orderSchema), async(req,res)=>{ const v=req.validated; const product=await Product.findById(v.productId); if(!product||!product.active)return res.status(404).json({message:'Product is unavailable'}); if(product.stock<v.quantity)return res.status(409).json({message:`Only ${product.stock} item(s) available`}); const price=product.discountPrice ?? product.price; const order=await Order.create({...v,product:product.id,productName:product.name,unitPrice:price,totalAmount:price*v.quantity,orderNumber:orderNumber()}); sendOrderEmail(order).catch(console.error); res.status(201).json({message:'Order placed successfully',orderNumber:order.orderNumber,totalAmount:order.totalAmount}); });
router.post('/contacts', rateContact, validate(contactSchema), async(req,res)=>{const contact=await Contact.create(req.validated);try{await sendContactEmails(contact)}catch(error){console.error('Contact email failed:',error.message)}res.status(201).json({message:'Thank you. Your message has been received.'})});
router.get('/orders',auth,async(req,res)=>{const filter={};if(req.query.search)filter.$or=[{orderNumber:new RegExp(req.query.search,'i')},{customerName:new RegExp(req.query.search,'i')},{email:new RegExp(req.query.search,'i')}];res.json(await Order.find(filter).populate('product').sort({createdAt:-1}))});
router.get('/orders/:id',auth,async(req,res)=>res.json(await Order.findById(req.params.id).populate('product')));
router.patch('/orders/:id/status',auth,async(req,res)=>{const status=z.enum(['New','Confirmed','Processing','Delivered','Cancelled']).parse(req.body.status);res.json(await Order.findByIdAndUpdate(req.params.id,{status},{new:true}))});
router.get('/dashboard',auth,async(_req,res)=>{const [products,categories,orders,newOrders,recent]=await Promise.all([Product.countDocuments(),Category.countDocuments(),Order.countDocuments(),Order.countDocuments({status:'New'}),Order.find().sort({createdAt:-1}).limit(6)]);res.json({products,categories,orders,newOrders,recent})});
router.get('/settings',async(_req,res)=>res.json(await Setting.findOne({key:'main'})||await Setting.create({key:'main'})));
router.put('/settings',auth,async(req,res)=>res.json(await Setting.findOneAndUpdate({key:'main'},req.body,{new:true,upsert:true,runValidators:true})));
router.get('/homepage',async(_req,res)=>res.json(await Homepage.findOne({key:'main'})||await Homepage.create({key:'main'})));
router.put('/homepage',auth,async(req,res)=>res.json(await Homepage.findOneAndUpdate({key:'main'},req.body,{new:true,upsert:true,runValidators:true})));

// Persist uploads in MongoDB; Vercel function disks cannot retain files.
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:3*1024*1024,files:8},fileFilter:(_r,f,cb)=>cb(null,/^image\/(jpeg|png|webp|gif)$/.test(f.mimetype))});
router.get('/images/:id',async(req,res)=>{if(!id.safeParse(req.params.id).success)return res.status(404).end();const image=await UploadedImage.findById(req.params.id);if(!image)return res.status(404).end();res.set('Content-Type',image.contentType).set('Cache-Control','public,max-age=31536000,immutable').send(image.data)});
router.post('/uploads',auth,upload.array('images',8),async(req,res)=>{if(!req.files?.length)return res.status(400).json({message:'Choose a JPEG, PNG, WebP, or GIF image.'});const images=await UploadedImage.insertMany(req.files.map(f=>({data:f.buffer,contentType:f.mimetype})));res.status(201).json({urls:images.map(i=>'/api/images/'+i.id)})});
export default router;
