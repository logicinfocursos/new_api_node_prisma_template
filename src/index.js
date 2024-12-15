// src\index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import AppRouter from './routes/app.router.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const port = process.env.API_PORT || 3001

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})

new AppRouter(app)
