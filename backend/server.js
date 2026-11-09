require('dotenv').config();
const express=require('express');
const cors=require('cors');
const app=express();
app.use(cors({origin:process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s=>s.trim()) : true}));
app.use(express.json());
app.use('/api/auth',require('./routes/auth'));
app.use('/api/books',require('./routes/books'));
app.use('/api/reviews',require('./routes/reviews'));
if(require.main===module){const PORT=process.env.PORT||3001;app.listen(PORT,()=>console.log(`Server körs på port ${PORT}`));}
module.exports=app;
