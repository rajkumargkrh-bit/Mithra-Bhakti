/* Mithra Bhakti IndexedDB file store */
const MBDB = {
  db:null,
  open(){return new Promise((resolve,reject)=>{const req=indexedDB.open("MithraBhaktiDB",1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("files")){const s=db.createObjectStore("files",{keyPath:"id",autoIncrement:true});s.createIndex("category","category",{unique:false});}};req.onsuccess=()=>{this.db=req.result;resolve(this.db)};req.onerror=()=>reject(req.error);});},
  async add(file,category){await this.open();return new Promise((resolve,reject)=>{const tx=this.db.transaction("files","readwrite");const req=tx.objectStore("files").add({name:file.name,type:file.type,size:file.size,category,createdAt:new Date().toISOString(),blob:file});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});},
  async all(){await this.open();return new Promise((resolve,reject)=>{const req=this.db.transaction("files").objectStore("files").getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});},
  async remove(id){await this.open();return new Promise((resolve,reject)=>{const req=this.db.transaction("files","readwrite").objectStore("files").delete(Number(id));req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});},
  async get(id){await this.open();return new Promise((resolve,reject)=>{const req=this.db.transaction("files").objectStore("files").get(Number(id));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
};