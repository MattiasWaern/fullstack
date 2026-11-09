const fs=require('fs');const path=require('path');const db=require('../database');
(async()=>{try{await db.query(fs.readFileSync(path.join(__dirname,'../schema.sql'),'utf8'));console.log('Tabeller skapade');}catch(e){console.error(e);process.exitCode=1;}finally{await db.end();}})();
