import mongoose from 'mongoose';

const opts = { timestamps: true };
const Admin = mongoose.model('Admin', new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true }, passwordHash: { type: String, required: true } }, opts));
const Category = mongoose.model('Category', new mongoose.Schema({ name: { type: String, required: true, unique: true }, slug: { type: String, required: true, unique: true }, description: String, image: String }, opts));
const Product = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true }, slug: { type: String, required: true, unique: true }, description: { type: String, required: true }, shortDescription: String,
  price: { type: Number, required: true, min: 0 }, discountPrice: { type: Number, min: 0 }, category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, images: [String],
  stock: { type: Number, default: 0, min: 0 }, dimensions: String, material: String, colors: [String], featured: { type: Boolean, default: false }, newArrival: { type: Boolean, default: false }, bestSeller: { type: Boolean, default: false }, active: { type: Boolean, default: true }, sold: { type: Number, default: 0 }
}, opts));
const Order = mongoose.model('Order', new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true }, customerName: { type: String, required: true }, email: { type: String, required: true }, phone: { type: String, required: true }, address: { type: String, required: true }, city: { type: String, required: true }, notes: String,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, productName: String, unitPrice: Number, quantity: { type: Number, required: true, min: 1 }, totalAmount: Number,
  status: { type: String, enum: ['New','Confirmed','Processing','Delivered','Cancelled'], default: 'New' }
}, opts));
const Navigation = mongoose.model('Navigation', new mongoose.Schema({ label: { type: String, required: true }, url: { type: String, required: true }, enabled: { type: Boolean, default: true }, order: { type: Number, default: 0 } }, opts));
const Setting = mongoose.model('Setting', new mongoose.Schema({ key: { type: String, default: 'main', unique: true }, websiteName: { type: String, default: 'Industrial Flow' }, logo: String, favicon: String, phone: String, email: String, address: String, socials: { facebook: String, instagram: String, pinterest: String }, footerText: String }, opts));
const Homepage = mongoose.model('Homepage', new mongoose.Schema({ key: { type: String, default: 'main', unique: true }, hero: { image: String, eyebrow: String, heading: String, description: String, buttonText: String, buttonUrl: String }, promotions: [{ title: String, description: String, image: String, url: String }], sectionVisibility: { featured: { type: Boolean, default: true }, newArrivals: { type: Boolean, default: true }, categories: { type: Boolean, default: true }, bestSellers: { type: Boolean, default: true }, about: { type: Boolean, default: true }, contact: { type: Boolean, default: true } }, aboutTitle: String, aboutText: String }, opts));
const Contact = mongoose.model('Contact', new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true, lowercase: true }, phone: String, subject: { type: String, required: true }, message: { type: String, required: true }, status: { type: String, enum: ['New','Read','Replied'], default: 'New' } }, opts));

export { Admin, Category, Product, Order, Navigation, Setting, Homepage, Contact };

export const UploadedImage=mongoose.model("UploadedImage",new mongoose.Schema({data:{type:Buffer,required:true},contentType:{type:String,required:true}},opts));
